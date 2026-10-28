// Minimal WebM (Matroska) muxer for WebCodecs VP8 / VP9 chunks.
// 只实现播放所需的最小结构：EBML 头、Segment Info、Tracks、Cluster/SimpleBlock。
// 不依赖第三方代码，输出为 Uint8Array，交给 Blob 直接下载。

const utf8 = s => new TextEncoder().encode(s);

// EBML 元素尺寸：以 1–8 字节的变长整数表示，首字节含长度标记位。
function size(n) {
  for (let len = 1; len <= 8; len++) {
    if (n < 2 ** (7 * len) - 1) {
      const out = new Uint8Array(len);
      let v = n;
      for (let i = len - 1; i >= 0; i--) { out[i] = v & 255; v = Math.floor(v / 256); }
      out[0] |= 1 << (8 - len);
      return out;
    }
  }
  throw new Error('WebM 元素尺寸超出范围');
}

function uintBytes(n) {
  const out = [];
  do { out.unshift(n & 255); n = Math.floor(n / 256); } while (n > 0);
  return Uint8Array.from(out);
}

function el(id, payload) {
  const s = size(payload.length);
  const out = new Uint8Array(id.length + s.length + payload.length);
  out.set(id, 0);
  out.set(s, id.length);
  out.set(payload, id.length + s.length);
  return out;
}

function cat(parts) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

const u = (id, n) => el(id, uintBytes(n));
const str = (id, s) => el(id, utf8(s));
const f64 = (id, n) => {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setFloat64(0, n);
  return el(id, b);
};

const ID = {
  ebml: [0x1a, 0x45, 0xdf, 0xa3],
  ebmlVersion: [0x42, 0x86],
  ebmlReadVersion: [0x42, 0xf7],
  ebmlMaxIdLength: [0x42, 0xf2],
  ebmlMaxSizeLength: [0x42, 0xf3],
  docType: [0x42, 0x82],
  docTypeVersion: [0x42, 0x87],
  docTypeReadVersion: [0x42, 0x85],
  segment: [0x18, 0x53, 0x80, 0x67],
  info: [0x15, 0x49, 0xa9, 0x66],
  timecodeScale: [0x2a, 0xd7, 0xb1],
  muxingApp: [0x4d, 0x80],
  writingApp: [0x57, 0x41],
  duration: [0x44, 0x89],
  tracks: [0x16, 0x54, 0xae, 0x6b],
  trackEntry: [0xae],
  trackNumber: [0xd7],
  trackUid: [0x73, 0xc5],
  trackType: [0x83],
  flagLacing: [0x9c],
  codecId: [0x86],
  video: [0xe0],
  pixelWidth: [0xb0],
  pixelHeight: [0xba],
  cluster: [0x1f, 0x43, 0xb6, 0x75],
  timecode: [0xe7],
  simpleBlock: [0xa3]
};

// chunks: [{data: Uint8Array, timestamp: µs, key: boolean}]
export function buildWebm({ width, height, fps = 30, codec = 'V_VP9', chunks = [] } = {}) {
  if (!width || !height) throw new Error('缺少视频尺寸');
  if (!Array.isArray(chunks) || !chunks.length) throw new Error('没有可封装的视频帧');
  const frameMs = 1000 / fps;
  const blocks = chunks
    .map(c => ({ data: c.data, time: Math.max(0, Math.round((c.timestamp || 0) / 1000)), key: !!c.key }))
    .sort((a, b) => a.time - b.time);
  const duration = blocks.at(-1).time + frameMs;

  const header = el(ID.ebml, cat([
    u(ID.ebmlVersion, 1),
    u(ID.ebmlReadVersion, 1),
    u(ID.ebmlMaxIdLength, 4),
    u(ID.ebmlMaxSizeLength, 8),
    str(ID.docType, 'webm'),
    u(ID.docTypeVersion, 2),
    u(ID.docTypeReadVersion, 2)
  ]));

  const info = el(ID.info, cat([
    u(ID.timecodeScale, 1000000),
    str(ID.muxingApp, 'afterimage-studio'),
    str(ID.writingApp, 'afterimage-studio'),
    f64(ID.duration, duration)
  ]));

  const tracks = el(ID.tracks, cat([
    el(ID.trackEntry, cat([
      u(ID.trackNumber, 1),
      u(ID.trackUid, 1 + Math.floor(Math.random() * 0xffffff)),
      u(ID.trackType, 1),
      u(ID.flagLacing, 0),
      str(ID.codecId, codec),
      el(ID.video, cat([u(ID.pixelWidth, width), u(ID.pixelHeight, height)]))
    ]))
  ]));

  // 每个 Cluster 从关键帧开始；超过 2 秒或 30 秒（SimpleBlock 的 int16 相对时间上限）就另起一个。
  const clusters = [];
  let group = null, start = 0;
  const flush = () => {
    if (!group) return;
    clusters.push(el(ID.cluster, cat([u(ID.timecode, start), ...group])));
    group = null;
  };
  for (const b of blocks) {
    const rel = b.time - start;
    if (!group || (b.key && rel > 2000) || rel > 30000) {
      flush();
      start = b.time;
      group = [];
    }
    const r = Math.max(-32768, Math.min(32767, b.time - start));
    const head = new Uint8Array([0x81, (r >> 8) & 255, r & 255, b.key ? 0x80 : 0]);
    group.push(el(ID.simpleBlock, cat([head, b.data])));
  }
  flush();

  return cat([header, el(ID.segment, cat([info, tracks, ...clusters]))]);
}
