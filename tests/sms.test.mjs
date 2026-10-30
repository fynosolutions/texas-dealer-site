import test from 'node:test';
import assert from 'node:assert/strict';
import {createTwilioSms} from '../server/sms.mjs';
const config={accountSid:'AC'+'a'.repeat(32),authToken:'test-secret'};
const payload={to:'+15550001111',from:'+15550002222',text:'TEST 新詢盤 & details'};
const accepted={sid:'SM'+'b'.repeat(32),status:'queued',error_code:null};
test('Twilio encodes text, phone numbers and auth; accepts sender number or Messaging Service',async()=>{
  for(const messagingServiceSid of ['', 'MG'+'c'.repeat(32)]) {
    let request;
    const send=createTwilioSms({...config,messagingServiceSid},async(url,options)=>{request={url,...options};return Response.json(accepted);});
    assert.equal(await send(payload),'accepted');
    assert.equal(request.url,`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`);
    assert.equal(request.headers.Authorization,`Basic ${Buffer.from(config.accountSid+':'+config.authToken).toString('base64')}`);
    const body=new URLSearchParams(request.body);
    assert.equal(body.get('To'),payload.to);assert.equal(body.get('Body'),payload.text);
    assert.equal(body.get('MessagingServiceSid'),messagingServiceSid || null);
    assert.equal(body.get('From'),messagingServiceSid ? null : payload.from);
  }
});
test('Twilio does not send with missing credentials or invalid recipient',async()=>{
  assert.equal(createTwilioSms({}),undefined);
  assert.equal(createTwilioSms({...config,messagingServiceSid:'bad'}),undefined);
  const send=createTwilioSms(config,()=>assert.fail('must not send'));
  assert.equal(await send({...payload,to:'invalid'}),'failed');
});
test('Twilio distinguishes rejected, unknown and accepted responses',async()=>{
  for(const [http,body,expected] of [[400,{},'failed'],[401,{},'failed'],[429,{},'failed'],[500,{},'unknown'],
    [201,accepted,'accepted'],[201,{...accepted,status:'undelivered'},'failed'],[201,{...accepted,error_code:30007},'failed'],[201,{},'unknown']]) {
    const send=createTwilioSms(config,async()=>Response.json(body,{status:http}));
    assert.equal(await send(payload),expected);
  }
  const send=createTwilioSms(config,async()=>{throw new Error('network timeout');});
  assert.equal(await send(payload),'unknown');
});
