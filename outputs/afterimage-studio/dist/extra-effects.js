import {curveValue} from './geometry.js';
import {createSurface} from './surface.js';
// Original CPU implementations; references and scope are documented in SOURCES.md.
const p=(key,label,min,max,value,step=1)=>({key,label,min,max,value,step});
const loopCycles=v=>v>0?Math.max(1,Math.round(v)):0;
export const EXTRA_EFFECTS={
 contrast:{name:'明度与对比度',cat:'摄影',icon:'◑',desc:'直接调节明度、对比与中间调',params:[p('brightness','明度',-100,100,0),p('contrast','对比度',-100,100,20),p('gamma','中间调 Gamma',.2,3,1,.05)]},
 curves:{name:'RGB 曲线',cat:'摄影',icon:'⌁',desc:'五点映射曲线；通道 0总 / 1红 / 2绿 / 3蓝',params:[p('channel','通道 0总 / 1红 / 2绿 / 3蓝',0,3,0),p('black','黑场输出',0,255,0),p('shadows','阴影输出',0,255,48),p('mid','中间调输出',0,255,128),p('highlights','高光输出',0,255,208),p('white','白场输出',0,255,255)]},
 balance:{name:'色彩平衡',cat:'摄影',icon:'◒',desc:'分离阴影、中间调、高光的 RGB 偏移',params:[p('sr','阴影 红 / 青',-100,100,0),p('sg','阴影 绿 / 洋红',-100,100,0),p('sb','阴影 蓝 / 黄',-100,100,15),p('mr','中间调 红 / 青',-100,100,0),p('mg','中间调 绿 / 洋红',-100,100,0),p('mb','中间调 蓝 / 黄',-100,100,0),p('hr','高光 红 / 青',-100,100,10),p('hg','高光 绿 / 洋红',-100,100,0),p('hb','高光 蓝 / 黄',-100,100,-8)]},
 levels:{name:'色阶',cat:'摄影',icon:'▥',desc:'输入黑白场与灰阶映射',params:[p('black','输入黑场',0,254,10),p('white','输入白场',1,255,245),p('gamma','灰阶 Gamma',.2,3,1,.05)]},
 pixelsort:{name:'像素排序',cat:'实验',icon:'▰',desc:'按亮度重排像素区间，拉出色带',params:[p('threshold','起始亮度',0,240,55),p('length','区间长度',8,600,160),p('vertical','方向 0横 / 1竖',0,1,0)]},
 ascii:{name:'ASCII 字符印相',cat:'复古',icon:'A',desc:'以字符密度重建明暗，保留原图透明度',params:[p('size','字符尺寸',8,40,14),p('colored','原色 0关 / 1开',0,1,0)],color:'#d4ed94',color2:'#121810'},
 ripple:{name:'液态波纹',cat:'实验',icon:'≈',desc:'正弦位移与周期性水波',params:[p('amount','波幅',0,100,28),p('frequency','波纹数量',1,24,6),p('speed','每循环圈数',0,3,1)]},
 swirl:{name:'漩涡透镜',cat:'实验',icon:'◉',desc:'围绕可移动中心扭转画面',params:[p('amount','旋转强度',-180,180,70),p('radius','范围 %',10,100,70),p('x','中心 X',0,100,50),p('y','中心 Y',0,100,50)]},
 posterize:{name:'色阶海报',cat:'印刷',icon:'▤',desc:'压缩每个通道的颜色层级',params:[p('levels','色阶数量',2,16,4),p('amount','混合强度',0,100,100)]},
 edge:{name:'霓虹边缘',cat:'实验',icon:'◇',desc:'Sobel 边缘检测映射为发光线稿',params:[p('gain','边缘强度',1,6,2,.1),p('amount','混合强度',0,100,100)],color:'#c6fc70',color2:'#101913'},
 emboss:{name:'银箔浮雕',cat:'印刷',icon:'◩',desc:'方向梯度模拟压印金属质感',params:[p('depth','浮雕深度',1,8,3,.1),p('amount','混合强度',0,100,100)]},
 prism:{name:'棱镜切片',cat:'实验',icon:'▥',desc:'切片交替反射与周期平移',params:[p('slices','切片数量',2,30,9),p('offset','折射距离',0,100,20),p('speed','每循环圈数',0,3,0)]},
 paper:{name:'纸纹与尘点',cat:'印刷',icon:'⁙',desc:'固定种子的细纤维与随机磨损',params:[p('amount','纸纹强度',0,100,30),p('dust','尘点密度',0,100,12)]},
 zoomblur:{name:'径向变焦',cat:'摄影',icon:'⊙',desc:'从可移动中心向外拉伸高光',params:[p('amount','变焦距离',0,100,30),p('x','中心 X',0,100,50),p('y','中心 Y',0,100,50)]},
 lens:{name:'镜头呼吸',cat:'摄影',icon:'◯',desc:'桶形变形、边缘色散与暗角同时生效',params:[p('distort','变形',-40,40,14),p('fringe','色散',0,20,6),p('vignette','暗角',0,100,30)]},
 misprint:{name:'套印偏移',cat:'印刷',icon:'◫',desc:'色版错位后与原版叠印',params:[p('dx','水平偏移 px',-60,60,9),p('dy','垂直偏移 px',-60,60,-6),p('amount','叠印强度',0,100,70)],color:'#e0503a'},
 leak:{name:'漏光',cat:'复古',icon:'◗',desc:'可移动的斜向暖光与边缘泛光',params:[p('x','光源 X',0,100,18),p('y','光源 Y',0,100,10),p('size','范围 %',10,120,70),p('angle','光带角度',0,360,35),p('amount','强度',0,100,45)],color:'#ffb071'}
};
const f=(type,params={},rest={})=>({type,params,...rest});
export const EXTRA_PRESETS=[
 {name:'数据瀑布',en:'DATA FALLS',cat:'实验',chain:[f('pixelsort',{threshold:40,length:380,vertical:1}),f('rgb',{amount:8}),f('grain',{amount:8})]},
 {name:'终端花园',en:'TERMINAL GARDEN',cat:'复古',chain:[f('tone',{contrast:25}),f('ascii',{size:14}),f('crt',{amount:18,spacing:5,speed:1})]},
 {name:'液态记忆',en:'LIQUID MEMORY',cat:'实验',chain:[f('ripple',{amount:32,frequency:7,speed:1}),f('rgb',{amount:4}),f('film',{amount:40})]},
 {name:'异星地形',en:'ALIEN TOPOGRAPHY',cat:'实验',chain:[f('swirl',{amount:95,radius:85}),f('edge',{gain:2.4},{color:'#e9a3d2',color2:'#191127'})]},
 {name:'银箔档案',en:'FOIL ARCHIVE',cat:'印刷',chain:[f('emboss',{depth:3.8,amount:100}),f('tone',{contrast:22,saturation:-100}),f('paper',{amount:18,dust:5})]},
 {name:'折射标本',en:'REFRACTED STUDY',cat:'实验',chain:[f('prism',{slices:7,offset:23,speed:1}),f('film',{amount:35,fade:3})]},
 {name:'酸性丝网',en:'ACID SCREENPRINT',cat:'印刷',chain:[f('posterize',{levels:3}),f('duotone',{amount:90},{color:'#302346',color2:'#d3ef67'}),f('paper',{amount:24,dust:18})]},
 {name:'失速公路',en:'VELOCITY',cat:'摄影',chain:[f('zoomblur',{amount:28,x:50,y:45}),f('tone',{contrast:20,warmth:-15}),f('grain',{amount:12})]},
 {name:'玻璃呼吸',en:'GLASS BREATH',cat:'摄影',chain:[f('lens',{distort:16,fringe:7,vignette:34}),f('film',{amount:36,fade:5})]},
 {name:'错版印刷',en:'OFF REGISTER',cat:'印刷',chain:[f('misprint',{dx:12,dy:-7,amount:85},{color:'#e2493c'}),f('paper',{amount:22,dust:10})]},
 {name:'曝光失误',en:'HAPPY ACCIDENT',cat:'复古',chain:[f('leak',{x:14,y:8,size:74,angle:38,amount:52}),f('tone',{warmth:14}),f('grain',{amount:12})]}
];
const luma=(d,i)=>d[i]*.2126+d[i+1]*.7152+d[i+2]*.0722;
const n=(x,y)=>{let v=Math.imul(x+Math.imul(y,374761393),1274126177);v^=v>>>13;return (v>>>0)/4294967295};
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function applyExtra(c,e,t=0,duration=5){
 const x=c.getContext('2d',{willReadFrequently:true}),w=c.width,h=c.height,p=e.params,s=w/1200;
 const im=x.getImageData(0,0,w,h),a=im.data,b=new Uint8ClampedArray(a);
 const sample=(xx,yy)=>4*(clamp(Math.round(yy),0,h-1)*w+clamp(Math.round(xx),0,w-1));
 const remap=fn=>{for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const i=4*(yy*w+xx),q=fn(xx,yy);for(let j=0;j<4;j++)a[i+j]=b[q+j]}};
 switch(e.type){
 case 'contrast':for(let i=0;i<a.length;i+=4)for(let j=0;j<3;j++){const v=clamp((b[i+j]-128)*(1+p.contrast/100)+128+p.brightness*2.55,0,255);a[i+j]=255*(v/255)**(1/p.gamma)}break;
 case 'curves':{const points=[p.black,p.shadows,p.mid,p.highlights,p.white],channel=Math.round(p.channel);for(let i=0;i<a.length;i+=4)for(let j=0;j<3;j++)if(!channel||j===channel-1)a[i+j]=curveValue(b[i+j],points);break;}
 case 'balance':for(let i=0;i<a.length;i+=4){const l=luma(b,i)/255,sh=(1-l)**2,hi=l*l,mid=1-sh-hi;for(let j=0;j<3;j++){const k=['r','g','b'][j];a[i+j]=b[i+j]+(p['s'+k]*sh+p['m'+k]*mid+p['h'+k]*hi)*1.2}}break;
 case 'levels':{const lo=Math.min(p.black,p.white-1),hi=Math.max(p.white,lo+1);for(let i=0;i<a.length;i+=4)for(let j=0;j<3;j++)a[i+j]=255*clamp((b[i+j]-lo)/(hi-lo),0,1)**(1/p.gamma);break;}
 case 'pixelsort':{const vertical=p.vertical>=.5,lines=vertical?w:h,size=vertical?h:w,len=Math.max(2,Math.round(p.length*s)),idx=(u,v)=>4*(vertical?(u*w+v):(v*w+u));for(let v=0;v<lines;v++){let u=0;while(u<size){if(luma(b,idx(u,v))<p.threshold||b[idx(u,v)+3]===0){u++;continue}const start=u,items=[];while(u<size&&u-start<len&&luma(b,idx(u,v))>=p.threshold&&b[idx(u,v)+3]>0){const i=idx(u++,v);items.push({i,l:luma(b,i)})}items.sort((a,b)=>a.l-b.l);items.forEach((item,k)=>{const i=idx(start+k,v);for(let j=0;j<3;j++)a[i+j]=b[item.i+j]})}}break;}
 case 'posterize':{const levels=Math.max(2,Math.round(p.levels));for(let i=0;i<a.length;i+=4)for(let j=0;j<3;j++)a[i+j]=b[i+j]*(1-p.amount/100)+Math.round(b[i+j]/255*(levels-1))*255/(levels-1)*p.amount/100;break;}
 case 'ripple':{const phase=t/duration*loopCycles(p.speed)*Math.PI*2;remap((xx,yy)=>sample(xx+Math.sin(yy/h*p.frequency*Math.PI*2+phase)*p.amount*s,yy+Math.cos(xx/w*p.frequency*Math.PI*2+phase)*p.amount*s*.3));break;}
 case 'swirl':{const cx=w*p.x/100,cy=h*p.y/100,radius=Math.max(w,h)*p.radius/100;remap((xx,yy)=>{const dx=xx-cx,dy=yy-cy,r=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)+p.amount*Math.PI/180*Math.max(0,1-r/radius)**2;return sample(cx+Math.cos(angle)*r,cy+Math.sin(angle)*r)});break;}
 case 'prism':{const slices=Math.max(2,Math.round(p.slices)),sw=w/slices,off=p.offset*s*(p.speed?Math.sin(t/duration*loopCycles(p.speed)*Math.PI*2):1);remap((xx,yy)=>{const k=Math.floor(xx/sw),local=xx-k*sw;return sample(k*sw+(k%2?sw-local:local)+off,yy)});break;}
 case 'edge':case 'emboss':{const lo=rgb(e.color2||'#000000'),hi=rgb(e.color||'#ffffff');for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const i=4*(yy*w+xx);let v;if(e.type==='emboss')v=clamp(128+(luma(b,sample(xx+1,yy+1))-luma(b,sample(xx-1,yy-1)))*p.depth,0,255)/255;else{const tl=luma(b,sample(xx-1,yy-1)),tc=luma(b,sample(xx,yy-1)),tr=luma(b,sample(xx+1,yy-1)),ml=luma(b,sample(xx-1,yy)),mr=luma(b,sample(xx+1,yy)),bl=luma(b,sample(xx-1,yy+1)),bc=luma(b,sample(xx,yy+1)),br=luma(b,sample(xx+1,yy+1));v=clamp(Math.hypot(-tl-2*ml-bl+tr+2*mr+br,-tl-2*tc-tr+bl+2*bc+br)*p.gain/255,0,1)}for(let j=0;j<3;j++)a[i+j]=b[i+j]*(1-p.amount/100)+(lo[j]+(hi[j]-lo[j])*v)*p.amount/100}break;}
 case 'paper':for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const i=4*(yy*w+xx),grain=(n(xx,yy)-.5)*p.amount*.5+Math.sin(yy*.75)*p.amount*.035,dust=n(xx+23,yy+71)<p.dust/8000?-80:0;for(let j=0;j<3;j++)a[i+j]=b[i+j]+grain+dust}break;
 case 'ascii':{const cell=Math.max(4,Math.round(p.size*s)),chars=' .:-=+*#%@',src=createSurface(w,h);src.getContext('2d').putImageData(im,0,0);x.clearRect(0,0,w,h);x.fillStyle=e.color2;x.fillRect(0,0,w,h);x.font=`bold ${cell}px monospace`;x.textBaseline='middle';x.textAlign='center';for(let yy=cell/2;yy<h;yy+=cell)for(let xx=cell/2;xx<w;xx+=cell*.65){const i=sample(xx,yy);x.fillStyle=p.colored>=.5?`rgb(${b[i]},${b[i+1]},${b[i+2]})`:e.color;x.fillText(chars[Math.min(chars.length-1,Math.floor(luma(b,i)/256*chars.length))],xx,yy)}x.save();x.globalCompositeOperation='destination-in';x.drawImage(src,0,0);x.restore();return c;}
 case 'zoomblur':{if(!p.amount)return c;const src=createSurface(w,h);src.getContext('2d').putImageData(im,0,0);x.clearRect(0,0,w,h);x.save();x.globalCompositeOperation='lighter';x.globalAlpha=1/16;const cx=w*p.x/100,cy=h*p.y/100;for(let k=0;k<16;k++){const z=1+k/15*p.amount/100*.45;x.drawImage(src,cx*(1-z),cy*(1-z),w*z,h*z)}x.restore();return c;}
 case 'lens':{const k=p.distort/100,cx=w/2,cy=h/2,maxR=Math.hypot(cx,cy),fr=p.fringe*s,vig=p.vignette/100;for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const i=4*(yy*w+xx),nx=(xx-cx)/maxR,ny=(yy-cy)/maxR,r=Math.hypot(nx,ny),g=1/(1+k*r*r*1.7),sx=cx+nx*maxR*g,sy=cy+ny*maxR*g,o=fr*(.35+r),rp=sample(sx+o,sy),gp=sample(sx,sy),bp=sample(sx-o,sy);a[i]=b[rp];a[i+1]=b[gp+1];a[i+2]=b[bp+2];if(vig){const d=Math.max(0,1-vig*Math.max(0,r-.42)/.58*1.3);for(let j=0;j<3;j++)a[i+j]*=d}}break;}
 case 'misprint':{const dx=p.dx*s,dy=p.dy*s,ink=rgb(e.color||'#e0503a'),m=p.amount/100;for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const i=4*(yy*w+xx),q0=sample(xx+dx,yy+dy),l=luma(b,q0)/255;for(let j=0;j<3;j++){const plate=255-(255-ink[j])*(.35+l*.65);a[i+j]=b[i+j]*(1-m)+b[i+j]*plate/255*m}}break;}
 case 'leak':{const cx=w*p.x/100,cy=h*p.y/100,cang=p.angle*Math.PI/180,rad=Math.max(w,h)*p.size/100*1.2,ink=rgb(e.color||'#ffb071'),m=p.amount/100,ux=Math.cos(cang),uy=Math.sin(cang);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const i=4*(yy*w+xx),dx=xx-cx,dy=yy-cy,d=Math.hypot(dx,dy)/rad,along=(dx*ux+dy*uy)/(Math.max(w,h)*.5),g=Math.max(0,1-d)*Math.max(.15,.5+.5*Math.cos(along*Math.PI))*m;for(let j=0;j<3;j++)a[i+j]=Math.min(255,b[i+j]+(255-b[i+j])*ink[j]/255*g)}break;}
 default:return c;
 }
 x.putImageData(im,0,0);return c;
}
