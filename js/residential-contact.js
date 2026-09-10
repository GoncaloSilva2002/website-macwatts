(() => {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const body = ['Nome', 'Email', 'Telefone', 'Solução', 'Mensagem']
      .map(key => `${key}: ${data.get(key) || 'Não indicado'}`).join('\n\n');
    const link = document.createElement('a');
    const area = document.body.classList.contains('residential') ? 'residencial' : 'empresarial';
    link.href = `mailto:leads@macwatts.pt?subject=${encodeURIComponent(`Pedido de contacto ${area}`)}&body=${encodeURIComponent(body)}`;
    link.textContent = 'Abrir aplicação de email';
    form.querySelector('.form-result').replaceChildren('Mensagem preparada. ', link, '. Confirme o envio na sua aplicação de email.');
    link.click();
  });
})();
