(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;

  const counters = [...document.querySelectorAll('.results-grid strong, .project-metrics dd')].map(el => {
    const node = el.firstChild;
    const finalText = node?.textContent;
    const value = Number(finalText?.trim().replace(/\s/g, ''));
    return node?.nodeType === Node.TEXT_NODE && Number.isFinite(value)
      ? { el, node, finalText, value, frame: null } : null;
  }).filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const counter = counters.find(item => item.el === entry.target);
      const start = performance.now();
      const trailingSpace = counter.finalText.match(/\s*$/)[0];
      const groupSeparator = counter.finalText.trim().match(/\d(\s+)\d/)?.[1];
      const format = value => groupSeparator
        ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator)
        : String(value);
      const tick = now => {
        const progress = Math.min((now - start) / 1800, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.node.textContent = progress === 1
          ? counter.finalText
          : format(Math.floor(counter.value * eased)) + trailingSpace;
        if (progress < 1) counter.frame = requestAnimationFrame(tick);
      };
      counter.node.textContent = '0' + trailingSpace;
      counter.frame = requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter.el));
  motion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    counters.forEach(counter => {
      cancelAnimationFrame(counter.frame);
      counter.node.textContent = counter.finalText;
    });
  });
})();
