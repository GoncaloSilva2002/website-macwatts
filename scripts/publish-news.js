'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const maxImageBytes = 8 * 1024 * 1024;
const maxTextLength = 80000;
const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function slugify(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 72).replace(/-+$/g, '') || 'noticia';
}

function localDate() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function dateLabel(value) {
  const [year, month, day] = value.split('-').map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}

function issueField(body, label, nextLabel) {
  const normalizedBody = body.replace(/\r\n/g, '\n');
  const marker = `### ${label}\n`;
  const markerIndex = normalizedBody.indexOf(marker);
  if (markerIndex < 0) return '';
  const contentStart = markerIndex + marker.length;
  const nextMarker = nextLabel ? normalizedBody.indexOf(`\n### ${nextLabel}\n`, contentStart) : -1;
  return normalizedBody.slice(contentStart, nextMarker < 0 ? undefined : nextMarker).trim();
}

function issueImageUrl(value) {
  const markdownImage = value.match(/!\[[^\]]*\]\((https:\/\/[^\s)]+)\)/i);
  const pastedUrl = value.match(/https:\/\/[^\s<>)]+/i);
  const candidate = (markdownImage?.[1] || pastedUrl?.[0] || '').replace(/[.,;]+$/, '');
  if (!candidate) throw new Error('Anexa uma imagem ou indica um URL HTTPS direto.');
  const url = new URL(candidate);
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('A imagem tem de estar num URL HTTPS válido.');
  }
  return url.href;
}

function identifyImage(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (buffer.length > 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'jpg';
  if (buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  throw new Error('O ficheiro não é uma imagem PNG, JPG ou WebP válida.');
}

async function downloadImage(url) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
  if (!response.ok || !response.body || new URL(response.url).protocol !== 'https:') {
    throw new Error('Não foi possível obter a imagem. Usa um URL HTTPS público.');
  }
  const declaredSize = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredSize) && declaredSize > maxImageBytes) {
    throw new Error('A imagem tem de ter até 8 MB.');
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > maxImageBytes) {
      await response.body.cancel().catch(() => {});
      throw new Error('A imagem tem de ter até 8 MB.');
    }
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  return { buffer, extension: identifyImage(buffer) };
}

