// 导出渲染线程：接收工程文档与位图资源，在 OffscreenCanvas 上逐帧渲染，
// 每帧以 ImageBitmap 回传主线程（零拷贝转移），主线程只负责显示与编码。
import {render} from './engine.js';

const assets=new Map();

async function toBitmap(canvas){
  if(typeof canvas.transferToImageBitmap==='function')return canvas.transferToImageBitmap();
  return createImageBitmap(canvas);
}

self.onmessage=async e=>{
  const data=e.data||{};
  if(data.type==='assets'){
    for(const [key,bitmap] of data.entries||[])assets.set(key,bitmap);
    return;
  }
  if(data.type!=='render')return;
  try{
    const out=render(data.doc,assets,data.maxSide||1000,data.time||0,!!data.bypass);
    const width=out.width,height=out.height;
    const bitmap=await toBitmap(out);
    self.postMessage({type:'frame',id:data.id,width,height,bitmap},[bitmap]);
  }catch(err){
    self.postMessage({type:'error',id:data.id,message:String(err&&err.message||err)});
  }
};
