import {spawn} from 'node:child_process';
import {once} from 'node:events';

// Own an isolated preview server; never use a possibly live user server for regression tests.
const server=spawn(process.execPath,['server.mjs'],{
  env:{...process.env,PORT:'0',CONTACT_MODE:'mock',RESEND_API_KEY:''},stdio:['ignore','pipe','inherit'],
});
try {
  const base=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview startup timeout')),10000);
    server.once('error',error=>{clearTimeout(timer);reject(error);});
    server.once('exit',()=>{clearTimeout(timer);reject(new Error('Preview exited'));});
    server.stdout.on('data',chunk=>{
      const match=String(chunk).match(/http:\/\/localhost:\d+/);
      if(match){clearTimeout(timer);resolve(match[0]);}
    });
  });
  const check=spawn(process.execPath,['tests/browser.mjs'],{env:{...process.env,TEST_BASE_URL:base},stdio:'inherit'});
  const [code]=await once(check,'exit');
  process.exitCode=code ?? 1;
} finally {
  if(server.exitCode===null) {const exited=once(server,'exit');server.kill();await exited;}
}
