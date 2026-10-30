import { createHash } from 'node:crypto';
const limits = {name:100, company:200, email:254, phone:40, message:5000};
export function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const values = {};
  for (const [key,max] of Object.entries(limits)) {
    if (input[key] !== undefined && typeof input[key] !== 'string') return null;
    values[key] = (input[key] || '').trim();
    if (values[key].length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(values[key])) return null;
  }
  if (!values.name || !values.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return null;
  if (/[\r\n]/.test(values.name+values.email+values.phone+values.company)) return null;
  return values;
}
export function aggregate(states) {
  if (states.every(s=>s==='accepted')) return 'accepted';
  if (states.includes('accepted')) return 'partial';
  if (states.includes('unknown')) return 'unknown';
  return 'failed';
}
// Integrate the selected providers here when their configuration is supplied.
// This adapter contract is explicitly documented; it is NOT a direct provider API.
export function createAdapter(url, token) {
  return async (payload, signal) => {
    const response = await fetch(url, {method:'POST', redirect:'error', signal,
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(payload)});
    if (!response.ok) return response.status >= 500 ? 'unknown' : 'failed';
    const body = await response.json();
    return ['accepted','failed','unknown'].includes(body.status) ? body.status : 'unknown';
  };
}
export function createContactService({mode='mock', mailTo='', smsTo='', mailFrom='', smsFrom='', brand='', sendMail, sendSms, smsEnabled=false, timeoutMs=8000, sharePending=true}={}) {
  const recent = new Map(); // hashes + promises/statuses only; no persistent inquiries
  return async input => {
    const data = validate(input);
    if (!data) return {http:400,status:'failed',error:'validation'};
    if (input._honey) return {http:400,status:'failed',error:'validation'};
    if (mode==='mock') return {http:200,status:'mock',mock:true,channels:{mail:'not_sent',sms:'not_sent'}};
    if (mode!=='live' || !mailTo || !mailFrom || !brand || !sendMail ||
        (smsEnabled && (!smsTo || !smsFrom || !sendSms))) return {http:503,status:'failed',error:'not_configured'};
    const now=Date.now();
    for (const [key,value] of recent) if (value.expires<now) recent.delete(key);
    const hash=createHash('sha256').update(JSON.stringify(data)).digest('hex');
    if (recent.has(hash)) {
      const entry=recent.get(hash);
      // Workers must not await I/O owned by another request.
      if (!sharePending && !entry.completed) return {http:200,status:'unknown',duplicate:true};
      return {...(entry.completed || await entry.result), duplicate:true};
    }
    if (recent.size>=1000) return {http:429,status:'failed',error:'busy'};
    const run = async (send,payload) => {
      const controller=new AbortController(); let timer;
      try {
        const result=await Promise.race([
          Promise.resolve().then(()=>send(payload,controller.signal)),
          new Promise(resolve=>{timer=setTimeout(()=>{controller.abort();resolve('unknown');},timeoutMs);})
        ]);
        return ['accepted','failed','unknown'].includes(result) ? result : 'unknown';
      } catch { return 'unknown'; } finally {clearTimeout(timer);}
    };
    const result = (async () => {
      const text=['New website wholesale inquiry', '',
        `Name: ${data.name}`, `Company: ${data.company || '—'}`, `Email: ${data.email}`,
        `Phone: ${data.phone || '—'}`, '', 'Message:', data.message,
        '', 'Reply to this email to contact the customer.'].join('\n');
      const [mail,sms]=await Promise.all([
        run(sendMail,{to:mailTo,from:mailFrom,replyTo:data.email,subject:`${brand} — Wholesale inquiry`,text}),
        smsEnabled ? run(sendSms,{to:smsTo,from:smsFrom,text:`${brand}: ${data.name.slice(0,50)} | ${data.company.slice(0,60)} | ${data.phone || data.email} | ${data.message.slice(0,180)}`}) : Promise.resolve('not_sent')
      ]);
      const status=aggregate(smsEnabled ? [mail,sms] : [mail]);
      return {http:status==='failed'?502:200,status,channels:{mail,sms}};
    })();
    const entry={expires:now+120000,result,completed:null};
    recent.set(hash,entry);
    entry.completed=await result;
    return entry.completed;
  };
}
