// Shared geometry for editor selection, animation, masking and export.
const EASE={smooth:u=>u*u*(3-2*u),linear:u=>u,hold:()=>0};
export function keyframePose(layer,t=0){
 const keys=layer.keyframes.filter(k=>k&&Number.isFinite(k.t)).sort((a,b)=>a.t-b.t);
 const num=(k,key,fallback)=>Number.isFinite(k[key])?k[key]:fallback;
 let a=keys[0],b=keys[0];
 if(t>=keys.at(-1).t)a=b=keys.at(-1);
 else if(t>keys[0].t)for(let i=0;i<keys.length-1;i++)if(t<keys[i+1].t){a=keys[i];b=keys[i+1];break}
 const span=(b.t??0)-(a.t??0),u=a===b?1:Math.max(0,Math.min(1,(t-a.t)/Math.max(1e-6,span))),e=(EASE[a.ease]||EASE.smooth)(u);
 const mix=(key,fallback)=>num(a,key,fallback)+(num(b,key,num(a,key,fallback))-num(a,key,fallback))*e;
 const scale=mix('scale',100)/100;
 return {...layer,x:mix('x',layer.x),y:mix('y',layer.y),rotation:mix('rotation',layer.rotation),opacity:mix('opacity',layer.opacity),w:layer.w*scale,h:layer.h*scale,fontSize:(layer.fontSize||0)*scale};
}
export function shiftKeyframes(layer,dx=0,dy=0,drot=0){
 if(!Array.isArray(layer.keyframes)||!layer.keyframes.length)return 0;
 const round=v=>Math.round(v*100)/100;
 for(const k of layer.keyframes){
  if(!k)continue;
  if(dx&&Number.isFinite(k.x))k.x=round(k.x+dx);
  if(dy&&Number.isFinite(k.y))k.y=round(k.y+dy);
  if(drot&&Number.isFinite(k.rotation))k.rotation=round(k.rotation+drot);
 }
 return layer.keyframes.length;
}
export function layerPose(layer,t=0,duration=5){
 if(Array.isArray(layer.keyframes)&&layer.keyframes.filter(k=>Number.isFinite(k?.t)).length>1)return keyframePose(layer,t);
 const m=layer.motion;if(!m?.enabled)return {...layer};
 const start=layer.timing?.start||0,end=layer.timing?.end??duration,localTime=Math.max(0,t-start);const progress=(1-Math.cos(localTime/Math.max(.01,end-start)*Math.PI*2))/2;
 const scale=1+((m.scale??100)/100-1)*progress;
 return {...layer,x:layer.x+(m.dx||0)*progress,y:layer.y+(m.dy||0)*progress,rotation:layer.rotation+(m.rotation||0)*progress,w:layer.w*scale,h:layer.h*scale,fontSize:(layer.fontSize||0)*scale};
}
export function wrapLines(ctx,text,width,wrap=true){
 const lines=[];for(const paragraph of text.split('\n')){if(!wrap||!paragraph){lines.push(paragraph);continue}let line='';for(const char of Array.from(paragraph)){if(line&&ctx.measureText(line+char).width>width){lines.push(line);line=char}else line+=char}lines.push(line)}return lines;
}
export function curveValue(value,points){const v=Math.max(0,Math.min(255,value)),xs=[0,64,128,192,255];let i=0;while(i<3&&v>xs[i+1])i++;const u=(v-xs[i])/(xs[i+1]-xs[i]);return points[i]*(1-u)+points[i+1]*u}

export function clipRange(l,duration){return {start:Math.min(duration,l.timing?.start??0),end:Math.min(duration,l.timing?.end??duration)}}
export function clipAlpha(l,t,duration){const r=clipRange(l,duration);if(t<r.start||t>=r.end)return 0;const a=l.timing?.fadeIn||0,b=l.timing?.fadeOut||0;return Math.max(0,Math.min(1,a?(t-r.start)/a:1,b?(r.end-t)/b:1))}
