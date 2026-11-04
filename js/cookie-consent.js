(() => {
  'use strict';
  const storageKey = 'macwatts-cookie-consent';
  const siteRoot = new URL('../', document.currentScript.src);
  const privacyHref = new URL('politica-de-privacidade/index.html#cookies', siteRoot).href;

  const readChoice = () => {
    try { return localStorage.getItem(storageKey); } catch { return null; }
  };
  const saveChoice = value => {
    try { localStorage.setItem(storageKey, value); } catch {}
  };

  const style = document.createElement('style');
  style.textContent = `
.cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:100;max-width:760px;margin-inline:auto;display:flex;align-items:center;gap:24px;padding:22px 24px;border-radius:8px;background:var(--navy,#142b3b);color:#d1dbe0;box-shadow:0 18px 40px #0005;font-family:var(--font,'Manrope',sans-serif);font-size:13px;line-height:1.65}
.cookie-banner[hidden],iframe[data-consent-src][hidden]{display:none!important}
.cookie-banner p{margin:0}
.cookie-banner strong{display:block;color:white;font-size:14px;margin-bottom:4px}
.cookie-banner a{color:#66dabd;text-decoration:underline}
.cookie-actions{display:flex;gap:10px;flex-shrink:0}
.cookie-actions button,.cookie-map button{font:inherit;font-size:13px;font-weight:800;padding:11px 18px;border-radius:5px;border:1px solid transparent;cursor:pointer;min-height:44px}
.cookie-accept{background:var(--green,#00b996);color:#102e2d}
.cookie-accept:hover{background:#34d9ac}
.cookie-reject{background:transparent;color:white;border-color:#ffffff59!important}
.cookie-reject:hover{border-color:white!important}
.cookie-banner button:focus-visible,.cookie-map button:focus-visible,.cookie-settings:focus-visible{outline:2px solid #66dabd;outline-offset:2px}
.cookie-map{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;min-height:280px;padding:24px;text-align:center;font-size:13px;line-height:1.6;color:var(--muted,#61707d);background:var(--pale,#f2f6f5)}
.cookie-map p{max-width:340px;margin:0}
.cookie-map button{background:var(--navy,#142b3b);color:white}
.cookie-settings{background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer}
.cookie-settings:hover{color:#57dfb8}
@media(max-width:640px){.cookie-banner{flex-direction:column;align-items:stretch;gap:16px;padding:20px}.cookie-actions button{flex:1}}`;
  document.head.append(style);

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Aviso de cookies');
  banner.hidden = true;
  banner.innerHTML = `<p><strong>Cookies</strong>Este site só guarda a sua escolha sobre cookies. O mapa do Google, nas páginas de contacto, só é carregado se aceitar, porque o Google pode guardar cookies no seu dispositivo. <a href="${privacyHref}">Saber mais</a></p><div class="cookie-actions"><button type="button" class="cookie-reject">Recusar</button><button type="button" class="cookie-accept">Aceitar</button></div>`;
  document.body.append(banner);

  const maps = [...document.querySelectorAll('iframe[data-consent-src]')];
  const loadMaps = () => maps.forEach(frame => {
    frame.previousElementSibling?.classList.contains('cookie-map') && frame.previousElementSibling.remove();
    frame.hidden = false;
    if (!frame.src) frame.src = frame.dataset.consentSrc;
  });
  const blockMaps = () => maps.forEach(frame => {
    frame.hidden = true;
    if (frame.previousElementSibling?.classList.contains('cookie-map')) return;
    const placeholder = document.createElement('div');
    placeholder.className = 'cookie-map';
    placeholder.innerHTML = '<p>O mapa é fornecido pelo Google, que pode guardar cookies no seu dispositivo.</p><button type="button">Mostrar mapa</button>';
    placeholder.querySelector('button').addEventListener('click', () => choose('accepted'));
    frame.before(placeholder);
  });

  const choose = value => {
    const previous = readChoice();
    saveChoice(value);
    banner.hidden = true;
    if (value === 'accepted') loadMaps();
    else if (previous === 'accepted' && maps.some(frame => frame.src)) location.reload();
  };
  banner.querySelector('.cookie-accept').addEventListener('click', () => choose('accepted'));
  banner.querySelector('.cookie-reject').addEventListener('click', () => choose('rejected'));

  const legalNav = document.querySelector('.footer-bottom nav');
  if (legalNav) {
    const settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'cookie-settings';
    settings.textContent = 'Cookies';
    settings.addEventListener('click', () => {
      banner.hidden = false;
      banner.querySelector('.cookie-accept').focus();
    });
    legalNav.append(settings);
  }

  const choice = readChoice();
  if (choice === 'accepted') loadMaps();
  else blockMaps();
  if (!choice) banner.hidden = false;
})();
