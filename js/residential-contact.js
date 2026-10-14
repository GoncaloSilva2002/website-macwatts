(() => {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const button = form.querySelector('button[type="submit"]');
  const result = form.querySelector('.form-result');
  const originalButtonText = button?.textContent.trim() || 'Enviar mensagem';

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const payload = {
      name: data.get('Nome'),
      email: data.get('Email'),
      phone: data.get('Telefone'),
      solution: data.get('Solução'),
      message: data.get('Mensagem'),
      website: data.get('Website'),
      audience: document.body.classList.contains('residential') ? 'residencial' : 'empresarial'
    };

    if (button) {
      button.disabled = true;
      button.textContent = 'A enviar…';
    }
    if (result) result.textContent = '';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(responseData.error || 'Não foi possível enviar a mensagem.');

      if (result) result.textContent = responseData.message || 'A mensagem foi enviada. Obrigado pelo contacto.';
      form.reset();
    } catch (error) {
      if (result) result.textContent = error.message || 'Não foi possível enviar a mensagem agora. Tente novamente ou escreva para leads@macwatts.pt.';
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalButtonText;
      }
    }
  });
})();
