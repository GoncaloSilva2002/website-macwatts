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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function contactEmailHtml({ name, email, phone, solution, message, audience }) {
  const fieldRow = (label, value) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e7edeb;color:#687784;font-size:13px;vertical-align:top;width:145px;">${label}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e7edeb;color:#203347;font-size:14px;line-height:1.6;">${value}</td>
    </tr>`;
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>');
  const receivedAt = new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Lisbon'
  }).format(new Date());

  return `<!doctype html>
<html lang="pt-PT">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="margin:0;padding:24px 12px;background:#f2f6f5;font-family:Arial,Helvetica,sans-serif;color:#203347;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="620" style="width:100%;max-width:620px;border-collapse:separate;border-spacing:0;">
          <tr>
            <td style="padding:25px 30px;background:#203347;border-radius:10px 10px 0 0;">
              <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:.04em;">MacWatts</div>
              <div style="margin-top:7px;color:#c7d6dc;font-size:13px;">Novo pedido de contacto</div>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;background:#ffffff;border:1px solid #e2eae7;border-top:0;">
              <div style="display:inline-block;padding:6px 10px;border-radius:3px;background:#e7f7f2;color:#007c66;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">${escapeHtml(audience)}</div>
              <h1 style="margin:18px 0 8px;color:#203347;font-size:24px;line-height:1.3;font-weight:600;">Pedido de ${escapeHtml(audience.toLowerCase())}</h1>
              <p style="margin:0 0 24px;color:#687784;font-size:14px;line-height:1.6;">Recebeu uma nova mensagem através do formulário do site.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;border:1px solid #e7edeb;">
                ${fieldRow('Nome', escapeHtml(name))}
                ${fieldRow('Email', `<a href="mailto:${safeEmail}" style="color:#007c66;text-decoration:underline;">${safeEmail}</a>`)}
                ${fieldRow('Telefone', escapeHtml(phone || 'Não indicado'))}
                ${fieldRow('Área de interesse', escapeHtml(solution || 'Não indicada'))}
              </table>
              <div style="margin-top:24px;padding:18px 20px;background:#f6f9f8;border-left:3px solid #00a887;">
                <div style="margin-bottom:9px;color:#687784;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Mensagem</div>
                <div style="color:#203347;font-size:14px;line-height:1.7;">${safeMessage}</div>
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:25px;border-collapse:collapse;">
                <tr><td style="border-radius:4px;background:#00836c;">
                  <a href="mailto:${safeEmail}" style="display:inline-block;padding:12px 18px;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;">Responder a ${escapeHtml(name)}</a>
                </td></tr>
              </table>
              <p style="margin:24px 0 0;color:#8a969e;font-size:11px;line-height:1.5;">Recebido em ${escapeHtml(receivedAt)} · Formulário de contacto MacWatts</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 20px;text-align:center;color:#7c898f;font-size:11px;line-height:1.5;">MacWatts · Energia e sustentabilidade</td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function smtpTransport() {
  const host = (process.env.MAIL_HOST || process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.MAIL_PORT || process.env.SMTP_PORT || 587);
  const user = (process.env.MAIL_USERNAME || process.env.SMTP_USER || '').trim();
  const pass = process.env.MAIL_PASSWORD || process.env.SMTP_PASS;
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !pass) return null;

  const secureSetting = process.env.MAIL_SECURE || process.env.SMTP_SECURE;
  const secure = secureSetting
    ? secureSetting.toLowerCase() === 'true'
    : port === 465;
  const from = (process.env.MAIL_FROM || process.env.CONTACT_FROM || user).trim();
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
      text,
      html: contactEmailHtml({ name, email, phone, solution, message, audience })
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
