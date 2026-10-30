import test from 'node:test';
import assert from 'node:assert/strict';
import {createContactService,validate,aggregate} from '../server/contact.mjs';
const inquiry={name:'Preview Buyer',company:'Test Kitchen',email:'buyer@example.com',phone:'+15550001111',message:'Please quote soup dumplings.'};
const config={mode:'live',mailTo:'sales@example.com',smsTo:'+15550002222',mailFrom:'sender@example.com',smsFrom:'INTERNAL',brand:'Test',smsEnabled:true,timeoutMs:20};
test('mock never calls providers and is labeled as simulation',async()=>{
 let calls=0;const result=await createContactService({sendMail:()=>calls++,sendSms:()=>calls++})(inquiry);
 assert.equal(calls,0);assert.equal(result.mock,true);assert.equal(result.status,'mock');
});
test('reject invalid fields and header injection',()=>{
 assert.equal(validate({...inquiry,email:'bad'}),null);
 assert.equal(validate({...inquiry,name:'a\r\nb'}),null);
 assert.equal(validate({...inquiry,message:'x'.repeat(5001)}),null);
 assert.equal(validate({...inquiry,name:[]}),null);
});
test('live mode fails closed without destinations and providers',async()=>{
 const result=await createContactService({mode:'live'})(inquiry);assert.equal(result.http,503);
});
test('destinations are fixed server side, parallel duplicate sends coalesce',async()=>{
 const mails=[],texts=[];
 const submit=createContactService({...config,sendMail:async p=>{mails.push(p);return 'accepted';},sendSms:async p=>{texts.push(p);return 'accepted';}});
 const results=await Promise.all([submit({...inquiry,to:'attacker@example.com',smsTo:inquiry.phone}),submit(inquiry)]);
 assert.equal(mails.length,1);assert.equal(texts.length,1);
 assert.equal(mails[0].to,config.mailTo);assert.equal(texts[0].to,config.smsTo);
 assert.equal(mails[0].replyTo,inquiry.email);assert.equal(results[0].status,'accepted');assert.equal(results[1].duplicate,true);
});
test('partial and unknown results are distinguished, timed-out sends are not retried',async()=>{
 let smsCalls=0;
 const submit=createContactService({...config,sendMail:async()=> 'accepted',sendSms:()=>{smsCalls++;return new Promise(()=>{});}});
 const first=await submit(inquiry),second=await submit(inquiry);
 assert.equal(first.status,'partial');assert.equal(first.channels.sms,'unknown');assert.equal(second.duplicate,true);assert.equal(smsCalls,1);
 assert.equal(aggregate(['failed','unknown']),'unknown');assert.equal(aggregate(['failed','failed']),'failed');
});
test('honeypot rejects without notification',async()=>{
 const result=await createContactService()({...inquiry,_honey:'bot'});assert.equal(result.http,400);
});
