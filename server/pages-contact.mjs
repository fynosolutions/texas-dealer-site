import {createHash} from 'node:crypto';
import {createContactService} from './contact.mjs';
import {createResendMailer} from './mail.mjs';
import {createTwilioSms} from './sms.mjs';

const json=(status,body,headers={})=>new Response(JSON.stringify(body),{
  status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers},
});

// Cache only within this isolate. Global edge protection is configured separately in Cloudflare.
export function createPagesHandler(fetchImpl=fetch) {
  let signature,submit;
  const rates=new Map();
  return async ({request,env})=>{
    if(request.method!=='POST') return json(405,{status:'failed'},{Allow:'POST'});
    const origins=(env.ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
    if(!origins.length) return json(503,{status:'failed',error:'not_configured'});
    if(!origins.includes(request.headers.get('Origin'))) return json(403,{status:'failed'});
    if(!/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type') || '')) return json(415,{status:'failed'});
    const now=Date.now();
    for(const [key,rate] of rates) if(rate.expires<now) rates.delete(key);
    const ip=createHash('sha256').update(request.headers.get('CF-Connecting-IP') || 'local').digest('hex');
    const rate=rates.get(ip) || {count:0,expires:now+60000};
    if(rate.count>=20 || (!rates.has(ip) && rates.size>=10000)) return json(429,{status:'failed'},{'Retry-After':'60'});
    rate.count++;rates.set(ip,rate);
    let input;
    try {
      if(Number(request.headers.get('Content-Length'))>32768) return json(413,{status:'failed'});
      if(!request.body) return json(400,{status:'failed'});
      const reader=request.body.getReader(),decoder=new TextDecoder();
      let text='',size=0;
      while(true) {
        const {done,value}=await reader.read();
        if(done) break;
        size+=value.byteLength;
        if(size>32768) {await reader.cancel();return json(413,{status:'failed'});}
        text+=decoder.decode(value,{stream:true});
      }
      input=JSON.parse(text+decoder.decode());
    } catch {return json(400,{status:'failed'});}
    const config={mode:env.CONTACT_MODE || 'mock',mailTo:env.MAIL_TO,mailFrom:env.MAIL_FROM,brand:env.NOTIFICATION_BRAND,
      smsEnabled:env.SMS_ENABLED==='true',smsTo:env.SMS_TO,smsFrom:env.TWILIO_MESSAGING_SERVICE_SID || env.SMS_FROM};
    const next=JSON.stringify([config,env.RESEND_API_KEY,env.MAIL_PROVIDER,env.SMS_PROVIDER,env.TWILIO_ACCOUNT_SID,env.TWILIO_AUTH_TOKEN]);
    if(next!==signature) {
      const supported=!env.MAIL_PROVIDER || env.MAIL_PROVIDER==='resend';
      submit=createContactService({...config,sharePending:false,
        sendMail:supported ? createResendMailer(env.RESEND_API_KEY,fetchImpl) : undefined,
        sendSms:(!env.SMS_PROVIDER || env.SMS_PROVIDER==='twilio') ? createTwilioSms({accountSid:env.TWILIO_ACCOUNT_SID,
          authToken:env.TWILIO_AUTH_TOKEN,messagingServiceSid:env.TWILIO_MESSAGING_SERVICE_SID},fetchImpl) : undefined});
      signature=next;
    }
    try {
      const {http,...body}=await submit(input);
      return json(http,body);
    } catch {return json(500,{status:'unknown'});}
  };
}
