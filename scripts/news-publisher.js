'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const maxImageBytes = 8 * 1024 * 1024;
const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const imageTypes = {
  'image/png': { extension: 'png', matches: buffer => buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  'image/jpeg': { extension: 'jpg', matches: buffer => buffer.length > 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255 },
  'image/webp': { extension: 'webp', matches: buffer => buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' }
};

class NewsInputError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function slugify(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 72).replace(/-+$/g, '') || 'noticia';
}

function todayInPortugal() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}

function imageBufferFrom(data, type) {
  if (!imageTypes[type] || typeof data !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(data)) {
    throw new NewsInputError('Escolhe uma imagem PNG, JPG ou WebP válida.');
  }
  const buffer = Buffer.from(data, 'base64');
  if (!buffer.length || buffer.length > maxImageBytes || !imageTypes[type].matches(buffer)) {
    throw new NewsInputError('A imagem tem de ser válida e ter até 8 MB.');
  }
  return { buffer, extension: imageTypes[type].extension };
}

function renderParagraphs(text) {
  return text.replace(/\r\n/g, '\n').split(/\n\s*\n/).map(paragraph => paragraph.trim())
    .filter(Boolean).map(paragraph => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('\n');
}

function sourceUrlFrom(value) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string' || value.length > 2048) {
    throw new NewsInputError('O link original tem de ter até 2048 caracteres.');
  }
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new NewsInputError('Introduz um link original válido com HTTPS.');
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new NewsInputError('O link original tem de usar HTTPS e não pode incluir credenciais.');
  }
  return url.href;
}

function customizeArticle(html, category, sourceUrl) {
  const newsListUrl = category === 'residencial' ? '../residencial/noticias.html' : '../noticias/index.html';
  const categoryLabel = category === 'residencial' ? 'Residencial' : 'Empresarial';
  let result = html.split('href="../noticias/index.html"').join(`href="${newsListUrl}"`);
  result = result.replace('<p class="eyebrow">Notícias MacWatts</p>', `<p class="eyebrow">Notícias / ${categoryLabel}</p>`);
  if (sourceUrl) {
    const safeUrl = escapeHtml(sourceUrl);
    const sourceLink = `<a class="button news-article-source" href="${safeUrl}" target="_blank" rel="noopener noreferrer">Ler a notícia original <span aria-hidden="true">↗</span></a>`;
    result = result.replace('<a class="text-link news-article-return"', `${sourceLink}<a class="text-link news-article-return"`);
  }
  return result;
}

async function renderArticle(root, article) {
  const newsIndex = await fs.readFile(path.join(root, 'noticias', 'index.html'), 'utf8');
  const header = newsIndex.match(/<header\b[\s\S]*?<\/header>/i)?.[0];
  const footer = newsIndex.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0];
  if (!header || !footer) throw new Error('Não foi possível encontrar o cabeçalho e o rodapé do site.');

  const title = escapeHtml(article.title);
  const excerpt = escapeHtml(article.excerpt);
  const date = escapeHtml(article.date);
  const dateLabel = escapeHtml(article.dateLabel);
  const image = escapeHtml(`../${article.image}`);
  return `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | Notícias MacWatts</title>
<meta name="description" content="${excerpt}">
<link rel="stylesheet" href="../assets/3a65094ad2-manrope.css">
<link rel="stylesheet" href="../css/home.css?v=2">
<link rel="stylesheet" href="../css/business-navigation.css?v=3">
<link rel="stylesheet" href="../css/news-article.css">
<script defer src="../js/home.js"></script>
</head>
<body class="business-home news-article-page">
<a class="skip-link" href="#conteudo">Saltar para o conteúdo</a>
${header}
<main id="conteudo">
<section class="news-article-intro"><div class="wrap"><a class="news-article-back" href="../noticias/index.html">← Todas as notícias</a><p class="eyebrow">Notícias MacWatts</p><h1>${title}</h1><p class="news-article-meta"><time datetime="${date}">${dateLabel}</time></p><p class="news-article-lead">${excerpt}</p></div></section>
<article class="news-article-body"><div class="wrap"><figure class="news-article-cover"><img src="${image}" alt="${title}" fetchpriority="high"><figcaption>${dateLabel}</figcaption></figure><div class="news-article-copy">${article.paragraphs}</div><a class="text-link news-article-return" href="../noticias/index.html">Voltar às notícias <span aria-hidden="true">→</span></a></div></article>
</main>
${footer}
</body>
</html>
`;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function makeSlug(root, baseSlug, existingNews, extension) {
  let slug = baseSlug;
  let suffix = 2;
  while (existingNews.some(item => item.slug === slug) || await exists(path.join(root, slug)) || await exists(path.join(root, 'assets', `noticia-${slug}.${extension}`))) {
    slug = `${baseSlug.slice(0, 66)}-${suffix++}`;
  }
  return slug;
}

async function createNews(root, input, existingNews = null) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new NewsInputError('Os dados enviados não são válidos.');
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const text = typeof input.text === 'string' ? input.text.trim() : '';
  const category = input.category;
  if (!title || title.length > 160) throw new NewsInputError('O título é obrigatório e deve ter até 160 caracteres.');
  if (!text || text.length > 80000) throw new NewsInputError('O texto é obrigatório e deve ter até 80 000 caracteres.');

  if (category !== 'residencial' && category !== 'empresarial') {
    throw new NewsInputError('Escolhe se a notícia é Residencial ou Empresarial.');
  }
  const sourceUrl = sourceUrlFrom(input.sourceUrl);
  const { buffer, extension } = imageBufferFrom(input.imageData, input.imageType);
  if (!existingNews) {
    try {
      existingNews = JSON.parse(await fs.readFile(path.join(root, 'data', 'news.json'), 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      existingNews = [];
    }
  }
  if (!Array.isArray(existingNews)) throw new Error('A lista de notícias tem um formato inválido.');

  const slug = await makeSlug(root, slugify(title), existingNews, extension);
  const date = todayInPortugal();
  const dateLabel = formatDate(date);
  const image = `assets/noticia-${slug}.${extension}`;
  const excerpt = text.replace(/\s+/g, ' ').slice(0, 200).trim();
  const article = { slug, title, image, excerpt, date, dateLabel, paragraphs: renderParagraphs(text) };
  const html = customizeArticle(await renderArticle(root, article), category, sourceUrl);
  const nextNews = [{ slug, title, image, excerpt, date, dateLabel, category, sourceUrl }, ...existingNews];

  return {
    slug,
    image,
    articleUrl: `/${slug}/index.html`,
    news: nextNews,
    files: [
      { path: image, content: buffer },
      { path: `${slug}/index.html`, content: Buffer.from(html, 'utf8') },
      { path: 'data/news.json', content: Buffer.from(`${JSON.stringify(nextNews, null, 2)}\n`, 'utf8') }
    ]
  };
}

module.exports = { NewsInputError, createNews };
