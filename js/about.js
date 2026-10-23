(() => {
  const grid = document.querySelector('.company-clients .client-grid');
  if (!grid) return;

  const featuredCount = 12;
  const items = [...grid.children];
  if (items.length <= featuredCount) return;

  grid.setAttribute('aria-label', 'Clientes em destaque da MacWatts');
  const details = document.createElement('details');
  details.className = 'client-directory-more';

  const summary = document.createElement('summary');
  summary.textContent = 'Ver todos os clientes';

  const remainingGrid = grid.cloneNode(false);
  remainingGrid.setAttribute('aria-label', 'Restantes clientes da MacWatts');
  items.slice(featuredCount).forEach(item => remainingGrid.append(item));

  details.append(summary, remainingGrid);
  grid.after(details);
})();
