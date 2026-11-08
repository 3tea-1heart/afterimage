export function snapTime(value,duration,fps=30,free=false){const v=free?value:Math.round(value*fps)/fps;return Math.max(0,Math.min(duration,v));}
export function shiftClipKeys(keys,delta,duration){return keys.map(k=>({...k,t:Math.max(0,Math.min(duration,k.t+delta))}));}
export function desktopAction(u,v,c){if(v>.925&&u>.17&&u<.43)return 'open';if(c.windowClosed)return 'orbit';const x=(u-c.windowX)*900,y=(v-c.windowY)*600;if(x>=495&&x<=530&&y>=0&&y<=42)return 'close';if(x>=0&&x<=535&&y>=0&&y<=42)return 'drag';return 'orbit';}
export function playerAction(x,y){const dy=y+.88;if(Math.hypot(x,dy)>.65)return null;if(Math.hypot(x,dy)<.25)return 'toggle';if(Math.abs(x)>Math.abs(dy))return x>0?'forward':'back';return dy>0?'louder':'quieter';}

export function splitLayerClip(layer,effects,t,duration,makeId=()=>crypto.randomUUID()){
 const z={start:0,end:duration,fadeIn:0,fadeOut:0,...layer.timing};if(layer.locked||t-z.start<1/30||z.end-t<1/30)throw new Error('请在片段内部至少一帧的位置分割');
 const envelope={sourceStart:z.sourceStart??z.start,sourceEnd:z.sourceEnd??z.end};const left=structuredClone(layer),right=structuredClone(layer);left.timing={...z,...envelope,end:t};right.id=makeId();right.name=layer.name+' / 后段';right.timing={...z,...envelope,start:t};return {left,right,effects:effects.filter(e=>e.target===layer.id).map(e=>({...structuredClone(e),id:makeId(),target:right.id}))};
}
