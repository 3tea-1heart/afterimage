const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, 'afterimage-studio', 'dist');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.json':'application/json'};
const server = http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end('Not found');return}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)});
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Port 4173 is busy. Close the previous server and try again.':error.message);process.exitCode=1});
server.listen(4173,'127.0.0.1',()=>console.log('AFTERIMAGE is ready: http://127.0.0.1:4173\nKeep this window open while editing. Ctrl+C to stop.'));
