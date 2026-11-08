const fs=require('fs'),path=require('path'),crypto=require('crypto');
module.exports=function createBridge({root,port}){
 const token=crypto.randomBytes(32).toString('hex'),jobs=new Map(),sessionPath=path.join(root,'work','local-api-session.json');fs.mkdirSync(path.dirname(sessionPath),{recursive:true});fs.writeFileSync(sessionPath,JSON.stringify({url:'http://127.0.0.1:'+port,token}),{mode:0o600});
 const json=(res,code,data)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
 const body=req=>new Promise((resolve,reject)=>{let size=0,parts=[];req.on('data',b=>{size+=b.length;if(size>80*1024*1024){reject(new Error('Request too large'));req.destroy();}else parts.push(b)});req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(parts).toString('utf8')))}catch{reject(new Error('Invalid JSON'))}});req.on('error',reject)});
 return async function handle(req,res,pathname){if(!pathname.startsWith('/api/'))return false;
 try{if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host))return json(res,403,{error:'Invalid host'}),true;
 if(req.headers.origin&&!['http://127.0.0.1:'+port,'http://localhost:'+port].includes(req.headers.origin))return json(res,403,{error:'Invalid origin'}),true;
 if(pathname==='/api/session'){if(req.method!=='GET'||req.headers['sec-fetch-site']!=='same-origin')return json(res,403,{error:'Same-origin browser session required'}),true;json(res,200,{token});return true;}
 const actual=Buffer.from(String(req.headers.authorization||'')),expected=Buffer.from('Bearer '+token);if(actual.length!==expected.length||!crypto.timingSafeEqual(actual,expected))return json(res,401,{error:'Invalid token'}),true;
 const now=Date.now();for(const [id,j]of jobs)if(now-j.created>300000)jobs.delete(id);
 if(pathname==='/api/jobs'&&req.method==='POST'){if(jobs.size>=100)return json(res,429,{error:'Queue full'}),true;const input=await body(req);if(!['commands','project','png'].includes(input.op))return json(res,400,{error:'Unsupported operation'}),true;if(input.op==='commands'&&(!Array.isArray(input.commands)||input.commands.length>100))return json(res,400,{error:'Invalid commands'}),true;const id=crypto.randomUUID();jobs.set(id,{id,op:input.op,commands:input.commands,status:'queued',created:now});json(res,202,{id});return true;}
 if(pathname==='/api/jobs/next'&&req.method==='GET'){const j=[...jobs.values()].find(x=>x.status==='queued');if(j)j.status='running';json(res,200,j||null);return true;}
 const id=pathname.split('/')[3],j=jobs.get(id);if(!j)return json(res,404,{error:'Job not found or expired'}),true;
 if(req.method==='GET'){json(res,200,j);return true;}if(req.method==='PUT'){if(j.status!=='running')return json(res,409,{error:'Job is not running'}),true;const input=await body(req);j.result=input.result;j.error=typeof input.error==='string'?input.error.slice(0,2000):undefined;j.status=j.error?'failed':'done';json(res,200,{ok:true});return true;}json(res,405,{error:'Method not allowed'});
 }catch(e){if(!res.headersSent)json(res,400,{error:e.message});}return true;
 };
};
