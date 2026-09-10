(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;

  const targets = [...document.querySelectorAll(
    '[data-elementor-type="wp-page"] .elementor-widget, ' +
    'main .section-heading, main .service-card, main .news-card, ' +
    'main .home-benefits > div, main .feature-visual, main .feature-copy, ' +
    'main .brands-heading, main .brand-grid > li, main .faq-grid > div, ' +
    'main .contact-inner > *, main .directory-group-heading, main .directory-card, ' +
    'main .results-grid > *, main .project-card, main .about-grid > *, ' +
    'main .service-extra, main .all-solutions-link, main .company-story > *, ' +
    'main .principles-grid > *'
  )].filter(el => !el.parentElement.closest('.elementor-widget'));
  const reveal = el => {
    el.classList.remove('mw-reveal-pending');
    el.classList.add('mw-reveal-visible');
  };
  const observer = new IntersectionObserver(entries => {
    entries.filter(entry => !entry.isIntersecting).forEach(({ target }) => {
      if (target.contains(document.activeElement)) return;
      target.classList.remove('mw-reveal-visible');
      target.classList.add('mw-reveal-pending');
    });
    entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
      entry.target.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 90}ms`);
      reveal(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -35px 0px' });

  targets.forEach(el => {
    // Repeated reveals also observe content in the initial viewport.
    const initiallyVisible = el.getBoundingClientRect().top < innerHeight;
    if (!initiallyVisible) el.classList.add('mw-reveal-pending');
    observer.observe(el);
    el.addEventListener('animationend', () => el.classList.remove('mw-reveal-visible'));
  });
  document.addEventListener('focusin', event => {
    const el = event.target.closest('.mw-reveal-pending, .mw-reveal-visible');
    if (!el) return;
    observer.unobserve(el);
    el.classList.remove('mw-reveal-pending', 'mw-reveal-visible');
  });
  motion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    targets.forEach(el => el.classList.remove('mw-reveal-pending', 'mw-reveal-visible'));
  });
})();
