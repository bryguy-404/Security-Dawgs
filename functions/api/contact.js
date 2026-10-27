import { companySizes, interests } from '../../src/data/contact-options.js';

const recipient = 'luke@wyckoffconsulting.com';
const sender = 'Security Dawgs <website@forms.securitydawgs.com>';
const maxBodyBytes = 8192;
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (status, body) => new Response(JSON.stringify(body), { status, headers });
const escapeHtml = value => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const validHost = host => ['securitydawgs.com', 'www.securitydawgs.com'].includes(host)
  || ['security-dawgs.pages.dev', 'security-dawgs-preview.pages.dev'].some(base => host === base || host.endsWith(`.${base}`));

async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('empty');
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBodyBytes) { await reader.cancel(); throw new Error('too-large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(body));
}

/** Keep the delivery target fixed on the server; request data cannot choose a recipient or sender. */
export async function handleContact(request, env, fetcher = fetch) {
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers: { ...headers, Allow: 'POST' } });
  const url = new URL(request.url);
  if (!validHost(url.hostname) || request.headers.get('Origin') !== url.origin) return json(403, { error: 'Please submit the form from the Security Dawgs website.' });
  if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return json(415, { error: 'Unsupported request format.' });
  if (Number(request.headers.get('Content-Length') || 0) > maxBodyBytes) return json(413, { error: 'Your request is too large.' });
  let data;
  try { data = await readBody(request); } catch (error) { return json(error.message === 'too-large' ? 413 : 400, { error: 'Please check your details and try again.' }); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return json(400, { error: 'Please check your details and try again.' });
  if (typeof data.website === 'string' && data.website.trim()) return json(200, { ok: true });
  const clean = (value, limit) => typeof value === 'string' && value.trim().length <= limit && !/[\u0000-\u001f\u007f]/.test(value) ? value.trim() : '';
  const name = clean(data.name, 120);
  const email = clean(data.email, 254);
  const phone = clean(data.phone, 40);
  const company = clean(data.company, 160);
  const companySize = companySizes.includes(data.companySize) ? data.companySize : '';
  const interest = interests.includes(data.interest) ? data.interest : 'General inquiry';
  if (!name || !company || !companySize || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || !/^[+\d\s().x#-]+$/i.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 20) return json(400, { error: 'Please enter your name, a valid email and phone number, company name, and company size.' });
  if (typeof data.submissionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submissionId)) return json(400, { error: 'Please reload the page and try again.' });
  if (typeof data.token !== 'string' || !data.token || data.token.length > 2048) return json(400, { error: 'Please complete the security check and try again.' });
  if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY) return json(503, { error: 'The form is temporarily unavailable. Please try again later.' });
  let verification;
  try {
    const verificationResponse = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: data.token, remoteip: request.headers.get('CF-Connecting-IP') || undefined }),
    });
    if (!verificationResponse.ok) throw new Error('verification-unavailable');
    verification = await verificationResponse.json();
  } catch { return json(503, { error: 'The security check is temporarily unavailable. Please try again.' }); }
  if (!verification.success || verification.hostname !== url.hostname || verification.action !== 'contact') return json(400, { error: 'The security check expired or could not be verified. Please try again.' });
  const details = [['Name', name], ['Email', email], ['Phone', phone], ['Company', company], ['Company size', `${companySize} employees`], ['Requested information', interest]];
  const text = `New Security Dawgs website request\n\n${details.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\nReply to this email to contact the person who submitted the form.`;
  const html = `<div style="font-family:Arial,sans-serif;color:#171918;max-width:620px;margin:auto"><div style="padding:28px;background:#ba0c2f;color:#fff"><h1 style="font-size:24px;margin:0">New Security Dawgs request</h1></div><table style="width:100%;border-collapse:collapse;margin:20px 0">${details.map(([label, value]) => `<tr><th style="text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid #ddd">${label}</th><td style="padding:12px;border-bottom:1px solid #ddd">${escapeHtml(value)}</td></tr>`).join('')}</table><p>Reply to this email to contact the person who submitted the form.</p></div>`;
  // Include the validated content in the key so an edited retry cannot reuse a different email payload.
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${data.submissionId}:${text}`));
  const idempotencyKey = `contact-${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')}`;
  try {
    const delivery = await fetcher('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'User-Agent': 'security-dawgs-contact/1.0', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ from: sender, to: [recipient], reply_to: email, subject: `Security Dawgs website request — ${company}`, text, html }),
    });
    const result = await delivery.json();
    if (!delivery.ok || typeof result.id !== 'string') {
      console.error('Contact delivery failed', { status: delivery.status });
      return json(503, { error: 'Your request could not be sent right now. Please try again shortly.' });
    }
    return json(200, { ok: true });
  } catch {
    console.error('Contact delivery unavailable');
    return json(503, { error: 'We couldn’t confirm your request was sent. Please try again shortly.' });
  }
}

export const onRequest = ({ request, env }) => handleContact(request, env);
