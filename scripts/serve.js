const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.pdf': 'application/pdf' };
http.createServer((req, res) => {
  let target;
  try { target = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
  catch { res.writeHead(400).end(); return; }
  if (!target.startsWith(root + path.sep) && target !== root) { res.writeHead(403).end(); return; }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  fs.readFile(target, (error, data) => {
    if (error) { res.writeHead(404).end('Página não encontrada'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(process.env.PORT || 8080, '127.0.0.1', () => console.log(`MacWatts: http://localhost:${process.env.PORT || 8080}`));
