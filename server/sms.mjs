import {Buffer} from 'node:buffer';

const e164=/^\+[1-9]\d{7,14}$/;
export function createTwilioSms({accountSid='',authToken='',messagingServiceSid=''}={},fetchImpl=fetch) {
  if(!/^AC[0-9a-f]{32}$/i.test(accountSid) || !authToken.trim() ||
      (messagingServiceSid && !/^MG[0-9a-f]{32}$/i.test(messagingServiceSid))) return undefined;
  return async ({to,from,text},signal)=>{
    if(!e164.test(to) || (!messagingServiceSid && !e164.test(from))) return 'failed';
    const body=new URLSearchParams({To:to,Body:text});
    if(messagingServiceSid) body.set('MessagingServiceSid',messagingServiceSid);
    else body.set('From',from);
    try {
      const response=await fetchImpl(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,{
        method:'POST',redirect:'error',signal,
        headers:{'Content-Type':'application/x-www-form-urlencoded',Authorization:`Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`},
        body:body.toString(),
      });
      if(!response.ok) return response.status>=500 || response.status===408 ? 'unknown' : 'failed';
      const result=await response.json();
      if(result.error_code!=null || ['failed','undelivered','canceled'].includes(result.status)) return 'failed';
      return typeof result.sid==='string' && /^SM[0-9a-f]{32}$/i.test(result.sid) &&
        ['accepted','queued','sending','sent','delivered'].includes(result.status) ? 'accepted' : 'unknown';
    } catch {return 'unknown';}
  };
}
