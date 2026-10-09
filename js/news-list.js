(() => {
  const grid = document.querySelector('[data-news-grid]');
  if (!grid) return;

  fetch('../data/news.json', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : [])
    .then(items => {
      if (!Array.isArray(items)) return;
      const insertionPoint = grid.firstElementChild;
      const newestFirst = [...items].sort((first, second) => String(second.date || '').localeCompare(String(first.date || '')));
      for (const item of newestFirst) {
        if (!item || !item.slug || !item.title || !item.image) continue;
        const card = document.createElement('a');
        card.className = 'news-card';
        card.href = `../${encodeURIComponent(item.slug)}/index.html`;

        const imageFrame = document.createElement('div');
        imageFrame.className = 'news-image';
        const image = document.createElement('img');
        image.src = `../${item.image}`;
        image.alt = item.title;
        image.loading = 'lazy';
        image.decoding = 'async';
        imageFrame.append(image);

        const content = document.createElement('div');
        const meta = document.createElement('p');
        meta.className = 'news-meta';
        meta.append(document.createTextNode('Empresarial '));
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
    })
    .catch(() => {});
})();
