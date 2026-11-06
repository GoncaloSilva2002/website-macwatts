'use strict';

// The client's IP address, for rate limiting.
// On Render, Cloudflare sits in front of the app and sets True-Client-IP; any value
// the client sends in that header is overwritten. X-Forwarded-For is only appended
// to, so its first entry can be forged by the client. Only the last entry, added by
// the proxy in front of us, can be trusted.
module.exports = function requestIp(req) {
  if (process.env.RENDER === 'true' || process.env.TRUST_PROXY === 'true') {
    const trueClientIp = req.headers['true-client-ip'];
    if (typeof trueClientIp === 'string' && trueClientIp.trim()) return trueClientIp.trim();
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      const last = forwarded.split(',').map(part => part.trim()).filter(Boolean).pop();
      if (last) return last;
    }
  }
  return req.socket.remoteAddress || 'unknown';
};
