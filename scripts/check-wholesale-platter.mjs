import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try {
 for (const width of [1440,390]) {
  const page = await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  for (const prefix of ['', '/zh-Hant']) {
   const response = await page.goto(`http://127.0.0.1:4321${prefix}/wholesale/`,{waitUntil:'networkidle'});
   assert.equal(response.status(),200);
   const card = page.locator('[data-offer="o2"]');
   await card.scrollIntoViewIfNeeded();
   const photo=card.locator('img');
   await photo.evaluate(img=>img.decode());
   assert.match(await photo.getAttribute('src'),/five-color-gyoza-black-platter.png$/);
   const dimensions=await photo.evaluate(img=>({natural:img.naturalWidth/img.naturalHeight, rendered:img.clientWidth/img.clientHeight}));
   assert.ok(Math.abs(dimensions.natural-dimensions.rendered)<0.06,JSON.stringify(dimensions));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await card.screenshot({path:`artifacts/wholesale-platter-${prefix?'zh':'en'}-${width}.png`,style:'.dealer-header{visibility:hidden}'});
  }
  await page.close();
 }
 console.log('PASS: Wholesale 02 image loads without material cropping or overflow in both languages at 1440/390px.');
} finally {await browser.close();}
