const CONTACT_RECIPIENT = 'leads@macwatts.pt';
const CONTACT_TOKEN_PROPERTY = 'GMAIL_RELAY_TOKEN';

function authorizeMailApp() {
  return MailApp.getRemainingDailyQuota();
}

function doPost(event) {
  try {
    const payload = JSON.parse(event?.postData?.contents || '{}');
    const expectedToken = PropertiesService.getScriptProperties().getProperty(CONTACT_TOKEN_PROPERTY) || '';
    if (!expectedToken || !tokensMatch(String(payload.token || ''), expectedToken)) {
      return jsonResponse({ ok: false, error: 'Pedido não autorizado.' });
    }

    const name = singleLine(payload.name, 120);
    const email = singleLine(payload.email, 254);
    const phone = singleLine(payload.phone, 60);
    const solution = singleLine(payload.solution, 160);
    const message = typeof payload.message === 'string' ? payload.message.trim().slice(0, 6000) : '';
    const audience = payload.audience === 'residencial' ? 'Residencial'
      : payload.audience === 'empresarial' ? 'Empresarial' : '';

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || !audience) {
      return jsonResponse({ ok: false, error: 'Os dados do pedido de contacto não são válidos.' });
    }

    const body = [
      `Novo pedido de contacto (${audience}) através do site MacWatts`,
      `Nome: ${name}`,
      `Email: ${email}`,
      `Telefone: ${phone || 'Não indicado'}`,
      `Área de interesse: ${solution || 'Não indicada'}`,
      'Mensagem:',
      message
    ].join('\n\n');

    MailApp.sendEmail({
      to: CONTACT_RECIPIENT,
      subject: `Pedido de contacto ${audience} - MacWatts`,
      body,
      name: 'MacWatts',
      replyTo: email
    });
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('Falha no relay Gmail:', error);
    return jsonResponse({ ok: false, error: 'Não foi possível enviar a mensagem.' });
  }
}

function singleLine(value, maxLength) {
  return typeof value === 'string'
    ? value.replace(/[\r\n\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength)
    : '';
}

function tokensMatch(candidate, expected) {
  const candidateDigest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    candidate,
    Utilities.Charset.UTF_8
  );
  const expectedDigest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    expected,
    Utilities.Charset.UTF_8
  );
  let difference = candidateDigest.length ^ expectedDigest.length;
  for (let index = 0; index < candidateDigest.length; index += 1) {
    difference |= candidateDigest[index] ^ expectedDigest[index];
  }
  return difference === 0;
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
