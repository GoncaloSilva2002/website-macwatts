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
  const energyCards = document.querySelectorAll('#energia .directory-card');
  const energyCardImages = [
    { src: '../assets/9ed488d695-solar-panels-roof-solar-cell-1-1.jpg', alt: 'Painéis solares numa cobertura industrial' },
    { src: '../assets/b48df63d55-clean-power-battery-storage-edited-scaled-1.jpg', alt: 'Sistema de armazenamento de energia' },
    { src: '../assets/599dfa8130-gestaoint1.jpg', alt: 'Técnico a monitorizar uma instalação elétrica' },
    { src: '../assets/d814ba1c7e-electric-car-power-charging.jpg', alt: 'Veículo elétrico em carregamento' },
    { src: '../assets/e6cf090706-power-pole-2524112_1920.jpg', alt: 'Rede elétrica de alta tensão' },
    { src: '../assets/64ee4cbccb-photo-automobile-production-line-welding-car-body-modern-car-assembly-plant-auto-industry-interior-hightech-factory-modern-production-1-1.jpg', alt: 'Iluminação numa instalação industrial' },
    { src: '../assets/78e2210662-close-up-heat-pump-outside-home_23-2149250253.jpg', alt: 'Unidades de uma bomba de calor' }
  ];
  energyCards.forEach((card, index) => {
    const imageData = energyCardImages[index];
    if (!imageData || card.querySelector('.directory-card-image')) return;
    const frame = document.createElement('span');
    frame.className = 'directory-card-image';
    const image = document.createElement('img');
    image.src = imageData.src;
    image.alt = imageData.alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    frame.append(image);
    card.prepend(frame);
  });
  const addDirectoryCardImages = (sectionSelector, images) => {
    document.querySelectorAll(`${sectionSelector} .directory-card`).forEach((card, index) => {
      const imageData = images[index];
      if (!imageData || card.querySelector('.directory-card-image')) return;
      const frame = document.createElement('span');
      frame.className = 'directory-card-image';
      const image = document.createElement('img');
      image.src = imageData.src;
      image.alt = imageData.alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      frame.append(image);
      card.prepend(frame);
    });
  };
  addDirectoryCardImages('#consultoria', [
    { src: '../assets/93df7fbff6-projeto.jpg', alt: 'Técnico a trabalhar num projeto energético' },
    { src: '../assets/auditoria-certificacao-energetica.png', alt: 'Classificação energética de uma habitação e relatório de eficiência' },
    { src: '../assets/325b92b357-Instalacao-Eletrica_-veja-o-passo-a-passo-completo-1.jpg', alt: 'Plantas técnicas para auditoria' },
    { src: '../assets/contratacao-venda-energia.png', alt: 'Empresários a fechar um acordo com energias renováveis ao fundo' }
  ]);
  addDirectoryCardImages('#operacoes-e-manutencao', [
    { src: '../assets/cbd3f9886d-dji_fly_20241211_151712_156_1733930266746_photo_optimized.jpg', alt: 'Instalação fotovoltaica numa cobertura industrial' },
    { src: '../assets/e5395e3b87-gestint3.jpg', alt: 'Gestão integrada da manutenção numa instalação' }
  ]);
  addDirectoryCardImages('#financiamento', [
    { src: '../assets/solucoes-empresariais.png', alt: 'Equipa empresarial a colaborar num projeto' }
  ]);
})();
