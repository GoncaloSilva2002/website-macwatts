'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const siteUrl = (process.env.SITE_URL || 'https://macwatts.pt').replace(/\/+$/, '');
const excluded = /^(admin|templates|scripts|node_modules|capturas-teste)\/|^404\.html$/;

const files = execFileSync('git', ['ls-files', '*.html'], { cwd: root, encoding: 'utf8' })
  .split('\n').filter(file => file && !excluded.test(file));

const entries = [];
for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if (/http-equiv=["']refresh["']|name=["']robots["'][^>]*noindex/i.test(html)) continue;
  const urlPath = file.replace(/(^|\/)index\.html$/, '$1').split('/').map(encodeURIComponent).join('/');
  const lastmod = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: root, encoding: 'utf8' }).trim()
    || new Date().toISOString().slice(0, 10);
  entries.push(`  <url><loc>${siteUrl}/${urlPath}</loc><lastmod>${lastmod}</lastmod></url>`);
}

fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *
Disallow: /admin/

Sitemap: ${siteUrl}/sitemap.xml
`);
console.log(`sitemap.xml: ${entries.length} páginas`);
