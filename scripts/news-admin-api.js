'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { NewsInputError, createNews } = require('./news-publisher');

const sessions = new Map();
const loginAttempts = new Map();
const sessionLifetimeMs = 8 * 60 * 60 * 1000;
const maxRequestBytes = 12 * 1024 * 1024;
const loginWindowMs = 15 * 60 * 1000;
const maxLoginAttempts = 5;
const repositoryOwner = process.env.GITHUB_OWNER || 'GoncaloSilva2002';
const repositoryName = process.env.GITHUB_REPOSITORY || 'website-macwatts';
const repositoryBranch = process.env.GITHUB_BRANCH || 'main';

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function sendJson(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}

function sendEmpty(res, status, headers = {}) {
  res.writeHead(status, { 'Cache-Control': 'no-store', ...headers });
  res.end();
}

async function readJson(req, byteLimit = maxRequestBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > byteLimit) throw new ApiError(413, 'O pedido excede o limite permitido.');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new ApiError(400, 'Os dados enviados não são válidos.');
  }
}

function readCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      try {
        return decodeURIComponent(part.slice(separator + 1).trim());
      } catch {
        return '';
      }
    }
  }
  return '';
}

function sessionFor(req) {
  const token = readCookie(req, 'macwatts_admin');
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { token, session };
}

function passwordMatches(candidate, expected) {
  const candidateHash = crypto.createHash('sha256').update(candidate).digest();
  const expectedHash = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(candidateHash, expectedHash);
}

function clientAddress(req) {
  return req.socket.remoteAddress || 'unknown';
}

function clearExpiredAttempts() {
  const now = Date.now();
  for (const [address, attempt] of loginAttempts) {
    if (attempt.resetAt <= now) loginAttempts.delete(address);
  }
}

function secureCookie(req) {
  return process.env.ADMIN_COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production' || Boolean(req.socket.encrypted);
}

function sessionCookie(req, token, ageSeconds) {
  return `macwatts_admin=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${ageSeconds}${secureCookie(req) ? '; Secure' : ''}`;
}

