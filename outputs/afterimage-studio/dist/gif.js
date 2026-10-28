// Minimal GIF89a encoder. Frames are quantized to a fixed 6x6x6 palette, so
// encoding is deterministic and needs no third-party code.
const LEVELS=6,STEP=255/(LEVELS-1);
const PALETTE=(()=>{const p=[];for(let r=0;r<LEVELS;r++)for(let g=0;g<LEVELS;g++)for(let b=0;b<LEVELS;b++)p.push(Math.round(r*STEP),Math.round(g*STEP),Math.round(b*STEP));while(p.length<768)p.push(0);return p})();
// 4x4 Bayer 有序抖动：把每级 51 的色阶差用像素级别的阈值打散，减轻渐变色带。
const BAYER=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];

// Floyd–Steinberg 误差扩散（蛇形扫描）。调色板是规则立方体，所以按通道分别量化，
// 把量化误差按 7/16、3/16、5/16、1/16 分给右侧、左下、下方、右下，梯度更平滑。
function diffuse(rgba,cols,rows,out){
 const n=cols+2;
 let cr=new Float32Array(n),cg=new Float32Array(n),cb=new Float32Array(n);
 let nr=new Float32Array(n),ng=new Float32Array(n),nb=new Float32Array(n);
 const clamp=v=>v<0?0:v>255?255:v;
 for(let y=0;y<rows;y++){
  const ltr=(y&1)===0;
  nr.fill(0);ng.fill(0);nb.fill(0);
  for(let s=0;s<cols;s++){
   const x=ltr?s:cols-1-s,p=(y*cols+x)*4,e=x+1,d=ltr?1:-1;
   const vr=clamp(rgba[p]+cr[e]),vg=clamp(rgba[p+1]+cg[e]),vb=clamp(rgba[p+2]+cb[e]);
   const r=Math.min(LEVELS-1,Math.max(0,Math.round(vr/STEP))),g=Math.min(LEVELS-1,Math.max(0,Math.round(vg/STEP))),b=Math.min(LEVELS-1,Math.max(0,Math.round(vb/STEP)));
   out[y*cols+x]=(r*LEVELS+g)*LEVELS+b;
   const er=vr-r*STEP,eg=vg-g*STEP,eb=vb-b*STEP,i1=e+d,i2=e-d;
   cr[i1]+=er*.4375;cg[i1]+=eg*.4375;cb[i1]+=eb*.4375;
   nr[i2]+=er*.1875;ng[i2]+=eg*.1875;nb[i2]+=eb*.1875;
   nr[e]+=er*.3125;ng[e]+=eg*.3125;nb[e]+=eb*.3125;
   nr[i1]+=er*.0625;ng[i1]+=eg*.0625;nb[i1]+=eb*.0625;
  }
  let t=cr;cr=nr;nr=t;t=cg;cg=ng;ng=t;t=cb;cb=nb;nb=t;
 }
}

export function quantizeFrame(rgba,width=0,dither=false){
 const cols=Math.max(1,width|0),rows=Math.ceil((rgba.length/4)/cols),out=new Uint8Array(rgba.length/4);
 if(dither==='fs'){diffuse(rgba,cols,rows,out);return out}
 for(let i=0,j=0;i<rgba.length;i+=4,j++){
  let n=0;
  if(dither){const x=j%cols,y=(j/cols)|0;n=(BAYER[y&3][x&3]+.5)/16-.5}
  const r=Math.min(LEVELS-1,Math.max(0,Math.round(rgba[i]/STEP+n)));
  const g=Math.min(LEVELS-1,Math.max(0,Math.round(rgba[i+1]/STEP+n)));
  const b=Math.min(LEVELS-1,Math.max(0,Math.round(rgba[i+2]/STEP+n)));
  out[j]=(r*LEVELS+g)*LEVELS+b;
 }
 return out;
}

function lzw(indices){
 const min=8,clear=1<<min,eoi=clear+1;
 let next=eoi+1,bits=min+1,dict=new Map(),acc=0,accBits=0;
 const out=[];
 const emit=c=>{acc|=c<<accBits;accBits+=bits;while(accBits>=8){out.push(acc&255);acc>>=8;accBits-=8}};
 emit(clear);
 let prefix=indices[0]||0;
 for(let i=1;i<indices.length;i++){
  const k=indices[i],key=prefix*4096+k;
  if(dict.has(key)){prefix=dict.get(key);continue}
  emit(prefix);
  if(next<4096){dict.set(key,next++);if(next>(1<<bits)&&bits<12)bits++}
  else{emit(clear);dict=new Map();next=eoi+1;bits=min+1}
  prefix=k;
 }
 emit(prefix);emit(eoi);
 if(accBits>0)out.push(acc&255);
 return Uint8Array.from(out);
}

function pushBlock(out,data){
 for(let i=0;i<data.length;i+=255){
  const chunk=data.subarray(i,i+255);
  out.push(chunk.length,...chunk);
 }
 out.push(0);
}

export function encodeGif({width,height,frames,delay=8}){
 const out=[];
 const u16=v=>out.push(v&255,(v>>8)&255);
 out.push(...[0x47,0x49,0x46,0x38,0x39,0x61]); // GIF89a
 u16(width);u16(height);
 out.push(0xf7,0,0); // global palette, 256 colors
 out.push(...PALETTE);
 out.push(0x21,0xff,0x0b,...new TextEncoder().encode('NETSCAPE2.0'),0x03,0x01,0,0,0); // loop forever
 for(const frame of frames){
  const data=lzw(frame);
  out.push(0x21,0xf9,0x04,0x04); // graphic control: disposal 1, no transparency
  u16(delay);out.push(0,0);
  out.push(0x2c);u16(0);u16(0);u16(width);u16(height);out.push(0);
  out.push(8);
  pushBlock(out,data);
 }
 out.push(0x3b);
 return Uint8Array.from(out);
}

export const GIF_PALETTE=PALETTE;
