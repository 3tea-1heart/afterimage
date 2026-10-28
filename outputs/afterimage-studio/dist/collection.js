// Independently implemented Canvas treatments. Research provenance: SOURCES.md.
const p=(key,label,min,max,value,step=1)=>({key,label,min,max,value,step});
const loopCycles=v=>v>0?Math.max(1,Math.round(v)):0;
export const COLLECTION_EFFECTS={
 riso:{name:'双色套印',cat:'印刷',icon:'◓',desc:'两组网点、油墨相乘与套色偏移',color:'#ed3865',color2:'#194ab2',params:[p('size','网点尺寸',3,24,8),p('offset','套色偏移',0,25,5),p('amount','油墨浓度',0,100,85)]},
 crosshatch:{name:'交叉排线',cat:'印刷',icon:'▩',desc:'依据亮度逐层增加斜向刻线',color:'#252627',color2:'#eee5cf',params:[p('spacing','线距',3,22,8),p('weight','线宽',.3,3,1,.1),p('amount','强度',0,100,100)]},
 stipple:{name:'点描印相',cat:'印刷',icon:'⠿',desc:'确定性散点重建明暗，保留透明度',color:'#212932',color2:'#f5e9d4',params:[p('size','点距',3,20,6),p('scatter','散布',0,100,65),p('amount','强度',0,100,100)]},
 thermal:{name:'热谱映射',cat:'实验',icon:'◉',desc:'将亮度映射为五段假色；不是温度测量',params:[p('shift','色谱偏移',0,100,0),p('amount','强度',0,100,100)]},
 glass:{name:'百叶玻璃',cat:'实验',icon:'▥',desc:'周期柱面折射，可播放循环位移',params:[p('size','玻璃条宽',8,150,55),p('amount','折射',0,100,55),p('speed','每循环圈数',0,3,0)]},
 splitgrade:{name:'分离染色',cat:'摄影',icon:'◒',desc:'阴影与高光分别染色，保留原始明暗',color:'#305a8c',color2:'#f1bb73',params:[p('balance','明暗分界',20,80,50),p('amount','染色强度',0,100,30)]}
};
const f=(type,params={},rest={})=>({type,params,...rest});
const look=(name,en,cat,desc,chain)=>({name,en,cat,desc,chain});
export const COLLECTION_PRESETS=[
 look('玫蓝套印','RISO / ROSE & BLUE','印刷','海报与唱片封面 · 双墨错位',[f('riso',{size:9,offset:7}),f('paper',{amount:24,dust:10})]),
 look('橘绿小刊','TANGERINE ZINE','印刷','橘色与墨绿 · 独立刊物',[f('riso',{size:6,offset:3},{color:'#ef6829',color2:'#235d4f'}),f('paper',{amount:20})]),
 look('午夜蚀刻','MIDNIGHT ETCHING','印刷','深蓝排线 · 建筑与肖像',[f('crosshatch',{spacing:7,weight:1.1},{color:'#193c62',color2:'#eee8d8'}),f('paper',{amount:16})]),
 look('铅笔手札','PENCIL NOTES','印刷','细排线与暖纸 · 写生感',[f('crosshatch',{spacing:5,weight:.6}),f('paper',{amount:30,dust:4})]),
 look('星尘点描','STARDUST PRESS','印刷','散点明暗 · 颗粒海报',[f('stipple',{size:7,scatter:80}),f('paper',{amount:15})]),
 look('植物档案','BOTANICAL ARCHIVE','印刷','绿色点描 · 静物与叶片',[f('stipple',{size:5,scatter:40},{color:'#315344',color2:'#e5dfbb'}),f('paper',{amount:22})]),
 look('黄黑警报','YELLOW ALERT','印刷','硬阈值与油墨扩散',[f('threshold',{threshold:120,noise:12},{color:'#171717',color2:'#edec48'}),f('minimum',{radius:1}),f('paper',{amount:15})]),
 look('樱桃报纸','CHERRY GAZETTE','印刷','红墨网点 · 编辑海报',[f('halftone',{size:6,amount:100},{color:'#962b40',color2:'#f1d8c5'}),f('paper',{amount:27})]),
 look('暖灰银盐','WARM SILVER','摄影','黑白暖纸 · 人像与街景',[f('tone',{saturation:-100,contrast:18}),f('splitgrade',{amount:15},{color:'#393c47',color2:'#e5c4a0'}),f('grain',{amount:9})]),
 look('海岸午后','COASTAL AFTERNOON','摄影','青色阴影与暖高光',[f('tone',{contrast:-8,saturation:-12}),f('splitgrade',{amount:23},{color:'#286f7b',color2:'#f3c681'}),f('film',{amount:25,fade:6})]),
 look('钨丝夜行','TUNGSTEN WALK','摄影','蓝影橙光 · 城市夜景',[f('splitgrade',{amount:35},{color:'#254b89',color2:'#f4a45c'}),f('halation',{amount:35,radius:8}),f('grain',{amount:12})]),
 look('褪色婚书','FADED LETTER','摄影','低对比粉棕 · 轻柔成片',[f('tone',{contrast:-15,saturation:-20,warmth:8}),f('film',{amount:30,fade:17}),f('splitgrade',{amount:12},{color:'#795d66',color2:'#f2dfbd'})]),
 look('雨幕青影','RAIN IN CYAN','摄影','冷青中间调 · 阴天街道',[f('balance',{sb:16,sr:-10,mb:9,mr:-8,hr:4}),f('tone',{contrast:16,saturation:-25}),f('grain',{amount:8})]),
 look('柔白日光','SOFT DAYLIGHT','摄影','柔亮高光 · 清淡肖像',[f('tone',{exposure:.15,contrast:-9,saturation:-8}),f('bloom',{amount:18,radius:12,threshold:190}),f('film',{amount:15,fade:4})]),
 look('琥珀终端','AMBER TERMINAL','复古','琥珀字符 · 终端海报',[f('ascii',{size:12},{color:'#ffb752',color2:'#17110a'}),f('crt',{amount:25,spacing:4})]),
 look('紫色掌机','LILAC POCKET','复古','四阶像素 · 游戏截图',[f('pixel',{size:9}),f('dither',{levels:4,size:2}),f('duotone',{}, {color:'#392c59',color2:'#d7b9ed'})]),
 look('绿色夜视','NIGHT VISION','复古','单色夜视风格 · 并非真实夜视',[f('duotone',{}, {color:'#092014',color2:'#9cdf69'}),f('grain',{amount:26,speed:1}),f('vignette',{amount:65,size:45}),f('crt',{amount:15})]),
 look('磁带日记','TAPE DIARY','复古','轻微信号摆动 · 循环播放',[f('film',{amount:55,fade:12}),f('rgb',{amount:3,speed:1}),f('glitch',{amount:8,bands:4,speed:1}),f('crt',{amount:18,spacing:3})]),
 look('热浪档案','HEAT ARCHIVE','实验','五段假色 · 超现实风景',[f('thermal',{amount:100}),f('grain',{amount:9})]),
 look('液态热谱','THERMAL TIDE','实验','动态玻璃折射与假色',[f('glass',{size:70,amount:65,speed:1}),f('thermal',{shift:15}),f('paper',{amount:10})]),
 look('磨砂记忆','REEDED MEMORY','实验','百叶折射 · 影像切片',[f('glass',{size:55,amount:75}),f('film',{amount:50,fade:7})]),
 look('流动橱窗','MOVING WINDOW','实验','循环柱面折射 · 动态封面',[f('glass',{size:90,amount:90,speed:1}),f('rgb',{amount:5}),f('tone',{saturation:15})]),
 look('珊瑚反转','CORAL REVERSAL','实验','暗房反转与珊瑚双色',[f('solarize',{threshold:150,amount:100}),f('duotone',{}, {color:'#562f62',color2:'#f3aa87'}),f('paper',{amount:16})]),
 look('冰蓝蓝图','ICE BLUEPRINT','实验','边缘线稿 · 建筑轮廓',[f('edge',{gain:3,amount:100},{color:'#d2f4ef',color2:'#163f7c'}),f('paper',{amount:13,dust:3})])
];
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const hash=(x,y)=>{let v=Math.imul(x+Math.imul(y,374761393),1274126177);return ((v^(v>>>13))>>>0)/4294967295};
export function applyCollection(c,e,t=0,duration=5){
 const ctx=c.getContext('2d',{willReadFrequently:true}),w=c.width,h=c.height,im=ctx.getImageData(0,0,w,h),a=im.data,b=new Uint8ClampedArray(a),p=e.params,s=w/1200;
 const at=(x,y)=>4*(clamp(Math.round(y),0,h-1)*w+clamp(Math.round(x),0,w-1));
 const lum=i=>(b[i]*.2126+b[i+1]*.7152+b[i+2]*.0722)/255;
 const lo=rgb(e.color||'#111111'),hi=rgb(e.color2||'#eeeeee'),mix=(p.amount??100)/100;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=4*(y*w+x),l=lum(i);let out=[b[i],b[i+1],b[i+2]];
  if(e.type==='splitgrade'){const k=clamp((l-p.balance/100)*1.5+.5);out=out.map((v,j)=>v+(lo[j]*(1-k)+hi[j]*k-128)*mix*.7)}
  if(e.type==='thermal'){const stops=[[17,12,54],[46,40,163],[214,36,111],[255,132,39],[255,247,176]],v=clamp(l+p.shift/100)*4,k=Math.min(3,Math.floor(v)),f=v-k;out=out.map((z,j)=>z*(1-mix)+(stops[k][j]*(1-f)+stops[k+1][j]*f)*mix)}
  if(e.type==='glass'){const size=Math.max(2,p.size*s),phase=t/duration*loopCycles(p.speed)*Math.PI*2,q=at(x+Math.sin(x/size*Math.PI*2+phase)*size*.45*mix,y);out=[b[q],b[q+1],b[q+2]];a[i+3]=b[q+3]}
  if(e.type==='crosshatch'){const size=Math.max(3,p.spacing*s),weight=Math.max(.45,p.weight*s),line=v=>((v%size)+size)%size<weight;const ink=(l<.83&&line(x+y))||(l<.6&&line(x-y))||(l<.35&&line(x+y+size*.5))||(l<.16&&line(x-y+size*.5));out=out.map((z,j)=>z*(1-mix)+(ink?lo[j]:hi[j])*mix)}
  if(e.type==='stipple'){const size=Math.max(3,p.size*s),gx=Math.floor(x/size),gy=Math.floor(y/size),cx=(gx+.5+(hash(gx,gy)-.5)*p.scatter/100*.7)*size,cy=(gy+.5+(hash(gx+87,gy)-.5)*p.scatter/100*.7)*size,dark=1-lum(at(cx,cy)),ink=Math.hypot(x-cx,y-cy)<size*.65*Math.sqrt(dark);out=out.map((z,j)=>z*(1-mix)+(ink?lo[j]:hi[j])*mix)}
  if(e.type==='riso'){const size=Math.max(3,p.size*s),off=p.offset*s,ink=(xx,yy,d)=>{const u=((xx%size)+size)%size-size/2,v=((yy%size)+size)%size-size/2;return Math.hypot(u,v)<size*.67*Math.sqrt(clamp(d))},a1=ink(x+y*.35,y,1-l),a2=ink(x-y*.35+off,y+off,(1-lum(at(x-off,y-off)))*.8);out=out.map((z,j)=>{let v=[246,239,219][j];if(a1)v*=lo[j]/255;if(a2)v*=hi[j]/255;return z*(1-mix)+v*mix})}
  for(let j=0;j<3;j++)a[i+j]=out[j];
 }
 ctx.putImageData(im,0,0);return c;
}
