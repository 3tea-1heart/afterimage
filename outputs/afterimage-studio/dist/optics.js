// Original implementations. See SOURCES-V6.md for research and limitations.
const p=(key,label,min,max,value,step=1)=>({key,label,min,max,value,step});
const loopCycles=v=>v>0?Math.max(1,Math.round(v)):0;
export const OPTICS_EFFECTS={
 bleach:{name:'留银冲洗',cat:'摄影',icon:'◐',desc:'保留银影的去饱和与高对比模拟',params:[p('amount','留银强度',0,100,65)]},
 tritone:{name:'三色渐变映射',cat:'印刷',icon:'◓',desc:'暗部、中间调与纸白三段染色',color:'#24284f',color2:'#e66c69',params:[p('pivot','中间调位置',10,90,50),p('amount','混合强度',0,100,100)]},
 contour:{name:'等高线印相',cat:'实验',icon:'◎',desc:'将明暗分层为地形般的轮廓线',color:'#253729',color2:'#e9edb3',params:[p('bands','轮廓层数',3,24,9),p('width','线条宽度',5,60,18),p('amount','强度',0,100,100)]},
 mosaic:{name:'彩窗拼块',cat:'印刷',icon:'▦',desc:'方格采样与深色接缝',color:'#1c2030',params:[p('size','拼块尺寸',8,100,35),p('gap','接缝宽度',0,35,12),p('amount','强度',0,100,100)]},
 weave:{name:'织物印花',cat:'印刷',icon:'▩',desc:'经纬交织的亮暗结构',params:[p('size','织纹尺寸',3,30,9),p('amount','织纹强度',0,100,55)]},
 interference:{name:'干涉色膜',cat:'实验',icon:'≈',desc:'根据亮度与空间生成可循环彩色薄膜',params:[p('frequency','条纹频率',1,16,5),p('amount','混合强度',0,100,55),p('speed','每循环圈数',0,3,1)]}
};
const f=(type,params={},rest={})=>({type,params,...rest});
const look=(name,en,cat,desc,chain)=>({name,en,cat,desc,chain});
export const OPTICS_PRESETS=[
 look('水银公路','MERCURY ROAD','摄影','留银硬调 · 城市与金属',[f('bleach',{amount:80}),f('grain',{amount:13})]),
 look('沙漠战地','DESERT DISPATCH','摄影','暖灰留银 · 粗粝纪实',[f('bleach',{amount:65}),f('tone',{warmth:22}),f('grain',{amount:19})]),
 look('深蓝时刻','BLUE HOUR','摄影','深蓝阴影 · 暮色肖像',[f('splitgrade',{amount:38},{color:'#203770',color2:'#d3c4dd'}),f('curves',{shadows:38,highlights:213}),f('grain',{amount:7})]),
 look('桃色漫游','PEACH HAZE','摄影','淡桃柔焦 · 午后肖像',[f('splitgrade',{amount:27},{color:'#68567a',color2:'#ffd4ae'}),f('orton',{amount:18,radius:10})]),
 look('红蓝宣言','RED BLUE MANIFESTO','印刷','三色映射 · 编辑封面',[f('tritone',{}, {color:'#17365a',color2:'#e95453'}),f('paper',{amount:18})]),
 look('紫橙唱片','VIOLET RECORD','印刷','紫影橙调 · 唱片视觉',[f('tritone',{pivot:40},{color:'#392752',color2:'#eb8b40'}),f('grain',{amount:12})]),
 look('苔原地图','MOSS ATLAS','实验','亮度等高线 · 植物与风景',[f('contour',{bands:12}),f('paper',{amount:24})]),
 look('电流地形','ELECTRIC TERRAIN','实验','细密轮廓 · 蓝色实验',[f('contour',{bands:18,width:12},{color:'#b9edff',color2:'#162956'})]),
 look('彩窗礼拜','STAINED SUNDAY','印刷','彩色方块 · 几何重组',[f('mosaic',{size:45,gap:15}),f('tone',{saturation:30,contrast:20})]),
 look('邮票拼贴','POSTAGE MOSAIC','印刷','暖色细拼块 · 复古印物',[f('mosaic',{size:22,gap:8},{color:'#eee0bd'}),f('film',{amount:60}),f('paper',{amount:20})]),
 look('提花记忆','JACQUARD MEMORY','印刷','经纬织纹 · 纺织海报',[f('posterize',{levels:6}),f('weave',{amount:65,size:12})]),
 look('帆布午后','CANVAS AFTERNOON','摄影','轻织纹 · 柔暖照片',[f('film',{amount:40}),f('weave',{amount:30,size:6})]),
 look('油膜之梦','OIL SLICK DREAM','实验','循环彩色干涉 · 动态封面',[f('interference',{amount:75,frequency:5,speed:1})]),
 look('全息夜航','HOLOGRAPHIC FLIGHT','实验','薄膜色带与玻璃折射',[f('glass',{size:60,amount:35,speed:1}),f('interference',{amount:60,frequency:3,speed:1})]),
 look('像素织锦','PIXEL TAPESTRY','复古','像素量化与织纹',[f('pixel',{size:12}),f('posterize',{levels:4}),f('weave',{size:12,amount:55})]),
 look('反相磁带','NEGATIVE TAPE','复古','银影反转与扫描纹',[f('bleach',{amount:50}),f('solarize',{threshold:130}),f('crt',{amount:30,speed:1})])
];
export function applyOptics(c,e,t=0,duration=5){
 const x=c.getContext('2d'),w=c.width,h=c.height,im=x.getImageData(0,0,w,h),a=im.data,b=new Uint8ClampedArray(a),q=e.params,m=q.amount/100;
 if(!m)return c;
 const rgb=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)),lo=rgb(e.color||'#222222'),hi=rgb(e.color2||'#eeeeee');
 for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){
  const i=4*(y*w+xx),l=(b[i]*.2126+b[i+1]*.7152+b[i+2]*.0722)/255;let out=[b[i],b[i+1],b[i+2]];
  if(e.type==='bleach')out=out.map(v=>{const k=v/255,blend=l<.5?2*k*l:1-2*(1-k)*(1-l);return 255*(blend*.7+l*.3)});
  if(e.type==='tritone'){const pivot=q.pivot/100,upper=l>pivot,z=upper?(l-pivot)/(1-pivot):l/pivot;out=out.map((v,j)=>upper?hi[j]+(248-hi[j])*z:lo[j]+(hi[j]-lo[j])*z)}
  if(e.type==='contour'){const phase=l*q.bands;out=phase-Math.floor(phase)<q.width/100?lo:hi}
  if(e.type==='mosaic'){const size=Math.max(3,Math.round(q.size*w/1200)),gx=Math.floor(xx/size),gy=Math.floor(y/size),sx=Math.min(w-1,Math.floor((gx+.5)*size)),sy=Math.min(h-1,Math.floor((gy+.5)*size)),j=4*(sy*w+sx),edge=xx%size<size*q.gap/100||y%size<size*q.gap/100;out=edge?lo:[b[j],b[j+1],b[j+2]]}
  if(e.type==='weave'){const size=Math.max(2,Math.round(q.size*w/1200)),gx=Math.floor(xx/size),gy=Math.floor(y/size),u=xx%size/size,v=y%size/size,k=(gx+gy)%2?Math.sin(u*Math.PI):Math.sin(v*Math.PI);out=out.map(z=>z*(.58+.5*k))}
  if(e.type==='interference'){const phase=(l*q.frequency+xx/w*.65+y/h*.3-t/Math.max(.01,duration)*loopCycles(q.speed))*Math.PI*2;out=out.map((v,j)=>255*(.5+.5*Math.cos(phase+j*Math.PI*2/3))*(.3+.7*l))}
  for(let j=0;j<3;j++)a[i+j]=b[i+j]*(1-m)+out[j]*m;
 }
 x.putImageData(im,0,0);return c;
}
