(() => {
  'use strict';
  const items = [...document.querySelectorAll('[data-gallery-image]')];
  if (!items.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-dialog';
  dialog.setAttribute('aria-label', 'Galeria do projeto South Atlantic');
  dialog.innerHTML = '<div class="photo-toolbar"><span class="photo-counter" aria-live="polite"></span><div class="photo-controls"><button type="button" data-prev aria-label="Fotografia anterior">←</button><button type="button" data-next aria-label="Fotografia seguinte">→</button><button type="button" data-close aria-label="Fechar galeria">✕</button></div></div><img alt=""><p class="photo-caption"></p>';
  document.body.append(dialog);
  let current = 0;
  let opener;
  const show = index => {
    current = (index + items.length) % items.length;
    const image = items[current].querySelector('img');
    dialog.querySelector('img').src = items[current].dataset.galleryImage;
    dialog.querySelector('img').alt = image.alt;
    dialog.querySelector('.photo-caption').textContent = image.alt;
    dialog.querySelector('.photo-counter').textContent = `${current + 1} / ${items.length} — South Atlantic`;
  };
  items.forEach((item, index) => item.addEventListener('click', () => {
    opener = item;
    show(index);
    document.body.classList.add('gallery-open');
    dialog.showModal();
    dialog.querySelector('[data-close]').focus();
  }));
  dialog.querySelector('[data-prev]').addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-next]').addEventListener('click', () => show(current + 1));
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.classList.remove('gallery-open'); opener?.focus(); });
})();
