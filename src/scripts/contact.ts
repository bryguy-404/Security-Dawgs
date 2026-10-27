type Turnstile = { render: (element: HTMLElement, options: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void };
declare global { interface Window { turnstile?: Turnstile; securityDawgsTurnstileReady?: () => void } }
const form = document.querySelector<HTMLFormElement>('#contact-form');
if (form) {
  const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const status = form.querySelector<HTMLElement>('#form-status')!;
  const widget = form.querySelector<HTMLElement>('#turnstile-widget')!;
  const sitekey = form.dataset.sitekey;
  let token = '';
  let widgetId: string | undefined;
  let widgetSize: 'compact' | 'flexible' | undefined;
  let sending = false;
  let submissionError = false;
  const submissionId = crypto.randomUUID();
  const interest = new URLSearchParams(location.search).get('interest') || 'General inquiry';
  function updateButton() { submit.disabled = sending || !token; }
  function challengeError(message: string) { token = ''; status.textContent = message; updateButton(); }
  function renderWidget() {
    if (!window.turnstile || !sitekey) return;
    const size = widget.clientWidth < 300 ? 'compact' : 'flexible';
    if (size === widgetSize || sending) return;
    if (widgetId !== undefined) window.turnstile.remove(widgetId);
    widgetSize = size;
    token = '';
    updateButton();
    widgetId = window.turnstile.render(widget, {
      sitekey, theme: 'light', size, action: 'contact',
      callback: (value: string) => { token = value; if (!sending && !submissionError) status.textContent = ''; updateButton(); },
      'expired-callback': () => challengeError('The security check expired. Please complete it again.'),
      'error-callback': () => challengeError('The security check could not load. Please check your connection and reload this page.'),
      'timeout-callback': () => challengeError('Please complete the security check to continue.'),
    });
  }
  window.securityDawgsTurnstileReady = () => {
    renderWidget();
    new ResizeObserver(renderWidget).observe(widget);
  };
  if (sitekey) {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=securityDawgsTurnstileReady&render=explicit';
    script.async = true;
    script.onerror = () => challengeError('The security check could not load. Please check your connection and reload this page.');
    document.head.append(script);
  } else challengeError('The form is temporarily unavailable. Please try again later.');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    if (!token) { challengeError('Please complete the security check before sending.'); return; }
    sending = true;
    submissionError = false;
    updateButton();
    submit.querySelector('span')!.textContent = 'Sending…';
    status.textContent = 'Sending your request…';
    const fields = new FormData(form);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fields.get('name'), email: fields.get('email'), phone: fields.get('phone'), company: fields.get('company'), companySize: fields.get('companySize'), website: fields.get('website'), interest, submissionId, token }),
        signal: AbortSignal.timeout(30000),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Your request could not be sent. Please try again.');
      form.hidden = true;
      document.querySelector<HTMLElement>('#form-heading')!.hidden = true;
      const success = document.querySelector<HTMLElement>('#form-success')!;
      success.hidden = false;
      success.focus();
    } catch (error) {
      submissionError = true;
      status.textContent = error instanceof Error && error.name === 'Error' ? error.message : 'We couldn’t confirm your request was sent. Please check your connection and try again.';
      token = '';
      if (widgetId !== undefined) window.turnstile?.reset(widgetId);
    } finally { sending = false; submit.querySelector('span')!.textContent = 'Send my request'; updateButton(); }
  });
}
export {};
