// 画布工厂：主线程用 HTMLCanvasElement，Worker 中用 OffscreenCanvas。
// 引擎和扩展效果都通过这里创建临时画布，避免直接依赖 document。
let factory=null;
export function setCanvasFactory(fn){factory=typeof fn==='function'?fn:null}
export function createSurface(w,h){
  const make=factory||(typeof document!=='undefined'
    ?()=>document.createElement('canvas')
    :()=>new OffscreenCanvas(1,1));
  const c=make();
  c.width=Math.max(1,Math.round(w));
  c.height=Math.max(1,Math.round(h));
  return c;
}
