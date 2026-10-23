(() => {
  'use strict';

  const allProjects = [
    { slug: 'primor', title: 'Primor', category: 'Mobilidade elétrica', image: 'b587e230b1-PXL_20240924_162108483.MP_.jpg' },
    { slug: 'batherafarm', title: 'Batherafarm', category: 'Energia solar', image: '6f78979f49-BATHERAFARM-2.jpg' },
    { slug: 'bombeiros-voluntarios-de-moncao', title: 'Bombeiros Voluntários de Monção', category: 'Energia solar', image: '9916dbf53c-BV-MONCAO.png' },
    { slug: 'ert', title: 'ERT', category: 'Energia solar', image: '744c360b42-ERT7.jpg' },
    { slug: 'medlog-alcochete', title: 'Medlog Alcochete', category: 'Energia solar', image: '5d7fc2e046-dji_fly_20241212_115244_174_1734004381664_photo_optimized.jpg' },
    { slug: 'misericordia-nossa-senhora-dos-milagres', title: 'Misericórdia Nossa Senhora dos Milagres', category: 'Energia solar', image: 'e5507296c9-MILAGRES-5.jpg' },
    { slug: 'prazer-do-pao', title: 'Prazer do Pão', category: 'Energia solar', image: 'ce1bf56944-PRAZER-DO-PAO.jpg' },
    { slug: 'premium-for-leather', title: 'Premium for Leather', category: 'Energia solar', image: '32c49cbea6-Premium-for-leather.jpg' },
    { slug: 'ribeiros', title: 'Ribeiros', category: 'Energia solar', image: '2b584d9eb6-Ribeiros-1.jpg' },
    { slug: 'south-atlantic', title: 'South Atlantic', category: 'Energia solar', image: 'cbd3f9886d-dji_fly_20241211_151712_156_1733930266746_photo_optimized.jpg' },
    { slug: 'air-olesa', title: 'Air Olesa', category: 'Energia solar', image: 'aff2e7aab2-AIR-OLESA.jpg' }
  ];

  const relatedTrack = document.querySelector('.more-projects .related-grid');
  if (relatedTrack && !relatedTrack.dataset.carouselReady) {
    relatedTrack.dataset.carouselReady = 'true';
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    const currentSlug = lastPart === 'index.html' ? pathParts[pathParts.length - 2] : lastPart;
    const relatedProjects = allProjects.filter(project => project.slug !== currentSlug);

    const cards = relatedProjects.map(project => {
      const card = document.createElement('a');
      card.className = 'project-card';
      card.href = `../${project.slug}/index.html`;

      const imageFrame = document.createElement('div');
      imageFrame.className = 'project-image';
      const image = document.createElement('img');
      image.src = `../assets/${project.image}`;
      image.alt = `Projeto ${project.title}`;
      image.loading = 'lazy';
      image.decoding = 'async';
      imageFrame.append(image);

      const info = document.createElement('div');
      info.className = 'project-info';
      const copy = document.createElement('div');
      const category = document.createElement('p');
      category.textContent = project.category;
      const title = document.createElement('h3');
      title.textContent = project.title;
      copy.append(category, title);
      info.append(copy);

      const arrow = document.createElement('span');
      arrow.className = 'round-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      info.append(arrow);
      card.append(imageFrame, info);
      return card;
    });

    relatedTrack.replaceChildren(...cards);
    relatedTrack.setAttribute('role', 'region');
    relatedTrack.setAttribute('aria-label', 'Outros projetos da MacWatts');
    relatedTrack.setAttribute('aria-roledescription', 'carrossel');

    const section = relatedTrack.closest('.more-projects');
    const controls = document.createElement('div');
    controls.className = 'related-controls';
    const position = document.createElement('span');
    position.className = 'related-position';
    position.setAttribute('aria-live', 'polite');
    position.setAttribute('aria-atomic', 'true');
    const buttons = document.createElement('div');
    buttons.className = 'related-control-buttons';

    const makeControl = (label, text) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'related-control';
      button.setAttribute('aria-label', label);
      button.textContent = text;
      return button;
    };

    const previous = makeControl('Projetos anteriores', '←');
    const next = makeControl('Projetos seguintes', '→');
    buttons.append(previous, next);
    controls.append(position, buttons);
    relatedTrack.after(controls);

    const stepSize = () => {
      const firstCard = relatedTrack.querySelector('.project-card');
      if (!firstCard) return 0;
      const gap = parseFloat(getComputedStyle(relatedTrack).columnGap) || 0;
      return firstCard.getBoundingClientRect().width + gap;
    };

    const updatePosition = () => {
      const step = stepSize();
      if (!step) return;
      const visible = Math.max(1, Math.round(relatedTrack.clientWidth / step));
      const current = Math.min(
        Math.round(relatedTrack.scrollLeft / step),
        relatedProjects.length - visible
      );
      position.textContent = `${current + 1}–${Math.min(current + visible, relatedProjects.length)} de ${relatedProjects.length}`;
    };

    const move = direction => {
      const step = stepSize();
      const maximum = relatedTrack.scrollWidth - relatedTrack.clientWidth;
      if (!step || maximum <= 1) return;
      const atStart = relatedTrack.scrollLeft <= 1;
      const atEnd = relatedTrack.scrollLeft >= maximum - 2;
      if (direction > 0 && atEnd) relatedTrack.scrollTo({ left: 0, behavior: 'smooth' });
      else if (direction < 0 && atStart) relatedTrack.scrollTo({ left: maximum, behavior: 'smooth' });
      else relatedTrack.scrollBy({ left: step * direction, behavior: 'smooth' });
    };

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    let positionFrame;
    relatedTrack.addEventListener('scroll', () => {
      cancelAnimationFrame(positionFrame);
      positionFrame = requestAnimationFrame(updatePosition);
    }, { passive: true });
    window.addEventListener('resize', updatePosition, { passive: true });
    updatePosition();

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let rotationTimer;
    const stopRotation = () => {
      window.clearInterval(rotationTimer);
      rotationTimer = undefined;
    };
    const startRotation = () => {
      if (reducedMotion.matches || rotationTimer || document.hidden) return;
      rotationTimer = window.setInterval(() => move(1), 5000);
    };

    section.addEventListener('mouseenter', stopRotation);
    section.addEventListener('mouseleave', startRotation);
    section.addEventListener('focusin', stopRotation);
    section.addEventListener('focusout', event => {
      if (!section.contains(event.relatedTarget)) startRotation();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopRotation();
      else startRotation();
    });
    reducedMotion.addEventListener('change', event => {
      if (event.matches) stopRotation();
      else startRotation();
    });
    startRotation();
  }

  const items = [...document.querySelectorAll('[data-gallery-image]')];
  if (!items.length) return;
  const projectName = document.querySelector('.project-title-row h1')?.textContent.trim() || 'projeto';
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-dialog';
  dialog.setAttribute('aria-label', `Galeria do projeto ${projectName}`);
  dialog.innerHTML = '<div class="photo-toolbar"><span class="photo-counter" aria-live="polite"></span><div class="photo-controls"><button type="button" data-prev aria-label="Fotografia anterior">←</button><button type="button" data-next aria-label="Fotografia seguinte">→</button><button type="button" data-close aria-label="Fechar galeria">×</button></div></div><img alt=""><p class="photo-caption"></p>';
  document.body.append(dialog);
  let current = 0;
  let opener;
  const show = index => {
    current = (index + items.length) % items.length;
    const image = items[current].querySelector('img');
    dialog.querySelector('img').src = items[current].dataset.galleryImage;
    dialog.querySelector('img').alt = image.alt;
    dialog.querySelector('.photo-caption').textContent = image.alt;
    dialog.querySelector('.photo-counter').textContent = `${current + 1} / ${items.length} — ${projectName}`;
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
