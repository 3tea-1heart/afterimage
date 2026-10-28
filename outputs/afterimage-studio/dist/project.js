import {EFFECTS} from './engine.js';
export function validateProject(v){
 const fail=s=>{throw new Error(s)},color=/^#[0-9a-f]{6}$/i,id=/^[a-zA-Z0-9_-]{1,80}$/;
 const num=(x,min,max)=>Number.isFinite(x)&&x>=min&&x<=max;
 if(!v||v.app!=='afterimage-studio'||v.version!==1)fail('不是受支持的余像工程');
 if(!Number.isInteger(v.width)||!Number.isInteger(v.height)||!num(v.width,16,4096)||!num(v.height,16,4096))fail('画幅尺寸无效');
 if(typeof v.title!=='string'||v.title.length>300||typeof v.recipe!=='string'||v.recipe.length>100)fail('工程名称无效');
 if(!Array.isArray(v.layers)||v.layers.length>60||!Array.isArray(v.effects)||v.effects.length>40)fail('工程图层或效果超出限制');
 if(!color.test(v.background)||!num(v.duration,1,30)||typeof v.transparent!=='boolean')fail('工程设置无效');
 const ids=new Set();
 for(const l of v.layers){
  if(!l||!['image','text','sticker','shape'].includes(l.type)||!id.test(l.id)||ids.has(l.id))fail('图层类型或标识无效');ids.add(l.id);
  if(typeof l.name!=='string'||l.name.length>300)fail('图层名称无效');
  if(!num(l.x,-32768,32768)||!num(l.y,-32768,32768)||!num(l.w,1,32768)||!num(l.h,1,32768)||!num(l.rotation,-360,360)||!num(l.opacity,0,100)||!num(l.shadow??0,0,100))fail('图层参数无效');
  if(!['source-over','multiply','screen','overlay','soft-light','difference','lighter'].includes(l.blend))fail('混合模式无效');
  if(l.mask!==undefined){const m=l.mask;if(!m||!['none','ellipse','rect'].includes(m.type)||!num(m.x,-100,200)||!num(m.y,-100,200)||!num(m.w,1,200)||!num(m.h,1,200)||!num(m.feather,0,200)||typeof m.invert!=='boolean')fail('蒙版参数无效')}
  if(l.timing!==undefined){const z=l.timing;if(!z||!num(z.start,0,30)||!num(z.end,0,30)||z.end-z.start<.049||!num(z.fadeIn,0,30)||!num(z.fadeOut,0,30))fail('时间片段无效')}
  if(l.motion!==undefined){const m=l.motion;if(!m||typeof m.enabled!=='boolean'||!num(m.dx,-4096,4096)||!num(m.dy,-4096,4096)||!num(m.rotation,-360,360)||!num(m.scale,10,300))fail('运动参数无效')}
  if(l.keyframes!==undefined){if(!Array.isArray(l.keyframes)||l.keyframes.length>60)fail('关键帧数量无效');
   for(const k of l.keyframes){if(!k||!num(k.t,0,30)||!num(k.x,-32768,32768)||!num(k.y,-32768,32768)||!num(k.rotation,-360,360)||!num(k.scale,10,3000)||!num(k.opacity,0,100))fail('关键帧参数无效');if(k.ease!==undefined&&!['smooth','linear','hold'].includes(k.ease))fail('关键帧缓动无效')}}
  if(l.align!==undefined&&!['left','center','right'].includes(l.align)||l.wrap!==undefined&&typeof l.wrap!=='boolean'||l.lineHeight!==undefined&&!num(l.lineHeight,.5,3))fail('文字排版参数无效');
  if(l.glow!==undefined&&!num(l.glow,0,100)||l.textScaleX!==undefined&&!num(l.textScaleX,.2,3)||l.glowColor!==undefined&&!color.test(l.glowColor))fail('文字材质无效');
  if(l.groupId!==undefined&&!id.test(l.groupId))fail('分组标识无效');
  if(l.crop!==undefined&&(!l.crop||!num(l.crop.x,0,100)||!num(l.crop.y,0,100)||!num(l.crop.zoom,1,5)))fail('框内裁切参数无效');
  if(l.fit!==undefined&&!['cover','stretch'].includes(l.fit))fail('图片适配方式无效');
  if(l.type==='image'){if(typeof l.src!=='string'||!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(l.src))fail('工程只接受内嵌图片');}
  else if(!color.test(l.color))fail('图层颜色无效');
  if(l.type==='text'||l.type==='sticker'){
   if(typeof l.content!=='string'||l.content.length>10000||!num(l.fontSize,8,600)||!['sans-serif','serif','monospace'].includes(l.font)||![400,500,600,700,800,900].includes(l.weight))fail('文字参数无效');
   if(!['normal','circle'].includes(l.layout)||typeof l.animate!=='boolean'||!num(l.stroke??0,0,20)||!color.test(l.strokeColor||'#17231e'))fail('文字样式无效');
  }
  if(l.type==='shape'&&!['rect','circle','line'].includes(l.shape))fail('形状类型无效');
 }
 const effectIds=new Set();
 for(const e of v.effects){
  const spec=e&&EFFECTS[e.type];if(!spec||!id.test(e.id)||effectIds.has(e.id))fail('效果标识无效');effectIds.add(e.id);
  if(typeof e.enabled!=='boolean'||(e.target!=='all'&&!ids.has(e.target)))fail('效果作用范围无效');
  for(const p of spec.params)if(!num(e.params?.[p.key],p.min,p.max))fail('效果参数超出范围');
  if(spec.color&&!color.test(e.color)||spec.color2&&!color.test(e.color2))fail('效果颜色无效');
 }
 return v;
}
