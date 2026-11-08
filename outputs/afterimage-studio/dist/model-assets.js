import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
export async function readModel(src){
 const bytes=src.startsWith('data:')?await (await fetch(src)).arrayBuffer():await (await fetch(new URL(src,import.meta.url))).arrayBuffer();
 if(bytes.byteLength>32*1024*1024)throw new Error('模型需小于32MB');
 const view=new DataView(bytes);if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2)throw new Error('请选择 glTF 2.0 的 GLB 模型');
 const length=view.getUint32(12,true),doc=JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,20,length)));
 if(doc.skins?.length)throw new Error('目前支持静态网格与节点动画，暂不支持骨骼蒙皮 GLB');
 if([...doc.buffers||[],...doc.images||[]].some(x=>x.uri&&!x.uri.startsWith('data:')))throw new Error('GLB 必须内嵌所有贴图，不支持外链文件');
 const gltf=await new GLTFLoader().parseAsync(bytes,'');
 const bounds=new T.Box3().setFromObject(gltf.scene),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
 if(!Number.isFinite(size.length())||size.length()===0)throw new Error('模型没有可显示的几何体');
 const root=new T.Group();root.add(gltf.scene);gltf.scene.position.sub(center);root.scale.setScalar(3.2/Math.max(size.x,size.y,size.z));
 return {root,animations:gltf.animations};
}
export function cloneModel(source){const root=source.clone(true);root.traverse(o=>{if(o.geometry)o.geometry=o.geometry.clone();if(o.material)o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();});return root;}
export function disposeModel(source,textures=false){const maps=new Set();source?.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m)continue;if(textures)for(const v of Object.values(m))if(v?.isTexture)maps.add(v);m.dispose();}});maps.forEach(t=>t.dispose());}

// BoomBox's CC0 UV atlas: preserve the shell and replace only the illuminated display.
export function albumDisplay(material,image){const original=material.emissiveMap;if(!original?.image||!image)return null;const src=original.image,mask=document.createElement('canvas');mask.width=src.width;mask.height=src.height;const mx=mask.getContext('2d');mx.drawImage(src,0,0);const data=mx.getImageData(0,0,mask.width,mask.height).data;let x0=mask.width,y0=mask.height,x1=0,y1=0;const rows=[];for(let y=0;y<mask.height;y++){let left=mask.width,right=0;for(let x=0;x<mask.width;x++){const i=(y*mask.width+x)*4;if(data[i+2]>100&&data[i+1]>80&&data[i]<data[i+2]*.6){left=Math.min(left,x);right=Math.max(right,x)}}if(left<right){rows.push([y,left,right]);x0=Math.min(x0,left);x1=Math.max(x1,right);y0=Math.min(y0,y);y1=Math.max(y1,y);}}if(!rows.length)return null;const ca=document.createElement('canvas');ca.width=mask.width;ca.height=mask.height;const x=ca.getContext('2d');x.drawImage(src,0,0);x.save();x.beginPath();for(const [y,left,right]of rows)x.rect(left,y,right-left+1,1);x.clip();x.translate((x0+x1)/2,(y0+y1)/2);x.rotate(Math.PI);const w=x1-x0+1,h=y1-y0+1,scale=Math.max(w/image.width,h/image.height);x.drawImage(image,-image.width*scale/2,-image.height*scale/2,image.width*scale,image.height*scale);x.fillStyle='#152d3b30';x.fillRect(-w/2,-h/2,w,h);x.fillStyle='#111c2445';for(let y=-h/2;y<h/2;y+=3)x.fillRect(-w/2,y,w,1);x.restore();const texture=new T.CanvasTexture(ca);texture.flipY=original.flipY;texture.colorSpace=T.SRGBColorSpace;material.emissiveMap=texture;material.emissiveIntensity=.85;material.userData.ownedMap=texture;return {x:x0/ca.width,y:y0/ca.height,w:w/ca.width,h:h/ca.height};}
