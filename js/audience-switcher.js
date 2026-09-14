(() => {
  const switcher = document.querySelector('.audience-switcher');
  if (!switcher) return;
  const trigger = switcher.querySelector('summary');
  const destination = switcher.querySelector('nav a:not([aria-current])');
  if (trigger && destination) {
    const area = destination.firstChild.textContent.trim();
    trigger.setAttribute('aria-label', `Mudar para ${area}`);
    trigger.setAttribute('title', `Mudar para ${area}`);
    trigger.addEventListener('click', event => {
      event.preventDefault();
      if (switcher.classList.contains('is-switching')) return;
      dismissHint();
      switcher.classList.add('is-switching');
      trigger.setAttribute('aria-busy', 'true');
      const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450;
      window.setTimeout(() => window.location.assign(destination.href), delay);
    });
    window.addEventListener('pageshow', () => {
      switcher.classList.remove('is-switching');
      trigger.removeAttribute('aria-busy');
    });
  }
  const hintKey = 'macwatts-area-hint-seen';
  let hint;
  const dismissHint = () => {
    if (!hint) return;
    const hadFocus = hint.contains(document.activeElement);
    hint.remove();
    hint = null;
    try { sessionStorage.setItem(hintKey, '1'); } catch (_) { /* Storage may be unavailable. */ }
    if (hadFocus) switcher.querySelector('summary').focus();
  };
  let seen = false;
  try { seen = sessionStorage.getItem(hintKey) === '1'; } catch (_) { /* Still show the introduction. */ }
  if (!seen) {
    hint = document.createElement('aside');
    hint.className = 'audience-hint';
    hint.setAttribute('aria-labelledby', 'audience-hint-title');
    hint.innerHTML = '<button class="audience-hint-close" type="button" aria-label="Fechar aviso">×</button>' +
      '<p class="audience-hint-label">Empresas e particulares</p>' +
      '<h2 id="audience-hint-title">A energia certa para si.</h2>' +
      '<p>Alterne entre <strong>Empresarial</strong> e <strong>Residencial</strong> no botão abaixo.</p>';
    document.body.append(hint);
    hint.querySelectorAll('button').forEach(button => button.addEventListener('click', dismissHint));
    switcher.addEventListener('toggle', () => { if (switcher.open) dismissHint(); });
  }
  document.addEventListener('click', event => {
    if (!switcher.contains(event.target)) switcher.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && hint) dismissHint();
    if (event.key === 'Escape' && switcher.open) {
      switcher.open = false;
      switcher.querySelector('summary').focus();
    }
  });
})();
