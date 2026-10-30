import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';

async function start(mode) {
  const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('../',import.meta.url),
    env:{...process.env,PORT:'0',CONTACT_MODE:mode,ALLOWED_ORIGINS:'http://localhost:4321',MAIL_PROVIDER:'resend',RESEND_API_KEY:'',SMS_ENABLED:'false'},stdio:['ignore','pipe','pipe']});
  try {
    const base=await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('server startup timeout')),10000);
      child.once('error',error=>{clearTimeout(timer);reject(error);});
      child.once('exit',()=>{clearTimeout(timer);reject(new Error('server exited'));});
      child.stdout.on('data',chunk=>{const match=String(chunk).match(/http:\/\/localhost:(\d+)/);if(match){clearTimeout(timer);resolve(`http://127.0.0.1:${match[1]}`);}});
    });
    return {child,base};
  } catch(error) {child.kill();throw error;}
}
const input={name:'HTTP Test',email:'buyer@example.com',message:'Local test only'};
for(const mode of ['mock','live']) {
  test(`HTTP contact validation and ${mode} response without external email`,async()=>{
    const {child,base}=await start(mode);
    try {
      const post=(body,origin='http://localhost:4321')=>fetch(base+'/api/contact',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
      assert.equal((await post(input,'https://other.example')).status,403);
      assert.equal((await post({...input,email:'invalid'})).status,400);
      const response=await post(input),body=await response.json();
      assert.equal(response.status,mode==='mock'?200:503);
      assert.equal(body.status,mode==='mock'?'mock':'failed');
      if(mode==='live') assert.equal(body.error,'not_configured');
      assert.equal((await fetch(base+'/.env')).status,404);
    } finally {const exited=once(child,'exit');child.kill();await exited;}
  });
}
