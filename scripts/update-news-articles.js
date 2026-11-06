'use strict';
// Refreshes the existing news pages: the "Outras notícias" section and the
// source link. Safe to run again whenever a news item is added.
const fs = require('node:fs/promises');
const path = require('node:path');
const { articlePagePath, renderRelatedNews, withRelatedNews, sourceLinkHtml } = require('./news-publisher');

const root = path.resolve(__dirname, '..');

(async () => {
  const news = JSON.parse(await fs.readFile(path.join(root, 'data', 'news.json'), 'utf8'));
  for (const item of news) {
    const pagePath = await articlePagePath(root, item);
    if (!pagePath) continue;
    const file = path.join(root, pagePath);
    let html = await fs.readFile(file, 'utf8');
    html = html.replace(/<a class="button article-source" href="([^"]+)"[^>]*>[^<]*<\/a>/, (match, href) =>
      sourceLinkHtml(href.replace(/&amp;/g, '&')));
    html = withRelatedNews(html, await renderRelatedNews(root, news, item, pagePath));
    await fs.writeFile(file, html, 'utf8');
    console.log(`Atualizado: ${pagePath}`);
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
