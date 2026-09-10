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
})();
