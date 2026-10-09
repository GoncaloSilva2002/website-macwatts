(() => {
  const grids = [...document.querySelectorAll('[data-news-grid]')];
  if (!grids.length) return;

  const feeds = new Map();
  for (const grid of grids) {
    const base = grid.dataset.newsBase || '../';
    if (!feeds.has(base)) {
      feeds.set(base, fetch(`${base}data/news.json`, { cache: 'no-store' })
        .then(response => response.ok ? response.json() : [])
        .catch(() => []));
    }

    feeds.get(base).then(items => {
      if (!Array.isArray(items)) return;
      const category = grid.dataset.newsCategory || 'empresarial';
      const limit = Number.parseInt(grid.dataset.newsLimit || '0', 10);
      const insertionPoint = grid.firstElementChild;
      const newestFirst = [...items]
        .filter(item => item && item.slug && item.title && item.image && (item.category || 'empresarial') === category)
        .sort((first, second) => String(second.date || '').localeCompare(String(first.date || '')))
        .slice(0, limit > 0 ? limit : undefined);

      for (const item of newestFirst) {
        const card = document.createElement('a');
        card.className = 'news-card';
        card.href = `${base}${encodeURIComponent(item.slug)}/index.html`;

        const imageFrame = document.createElement('div');
        imageFrame.className = 'news-image';
        const image = document.createElement('img');
        image.src = `${base}${item.image}`;
        image.alt = item.title;
        image.loading = 'lazy';
        image.decoding = 'async';
        imageFrame.append(image);

        const content = document.createElement('div');
        const meta = document.createElement('p');
        meta.className = 'news-meta';
        meta.append(document.createTextNode(category === 'residencial' ? 'Residencial ' : 'Empresarial '));
        const date = document.createElement('span');
        date.textContent = item.dateLabel || item.date || '';
        meta.append(date);
        const title = document.createElement('h3');
        title.textContent = item.title;
        const link = document.createElement('span');
        link.className = 'text-link';
        link.textContent = 'Ler artigo';
        content.append(meta, title, link);
        card.append(imageFrame, content);
        grid.insertBefore(card, insertionPoint);
      }
    });
  }
})();
