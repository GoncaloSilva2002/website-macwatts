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
  const publishedNewsList = document.querySelector('#published-news-list');
  const manageStatus = document.querySelector('#manage-status');
  const newsDashboard = document.querySelector('#news-dashboard');
  const createView = document.querySelector('#news-create-view');
  const backToNewsButton = document.querySelector('#back-to-news');

  function setStatus(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle('is-error', isError);
  }

  function showEditor() {
    loginPanel.hidden = true;
    editorPanel.hidden = false;
    showDashboard();
    loadPublishedNews();
  }

  function showLogin() {
    editorPanel.hidden = true;
    loginPanel.hidden = false;
  }

  function showDashboard() {
    createView.hidden = true;
    newsDashboard.hidden = false;
  }

  function showCreateView() {
    newsDashboard.hidden = true;
    createView.hidden = false;
    document.querySelector('#news-title').focus();
  }

  async function readJson(response) {
    return response.json().catch(() => ({}));
  }

  async function loadPublishedNews() {
    publishedNewsList.replaceChildren();
    appendAddCard();
    setStatus(manageStatus, "");
    try {
      const response = await fetch("/api/admin/news", { cache: "no-store" });
      const result = await readJson(response);
      if (response.status === 401) { showLogin(); return; }
      if (!response.ok) throw new Error(result.error || "Não foi possível carregar os artigos.");
      const items = Array.isArray(result.news) ? result.news : [];
      if (!items.length) {
        setStatus(manageStatus, "Ainda não existem artigos criados nesta área.");
        return;
      }
      for (const item of items) {
        if (!item || !item.slug || !item.title) continue;
        const row = document.createElement("div");
        row.className = "news-manage-item";
        const articlePath = item.articlePath || `${item.slug}/index.html`;
        const imageLink = document.createElement("a");
        imageLink.className = "news-manage-image";
        imageLink.href = `../${articlePath.split('/').map(encodeURIComponent).join('/')}`;
        imageLink.setAttribute("aria-label", `Abrir: ${item.title}`);
        const image = document.createElement("img");
        image.src = `../${String(item.image || '').split('/').map(encodeURIComponent).join('/')}`;
        image.alt = "";
        image.loading = "lazy";
        image.addEventListener("error", () => row.classList.add("has-no-image"), { once: true });
        imageLink.append(image);
        const info = document.createElement("div");
        info.className = "news-manage-content";
        const meta = document.createElement("p");
        meta.className = "news-manage-meta";
        meta.textContent = `${item.category === "residencial" ? "Residencial" : "Empresarial"} · ${item.dateLabel || item.date || ""}`;
        const title = document.createElement("a");
        title.className = "news-manage-title";
        title.href = imageLink.href;
        title.textContent = item.title;
        info.append(meta, title);
        const button = document.createElement("button");
        button.className = "news-delete-button";
        button.type = "button";
        button.textContent = "Eliminar";
        button.addEventListener("click", () => deletePublishedNews(item, button));
        row.append(imageLink, info, button);
        publishedNewsList.append(row);
      }
    } catch (error) {
      setStatus(manageStatus, error.message || "Não foi possível carregar os artigos.", true);
    }
  }

  function appendAddCard() {
    if (publishedNewsList.querySelector(".news-add-card")) return;
    const card = document.createElement("button");
    card.className = "news-add-card";
    card.type = "button";
    card.setAttribute("aria-label", "Adicionar uma nova not\u00edcia");
    const plus = document.createElement("span");
    plus.className = "news-add-card-icon";
    plus.setAttribute("aria-hidden", "true");
    plus.textContent = "+";
    const label = document.createElement("span");
    label.textContent = "Adicionar not\u00edcia";
    card.append(plus, label);
    card.addEventListener("click", showCreateView);
    publishedNewsList.append(card);
  }

  async function deletePublishedNews(item, button) {
    if (!window.confirm(`Eliminar o artigo "${item.title}"? Esta ação não pode ser anulada.`)) return;
    button.disabled = true;
    button.textContent = "A eliminar…";
    setStatus(manageStatus, "");
    try {
      const response = await fetch("/api/admin/news/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: item.slug })
      });
      const result = await readJson(response);
      if (response.status === 401) showLogin();
      if (!response.ok) throw new Error(result.error || "Não foi possível eliminar o artigo.");
      await loadPublishedNews();
      setStatus(manageStatus, result.message || "Artigo eliminado.");
    } catch (error) {
      setStatus(manageStatus, error.message || "Não foi possível eliminar o artigo.", true);
      button.disabled = false;
      button.textContent = "Eliminar";
    }
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

  backToNewsButton.addEventListener('click', showDashboard);

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
      await loadPublishedNews();
      showDashboard();
      setStatus(manageStatus, result.message || 'Notícia criada.');
      const articleLink = document.createElement('a');
      articleLink.href = result.url;
      articleLink.textContent = 'Abrir artigo';
      manageStatus.append(document.createTextNode(' '), articleLink);
    } catch (error) {
      setStatus(editorStatus, error.message || 'Não foi possível ligar ao servidor.', true);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Criar notícia <span aria-hidden="true">→</span>';
    }
  });
})();
