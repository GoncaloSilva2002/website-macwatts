(() => {
  const loginPanel = document.querySelector('#login-panel');
  const editorPanel = document.querySelector('#editor-panel');
  if (!loginPanel || !editorPanel) return;

  const loginForm = document.querySelector('#login-form');
  const loginStatus = document.querySelector('#login-status');
  const loginButton = document.querySelector('#login-button');
  const editorForm = document.querySelector('#news-form');
  const editorStatus = document.querySelector('#form-status');
  const submitButton = document.querySelector('#submit-news');
  const imageInput = document.querySelector('#news-image');
  const imagePreview = document.querySelector('#image-preview');

  function setStatus(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle('is-error', isError);
  }

  function showEditor() {
    loginPanel.hidden = true;
    editorPanel.hidden = false;
  }

  function showLogin() {
    editorPanel.hidden = true;
    loginPanel.hidden = false;
  }

  async function readJson(response) {
    return response.json().catch(() => ({}));
  }

  fetch('/api/admin/session', { cache: 'no-store' })
    .then(response => {
      if (response.status === 204) showEditor();
      else if (response.status === 404) setStatus(loginStatus, 'O servidor de administração ainda não está ativo neste alojamento.', true);
      else if (response.status !== 401) setStatus(loginStatus, 'Não foi possível verificar a sessão de administração.', true);
    })
    .catch(() => setStatus(loginStatus, 'Não foi possível ligar à área de administração.', true));

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    setStatus(loginStatus, '');
    loginButton.disabled = true;
    loginButton.textContent = 'A verificar…';
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: document.querySelector('#admin-password').value })
      });
      const result = await readJson(response);
      if (response.status !== 204) throw new Error(result.error || 'Não foi possível iniciar sessão.');
      loginForm.reset();
      showEditor();
    } catch (error) {
      setStatus(loginStatus, error.message || 'Não foi possível ligar ao servidor.', true);
    } finally {
      loginButton.disabled = false;
      loginButton.innerHTML = 'Entrar <span aria-hidden="true">→</span>';
    }
  });

  document.querySelector('#logout-button').addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    showLogin();
  });

  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) {
      imagePreview.hidden = true;
      imagePreview.removeAttribute('src');
      return;
    }
    imagePreview.src = URL.createObjectURL(file);
    imagePreview.hidden = false;
  });

  editorForm.addEventListener('submit', async event => {
    event.preventDefault();
    setStatus(editorStatus, '');
    const file = imageInput.files[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setStatus(editorStatus, 'Escolhe uma imagem PNG, JPG ou WebP.', true);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setStatus(editorStatus, 'A imagem tem de ter até 8 MB.', true);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'A criar notícia…';
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
        reader.readAsDataURL(file);
      });
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: document.querySelector('#news-title').value,
          category: document.querySelector('#news-category').value,
          sourceUrl: document.querySelector('#news-source-url').value,
          text: document.querySelector('#news-text').value,
          imageType: file.type,
          imageData: dataUrl.split(',')[1]
        })
      });
      const result = await readJson(response);
      if (response.status === 401) showLogin();
      if (!response.ok) throw new Error(result.error || 'Não foi possível criar a notícia.');

      setStatus(editorStatus, result.message || 'Notícia criada.');
      const link = document.createElement('a');
      link.href = result.url;
      link.textContent = 'Abrir artigo';
      editorStatus.append(link);
      editorForm.reset();
      imagePreview.hidden = true;
      imagePreview.removeAttribute('src');
    } catch (error) {
      setStatus(editorStatus, error.message || 'Não foi possível ligar ao servidor.', true);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Criar notícia <span aria-hidden="true">→</span>';
    }
  });
})();
