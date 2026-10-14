'use strict';

const nodemailer = require('nodemailer');

const maxRequestBytes = 16000;
const rateLimitWindowMs = 10 * 60 * 1000;
const maxRequestsPerWindow = 5;
const rateLimits = new Map();

class ContactApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function sendJson(res, status, value) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(value));
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxRequestBytes) throw new ContactApiError(413, 'O formulário excede o tamanho permitido.');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new ContactApiError(400, 'Não foi possível ler os dados do formulário.');
  }
}

function requestIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') || req.socket.remoteAddress || 'unknown';
}

function consumeRateLimit(req) {
  const now = Date.now();
  const ip = requestIp(req);
  const entry = rateLimits.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateLimits.set(ip, { count: 1, resetAt: now + rateLimitWindowMs });
    return true;
  }
  if (entry.count >= maxRequestsPerWindow) return false;
  entry.count += 1;
  if (rateLimits.size > 2000) {
    for (const [key, value] of rateLimits) {
      if (value.resetAt <= now) rateLimits.delete(key);
    }
  }
  return true;
}

function hasSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

function singleLine(value, maxLength) {
  return typeof value === 'string'
    ? value.replace(/[\r\n\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength)
    : '';
}

function smtpTransport() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !pass) return null;

  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE.toLowerCase() === 'true'
    : port === 465;
  const from = process.env.CONTACT_FROM?.trim() || user;
  const to = process.env.CONTACT_TO?.trim() || 'leads@macwatts.pt';
  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
  return { transport, from, to };
}

async function handle(req, res, pathname) {
  if (pathname !== '/api/contact') return false;
  if (req.method !== 'POST') {
    res.writeHead(405, { Allow: 'POST', 'Cache-Control': 'no-store' }).end();
    return true;
  }
  if (!hasSameOrigin(req)) {
    sendJson(res, 403, { error: 'Pedido não autorizado.' });
    return true;
  }
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    sendJson(res, 415, { error: 'Formato do formulário não suportado.' });
    return true;
  }
  if (!consumeRateLimit(req)) {
    sendJson(res, 429, { error: 'Foram enviados demasiados pedidos. Tente novamente mais tarde.' });
    return true;
  }

  try {
    const input = await readJson(req);
    if (typeof input?.website === 'string' && input.website.trim()) {
      sendJson(res, 200, { message: 'Mensagem enviada. Obrigado pelo contacto.' });
      return true;
    }

    const name = singleLine(input?.name, 120);
    const email = singleLine(input?.email, 254);
    const phone = singleLine(input?.phone, 60);
    const solution = singleLine(input?.solution, 160);
    const message = typeof input?.message === 'string' ? input.message.trim().slice(0, 6000) : '';
    const audience = input?.audience === 'residencial' ? 'Residencial' : input?.audience === 'empresarial' ? 'Empresarial' : '';

    if (name.length < 2) throw new ContactApiError(400, 'Indique o seu nome.');
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ContactApiError(400, 'Indique um endereço de email válido.');
    }
    if (message.length < 10) throw new ContactApiError(400, 'Escreva uma mensagem com pelo menos 10 caracteres.');
    if (!audience) throw new ContactApiError(400, 'Não foi possível identificar a área do pedido.');

    const config = smtpTransport();
    if (!config) {
      sendJson(res, 503, { error: 'O envio de email ainda não está configurado. Tente novamente mais tarde ou escreva para leads@macwatts.pt.' });
      return true;
    }

    const text = [
      `Novo pedido de contacto (${audience}) através do site MacWatts`,
      `Nome: ${name}`,
      `Email: ${email}`,
      `Telefone: ${phone || 'Não indicado'}`,
      `Área de interesse: ${solution || 'Não indicada'}`,
      'Mensagem:',
      message
    ].join('\n\n');

    await config.transport.sendMail({
      from: { name: 'MacWatts', address: config.from },
      to: config.to,
      replyTo: { name, address: email },
      subject: `Pedido de contacto ${audience} - MacWatts`,
      text
    });
    sendJson(res, 200, { message: 'A mensagem foi enviada. Obrigado pelo contacto.' });
  } catch (error) {
    if (error instanceof ContactApiError) {
      sendJson(res, error.status, { error: error.message });
    } else {
      console.error('Não foi possível enviar o formulário de contactos:', error.message);
      sendJson(res, 502, { error: 'Não foi possível enviar a mensagem agora. Tente novamente ou escreva para leads@macwatts.pt.' });
    }
  }
  return true;
}

module.exports = handle;
