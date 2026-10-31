const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('rev-in'); observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('.rev').forEach(el => { el.classList.add('rev-ready'); observer.observe(el); });
}
const zh = document.documentElement.lang === 'zh-Hant';
const messages = zh ? {
  sending: '送出中…', mock: '模擬提交完成，未發送郵件或簡訊。',
  accepted: '謝謝，您的詢盤已提交至郵件服務。',
  not_configured: '表單暫時無法送出。已保留您填寫的內容，請稍後再試。',
  partial: '部分通知已被接受，另一通道未完成。請勿立即重複提交。',
  unknown: '無法確認通知狀態，可能已發送。已保留內容，請勿立即重複提交。',
  failed: '提交未完成，已保留您的內容。請稍後重試。',
} : {
  sending: 'Sending…', mock: 'Simulation complete. No email or SMS was sent.',
  accepted: 'Thank you. Your inquiry has been submitted for email delivery.',
  not_configured: 'The contact form is temporarily unavailable. Your entries are kept. Please try again later.',
  partial: 'One notification was accepted; the other did not complete. Please do not immediately resubmit.',
  unknown: 'Notification status is uncertain; it may have been sent. Your entries are kept. Please do not immediately resubmit.',
  failed: 'Your request did not complete. Your entries are kept. Please try again later.',
};
// Shared lead hub (Cloudflare Worker). Change this one line to move leads to another backend.
const FORM_ENDPOINT = 'https://feast-contact.fynosolutions.xyz/submit/yaya';
document.querySelectorAll<HTMLFormElement>('form[data-cf-form]').forEach(form => {
  let busy = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    busy = true;
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const status = form.querySelector<HTMLElement>('[data-cf-status]')!;
    const label = button.textContent;
    button.disabled = true; button.textContent = messages.sending;
    status.textContent = ''; status.removeAttribute('data-state');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const data = Object.fromEntries(new FormData(form));
      const response = await fetch(FORM_ENDPOINT, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data), signal:controller.signal});
      const result = await response.json();
      const state = !response.ok ? (result.error === 'not_configured' ? 'not_configured' : 'failed') : result.mock ? 'mock' : result.success === true ? 'accepted' : result.status;
      const known = ['accepted','partial','unknown','failed','mock','not_configured'].includes(state);
      status.textContent = known ? messages[state as keyof typeof messages] : messages.failed;
      if (!response.ok || ['failed','partial','unknown'].includes(state)) status.dataset.state = 'error';
      if (state === 'accepted') form.reset();
    } catch {
      status.textContent = messages.unknown; status.dataset.state = 'error';
    } finally {
      clearTimeout(timer); busy = false; button.disabled = false; button.textContent = label;
    }
  });
});
