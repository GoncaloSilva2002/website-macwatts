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
  const heroCarousel = document.querySelector('[data-hero-carousel]');
  if (heroCarousel) {
    const slides = [...heroCarousel.querySelectorAll('.hero-slide')];
    const controls = document.querySelector('.hero-carousel-controls');
    const dots = controls ? [...controls.querySelectorAll('[data-carousel-slide]')] : [];
    const previous = controls?.querySelector('[data-carousel-action="previous"]');
    const next = controls?.querySelector('[data-carousel-action="next"]');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
    let timer = null;
    let touchStartX = null;
    const show = index => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === current;
        dot.setAttribute('aria-selected', String(active));
        dot.tabIndex = active ? 0 : -1;
      });
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => {
      stop();
      if (!reducedMotion && slides.length > 1) timer = setInterval(() => show(current + 1), 7000);
    };
    dots.forEach(dot => dot.addEventListener('click', () => { show(Number(dot.dataset.carouselSlide)); start(); }));
    previous?.addEventListener('click', () => { show(current - 1); start(); });
    next?.addEventListener('click', () => { show(current + 1); start(); });
    controls?.addEventListener('mouseenter', stop);
    controls?.addEventListener('mouseleave', start);
    controls?.addEventListener('focusin', stop);
    controls?.addEventListener('focusout', event => { if (!controls.contains(event.relatedTarget)) start(); });
    heroCarousel.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') touchStartX = event.clientX; });
    heroCarousel.addEventListener('pointerup', event => {
      if (touchStartX === null) return;
      const distance = event.clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(distance) > 45) { show(current + (distance < 0 ? 1 : -1)); start(); }
    });
    show(current);
    start();
  }
  const projectsSection = document.querySelector('.company-projects');
  const projectsGrid = projectsSection && projectsSection.querySelector('.project-grid');
  if (projectsSection && projectsGrid && projectsGrid.children.length > 3) {
    const projectsMore = document.createElement('div');
    projectsMore.className = 'projects-more';
    projectsMore.innerHTML = '<button class="button" type="button">Ver mais projetos <span aria-hidden="true"></span></button>';
    projectsGrid.after(projectsMore);
    projectsMore.querySelector('button').addEventListener('click', () => {
      projectsSection.classList.add('projects-expanded');
      projectsMore.remove();
    });
  }
})();
