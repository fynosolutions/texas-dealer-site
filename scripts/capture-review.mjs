import {chromium} from 'playwright';
const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try {
 for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  for(const [locale,prefix] of [['en',''],['zh','/zh-Hant']]) {
   await page.goto(`http://127.0.0.1:4321${prefix}/`,{waitUntil:'networkidle'});
   await page.screenshot({path:`artifacts/review-home-${locale}-${width}.png`});
   await page.locator('[data-journey]').screenshot({path:`artifacts/review-process-${locale}-${width}.png`,style:'.dealer-header{visibility:hidden}'});
   await page.goto(`http://127.0.0.1:4321${prefix}/products/`,{waitUntil:'networkidle'});
   await page.screenshot({path:`artifacts/review-catalog-${locale}-${width}.png`});
  }
  await page.close();
 }
 console.log('Review screenshots saved: homepage, process and catalog in both languages at 1440/390px.');
} finally {await browser.close();}
