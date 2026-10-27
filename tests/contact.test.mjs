import test from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../functions/api/contact.js';

const origin = 'https://security-dawgs.pages.dev';
const data = { name: 'Example Person', email: 'person@example.com', phone: '+1 (555) 010-1234', company: 'Example Company', companySize: '11–50', interest: 'Blast Radius', website: '', token: 'test-token', submissionId: '12345678-1234-4123-8123-123456789abc' };
const env = { RESEND_API_KEY: 'test-resend-secret', TURNSTILE_SECRET_KEY: 'test-turnstile-secret' };
const request = (changes = {}, headers = {}) => new Request(`${origin}/api/contact`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ ...data, ...changes }) });
const verified = { success: true, hostname: 'security-dawgs.pages.dev', action: 'contact' };
const apiResponse = (body, status = 200) => new Response(JSON.stringify(body), { status });
const neverFetch = () => { throw new Error('Unexpected external request'); };

test('rejects cross-origin requests and unsupported methods without external calls', async () => {
  assert.equal((await handleContact(request({}, { Origin: 'https://attacker.example' }), env, neverFetch)).status, 403);
  assert.equal((await handleContact(new Request(`${origin}/api/contact`), env, neverFetch)).status, 405);
});
test('validates all requested fields, body size, and token before contacting providers', async () => {
  for (const changes of [{ name: '' }, { email: 'invalid' }, { email: 'x@example.com\r\nBCC:other@example.com' }, { phone: '12' }, { company: '' }, { companySize: 'unknown' }, { token: '' }, { submissionId: 'invalid' }]) {
    assert.equal((await handleContact(request(changes), env, neverFetch)).status, 400);
  }
  assert.equal((await handleContact(request({ company: 'x'.repeat(9000) }), env, neverFetch)).status, 413);
});
test('honeypot submissions do not send any email', async () => {
  const response = await handleContact(request({ website: 'spam.example' }), env, neverFetch);
  assert.equal(response.status, 200);
});
test('fails closed when credentials are missing', async () => {
  assert.equal((await handleContact(request(), {}, neverFetch)).status, 503);
});
test('rejects failed, wrong-host, and wrong-action Turnstile responses before sending', async () => {
  for (const result of [{ success: false }, { ...verified, hostname: 'attacker.example' }, { ...verified, action: 'login' }]) {
    let calls = 0;
    const response = await handleContact(request(), env, async () => { calls++; return apiResponse(result); });
    assert.equal(response.status, 400);
    assert.equal(calls, 1);
  }
});
test('delivers all fields to the fixed recipient, safely escapes HTML, and uses visitor Reply-To', async () => {
  const calls = [];
  const fetcher = async (url, init) => { calls.push({ url, init }); return apiResponse(calls.length === 1 ? verified : { id: 'email-id' }); };
  const response = await handleContact(request({ company: '<Example & Co>', to: 'attacker@example.com' }), env, fetcher);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  const payload = JSON.parse(calls[1].init.body);
  assert.deepEqual(payload.to, ['luke@wyckoffconsulting.com']);
  assert.equal(payload.from, 'Security Dawgs <website@forms.securitydawgs.com>');
  assert.equal(payload.reply_to, data.email);
  for (const value of [data.name, data.email, data.phone, data.companySize, data.interest]) assert.ok(payload.text.includes(value));
  assert.ok(payload.html.includes('&lt;Example &amp; Co&gt;'));
  assert.ok(!payload.html.includes('<Example & Co>'));
  assert.match(calls[1].init.headers['Idempotency-Key'], /^contact-[a-f0-9]{64}$/);
});
test('retries use the same delivery key for identical requests', async () => {
  const keys = [];
  const fetcher = async (url, init) => {
    if (url.includes('siteverify')) return apiResponse(verified);
    keys.push(init.headers['Idempotency-Key']); return apiResponse({ id: 'email-id' });
  };
  await handleContact(request(), env, fetcher);
  await handleContact(request({ token: 'new-token' }), env, fetcher);
  assert.equal(keys[0], keys[1]);
});
test('provider errors report failure rather than a false success', async () => {
  const response = await handleContact(request(), env, async url => url.includes('siteverify') ? apiResponse(verified) : apiResponse({ message: 'quota exceeded' }, 429));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, undefined);
  assert.equal((await handleContact(request(), env, async () => { throw new Error('network'); })).status, 503);
});
