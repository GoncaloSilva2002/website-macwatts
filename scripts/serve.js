'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf'
};

function loadLocalEnvironment() {
  try {
    const content = fs.readFileSync(path.join(root, '.env'), 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || Object.hasOwn(process.env, match[1])) continue;
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

loadLocalEnvironment();
const handleAdminApi = require('./news-admin-api');

const server = http.createServer(async (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/\\/g, '/');
  } catch {
    res.writeHead(400).end();
    return;
  }

  if (pathname === '/healthz' && (req.method === 'GET' || req.method === 'HEAD')) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : 'ok');
    return;
  }

  if (await handleAdminApi(req, res, pathname, root)) return;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let target = path.resolve(root, `.${pathname}`);
  if (!target.startsWith(root + path.sep) && target !== root) {
    res.writeHead(403).end();
    return;
  }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  fs.readFile(target, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Página não encontrada');
      return;
    }
    res.writeHead(200, {
      'Content-Type': types[path.extname(target)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': path.extname(target) === '.html' ? 'no-cache' : 'public, max-age=3600'
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});

const port = Number(process.env.PORT) || 8080;
const host = process.env.HOST || (process.env.RENDER === 'true' ? '0.0.0.0' : '127.0.0.1');
server.listen(port, host, () => {
  console.log(`MacWatts: http://localhost:${port}`);
});
