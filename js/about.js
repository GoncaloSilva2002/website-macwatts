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

  const normalizeLogo = image => {
    if (!image.complete || !image.naturalWidth) return;

    try {
      const downscale = Math.min(1, 500 / image.naturalWidth, 300 / image.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * downscale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * downscale));
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let left = canvas.width;
      let top = canvas.height;
      let right = 0;
      let bottom = 0;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const offset = (y * canvas.width + x) * 4;
          const red = pixels[offset];
          const green = pixels[offset + 1];
          const blue = pixels[offset + 2];
          const alpha = pixels[offset + 3];
          const brightest = Math.max(red, green, blue);
          const darkest = Math.min(red, green, blue);

          if (alpha < 24 || (darkest > 238 && brightest - darkest < 20)) continue;
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x + 1);
          bottom = Math.max(bottom, y + 1);
        }
      }

      if (right <= left || bottom <= top) return;

      const cell = image.closest('li');
      const logoGrid = image.closest('.client-grid');
      const style = getComputedStyle(logoGrid);
      const targetHeight = parseFloat(style.getPropertyValue('--client-logo-art-height'));
      const targetWidth = Math.min(
        parseFloat(style.getPropertyValue('--client-logo-art-width')),
        cell.clientWidth - 32
      );
      const imageBox = image.getBoundingClientRect();
      const visibleWidth = ((right - left) / canvas.width) * imageBox.width;
      const visibleHeight = ((bottom - top) / canvas.height) * imageBox.height;
      const scale = Math.min(targetWidth / visibleWidth, targetHeight / visibleHeight);

      if (Number.isFinite(scale) && scale > 0) image.style.transform = `scale(${scale})`;
    } catch {
      // Keep the original contained logo if pixel inspection is unavailable.
    }
  };

  document.querySelectorAll('.company-clients .client-grid img').forEach(image => {
    if (image.complete) normalizeLogo(image);
    else image.addEventListener('load', () => normalizeLogo(image), { once: true });
  });

  details.addEventListener('toggle', () => {
    if (!details.open) return;
    requestAnimationFrame(() => {
      remainingGrid.querySelectorAll('img').forEach(image => {
        image.style.transform = '';
        normalizeLogo(image);
      });
    });
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      document.querySelectorAll('.company-clients .client-grid img').forEach(image => {
        if (image.closest('details') && !image.closest('details').open) return;
        image.style.transform = '';
        normalizeLogo(image);
      });
    }, 120);
  }, { passive: true });
})();
