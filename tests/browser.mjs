import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const base=process.env.TEST_BASE_URL || 'http://localhost:4321';
const routes=['/','/products/','/wholesale/','/contact/','/zh-Hant/','/zh-Hant/products/','/zh-Hant/wholesale/','/zh-Hant/contact/'];
await mkdir('artifacts',{recursive:true});
const report=[];
try {
 for (const width of [1440,390,320]) {
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  for (const route of routes) {
   const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200);
   await page.evaluate(async()=>{await document.fonts.ready;});
   const overflow=await page.evaluate(()=>[...document.querySelectorAll('main *,header a,header button')].filter(el=>{
    const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&s.visibility!=='hidden'&&s.display!=='none'&&(r.right>innerWidth+2||r.left < -2);
   }).map(el=>`${el.tagName}: ${el.textContent.slice(0,60)}`));
   assert.deepEqual(overflow,[],`${width} ${route} overflow: ${overflow}`);
   const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src));assert.deepEqual(broken,[]);
   const navOverlap=await page.evaluate(()=>{
    const a=document.querySelector('header > div:first-child > div').getBoundingClientRect();
    const b=document.querySelector('.language-switch').getBoundingClientRect();
    return a.left<b.right && a.right>b.left && a.top<b.bottom && a.bottom>b.top;
   });assert.equal(navOverlap,false,`${width} navigation overlaps language switch`);
   assert.equal(await page.locator('form').count(),1);
   const expected=route.startsWith('/zh-Hant') ? route.replace('/zh-Hant','') || '/' : '/zh-Hant'+route;
   const lang=await page.locator('header .language-switch').getAttribute('href');assert.equal(lang.replace(/\/$/,''),expected.replace(/\/$/,''));
   if(width<1024){
    const toggle=page.locator('[data-mobile-toggle]');await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');
    assert.equal(await toggle.evaluate(el=>el===document.activeElement),true);
   }
   if(route.includes('/products/')) {
    assert.equal(await page.locator('[data-product-catalog] img').count(),0);
    assert.equal(await page.locator('[data-product-id] a').count(),0);
    for (const id of ['category-five-color','category-mala-cake']) {
     if(width<1024) await page.locator('#category-select').selectOption(id);
     else await page.locator(`[data-category-navigation] nav a[href="#${id}"]`).click();
     await page.waitForFunction(id=>location.hash==='#'+id,id);
     await page.waitForFunction(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.top>=90&&r.top<innerHeight;},id);
    }
    await page.goto(base+route,{waitUntil:'networkidle'});
   }
   if(route==='/' || route==='/zh-Hant/' || route.includes('/wholesale/')) {
    assert.equal(await page.locator('[data-journey] li').count(),6);
    assert.equal(await page.locator('[data-purchasing-terms] dd').count(),4);
    if(width!==320) await page.locator('[data-journey]').screenshot({path:`artifacts/review-journey-${width}-${route.replaceAll('/','_')}.png`});
   }
   if(width!==320) {
    await page.locator('img').evaluateAll(imgs=>imgs.forEach(img=>img.loading='eager'));
    await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
    await page.screenshot({path:`artifacts/${width}-${route.replaceAll('/','_')||'home'}.png`,fullPage:true});
   }
   report.push({width,route,status:'passed'});
  }
  assert.deepEqual(errors,[]);
  await context.close();
 }
 const context=await browser.newContext();const page=await context.newPage();
 // Keep browser regression checks independent of live credentials and never send real inquiries.
 await page.route('**/api/contact',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'mock',mock:true})}));
 for(const route of ['/contact/','/zh-Hant/contact/','/']){
  await page.goto(base+route);
  const form=page.locator('form');await form.locator('[name="name"]').fill('Preview Buyer');await form.locator('[name="email"]').fill('preview@example.com');await form.locator('[name="message"]').fill('Test inquiry — do not send.');
  await form.locator('button').click();await page.waitForFunction(()=>document.querySelector('[data-cf-status]').textContent.includes('Simulation')||document.querySelector('[data-cf-status]').textContent.includes('模擬提交完成'));
  assert.equal(await form.locator('[name="message"]').inputValue(),'Test inquiry — do not send.');
 }
 await page.route('**/api/contact',route=>route.fulfill({status:502,contentType:'application/json',body:JSON.stringify({status:'failed'})}));
 await page.locator('form button').click();await page.waitForFunction(()=>document.querySelector('[data-cf-status]').dataset.state==='error');
 assert.equal(await page.locator('[name="message"]').inputValue(),'Test inquiry — do not send.');
 for(const route of ['/contact/','/zh-Hant/contact/','/']) {
  await page.goto(base+route);
  const form=page.locator('form');
  await form.locator('[name="name"]').fill('Browser Test');
  await form.locator('[name="email"]').fill('buyer@example.com');
  await form.locator('[name="message"]').fill('Browser test only');
  for(const [http,body] of [[503,{status:'failed',error:'not_configured'}],[200,{status:'unknown'}],[502,{status:'accepted'}]]) {
   await page.unroute('**/api/contact');
   await page.route('**/api/contact',r=>r.fulfill({status:http,contentType:'application/json',body:JSON.stringify(body)}));
   await form.locator('button').click();
   await page.waitForFunction(()=>document.querySelector('[data-cf-status]').dataset.state==='error'&&!document.querySelector('form button').disabled);
   assert.equal(await form.locator('[name="message"]').inputValue(),'Browser test only');
  }
  await page.unroute('**/api/contact');
  let calls=0;
  await page.route('**/api/contact',async r=>{
   calls++;await new Promise(resolve=>setTimeout(resolve,200));
   await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'accepted'})});
  });
  await form.evaluate(el=>{el.requestSubmit();el.requestSubmit();});
  assert.equal(await form.locator('button').isDisabled(),true);
  await page.waitForFunction(()=>document.querySelector('form [name="message"]').value==='');
  assert.equal(calls,1);
  assert.match(await form.locator('[data-cf-status]').textContent(),/submitted for email delivery|已提交至郵件服務/);
 }
 await context.close();
 const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();await staticPage.goto(base);
 assert.equal(await staticPage.locator('.rev').first().evaluate(el=>getComputedStyle(el).opacity),'1');await nojs.close();
 await writeFile('artifacts/browser-report.json',JSON.stringify({routes:report,mockForms:'passed',emailFormStates:'passed',duplicateClickProtection:'passed',failurePreservesInput:'passed',noJavaScriptContent:'passed'},null,2));
 console.log('PASS: 24 viewport/route checks, mock/success/unavailable/unknown/error forms, duplicate click protection, no-JS content.');
} finally {await browser.close();}
