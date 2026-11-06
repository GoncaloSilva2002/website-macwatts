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
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};
const redirects = {
  '/residencia/': '/residencial/',
  '/bombas-de-calor/': '/residencial/bombas-calor.html',
  '/financiamento/': '/residencial/financiamento.html',
  '/auditoria-e-certificacao-energetica/': '/residencial/autditoria.html',
  '/carregadores-para-veiculos-eletricos/': '/residencial/carregadores.html',
  '/paineis-solares-e-baterias/': '/residencial/paineis-solares-bateria.html',
  '/2024/12/03/': '/noticias/',
  '/2025/03/14/': '/noticias/',
  '/2026/06/09/': '/noticias/'
};
// Every page only loads its own scripts. Inline styles are still used across the
// site, and the only external frames are the Google map and the Amplify app.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  'frame-src https://maps.google.com https://www.google.com https://main.d1ewoiy1pgag7s.amplifyapp.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join('; ');
const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  // Only over HTTPS: Render serves the site over HTTPS, the local server does not.
  ...(process.env.RENDER === 'true' ? { 'Strict-Transport-Security': 'max-age=31536000' } : {})
};
const blocked =/^\/(\.|scripts\/|templates\/|node_modules\/|capturas-teste\/|package(-lock)?\.json$|README\.md$|clone-report\.json$|verification-report\.json$)|\/\./;

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
const handleContactApi = require('./contact-api');

function sendNotFound(req, res) {
  fs.readFile(path.join(root, '404.html'), (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Página não encontrada');
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

const server = http.createServer(async (req, res) => {
  for (const [name, value] of Object.entries(securityHeaders)) res.setHeader(name, value);
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

  if (await handleContactApi(req, res, pathname)) return;
  if (await handleAdminApi(req, res, pathname, root)) return;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  const redirect = redirects[pathname.replace(/index\.html$/, '').replace(/([^/])$/, '$1/')];
  if (redirect && (req.method === 'GET' || req.method === 'HEAD')) {
    res.writeHead(301, { Location: redirect }).end();
    return;
  }

  if (blocked.test(pathname)) {
    sendNotFound(req, res);
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
      sendNotFound(req, res);
      return;
    }
    res.writeHead(200, {
      'Content-Type': types[path.extname(target)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': path.extname(target) === '.html'
        ? 'no-cache'
        : /^\/assets\/[0-9a-f]{10}-/.test(pathname)
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=3600'
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});

const port = Number(process.env.PORT) || 8080;
const host = process.env.HOST || (process.env.RENDER === 'true' ? '0.0.0.0' : '127.0.0.1');
server.listen(port, host, () => {
  console.log(`MacWatts: http://localhost:${port}`);
});
