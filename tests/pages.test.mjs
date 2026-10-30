import test from 'node:test';
import assert from 'node:assert/strict';
import {createPagesHandler} from '../server/pages-contact.mjs';

const env={CONTACT_MODE:'live',MAIL_PROVIDER:'resend',RESEND_API_KEY:'test-key',MAIL_TO:'owner@example.com',MAIL_FROM:'site@example.com',NOTIFICATION_BRAND:'Test',ALLOWED_ORIGINS:'https://dealer.example',SMS_ENABLED:'false'};
const data={name:'Test Customer',email:'buyer@example.com',message:'TEST 詢價'};
function context(body=data,overrides={},headers={}) {
  return {env:{...env,...overrides},request:new Request('https://dealer.example/api/contact',{
    method:'POST',headers:{Origin:'https://dealer.example','Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1',...headers},body:JSON.stringify(body),
  })};
}
test('Pages sends to server recipient, preserves Unicode and reuses completed response',async()=>{
  const sent=[];
  const handler=createPagesHandler(async(_url,options)=>{sent.push(JSON.parse(options.body));return Response.json({id:'test-id'});});
  const response=await handler(context({...data,to:'attacker@example.com'}));
  assert.equal(response.status,200);
  assert.equal((await response.json()).status,'accepted');
  assert.deepEqual(sent[0].to,[env.MAIL_TO]);
  assert.equal(sent[0].reply_to,data.email);
  assert.ok(sent[0].text.includes(data.message));
  assert.equal((await (await handler(context())).json()).duplicate,true);
  assert.equal(sent.length,1);
});
test('Pages rejects invalid origin, content, configuration and oversized requests before sending',async()=>{
  const handler=createPagesHandler(()=>assert.fail('must not send'));
  for(const [ctx,status] of [
    [context(data,{}, {Origin:'https://other.example'}),403],
    [context(data,{}, {'Content-Type':'text/plain'}),415],
    [context({...data,email:'invalid'}),400],
    [context({...data,_honey:'bot'}),400],
    [context(data,{RESEND_API_KEY:''}),503],
    [context(data,{ALLOWED_ORIGINS:''}),503],
    [context(data,{SMS_ENABLED:'true'}),503],
    [context({...data,message:'大'.repeat(12000)}),413],
    [{env,request:new Request('https://dealer.example/api/contact')},405],
  ]) assert.equal((await handler(ctx)).status,status);
});
test('Pages mock never invokes email provider',async()=>{
  const handler=createPagesHandler(()=>assert.fail('must not send'));
  assert.equal((await (await handler(context(data,{CONTACT_MODE:'mock'}))).json()).status,'mock');
});
test('Pages sends email and SMS to configured owners and reports partial provider failure',async()=>{
  const smsConfig={SMS_ENABLED:'true',SMS_PROVIDER:'twilio',SMS_TO:'+15550001111',SMS_FROM:'+15550002222',
    TWILIO_ACCOUNT_SID:'AC'+'a'.repeat(32),TWILIO_AUTH_TOKEN:'test-token'};
  for(const failSms of [false,true]) {
    const sent=[];
    const handler=createPagesHandler(async(url,options)=>{
      sent.push({url,body:options.body});
      if(url.includes('twilio.com')) return failSms ? Response.json({code:21610},{status:400}) : Response.json({sid:'SM'+'b'.repeat(32),status:'queued'});
      return Response.json({id:'mail-id'});
    });
    const response=await handler(context({...data,phone:'+15550003333',smsTo:'+15550004444'},smsConfig));
    const result=await response.json();
    assert.equal(result.status,failSms ? 'partial' : 'accepted');
    assert.equal(result.channels.mail,'accepted');
    assert.equal(result.channels.sms,failSms ? 'failed' : 'accepted');
    assert.equal(sent.length,2);
    const sms=new URLSearchParams(sent.find(x=>x.url.includes('twilio.com')).body);
    assert.equal(sms.get('To'),smsConfig.SMS_TO);
    assert.ok(sms.get('Body').includes('+15550003333'));
    const duplicate=await handler(context({...data,phone:'+15550003333'},smsConfig));
    assert.equal((await duplicate.json()).duplicate,true);assert.equal(sent.length,2);
  }
});
test('Pages rate limiting separates Cloudflare client addresses',async()=>{
  const handler=createPagesHandler(()=>assert.fail('must not send'));
  for(let i=0;i<20;i++) assert.equal((await handler(context(data,{CONTACT_MODE:'mock'}))).status,200);
  assert.equal((await handler(context(data,{CONTACT_MODE:'mock'}))).status,429);
  assert.equal((await handler(context(data,{CONTACT_MODE:'mock'},{'CF-Connecting-IP':'192.0.2.2'}))).status,200);
});
test('Pages concurrent duplicates do not await another request-owned fetch',async()=>{
  let release,started;
  const ready=new Promise(resolve=>{started=resolve;});
  const handler=createPagesHandler(()=>new Promise(resolve=>{release=resolve;started();}));
  const first=handler(context());await ready;
  const duplicate=await handler(context());
  assert.equal((await duplicate.json()).status,'unknown');
  release(Response.json({id:'accepted'}));
  assert.equal((await (await first).json()).status,'accepted');
  assert.equal((await (await handler(context())).json()).status,'accepted');
});
