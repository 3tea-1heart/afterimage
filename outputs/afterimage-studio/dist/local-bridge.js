// Local-only authenticated transport; editing still requires the user's API setting.
export function startLocalBridge(api,enabled){
 if(!/^https?:$/.test(location.protocol)||!['127.0.0.1','localhost'].includes(location.hostname))return;
 let stopped=false,token='',active=false;
 async function poll(){if(stopped)return;try{if(!enabled())return;if(!token){const r=await fetch('/api/session',{cache:'no-store'});if(!r.ok)return;token=(await r.json()).token;}const headers={Authorization:'Bearer '+token};const r=await fetch('/api/jobs/next',{headers,cache:'no-store'});if(!r.ok){token='';return;}const job=await r.json();if(!job)return;active=true;let result,error;try{if(job.op==='commands')result=await api.applyCommands(job.commands);else if(job.op==='project')result=api.getProject();else if(job.op==='png'){const blob=await api.exportPNG();result=await new Promise((res,rej)=>{const rd=new FileReader();rd.onload=()=>res({data:rd.result});rd.onerror=rej;rd.readAsDataURL(blob)});}else throw new Error('Unsupported operation');}catch(e){error=e.message;}await fetch('/api/jobs/'+job.id,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({result,error})});}catch{}finally{active=false;if(!stopped)setTimeout(poll,enabled()?500:2000);}}
 poll();addEventListener('pagehide',()=>{stopped=true},{once:true});return()=>{stopped=true};
}
