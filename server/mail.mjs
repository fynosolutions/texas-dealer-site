// Resend REST API. Credentials and destinations stay on the server.
export function createResendMailer(apiKey, fetchImpl = fetch) {
  if (!apiKey?.trim()) return undefined;
  return async ({to, from, replyTo, subject, text}, signal) => {
    try {
      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST', redirect: 'error', signal,
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.trim()}`},
        body: JSON.stringify({from, to: [to], reply_to: replyTo, subject, text}),
      });
      if (!response.ok) return response.status >= 500 || response.status === 408 ? 'unknown' : 'failed';
      const body = await response.json();
      return typeof body.id === 'string' && body.id.length > 0 ? 'accepted' : 'unknown';
    } catch {
      // A lost response does not prove that the email was not sent. Never retry automatically.
      return 'unknown';
    }
  };
}
