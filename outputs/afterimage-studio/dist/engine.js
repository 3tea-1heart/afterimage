import {cropRect} from './editing.js';
import {MATERIAL_EFFECTS,applyMaterial} from './materials.js';
import {ART_EFFECTS,ART_PRESETS,applyArt} from './art.js';
import {OPTICS_EFFECTS,OPTICS_PRESETS,applyOptics} from './optics.js';
import {COLLECTION_EFFECTS,COLLECTION_PRESETS,applyCollection} from './collection.js';
import {layerPose,wrapLines,clipAlpha} from './geometry.js';
export {layerPose} from './geometry.js';
import {EXTRA_EFFECTS,EXTRA_PRESETS,applyExtra} from './extra-effects.js';
import {createSurface} from './surface.js';
export const FAMILIES=['全部','摄影','复古','印刷','实验'];
const p=(key,label,min,max,value,step=1)=>({key,label,min,max,value,step});
const loopCycles=v=>v>0?Math.max(1,Math.round(v)):0;
export const EFFECTS={
 tone:{name:'基础调色',cat:'摄影',icon:'◑',desc:'曝光、对比、饱和与冷暖',params:[p('exposure','曝光',-2,2,0,.05),p('contrast','对比',-80,100,12),p('saturation','饱和',-100,100,0),p('warmth','冷暖',-100,100,0)]},
 film:{name:'胶片色彩',cat:'摄影',icon:'▤',desc:'暖高光、青阴影与抬黑',params:[p('amount','色彩强度',0,100,65),p('fade','褪色',0,60,12)]},
 grain:{name:'胶片颗粒',cat:'摄影',icon:'⁙',desc:'可冻结或运动的细颗粒',params:[p('amount','颗粒强度',0,80,18),p('speed','运动速度',0,5,0,.1)]},
 bloom:{name:'高光柔晕',cat:'摄影',icon:'☼',desc:'只让高亮柔和溢出',params:[p('amount','柔晕',0,100,40),p('radius','范围',1,40,12),p('threshold','亮度阈值',60,245,160)]},
 halation:{name:'暖色溢光',cat:'摄影',icon:'◉',desc:'高亮周围的红橙色散射',params:[p('amount','溢光强度',0,100,45),p('radius','范围',1,30,8),p('threshold','高亮阈值',80,245,180)]},
 orton:{name:'Orton 柔焦',cat:'摄影',icon:'☁',desc:'柔光与清晰结构叠合',params:[p('amount','混合强度',0,100,30),p('radius','柔焦范围',1,35,13)]},
 vignette:{name:'裁剪后晕影',cat:'摄影',icon:'◕',desc:'随画幅重算的柔和暗角',params:[p('amount','暗角',0,100,40),p('size','中心范围',10,90,48)]},
 light:{name:'局部色光',cat:'摄影',icon:'✷',desc:'可移动的二维柔和光斑',params:[p('x','水平位置',0,100,75),p('y','垂直位置',0,100,25),p('size','光源范围',10,100,55),p('amount','亮度',0,100,45)],color:'#ffd8a0'},
 bars:{name:'电影裁边',cat:'摄影',icon:'▬',desc:'保留画幅的上下遮幅',params:[p('amount','遮幅高度 %',0,35,12)]},
 motion:{name:'方向拖影',cat:'实验',icon:'≋',desc:'沿指定方向的静态运动模糊',params:[p('distance','距离',0,80,20),p('angle','方向',0,360,0)]},
 rgb:{name:'RGB 分离',cat:'复古',icon:'◈',desc:'红蓝通道错位',params:[p('amount','错位距离',0,35,5),p('angle','方向',0,360,0),p('speed','动态速度',0,4,0,.1)]},
 pixel:{name:'像素化',cat:'复古',icon:'▦',desc:'保留块状采样的像素网格',params:[p('size','像素大小',2,60,8)]},
 dither:{name:'Bayer 抖色',cat:'复古',icon:'▧',desc:'规则的四色或黑白点阵',params:[p('size','点阵大小',1,12,2),p('levels','灰阶数量',2,8,3),p('amount','抖色强度',0,100,80)]},
 crt:{name:'CRT 扫描屏',cat:'复古',icon:'▥',desc:'扫描线、暗边与信号滚动',params:[p('amount','扫描线',0,100,45),p('spacing','线距',2,12,4),p('speed','扫描速度',0,4,0,.1)]},
 glitch:{name:'信号故障',cat:'复古',icon:'⌁',desc:'可复现的切片位移',params:[p('amount','错位强度',0,100,25),p('bands','条带数量',1,35,8),p('speed','更新速度',0,6,0,.1)]},
 duotone:{name:'双色映射',cat:'印刷',icon:'◒',desc:'将明暗映射为两种墨色',params:[p('amount','混合强度',0,100,100)],color:'#233e54',color2:'#edcda0'},
 cyanotype:{name:'蓝晒印相',cat:'摄影',icon:'◐',desc:'纸白与深蓝的印相色阶',params:[p('contrast','印相对比',0,100,30),p('amount','强度',0,100,100)]},
 halftone:{name:'半调网点',cat:'印刷',icon:'⠿',desc:'按明暗改变大小的墨点',params:[p('size','网点尺寸',3,24,8),p('amount','叠印强度',0,100,100)],color:'#213026',color2:'#e8dfbf'},
 engraving:{name:'曲线线雕',cat:'印刷',icon:'≋',desc:'由亮度调制粗细的雕刻线',params:[p('spacing','线距',3,20,6),p('curve','曲线幅度',0,30,8),p('amount','混合强度',0,100,100)],color:'#29332a',color2:'#efe4ca'},
 threshold:{name:'复印机阈值',cat:'印刷',icon:'▨',desc:'黑白分离与碳粉噪声',params:[p('threshold','黑白阈值',0,255,130),p('noise','碳粉颗粒',0,90,25)],color:'#202820',color2:'#eee9d7'},
 minimum:{name:'最小值 · 墨扩散',cat:'印刷',icon:'●',desc:'扩大暗色区域，形成油墨晕染',params:[p('radius','扩散半径',1,5,1)]},
 solarize:{name:'暗房反转',cat:'实验',icon:'◮',desc:'高于阈值的明暗翻转',params:[p('threshold','反转阈值',10,245,135),p('amount','混合强度',0,100,90)]},
 cycle:{name:'色相循环',cat:'实验',icon:'◎',desc:'周期性变色，非索引色动画',params:[p('hue','起始色相',0,360,0),p('turns','每循环圈数',0,4,1),p('amount','混合强度',0,100,100)]},
 kaleido:{name:'镜像万花筒',cat:'实验',icon:'✺',desc:'用镜像扇区重组图像',params:[p('segments','扇区数量',2,12,6),p('rotation','旋转角度',0,360,0),p('speed','每循环圈数',0,2,0)]}
};
Object.assign(EFFECTS,MATERIAL_EFFECTS,ART_EFFECTS,EXTRA_EFFECTS,COLLECTION_EFFECTS,OPTICS_EFFECTS);
export const makeEffect=(type,params={})=>({id:crypto.randomUUID(),type,enabled:true,open:false,target:'all',params:Object.fromEntries(EFFECTS[type].params.map(x=>[x.key,x.value])),...((EFFECTS[type].color)?{color:EFFECTS[type].color}:{}),...((EFFECTS[type].color2)?{color2:EFFECTS[type].color2}:{}),...params});
const fx=(type,params={},rest={})=>({type,params,...rest});
export const PRESETS=[
 {name:'夜景胶片',en:'MIDNIGHT FILM',cat:'摄影',chain:[fx('tone',{contrast:20,saturation:-12,warmth:-15}),fx('film',{amount:65,fade:8}),fx('halation',{amount:48,radius:10,threshold:170}),fx('grain',{amount:15,speed:0}),fx('vignette',{amount:30,size:55})]},
 {name:'冷银暗房',en:'SILVER ROOM',cat:'摄影',chain:[fx('tone',{contrast:24,saturation:-85,warmth:-25}),fx('film',{amount:20,fade:7}),fx('grain',{amount:12,speed:0})]},
 {name:'雾中柔光',en:'SOFT FOCUS',cat:'摄影',chain:[fx('tone',{contrast:-12,saturation:-12,warmth:15}),fx('orton',{amount:32,radius:16}),fx('light',{x:70,y:20,size:65,amount:20})]},
 {name:'蓝晒标本',en:'BLUE IMPRESSION',cat:'摄影',chain:[fx('cyanotype',{contrast:38,amount:100}),fx('grain',{amount:11,speed:0})]},
 {name:'深夜电视',en:'OFF AIR',cat:'复古',chain:[fx('tone',{contrast:20,saturation:-20,warmth:-15}),fx('rgb',{amount:4,angle:0,speed:0}),fx('crt',{amount:40,spacing:4,speed:1}),fx('grain',{amount:15,speed:1}),fx('vignette',{amount:45,size:50})]},
 {name:'掌机来信',en:'POCKET MEMORY',cat:'复古',chain:[fx('pixel',{size:7}),fx('dither',{size:2,levels:4,amount:90}),fx('duotone',{amount:100},{color:'#27382c',color2:'#b8ce78'})]},
 {name:'失真信号',en:'SIGNAL LOST',cat:'复古',chain:[fx('rgb',{amount:10,angle:0,speed:1}),fx('glitch',{amount:30,bands:8,speed:2}),fx('crt',{amount:20,spacing:3,speed:0})]},
 {name:'双色刊物',en:'TWO INKS',cat:'印刷',chain:[fx('tone',{contrast:24,saturation:0,warmth:0}),fx('halftone',{size:7,amount:70},{color:'#2a4476',color2:'#edaf7c'}),fx('grain',{amount:9,speed:0})]},
 {name:'地下复印刊',en:'COPY OF A COPY',cat:'印刷',chain:[fx('threshold',{threshold:135,noise:38}),fx('minimum',{radius:1})]},
 {name:'铜版肖像',en:'ETCHED IN TIME',cat:'印刷',chain:[fx('engraving',{spacing:6,curve:10,amount:100}),fx('grain',{amount:10,speed:0})]},
 {name:'银盐幽灵',en:'SILVER GHOST',cat:'实验',chain:[fx('tone',{contrast:12,saturation:-100,warmth:0}),fx('solarize',{threshold:135,amount:90}),fx('duotone',{amount:70},{color:'#253440',color2:'#d3ded6'})]},
 {name:'酸性色流',en:'CHROMA DRIFT',cat:'实验',chain:[fx('tone',{contrast:20,saturation:50,warmth:0}),fx('cycle',{hue:25,turns:1,amount:100}),fx('grain',{amount:8,speed:0})]}
];
PRESETS.push(...ART_PRESETS,...EXTRA_PRESETS,...COLLECTION_PRESETS,...OPTICS_PRESETS);
export function buildChain(recipe){return recipe.chain.map(e=>{const o=makeEffect(e.type);return {...o,...e,id:crypto.randomUUID(),params:{...o.params,...e.params}}})}
export const canvas=createSurface;
const clamp=x=>Math.min(255,Math.max(0,x));
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const lum=(a,i)=>a[i]*.2126+a[i+1]*.7152+a[i+2]*.0722;
const noise=(x,y,s=0)=>{let n=Math.imul(x+Math.imul(y,374761393)+Math.imul(s,668265263),1274126177);n=(n^(n>>>13));return ((n>>>0)%65536)/65535;};
function mapPixels(c,fn){const x=c.getContext('2d',{willReadFrequently:true}),im=x.getImageData(0,0,c.width,c.height),a=im.data;for(let i=0;i<a.length;i+=4)fn(a,i,(i/4)%c.width,Math.floor(i/4/c.width));x.putImageData(im,0,0);}
export function applyEffect(c,e,t=0,duration=5){if(!e.enabled)return c;const w=c.width,h=c.height,x=c.getContext('2d',{willReadFrequently:true}),p=e.params,s=w/1200;const copy=()=>{const z=canvas(w,h);z.getContext('2d').drawImage(c,0,0);return z};
 switch(e.type){
 case 'tone':mapPixels(c,(a,i)=>{const l=lum(a,i),sat=1+p.saturation/100,k=1+p.contrast/100,gain=2**p.exposure;for(let j=0;j<3;j++){let z=(l+(a[i+j]-l)*sat)*gain;z=(z-128)*k+128;z+=p.warmth*.38*(j===0?1:j===2?-1:.1);a[i+j]=clamp(z)}});break;
 case 'film':mapPixels(c,(a,i)=>{const l=lum(a,i)/255,m=p.amount/100,sh=1-l;const vals=[a[i]*.97+14*l-6*sh,a[i+1]*.98+4,a[i+2]*.91+16*sh];for(let j=0;j<3;j++)a[i+j]=clamp(a[i+j]*(1-m)+vals[j]*m+p.fade*(1-a[i+j]/255));});break;
 case 'grain':{const seed=Math.floor(t*p.speed*12);mapPixels(c,(a,i,xx,yy)=>{const n=(noise(xx,yy,seed)-.5)*p.amount;for(let j=0;j<3;j++)a[i+j]+=n});break;}
 case 'duotone':case 'cyanotype':{const lo=rgb(e.type==='cyanotype'?'#092c67':e.color),hi=rgb(e.type==='cyanotype'?'#eef0dc':e.color2),m=p.amount/100;mapPixels(c,(a,i)=>{let l=lum(a,i)/255;if(e.type==='cyanotype')l=Math.max(0,Math.min(1,(l-.5)*(1+p.contrast/100)+.5));for(let j=0;j<3;j++)a[i+j]=a[i+j]*(1-m)+(lo[j]+(hi[j]-lo[j])*l)*m;});break;}
 case 'threshold':{const lo=rgb(e.color),hi=rgb(e.color2);mapPixels(c,(a,i,xx,yy)=>{const col=lum(a,i)+(noise(xx,yy)-.5)*p.noise>p.threshold?hi:lo;for(let j=0;j<3;j++)a[i+j]=col[j]});break;}
 case 'solarize':mapPixels(c,(a,i)=>{for(let j=0;j<3;j++)if(a[i+j]>p.threshold)a[i+j]=a[i+j]*(1-p.amount/100)+(255-a[i+j])*p.amount/100});break;
 case 'pixel':{const size=Math.max(1,p.size*s),sm=canvas(w/size,h/size),cx=sm.getContext('2d');cx.drawImage(c,0,0,sm.width,sm.height);x.clearRect(0,0,w,h);x.imageSmoothingEnabled=false;x.drawImage(sm,0,0,w,h);x.imageSmoothingEnabled=true;break;}
 case 'dither':{const matrix=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],size=Math.max(1,Math.round(p.size*s));mapPixels(c,(a,i,xx,yy)=>{const n=(matrix[(Math.floor(yy/size)%4)*4+Math.floor(xx/size)%4]/16-.5)*p.amount/100*255/(p.levels-1);const v=Math.round(clamp(lum(a,i)+n)/255*(p.levels-1))*255/(p.levels-1);a[i]=a[i+1]=a[i+2]=v});break;}
 case 'rgb':{const im=x.getImageData(0,0,w,h),a=im.data,b=new Uint8ClampedArray(a),v=p.amount*s*(p.speed?(.7+.3*Math.sin(t*p.speed*Math.PI*2)):1),dx=Math.round(Math.cos(p.angle*Math.PI/180)*v),dy=Math.round(Math.sin(p.angle*Math.PI/180)*v);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const i=(yy*w+xx)*4,r=(Math.max(0,Math.min(h-1,yy+dy))*w+Math.max(0,Math.min(w-1,xx+dx)))*4,bl=(Math.max(0,Math.min(h-1,yy-dy))*w+Math.max(0,Math.min(w-1,xx-dx)))*4;a[i]=b[r];a[i+2]=b[bl+2]}x.putImageData(im,0,0);break;}
 case 'crt':{const spacing=Math.max(2,p.spacing*s),offset=(t*p.speed*25)%spacing;x.save();x.globalCompositeOperation='source-atop';x.fillStyle=`rgba(0,0,0,${p.amount/100*.65})`;for(let yy=offset;yy<h;yy+=spacing)x.fillRect(0,yy,w,Math.max(1,spacing*.35));x.restore();break;}
 case 'glitch':{const z=copy(),seed=Math.floor(t*p.speed*8);for(let k=0;k<p.bands;k++){const yy=Math.floor(noise(k,2,seed)*h),hh=Math.max(1,Math.floor(noise(k,3,seed)*h*.04)),dx=(noise(k,4,seed)-.5)*p.amount*s*2;x.clearRect(0,yy,w,hh);x.drawImage(z,0,yy,w,Math.min(hh,h-yy),dx,yy,w,Math.min(hh,h-yy));}break;}
 case 'vignette':{const grad=x.createRadialGradient(w/2,h/2,Math.min(w,h)*p.size/200,w/2,h/2,Math.hypot(w,h)/2);grad.addColorStop(0,'transparent');grad.addColorStop(1,`rgba(0,0,0,${p.amount/100})`);x.save();x.globalCompositeOperation='source-atop';x.fillStyle=grad;x.fillRect(0,0,w,h);x.restore();break;}
 case 'light':{const cx=w*p.x/100,cy=h*p.y/100,rad=Math.max(w,h)*p.size/100,co=rgb(e.color),g=x.createRadialGradient(cx,cy,0,cx,cy,rad);g.addColorStop(0,`rgba(${co.join(',')},${p.amount/100})`);g.addColorStop(1,`rgba(${co.join(',')},0)`);x.save();x.globalCompositeOperation='screen';x.fillStyle=g;x.fillRect(0,0,w,h);x.restore();break;}
 case 'bars':x.save();x.fillStyle='#080b09';x.fillRect(0,0,w,h*p.amount/100);x.fillRect(0,h*(1-p.amount/100),w,h*p.amount/100);x.restore();break;
 case 'orton':{const z=copy();x.save();x.globalCompositeOperation='screen';x.globalAlpha=p.amount/100*.65;x.filter=`blur(${Math.max(.5,p.radius*s)}px)`;x.drawImage(z,0,0);x.restore();break;}
 case 'bloom':case 'halation':{const z=copy();mapPixels(z,(a,i)=>{const l=lum(a,i),v=Math.max(0,(l-p.threshold)/(255-p.threshold));a[i+3]*=v;if(e.type==='halation'){a[i]=255;a[i+1]=85;a[i+2]=28}});x.save();x.globalCompositeOperation='screen';x.globalAlpha=p.amount/100;x.filter=`blur(${Math.max(.5,p.radius*s)}px)`;x.drawImage(z,0,0);x.restore();break;}
 case 'motion':{const z=copy(),n=12,dx=Math.cos(p.angle*Math.PI/180)*p.distance*s,dy=Math.sin(p.angle*Math.PI/180)*p.distance*s;x.clearRect(0,0,w,h);x.save();x.globalCompositeOperation='lighter';x.globalAlpha=1/n;for(let k=0;k<n;k++)x.drawImage(z,dx*(k/(n-1)-.5),dy*(k/(n-1)-.5));x.restore();break;}
 case 'halftone':{const z=copy(),a=z.getContext('2d').getImageData(0,0,w,h).data,size=Math.max(2,p.size*s),out=canvas(w,h),ox=out.getContext('2d');ox.fillStyle=e.color2;ox.fillRect(0,0,w,h);ox.fillStyle=e.color;for(let yy=size/2;yy<h;yy+=size)for(let xx=size/2;xx<w;xx+=size){const i=(Math.floor(yy)*w+Math.floor(xx))*4,r=Math.sqrt(1-lum(a,i)/255)*size*.7;ox.beginPath();ox.arc(xx,yy,r,0,Math.PI*2);ox.fill();}ox.globalCompositeOperation='destination-in';ox.drawImage(z,0,0);x.save();x.globalAlpha=p.amount/100;x.drawImage(out,0,0);x.restore();break;}
 case 'engraving':{const lo=rgb(e.color),hi=rgb(e.color2),sp=Math.max(2,p.spacing*s),m=p.amount/100;mapPixels(c,(a,i,xx,yy)=>{const l=lum(a,i)/255,phase=(yy+Math.sin(xx/w*10)*p.curve*s)/sp;const v=(Math.sin(phase*Math.PI*2)*.5+.5)>l?lo:hi;for(let j=0;j<3;j++)a[i+j]=a[i+j]*(1-m)+v[j]*m});break;}
 case 'minimum':{const im=x.getImageData(0,0,w,h),a=im.data,b=new Uint8ClampedArray(a),r=Math.max(1,Math.round(p.radius*s));for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const i=(yy*w+xx)*4;for(let j=0;j<3;j++){let v=255;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const q=(Math.max(0,Math.min(h-1,yy+dy))*w+Math.max(0,Math.min(w-1,xx+dx)))*4;v=Math.min(v,b[q+j])}a[i+j]=v;}}x.putImageData(im,0,0);break;}
 case 'cycle':{const z=copy();x.save();x.clearRect(0,0,w,h);x.filter='none';x.globalAlpha=1-p.amount/100;x.drawImage(z,0,0);x.globalAlpha=p.amount/100;x.filter=`hue-rotate(${p.hue+t/duration*loopCycles(p.turns)*360}deg)`;x.globalCompositeOperation='lighter';x.drawImage(z,0,0);x.restore();break;}
 case 'kaleido':{const im=x.getImageData(0,0,w,h),a=im.data,b=new Uint8ClampedArray(a),sector=Math.PI*2/p.segments,rot=p.rotation*Math.PI/180+t/duration*loopCycles(p.speed)*Math.PI*2;for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const dx=xx-w/2,dy=yy-h/2,r=Math.hypot(dx,dy);let ang=((Math.atan2(dy,dx)+rot)%sector+sector)%sector;ang=Math.min(ang,sector-ang);const sx=Math.max(0,Math.min(w-1,Math.round(w/2+r*Math.cos(ang)))),sy=Math.max(0,Math.min(h-1,Math.round(h/2+r*Math.sin(ang)))),i=(yy*w+xx)*4,q=(sy*w+sx)*4;for(let j=0;j<4;j++)a[i+j]=b[q+j]}x.putImageData(im,0,0);break;}
 default:if(MATERIAL_EFFECTS[e.type])return applyMaterial(c,e);if(ART_EFFECTS[e.type])return applyArt(c,e);if(OPTICS_EFFECTS[e.type])return applyOptics(c,e,t,duration);return COLLECTION_EFFECTS[e.type]?applyCollection(c,e,t,duration):applyExtra(c,e,t,duration);
 }return c;
}
export function drawLayer(ctx,l,assets,t,duration){l=layerPose(l,t,duration);ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.rotation*Math.PI/180);ctx.globalAlpha=l.opacity/100;ctx.globalCompositeOperation=l.blend||'source-over';if(l.shadow){ctx.shadowColor='#0009';ctx.shadowBlur=l.shadow;ctx.shadowOffsetX=l.shadow*.35;ctx.shadowOffsetY=l.shadow*.6;}
 if(l.type==='image'){const im=assets.get(l.src);if(im){if(l.fit==='cover'){const crop=cropRect(im,l);ctx.drawImage(im,crop.x,crop.y,crop.w,crop.h,-l.w/2,-l.h/2,l.w,l.h)}else ctx.drawImage(im,-l.w/2,-l.h/2,l.w,l.h)};}
 else if(l.type==='text'||l.type==='sticker'){if(l.glow){ctx.shadowColor=l.glowColor||'#c5a953';ctx.shadowBlur=l.glow;}ctx.scale(l.textScaleX||1,1);ctx.fillStyle=l.color;ctx.strokeStyle=l.strokeColor||'#17231e';ctx.lineWidth=l.stroke||0;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${l.weight||700} ${l.fontSize}px ${l.font==='monospace'?'Consolas, Microsoft YaHei, monospace':l.font==='serif'?'SimSun, serif':'Arial, Microsoft YaHei, sans-serif'}`;const content=l.content||'';if(l.layout==='circle'){const chars=Array.from(content),radius=Math.max(20,l.w/2),off=l.animate?t/duration*Math.PI*2:0;chars.forEach((ch,i)=>{const a=-Math.PI/2+i*Math.PI*2/Math.max(chars.length,1)+off;ctx.save();ctx.translate(Math.cos(a)*radius,Math.sin(a)*radius);ctx.rotate(a+Math.PI/2);if(l.stroke)ctx.strokeText(ch,0,0);ctx.fillText(ch,0,0);ctx.restore()});}else{const lines=wrapLines(ctx,content,l.w,l.wrap!==false);ctx.textAlign=l.align||'center';lines.forEach((line,i)=>{const y=(i-(lines.length-1)/2)*l.fontSize*(l.lineHeight||1.35);if(l.animate){let chars=Array.from(line),width=ctx.measureText(line).width,xx=-width/2;for(let j=0;j<chars.length;j++){const cw=ctx.measureText(chars[j]).width,yy=y+Math.sin(j*.55+t/duration*Math.PI*2)*l.fontSize*.2;if(l.stroke)ctx.strokeText(chars[j],xx+cw/2,yy);ctx.fillText(chars[j],xx+cw/2,yy);xx+=cw}}else{const tx=l.align==='left'?-l.w/2:l.align==='right'?l.w/2:0;if(l.stroke)ctx.strokeText(line,tx,y);ctx.fillText(line,tx,y)}})}}
 else if(l.type==='shape'){ctx.fillStyle=l.color;ctx.strokeStyle=l.color;ctx.lineWidth=l.stroke||4;if(l.shape==='line'){ctx.beginPath();ctx.moveTo(-l.w/2,-l.h/2);ctx.lineTo(l.w/2,l.h/2);ctx.stroke();}else if(l.shape==='circle'){ctx.beginPath();ctx.ellipse(0,0,l.w/2,l.h/2,0,0,Math.PI*2);ctx.fill()}else ctx.fillRect(-l.w/2,-l.h/2,l.w,l.h);}
 ctx.restore();}
function applyLayerMask(c,l,scale,t,duration){
 const m=l.mask;if(!m||m.type==='none')return;const pose=layerPose(l,t,duration),mask=canvas(c.width,c.height),mx=mask.getContext('2d');
 mx.save();mx.scale(scale,scale);mx.translate(pose.x,pose.y);mx.rotate(pose.rotation*Math.PI/180);mx.translate(pose.w*(m.x-50)/100,pose.h*(m.y-50)/100);mx.fillStyle='#fff';mx.filter=m.feather?`blur(${m.feather*scale}px)`:'none';
 const mw=pose.w*m.w/100,mh=pose.h*m.h/100;if(m.type==='ellipse'){mx.beginPath();mx.ellipse(0,0,mw/2,mh/2,0,0,Math.PI*2);mx.fill()}else mx.fillRect(-mw/2,-mh/2,mw,mh);mx.restore();
 const x=c.getContext('2d');x.save();x.globalCompositeOperation=m.invert?'destination-out':'destination-in';x.drawImage(mask,0,0);x.restore();
}
// How much transparent margin an effect needs so its glow/blur is not clipped at the layer box edge.
function effectPad(e){
 const q=e.params||{};
 if(e.type==='bloom'||e.type==='halation'||e.type==='orton')return (q.radius||12)*2.2;
 if(e.type==='motion')return q.distance||20;
 if(e.type==='glitch')return (q.amount||25)*1.2;
 return 0;
}
// 图层效果结果缓存：姿态、时间与画质不变时，整层像素处理结果可以直接复用。
// 键里剔除 x/y/rotation/opacity/motion/keyframes 等合成阶段才用到的字段，
// 这样拖动、播放、缩放画布都不会让效果重新跑一遍。
const effectCache=new Map(),EFFECT_CACHE_MAX=12;
function effectSig(effects){
 let out='';
 for(const e of effects){const p=e.params||{};out+=e.type;
  for(const k of Object.keys(p).sort())out+='|'+k+'='+p[k];
  if(e.color)out+='|c='+e.color;if(e.color2)out+='|c2='+e.color2;if(e.enabled===false)out+='|off';
  out+=';'}
 return out;
}
function layerSig(l){
 return JSON.stringify({...l,x:0,y:0,rotation:0,opacity:100,blend:'source-over',motion:null,keyframes:null,timing:null,hidden:false,locked:false,src:l.src?(l.src.length+':'+l.src.slice(-32)):''});
}
// 只有带运动参数的效果与文字动画会随时间变化，其余效果在整个时间轴上是静态的。
function timeBound(l,effects){
 if(l.animate)return true;
 for(const e of effects){const p=e.params||{};if(p.speed>0||(e.type==='cycle'&&p.turns>0))return true}
 return false;
}
function cachedLocal(key,build){
 const hit=effectCache.get(key);
 if(hit){effectCache.delete(key);effectCache.set(key,hit);return hit}
 const made=build();
 effectCache.set(key,made);
 if(effectCache.size>EFFECT_CACHE_MAX)effectCache.delete(effectCache.keys().next().value);
 return made;
}

export function render(doc,assets,maxSide=1000,t=0,bypass=false){
 const sc=Math.min(1,maxSide/Math.max(doc.width,doc.height)),w=Math.round(doc.width*sc),h=Math.round(doc.height*sc),c=canvas(w,h),ctx=c.getContext('2d',{willReadFrequently:true});
 if(!doc.transparent){ctx.fillStyle=doc.background;ctx.fillRect(0,0,w,h)}
 for(const source of doc.layers){const alpha=clipAlpha(source,t,doc.duration);if(source.hidden||alpha<=0)continue;const l={...source,opacity:source.opacity*alpha};const effects=bypass?[]:doc.effects.filter(e=>e.target===l.id&&e.enabled);const localTime=Math.max(0,t-(source.timing?.start||0));
  if(effects.length){
   const pose=layerPose(l,t,doc.duration),lw=Math.max(1,Math.round(pose.w*sc)),lh=Math.max(1,Math.round(pose.h*sc)),pad=Math.ceil(Math.max(0,...effects.map(effectPad))*(lw/1200))+2;
   const key=layerSig(source)+'#'+effectSig(effects)+'#'+lw+'x'+lh+'+'+pad+'+'+Math.round(sc*1000)+'+'+doc.duration+'#'+(timeBound(source,effects)?Math.round(localTime*30)/30:0);
   const local=cachedLocal(key,()=>{
    const box=canvas(lw+pad*2,lh+pad*2),ox=box.getContext('2d',{willReadFrequently:true});
    ox.translate(pad,pad);ox.scale(lw/pose.w,lh/pose.h);
    drawLayer(ox,{...pose,x:pose.w/2,y:pose.h/2,rotation:0,opacity:100,blend:'source-over',motion:undefined},assets,localTime,doc.duration);
    ox.setTransform(1,0,0,1,0,0);effects.forEach(e=>applyEffect(box,e,localTime,doc.duration));
    return box;
   });
   const lc=canvas(w,h),lx=lc.getContext('2d');lx.save();lx.translate(pose.x*sc,pose.y*sc);lx.rotate(pose.rotation*Math.PI/180);lx.drawImage(local,-(pad+lw/2),-(pad+lh/2),local.width,local.height);lx.restore();
   if(l.mask&&l.mask.type!=='none')applyLayerMask(lc,l,sc,t,doc.duration);
   ctx.save();ctx.globalAlpha=l.opacity/100;ctx.globalCompositeOperation=l.blend;ctx.drawImage(lc,0,0);ctx.restore();
  }else if(l.mask&&l.mask.type!=='none'){
   const lc=canvas(w,h),lx=lc.getContext('2d');lx.scale(sc,sc);drawLayer(lx,{...l,opacity:100,blend:'source-over'},assets,t,doc.duration);lx.setTransform(1,0,0,1,0,0);applyLayerMask(lc,l,sc,t,doc.duration);
   ctx.save();ctx.globalAlpha=l.opacity/100;ctx.globalCompositeOperation=l.blend;ctx.drawImage(lc,0,0);ctx.restore();
  }else{ctx.save();ctx.scale(sc,sc);drawLayer(ctx,l,assets,t,doc.duration);ctx.restore()}
 }
 if(!bypass)doc.effects.filter(e=>e.target==='all').forEach(e=>applyEffect(c,e,t,doc.duration));return c;
}