function renderParagraphs(text) {
  return text.replace(/\r\n/g, '\n').split(/\n\s*\n/).map(paragraph => paragraph.trim())
    .filter(Boolean).map(paragraph => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('\n');
}

function renderNewsCard(article, category) {
  const label = category === 'residencial' ? 'Residencial' : 'Empresarial';
  const href = escapeHtml(`../${article.slug}/index.html`);
  const image = escapeHtml(`../${article.image}`);
  const title = escapeHtml(article.title);
  const dateLabel = escapeHtml(article.dateLabel || article.date || "");
  return `<a class="news-card" href="${href}"><div class="news-image"><img alt="${title}" loading="lazy" src="${image}"></div><div><p class="news-meta">${label} <span>${dateLabel}</span></p><h3>${title}</h3><span class="text-link">Ler artigo</span></div></a>`;
}

function addNewsCardToListing(html, article, category) {
  const href = `href="../${article.slug}/index.html"`;
  if (html.includes(href)) return html;
  const grid = /(<div class="news-grid"[^>]*data-news-grid[^>]*>)/;
  if (!grid.test(html)) throw new Error("Nao foi possivel encontrar a lista de noticias.");
  return html.replace(grid, openingTag => `${openingTag}\n${renderNewsCard(article, category)}`);
}

async function renderArticle(article) {
  const newsIndex = await fs.readFile(path.join(root, 'noticias', 'index.html'), 'utf8');
  const header = newsIndex.match(/<header\b[\s\S]*?<\/header>/i)?.[0];
  const footer = newsIndex.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0];
  if (!header || !footer) throw new Error('Não foi possível encontrar o cabeçalho e o rodapé do site.');

  const title = escapeHtml(article.title);
  const excerpt = escapeHtml(article.excerpt);
  const date = escapeHtml(article.date);
  const label = escapeHtml(article.dateLabel);
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
<link rel="stylesheet" href="../css/residential.css?v=2">
<link rel="stylesheet" href="../css/business-navigation.css?v=3">
<link rel="stylesheet" href="../css/residential-article.css">
<link rel="stylesheet" href="../css/scroll-reveal.css">
<script defer src="../js/home.js"></script>
<script defer src="../js/scroll-reveal.js"></script>
</head>
<body class="business-home">
<a class="skip-link" href="#conteudo">Saltar para o conteúdo</a>
${header}
<main id="conteudo">
<section class="article-heading"><div class="wrap"><a class="article-back" href="../noticias/index.html">Voltar às notícias</a><p class="eyebrow">Notícias / Empresarial</p><h1>${title}</h1><time class="article-date" datetime="${date}">${label}</time></div></section>
<article class="wrap article-body"><figure><img src="${image}" alt="${title}" fetchpriority="high"></figure><div class="article-copy">${article.paragraphs}</div><div class="article-footer"><a class="text-link news-article-return" href="../noticias/index.html">Todas as notícias</a><a class="text-link" href="../contactos/index.html">Falar com a MacWatts</a></div></article>
</main>
${footer}
</body>
</html>
`;
}

async function uniqueSlug(base, entries, extension) {
  let slug = base;
  let suffix = 2;
  while (entries.some(item => item.slug === slug) || await exists(path.join(root, slug)) || await exists(path.join(root, 'assets', `noticia-${slug}.${extension}`))) {
    slug = `${base.slice(0, 66)}-${suffix++}`;
  }
  return slug;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) throw new Error('Este publicador só pode ser executado pelo formulário do GitHub.');
  const event = JSON.parse(await fs.readFile(eventPath, 'utf8'));
  const body = event.issue?.body || '';
  const title = issueField(body, 'Título da notícia', 'Imagem da notícia');
  const imageValue = issueField(body, 'Imagem da notícia', 'Texto da notícia');
  const text = issueField(body, 'Texto da notícia');

  if (!title || title.length > 160 || title === '_No response_') throw new Error('O título é obrigatório e deve ter até 160 caracteres.');
  if (!text || text === '_No response_' || text.length > maxTextLength) throw new Error('O texto é obrigatório e deve ter até 80 000 caracteres.');

  const downloaded = await downloadImage(issueImageUrl(imageValue));
  const newsFile = path.join(root, 'data', 'news.json');
  let entries = [];
  try {
    entries = JSON.parse(await fs.readFile(newsFile, 'utf8'));
    if (!Array.isArray(entries)) throw new Error('A lista de notícias tem um formato inválido.');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const slug = await uniqueSlug(slugify(title), entries, downloaded.extension);
  const date = localDate();
  const image = `assets/noticia-${slug}.${downloaded.extension}`;
  const article = {
    slug,
    title,
    image,
    excerpt: text.replace(/\s+/g, ' ').slice(0, 200).trim(),
    date,
    dateLabel: dateLabel(date),
    paragraphs: renderParagraphs(text)
  };

  const listingPath = path.join(root, 'noticias', 'index.html');
  const listingHtml = await fs.readFile(listingPath, 'utf8');
  const updatedListing = addNewsCardToListing(listingHtml, article, 'empresarial');

  await fs.mkdir(path.join(root, slug), { recursive: false });
  await fs.writeFile(path.join(root, image), downloaded.buffer, { flag: 'wx' });
  await fs.writeFile(path.join(root, slug, 'index.html'), await renderArticle(article), { flag: 'wx' });
  await fs.writeFile(listingPath, updatedListing, 'utf8');
  await fs.writeFile(newsFile, `${JSON.stringify([{ slug, title, image, excerpt: article.excerpt, date, dateLabel: article.dateLabel }, ...entries], null, 2)}\n`, 'utf8');

  if (process.env.GITHUB_OUTPUT) {
    await fs.appendFile(process.env.GITHUB_OUTPUT, `slug=${slug}\nimage=${image}\n`);
  }
  console.log(`Artigo criado: ${slug}`);
}

main().catch(error => {
  console.error(error.message || 'Não foi possível publicar a notícia.');
  process.exitCode = 1;
});
