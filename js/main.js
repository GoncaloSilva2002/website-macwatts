/* Plain JavaScript: no WordPress, Elementor runtime or external libraries. */
(() => {
  'use strict';
  document.querySelectorAll('.e-con').forEach(el => el.classList.add('e-lazyloaded'));

  document.querySelectorAll('.elementor-menu-toggle').forEach((toggle, index) => {
    const menu = toggle.parentElement.querySelector('nav.elementor-nav-menu--dropdown');
    if (!menu) return;
    menu.id = `mobile-menu-${index}`;
    toggle.setAttribute('aria-controls', menu.id);
    toggle.setAttribute('aria-label', 'Abrir menu');
    function setOpen(open) {
      toggle.classList.toggle('elementor-active', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      menu.querySelectorAll('a').forEach(a => a.tabIndex = open ? 0 : -1);
    }
    setOpen(false);
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    toggle.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', e => { if (!toggle.parentElement.contains(e.target)) setOpen(false); });
  });

  document.querySelectorAll('.elementor-slides-wrapper').forEach(slider => {
    const slides = [...slider.querySelectorAll('.swiper-slide')];
    if (!slides.length) return;
    let current = 0;
    let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let hovered = false;
    slider.setAttribute('role', 'region');
    slider.setAttribute('aria-label', 'Soluções MacWatts');
    slider.setAttribute('aria-roledescription', 'carrossel');
    const pagination = slider.querySelector('.swiper-pagination') || slider.appendChild(document.createElement('div'));
    pagination.className = 'swiper-pagination';
    const dots = slides.map((slide, i) => {
      const dot = document.createElement('button');
      dot.className = 'swiper-pagination-bullet';
      dot.setAttribute('aria-label', slide.querySelector('.elementor-slide-heading')?.textContent || `Slide ${i + 1}`);
      dot.addEventListener('click', () => show(i));
      pagination.append(dot);
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-label', `${i + 1} de ${slides.length}`);
      return dot;
    });
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === current);
        slide.setAttribute('aria-hidden', String(i !== current));
        slide.inert = i !== current;
        dots[i].classList.toggle('swiper-pagination-bullet-active', i === current);
        dots[i].setAttribute('aria-current', String(i === current));
      });
    }
    [['prev', '‹', 'Slide anterior', -1], ['next', '›', 'Slide seguinte', 1]].forEach(([name, icon, label, step]) => {
      const button = document.createElement('button');
      button.className = `slide-control slide-${name}`;
      button.textContent = icon;
      button.setAttribute('aria-label', label);
      button.addEventListener('click', () => show(current + step));
      slider.append(button);
    });
    const pause = document.createElement('button');
    pause.className = 'slide-pause';
    const updatePause = () => { pause.textContent = paused ? 'Reproduzir' : 'Pausar'; pause.setAttribute('aria-pressed', String(paused)); };
    updatePause();
    pause.addEventListener('click', () => { paused = !paused; updatePause(); });
    slider.append(pause);
    slider.addEventListener('mouseenter', () => hovered = true);
    slider.addEventListener('mouseleave', () => hovered = false);
    slider.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); show(current + (e.key === 'ArrowRight' ? 1 : -1)); }
    });
    let touchX = 0;
    slider.addEventListener('touchstart', e => touchX = e.changedTouches[0].clientX, { passive: true });
    slider.addEventListener('touchend', e => {
      const delta = e.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 50) show(current + (delta < 0 ? 1 : -1));
    }, { passive: true });
    show(0);
    slider.classList.add('is-ready');
    setInterval(() => { if (!paused && !hovered && !document.hidden && !slider.contains(document.activeElement)) show(current + 1); }, 6500);
  });

  document.querySelectorAll('form[data-static-form]').forEach(form => {
    form.querySelectorAll('.elementor-field-type-recaptcha_v3, input[type=hidden]').forEach(el => el.remove());
    form.querySelectorAll('input, textarea').forEach(input => input.setAttribute('aria-label', input.placeholder || input.name));
    const phone = form.querySelector('[placeholder="Telefone"]');
    if (phone) phone.type = 'tel';
    const note = document.createElement('p');
    note.className = 'form-note';
    note.textContent = 'Ao continuar, a mensagem será preparada na sua aplicação de email para envio a geral@macwatts.pt.';
    form.append(note);
    const label = form.querySelector('.elementor-button-text');
    if (label) label.textContent = 'Preparar email';
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const body = [...form.querySelectorAll('input:not([type=hidden]), textarea')].map(input => `${input.placeholder}: ${input.value}`).join('\n\n');
      const link = document.createElement('a');
      link.href = `mailto:geral@macwatts.pt?subject=${encodeURIComponent('Pedido de contacto — MacWatts')}&body=${encodeURIComponent(body)}`;
      link.textContent = 'Abrir aplicação de email';
      note.replaceChildren('Mensagem preparada. ', link, '. Confirme o envio na sua aplicação de email.');
      link.click();
    });
  });

  document.querySelectorAll('a[href]').forEach(anchor => {
    if (!/\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(anchor.getAttribute('href'))) return;
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const dialog = document.createElement('dialog');
      dialog.className = 'image-dialog';
      const img = document.createElement('img');
      img.src = anchor.href;
      img.alt = anchor.querySelector('img')?.alt || 'Projeto MacWatts';
      const close = document.createElement('button');
      close.textContent = '×';
      close.setAttribute('aria-label', 'Fechar imagem');
      close.addEventListener('click', () => dialog.close());
      dialog.append(close, img);
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
      dialog.addEventListener('close', () => dialog.remove());
      document.body.append(dialog);
      dialog.showModal();
    });
  });
})();
