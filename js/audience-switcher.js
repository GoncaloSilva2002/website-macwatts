(() => {
  const switcher = document.querySelector('.audience-switcher');
  if (!switcher) return;
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
      '<p>Pode alternar entre <strong>Empresarial</strong> e <strong>Residencial</strong> a qualquer momento. Basta usar este botão no canto do ecrã.</p>' +
      '<button class="audience-hint-confirm" type="button">Entendido</button>';
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
