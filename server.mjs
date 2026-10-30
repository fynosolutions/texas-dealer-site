import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createAdapter, createContactService } from './server/contact.mjs';
import { createResendMailer } from './server/mail.mjs';
import { createTwilioSms } from './server/sms.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
if (existsSync(path.join(root,'.env')) && process.loadEnvFile) process.loadEnvFile(path.join(root,'.env'));
const env=process.env;
const port=Number(env.PORT || 4321);
const mode=env.CONTACT_MODE || 'mock';
const origins=new Set((env.ALLOWED_ORIGINS || `http://localhost:${port},http://127.0.0.1:${port}`).split(',').map(s=>s.trim()));
const adapter=(url,token)=>url && token && /^https:\/\//.test(url) ? createAdapter(url,token) : undefined;
const mailProvider=env.MAIL_PROVIDER || 'resend';
const sendMail=mailProvider==='resend' ? createResendMailer(env.RESEND_API_KEY) :
  mailProvider==='adapter' ? adapter(env.MAIL_ADAPTER_URL,env.MAIL_ADAPTER_TOKEN) : undefined;
const smsProvider=env.SMS_PROVIDER || 'twilio';
const sendSms=smsProvider==='twilio' ? createTwilioSms({accountSid:env.TWILIO_ACCOUNT_SID,authToken:env.TWILIO_AUTH_TOKEN,
  messagingServiceSid:env.TWILIO_MESSAGING_SERVICE_SID}) : smsProvider==='adapter' ? adapter(env.SMS_ADAPTER_URL,env.SMS_ADAPTER_TOKEN) : undefined;
const contact=createContactService({mode,mailTo:env.MAIL_TO,smsTo:env.SMS_TO,mailFrom:env.MAIL_FROM,
  smsFrom:smsProvider==='twilio' ? env.TWILIO_MESSAGING_SERVICE_SID || env.SMS_FROM : env.SMS_FROM,brand:env.NOTIFICATION_BRAND,
  sendMail,smsEnabled:env.SMS_ENABLED==='true',sendSms});
const dist=path.join(root,'dist');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const rates=new Map();
function json(res,code,body){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));}
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  try {
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/api/contact'){
      if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{status:'failed'});}
      if(!origins.has(req.headers.origin)) return json(res,403,{status:'failed'});
      if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||'')) return json(res,415,{status:'failed'});
      const now=Date.now();for(const [key,v] of rates) if(v.expires<now)rates.delete(key);
      const key=createHash('sha256').update(req.socket.remoteAddress||'local').digest('hex');
      const rate=rates.get(key)||{count:0,expires:now+60000};
      if(rate.count>=20 || rates.size>=10000) {res.setHeader('Retry-After','60');return json(res,429,{status:'failed'});}
      rate.count++;rates.set(key,rate);
      let body='',size=0;
      for await(const chunk of req){size+=chunk.length;if(size>32768)return json(res,413,{status:'failed'});body+=chunk;}
      let input;try{input=JSON.parse(body);}catch{return json(res,400,{status:'failed'});}
      const {http:code,...result}=await contact(input);return json(res,code,result);
    }
    if(!['GET','HEAD'].includes(req.method))return json(res,405,{status:'failed'});
    const pathname=decodeURIComponent(url.pathname);
    let target=path.resolve(dist,'.'+pathname);
    if(target!==dist && !target.startsWith(dist+path.sep))return json(res,403,{status:'failed'});
    const info=await stat(target);
    if(info.isDirectory()){
      if(!pathname.endsWith('/')){res.writeHead(308,{Location:url.pathname+'/'+url.search});return res.end();}
      target=path.join(target,'index.html');
    }
    const body=await readFile(target);
    res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(req.method==='HEAD'?undefined:body);
  } catch(error) {json(res,error.code==='ENOENT'?404:400,{status:'failed'});}
});
server.requestTimeout=15000;
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://localhost:${server.address().port} — contact mode: ${mode}`));
