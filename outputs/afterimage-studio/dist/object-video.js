import {buildWebm} from './webm.js';
export async function encodeObjectVideo({render,cancelled,progress,frames=144,fps=24,size=800}){
 if(typeof VideoEncoder!=='function')throw new Error('当前浏览器没有 WebCodecs 视频编码器，请使用桌面 Chrome / Edge');
 const cfg={codec:'vp8',width:size,height:size,framerate:fps,bitrate:4000000,latencyMode:'quality'};if(!(await VideoEncoder.isConfigSupported(cfg)).supported)throw new Error('当前设备不支持 VP8 编码');
 let failure;const chunks=[],enc=new VideoEncoder({output:chunk=>{const data=new Uint8Array(chunk.byteLength);chunk.copyTo(data);chunks.push({data,timestamp:chunk.timestamp,key:chunk.type==='key'})},error:e=>failure=e});
 try{enc.configure(cfg);for(let i=0;i<frames;i++){if(cancelled())throw new Error('导出已取消');if(failure)throw failure;const canvas=await render(i/fps,frames/fps);const frame=new VideoFrame(canvas,{timestamp:Math.round(i/fps*1e6),duration:Math.round(1e6/fps)});try{enc.encode(frame,{keyFrame:i%fps===0})}finally{frame.close();}if(enc.encodeQueueSize>6)await enc.flush();progress((i+1)/frames);await new Promise(r=>setTimeout(r,0));}await enc.flush();if(failure)throw failure;return new Blob([buildWebm({width:size,height:size,fps,codec:'V_VP8',chunks})],{type:'video/webm'});}finally{if(enc.state!=='closed')enc.close();}
}
