(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#main-nav');
  const closeServices = () => menu.querySelectorAll('.business-menu[open]').forEach(details => { details.open = false; });
  const setOpen = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
    if (!open) closeServices();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.querySelector('.business-menu[open]')) {
      const summary = menu.querySelector('.business-menu[open] summary');
      closeServices();
      summary.focus();
      return;
    }
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) setOpen(false); });
  matchMedia('(max-width: 800px)').addEventListener('change', () => setOpen(false));
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
  const productionValue = document.querySelector('[data-production-value]');
  if (productionValue && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const min = 0;
    const max = 92;
    const cycleMs = 16000;
    const updateProduction = time => {
      const progress = (time % cycleMs) / cycleMs;
      let daylight = 0;
      if (progress < 0.12) daylight = progress / 0.12 * 0.18;
      else if (progress < 0.42) daylight = 0.18 + ((progress - 0.12) / 0.3) * 0.82;
      else if (progress < 0.66) daylight = 1;
      else if (progress < 0.94) daylight = 1 - ((progress - 0.66) / 0.28);
      productionValue.textContent = Math.round(min + daylight * (max - min));
      requestAnimationFrame(updateProduction);
    };
    requestAnimationFrame(updateProduction);
  }
})();
