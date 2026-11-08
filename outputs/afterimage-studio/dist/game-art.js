// Original Canvas algorithms; see SOURCES-GAME-ART.md. No game code or assets bundled.
const p=(key,label,min,max,value)=>({key,label,min,max,value,step:1});
const spec=(name,desc,params)=>({name,desc,cat:'实验',icon:'✧',params:[p('amount','强度',0,100,75),...params]});
export const GAME_EFFECTS={
 cardfoil:spec('银箔流光','冷银微刻纹与移动镜面光带',[p('detail','刻纹密度',10,100,55),p('speed','每周期圈数',0,4,1)]),
 cardholo:spec('镭射覆膜','保留原图明暗的衍射彩虹与闪点',[p('detail','衍射密度',10,100,45),p('speed','每周期圈数',0,4,1)]),
 cardprism:spec('多彩棱镜','连续虹彩映射与宽幅流动色带',[p('detail','色带密度',10,100,30),p('speed','每周期圈数',0,4,1)]),
 cardmatte:spec('哑光卡纸','压缩高光、抬黑与细纤维质感',[p('detail','纸纹',0,100,35)]),
 tensionpaint:spec('张力肖像','方向性碎笔、冷暖断色与选择性保留轮廓',[p('detail','笔触尺度',10,100,45)]),
 pixelstep:spec('像素步进','分区阶梯位移、限色与循环像素波',[p('detail','像素尺度',10,100,45),p('speed','每周期圈数',0,4,1)]),
 voxellight:spec('体素浮雕','照片采样的伪体素块面与冷暖光照',[p('detail','方块尺度',10,100,55),p('speed','每周期圈数',0,4,1)]),
 emberfield:spec('循环余烬','确定性上升火星与暖色光晕',[p('detail','火星密度',10,100,50),p('speed','每周期圈数',0,4,1)])
};
const TAU=Math.PI*2;
const hash=(x,y)=>{const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v)};
export function applyGameArt(c,e,t=0,duration=5){
 const x=c.getContext('2d'),w=c.width,h=c.height,im=x.getImageData(0,0,w,h),a=im.data,b=new Uint8ClampedArray(a),m=e.params.amount/100;
 if(!m)return c;
 const d=e.params.detail||1,phase=TAU*t/Math.max(.01,duration)*(e.params.speed||0),block=Math.max(2,Math.round(w/1200*(3+d*.28)));
 const at=(xx,yy)=>((Math.max(0,Math.min(h-1,yy|0))*w+Math.max(0,Math.min(w-1,xx|0)))*4);
 const lum=i=>b[i]*.299+b[i+1]*.587+b[i+2]*.114;
 for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
  const i=(yy*w+xx)*4;if(!b[i+3])continue;
  const u=xx/w,v=yy/h,L=lum(i),n=hash(xx,yy);let col=[b[i],b[i+1],b[i+2]];
  if(e.type==='cardmatte')col=col.map(z=>25+z*.78+(n-.5)*d*.12);
  else if(e.type==='tensionpaint'){
   const cell=Math.max(2,Math.round(w/1200*(4+d*.2))),cx=Math.floor(xx/cell),cy=Math.floor(yy/cell),j=at(cx*cell+hash(cx,cy)*cell,cy*cell+Math.sin(cx*2.1)*cell*.7),edge=Math.abs(L-lum(at(xx+1,yy)))+Math.abs(L-lum(at(xx,yy+1))),keep=Math.min(.85,edge/60),stroke=Math.sin((xx+yy*.38)/cell*9+hash(cx,cy)*4)*9;
   col=col.map((z,k)=>{const sampled=b[j+k],tone=L<125?[-14,5,20][k]:[22,5,-16][k];return z*keep+(sampled+tone+stroke)*(1-keep)});
  }else if(e.type==='pixelstep'||e.type==='voxellight'){
   const wave=e.type==='pixelstep'?Math.round(Math.sin(phase+Math.floor(yy/block)*.3)*2)*block:0,j=at(Math.floor((xx+wave)/block)*block+block/2,Math.floor(yy/block)*block+block/2);
   if(e.type==='pixelstep')col=[0,1,2].map(k=>Math.round(b[j+k]/42.5)*42.5);
   else{const fx=(xx%block)/block,fy=(yy%block)/block,face=fy<.22?1.2:fx>.72?.62:.9,glow=(Math.sin(phase)+1)*.5;col=[0,1,2].map(k=>b[j+k]*face+[glow*16,glow*3,-glow*7][k]);}
  }else if(e.type!=='emberfield'){
   const field=u*2+v*.7+Math.sin(v*8+phase)*.22+phase/TAU,shine=Math.pow(Math.max(0,Math.cos(field*TAU)),14),etch=(Math.sin((u+v)*d*20)+1)*.5;
   if(e.type==='cardfoil')col=col.map((z,k)=>z*.82+shine*[85,110,145][k]+etch*9);
   else{const rainbow=[0,1,2].map(k=>127+127*Math.cos(field*TAU*(e.type==='cardprism'?1:2)+k*TAU/3));col=col.map((z,k)=>e.type==='cardprism'?z*.52+rainbow[k]*(.22+L/510):z*.78+rainbow[k]*.22+shine*35);if(e.type==='cardholo'&&hash(Math.floor(xx/3),Math.floor(yy/3))>.995)col=col.map(z=>z+shine*80);}
  }
  for(let k=0;k<3;k++)a[i+k]=b[i+k]*(1-m)+col[k]*m;
 }
 if(e.type==='emberfield'){
  const particles=Math.round(d*1.8),ph=phase/TAU;
  for(let q=0;q<particles;q++){
   const u=hash(q,2),rise=(hash(q,8)+ph)%1,px=Math.round((u+Math.sin(phase+q)*.018)*w),py=Math.round((1-rise)*h),r=Math.max(1,Math.round(w/600*(1+hash(q,4)*2))),fade=Math.sin(rise*Math.PI)*m;
   for(let dy=-r*3;dy<=r*3;dy++)for(let dx=-r*3;dx<=r*3;dx++){const xx=px+dx,yy=py+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;const i=(yy*w+xx)*4;if(!b[i+3])continue;const f=Math.exp(-(dx*dx+dy*dy)/(r*r))*fade;for(let k=0;k<3;k++)a[i+k]=Math.min(255,a[i+k]+[255,120,35][k]*f);}
  }
 }
 x.putImageData(im,0,0);return c;
}
const recipe=(name,en,type,params={},extra=[])=>({name,en,cat:'实验',chain:[{type,params},...extra]});
export const GAME_PRESETS=[
 recipe('银箔珍藏','SILVER EDITION','cardfoil'),recipe('虹膜卡面','HOLOGRAPHIC','cardholo'),recipe('多彩幻卡','PRISM EDITION','cardprism'),recipe('无光纸牌','MATTE STOCK','cardmatte'),
 recipe('冷银闪面','COLD FOIL','cardfoil',{amount:90,detail:80}),recipe('糖纸光谱','CANDY SPECTRUM','cardholo',{amount:55,detail:75}),
 recipe('破碎的自画像','FRACTURED PORTRAIT','tensionpaint',{amount:90,detail:60},[{type:'grain',params:{amount:8}}]),
 recipe('灰蓝心绪','BLUE TEMPERA','tensionpaint',{amount:70,detail:35},[{type:'tone',params:{warmth:-18,saturation:-24}}]),
 recipe('像素机器人来信','PIXEL TRANSMISSION','pixelstep'),recipe('静止的掌机梦','HANDHELD STILL','pixelstep',{speed:0,detail:65}),
 recipe('暮色方块岛','DUSK BLOCKS','voxellight'),recipe('篝火后的余温','AFTER THE BONFIRE','voxellight',{amount:65},[{type:'emberfield',params:{amount:65,detail:50,speed:1}}]),
 recipe('漂浮的余烬','FLOATING EMBERS','emberfield'),recipe('极光色纸','AURORA PAPER','cardprism',{amount:40,detail:55},[{type:'cardmatte',params:{amount:40,detail:30}}])
];