async function githubRequest(token, endpoint, method = 'GET', body) {
  const response = await fetch(`https://api.github.com/repos/${repositoryOwner}/${repositoryName}/${endpoint}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'MacWatts-News-Admin',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60000)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = response.status === 401 || response.status === 403
      ? 'O token GitHub do servidor não tem permissões para publicar.'
      : response.status === 409 || response.status === 422
        ? 'O repositório mudou durante a publicação. Atualiza a página e tenta novamente.'
        : `O GitHub recusou a publicação (HTTP ${response.status}).`;
    throw new ApiError(response.status === 409 || response.status === 422 ? 409 : 502, message);
  }
  return result;
}

async function getRemoteNews(token) {
  const ref = await githubRequest(token, `git/ref/heads/${encodeURIComponent(repositoryBranch)}`);
  const commit = await githubRequest(token, `git/commits/${ref.object.sha}`);
  try {
    const file = await githubRequest(token, `contents/data/news.json?ref=${encodeURIComponent(ref.object.sha)}`);
    const entries = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
    if (!Array.isArray(entries)) throw new Error('invalid news list');
    return { entries, parentSha: ref.object.sha, baseTree: commit.tree.sha };
  } catch (error) {
    if (error instanceof ApiError && error.status === 502 && String(error.message).includes('HTTP 404')) {
      return { entries: [], parentSha: ref.object.sha, baseTree: commit.tree.sha };
    }
    throw error;
  }
}

async function commitNews(token, published, title, parentSha, baseTree) {
  const tree = [];
  for (const file of published.files) {
    const blob = await githubRequest(token, 'git/blobs', 'POST', {
      content: file.content.toString('base64'),
      encoding: 'base64'
    });
    tree.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const newTree = await githubRequest(token, 'git/trees', 'POST', { base_tree: baseTree, tree });
  const commit = await githubRequest(token, 'git/commits', 'POST', {
    message: `Publica notícia: ${title.replace(/[\r\n]+/g, ' ').slice(0, 100)}`,
    tree: newTree.sha,
    parents: [parentSha]
  });
  await githubRequest(token, `git/refs/heads/${encodeURIComponent(repositoryBranch)}`, 'PATCH', {
    sha: commit.sha,
    force: false
  });
}

async function saveLocally(root, published) {
  for (const file of published.files) {
    const destination = path.resolve(root, file.path);
    if (!destination.startsWith(root + path.sep)) throw new Error('Caminho inválido ao gravar a notícia.');
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, file.content, { flag: file.path === published.image ? 'wx' : 'w' });
  }
}

async function handle(req, res, pathname, root) {
  if (!pathname.startsWith('/api/admin/')) return false;
  if (req.method === 'GET' && pathname === '/api/admin/session') {
    if (sessionFor(req)) sendEmpty(res, 204);
    else sendEmpty(res, 401);
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/admin/login') {
    const password = process.env.NEWS_ADMIN_PASSWORD;
    if (!password || password.length < 12) {
      sendJson(res, 503, { error: 'A palavra-passe de administração ainda não está configurada no servidor.' });
      return true;
    }
    clearExpiredAttempts();
    const address = clientAddress(req);
    const attempt = loginAttempts.get(address);
    if (attempt && attempt.count >= maxLoginAttempts && attempt.resetAt > Date.now()) {
      sendJson(res, 429, { error: 'Demasiadas tentativas. Aguarda 15 minutos e volta a tentar.' });
      return true;
    }
    const input = await readJson(req, 4096);
    if (!input || typeof input !== 'object' || typeof input.password !== 'string' || !passwordMatches(input.password, password)) {
      const next = attempt && attempt.resetAt > Date.now()
        ? { count: attempt.count + 1, resetAt: attempt.resetAt }
        : { count: 1, resetAt: Date.now() + loginWindowMs };
      loginAttempts.set(address, next);
      sendJson(res, 401, { error: 'Palavra-passe incorreta.' });
      return true;
    }
    loginAttempts.delete(address);
    const token = crypto.randomBytes(32).toString('base64url');
    sessions.set(token, { expiresAt: Date.now() + sessionLifetimeMs });
    sendEmpty(res, 204, { 'Set-Cookie': sessionCookie(req, token, sessionLifetimeMs / 1000) });
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/admin/logout') {
    const session = sessionFor(req);
    if (session) sessions.delete(session.token);
    sendEmpty(res, 204, { 'Set-Cookie': sessionCookie(req, '', 0) });
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/admin/news') {
    if (!sessionFor(req)) {
      sendJson(res, 401, { error: 'A sessão expirou. Entra novamente.' });
      return true;
    }
    const input = await readJson(req);
    const token = process.env.GITHUB_REPO_TOKEN;
    if (process.env.RENDER === 'true' && !token) {
      sendJson(res, 503, { error: 'Falta configurar o token de publicação do GitHub no Render.' });
      return true;
    }

    let published;
    if (token) {
      const remote = await getRemoteNews(token);
      published = await createNews(root, input, remote.entries);
      await commitNews(token, published, input.title.trim(), remote.parentSha, remote.baseTree);
    } else {
      published = await createNews(root, input);
      await saveLocally(root, published);
    }

    sendJson(res, 201, {
      slug: published.slug,
      url: published.articleUrl,
      published: Boolean(token),
      message: token ? 'Notícia enviada. O site será atualizado pelo Render.' : 'Notícia criada no site local.'
    });
    return true;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'POST') {
    sendJson(res, 405, { error: 'Método não permitido.' });
    return true;
  }
  sendJson(res, 404, { error: 'Endpoint não encontrado.' });
  return true;
}

module.exports = async function handleAdminApi(req, res, pathname, root) {
  try {
    return await handle(req, res, pathname, root);
  } catch (error) {
    if (res.headersSent) return true;
    const status = error instanceof ApiError || error instanceof NewsInputError ? error.status : 500;
    const message = status === 500 ? 'Não foi possível concluir o pedido.' : error.message;
    sendJson(res, status, { error: message });
    return true;
  }
};
