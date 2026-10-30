import test from 'node:test';
import assert from 'node:assert/strict';
import {createResendMailer} from '../server/mail.mjs';
import {createContactService} from '../server/contact.mjs';

const input={name:'Test Buyer',company:'Test Kitchen',email:'buyer@example.com',phone:'+15550001111',message:'詢價 <script>literal</script>\nSecond line'};
const config={mode:'live',mailTo:'owner@example.com',mailFrom:'Website <onboarding@resend.dev>',brand:'Website test'};

test('email-only inquiry sends fixed destination, complete text and customer reply address',async()=>{
  const calls=[];
  const sendMail=createResendMailer('test-key',async(url,options)=>{
    calls.push({url,...options});
    return new Response(JSON.stringify({id:'email-123'}));
  });
  const submit=createContactService({...config,sendMail,sendSms:()=>assert.fail('SMS must be disabled')});
  const results=await Promise.all([submit({...input,to:'attacker@example.com',from:'attacker@example.com'}),submit(input)]);
  assert.equal(calls.length,1);
  assert.equal(calls[0].url,'https://api.resend.com/emails');
  assert.equal(calls[0].headers.Authorization,'Bearer test-key');
  assert.equal(calls[0].redirect,'error');
  const body=JSON.parse(calls[0].body);
  assert.deepEqual(body.to,[config.mailTo]);
  assert.equal(body.from,config.mailFrom);
  assert.equal(body.reply_to,input.email);
  for(const value of Object.values(input)) assert.ok(body.text.includes(value));
  assert.equal(body.html,undefined);
  assert.equal(results[0].status,'accepted');
  assert.equal(results[0].channels.sms,'not_sent');
  assert.equal(results[1].duplicate,true);
});

test('missing mail credentials fail closed and enabled SMS requires full configuration',async()=>{
  assert.equal(createResendMailer('  '),undefined);
  const missing=await createContactService(config)(input);
  assert.equal(missing.http,503);
  const sms=await createContactService({...config,smsEnabled:true,sendMail:()=>assert.fail('must not send')})(input);
  assert.equal(sms.error,'not_configured');
});

test('provider rejects, uncertain responses and network errors do not report success',async()=>{
  for(const [code,body,expected] of [[401,{},'failed'],[403,{},'failed'],[429,{},'failed'],[500,{},'unknown'],[408,{},'unknown'],[200,{},'unknown'],[200,{id:'abc'},'accepted']]) {
    const send=createResendMailer('test-key',async()=>new Response(JSON.stringify(body),{status:code}));
    assert.equal(await send({to:'owner@example.com'}),expected);
  }
  for(const fetchImpl of [async()=>{throw new Error('network');},async()=>new Response('invalid JSON')]) {
    assert.equal(await createResendMailer('test-key',fetchImpl)({}),'unknown');
  }
});

test('email timeout aborts and duplicate submission does not resend',async()=>{
  let calls=0,signal;
  const sendMail=createResendMailer('test-key',async(_url,options)=>{
    calls++;signal=options.signal;return new Promise(()=>{});
  });
  const submit=createContactService({...config,sendMail,timeoutMs:10});
  assert.equal((await submit(input)).status,'unknown');
  assert.equal(signal.aborted,true);
  assert.equal((await submit(input)).duplicate,true);
  assert.equal(calls,1);
});
