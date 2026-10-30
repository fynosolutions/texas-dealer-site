"""One-time adaptation of the original components; reference checkout stays untouched."""
from pathlib import Path
import re, json, ast, shutil
ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT/'src'
ORIGINAL = ROOT.parent/'factory-reference/src'
def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding='utf-8')
def original(name): return (ORIGINAL/name).read_text(encoding='utf-8')

quoted = r'''(?:'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")'''
pattern = r"'([^']+)':\s*\{\s*en:\s*("+quoted+r"),\s*'zh-Hant':\s*("+quoted+r"),?\s*\}"
translations = {key:{'en':ast.literal_eval(en),'zh-Hant':ast.literal_eval(zh)} for key,en,zh in re.findall(pattern,original('i18n/ui.ts'),re.S)}
updates = {
 'nav.requestSamples': ['Get Wholesale Pricing','獲取批發報價'],
 'nav.wholesale': ['Wholesale','批發與配送'],
 'hero.title1': ['Restaurant-Ready','德州餐飲供應'],
 'hero.title2': ['Dumplings &','水餃 ·'],
 'hero.titleItalic': ['Gyoza','煎餃'],
 'hero.seoTail': ['— wholesale food supply for Texas restaurants','— 面向德州餐飲店的食品批發供應'],
 'hero.subtitle': ['For Texas Restaurants · Product Selection · Wholesale Supply','服務德州餐飲店 · 選品採購 · 批發供應'],
 'home2.stmt.black': ['Restaurant Wholesale. Serving Texas.','餐飲批發，服務德州。'],
 'home2.stmt.grey': ['Products for your menu. Support for your next order.','從菜單選品，到下一次補貨。'],
 'home2.card1.title': ['Products for Your Menu','協助菜單選品'],
 'home2.card1.b1': ['Explore dumplings, gyoza, buns and dim sum','水餃、煎餃、包點與點心，多種品類可選'],
 'home2.card1.b2': ['Compare flavors and pack sizes for your kitchen','按餐廳需求比較口味與包裝規格'],
 'home2.card1.b3': ['Talk to our team about your purchasing needs','與銷售團隊溝通實際採購需求'],
 'home2.card2.title': ['Purchasing & Reordering','採購與補貨溝通'],
 'home2.card2.b1': ['Plan product combinations around your menu','依菜單需要組合採購產品'],
 'home2.card2.b2': ['Confirm quantities and packaging with sales','與銷售確認數量和包裝規格'],
 'home2.card2.b3': ['Request a quote for your planned order','按預計採購量獲取批發報價'],
 'home2.card2.b4': ['Discuss your next replenishment in advance','提前溝通下一次補貨安排'],
 'home2.card3.title': ['Delivery Coordination','配送安排諮詢'],
 'home2.card3.b1': ['Food supply for restaurant customers in Texas','面向德州餐飲客戶供貨'],
 'home2.card3.b2': ['Share your delivery location and order quantities','提供送貨地點及預計採購數量'],
 'home2.card3.b3': ['Confirm coverage, minimums and schedules with sales','具體配送區域、起訂量及安排請聯絡銷售確認'],
 'home2.types.title': ['Featured Products','主推產品'],
 'product.colorful.body': ['Five colors and five fillings, with 30 g pieces. An option for appetizer plates and set menus.','五色造型、五種餡料，每顆 30g，適合前菜拼盤與套餐搭配。'],
 'product.soup.body': ['Pork or chicken, 36 g each. A soup dumpling option for dine-in and takeout menus.','豬肉／雞肉口味，每顆 36g，適合堂食及外賣菜單選品。'],
 'product.gyoza.name': ['Fully-Cooked Gyoza','全熟煎餃'],
 'product.gyoza.body': ['Four flavors. 2 lb per bag, 10 bags per case. Fully cooked; follow the product packaging for heating instructions.','四種口味，2 lb／袋，10 袋／箱。全熟產品，加熱方法請依產品包裝指引。'],
 'home2.serve.title': ['Who We Serve','我們服務誰'],
 'about.hero.body': ['We serve restaurant operators in Texas, helping kitchens choose products, coordinate purchases and discuss replenishment and delivery.','我們服務德州餐飲店，協助後廚選品、組合採購，並溝通補貨與配送安排。'],
 'home2.mission.title': ['Our Supply Background','合作供應背景'],
 'home2.mission.sub': ['Production expertise. Purchasing support.','生產端供貨，銷售端服務。'],
 'about.mission.body': ['Our products are sourced from a partner food manufacturer. We focus on product selection, wholesale quotations and order coordination for restaurant customers. The production facilities shown belong to our supplier.','產品由合作食品工廠供應。我們專注為餐飲客戶提供選品、批發報價與訂購溝通服務；圖示生產設施屬於合作供應工廠。'],
 'closing.title': ['For Every Menu We Supply.','為每一份菜單，提供採購支持。'],
 'closing.body': ['Tell us what your restaurant needs. Contact our team for wholesale pricing and delivery arrangements in Texas.','告訴我們餐廳的採購需求，洽詢批發報價與德州配送安排。'],
 'closing.cta': ['Get Wholesale Pricing','獲取批發報價'],
 'products.hero.body': ['Compare our full product range, flavors, pack sizes and case counts. Contact sales to confirm your product selection, quantities and wholesale pricing.','查看完整產品、口味、包裝規格與箱裝數量，並聯絡銷售確認選品、數量及批發報價。'],
 'wholesale.hero.body': ['Product selection, purchasing and delivery coordination for Texas restaurants. Tell us what your kitchen needs.','為德州餐飲店提供選品、採購及配送溝通服務。歡迎告訴我們後廚的實際需求。'],
 'wholesale.offers.title': ['Products & Purchasing','產品與採購'],
 'wholesale.offers.sub': ['Menu selection · Wholesale pricing · Delivery coordination','菜單選品 · 批發報價 · 配送溝通'],
 'wholesale.offers.o1.title': ['Soup Dumplings','灌湯小籠包'],
 'wholesale.offers.o1.stat': ['36 g','36g'],
 'wholesale.offers.o1.body': ['Pork and chicken options. Contact sales with your quantities for a wholesale quotation.','豬肉與雞肉口味，請提供採購數量，向銷售團隊洽詢批發報價。'],
 'wholesale.offers.o2.title': ['5-Color Gyoza','五彩鍋貼'],
 'wholesale.offers.o2.stat': ['5 Colors','五色造型'],
 'wholesale.offers.o2.body': ['Beef, pork, chicken, shrimp and vegetable fillings. Compare flavors and specifications in the product catalog.','牛肉、豬肉、雞肉、鮮蝦與素菜餡料，完整口味與規格請見產品目錄。'],
 'wholesale.offers.o3.title': ['Texas Delivery','德州配送'],
 'wholesale.offers.o3.body': ['Serving restaurant customers in Texas. Contact sales to confirm delivery coverage, order minimums and arrangements.','面向德州餐飲客戶供貨，具體配送區域、起訂量及安排請聯絡銷售確認。'],
 'wholesale.offers.trust.1': ['Product selection','選品溝通'],
 'wholesale.offers.trust.2': ['Wholesale quotations','批發報價'],
 'wholesale.offers.trust.3': ['Delivery coordination','配送安排'],
 'wholesale.offers.trust.4': ['Reordering support','補貨溝通'],
 'wholesale.terms.t1.value': ['Texas: confirm coverage and schedules with sales','德州：具體覆蓋區域與時間請洽銷售'],
 'wholesale.terms.t2.value': ['Contact sales with your products and quantities','請提供產品與數量，向銷售確認起訂條件'],
 'wholesale.terms.t4.value': ['See Products for the complete range, pack sizes and case counts','完整品類、包裝規格與箱裝數量請見產品頁'],
 'contact.hero.body': ['Tell us your products, quantities and delivery location. Our sales team will follow up on your purchasing needs.','請告訴我們所需產品、採購數量及送貨地點，銷售團隊將跟進您的採購需求。'],
 'contact.form.note': ['Preview only: submissions are simulated. No email or SMS is sent.','目前為預覽：表單僅模擬提交，不會發送郵件或簡訊。'],
 'contact.form.success': ['Simulation complete. No email or SMS was sent.','模擬提交完成，未發送郵件或簡訊。'],
 'contact.form.error': ['Unable to submit. Your entries have been kept.','無法提交，已保留您填寫的內容。'],
 'footer.brand.title': ['[BRAND NAME]','[銷售商品牌名稱]'],
 'footer.rights': ['© 2026 [BRAND NAME]. All rights reserved.','© 2026 [銷售商品牌名稱]。版權所有。'],
 'journey.cta': ['Get Wholesale Pricing','獲取批發報價'],
}
for k,(en,zh) in updates.items(): translations[k]={'en':en,'zh-Hant':zh}
# Only keep strings used by the retained components and their dynamic keys.
keep = set(re.findall(r"tr\('([^']+)'", '\n'.join(original('components/'+n+'.astro') for n in ['Header','Footer','HomeV2','ProductsPage','ContactPage','WholesalePage'])))
keep |= set(updates)
keep |= {k for k in translations if k.startswith(('wholesale.offers.o','wholesale.offers.trust.','wholesale.terms.'))}
translations = {k:v for k,v in translations.items() if k in keep and not re.search(r'weiming|wei ming|味鳴|味鸣|Maspeth|New York|紐約|50\+|60\+|30%|FDA|USDA|SQF',str(v),re.I)}
write(SRC/'i18n/ui.ts', '''import { site } from '../data/site';
export const languages = {en:'EN','zh-Hant':'繁體'} as const;
export type Locale = keyof typeof languages;
export const defaultLocale: Locale = 'en';
export const company = site;
export const t: Record<string, Record<Locale,string>> = '''+json.dumps(translations,ensure_ascii=False,indent=2)+''';
export function tr(key: string, locale: Locale): string {
  if (!t[key]) throw new Error(`Missing translation: ${key}`);
  return t[key][locale];
}
''')

# Retain original header; make the brand placeholder explicit and links accessible.
s=original('components/Header.astro').replace("import { tr, type Locale }", "import { tr, company, type Locale }")
s=s.replace('aria-label="Wei Ming USA Inc"','aria-label={company.legalName[locale]}').replace('/images/brand/weiming-icon.png','/assets/brand-placeholder.svg').replace('alt="Wei Ming"','alt={isZh ? "Logo 待補" : "Logo pending"}').replace('Wei Ming USA','{company.shortName[locale]}')
s=s.replace('class="fixed inset-x-0','class="dealer-header fixed inset-x-0').replace('class="pointer-events-auto inline-flex items-center absolute','class="language-switch pointer-events-auto inline-flex items-center absolute')
s=s.replace('href={item.href}', 'href={item.href} aria-current={isActive(item.match) ? "page" : undefined}')
s=s.replace('</script>', '''document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn?.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); } });
  menu?.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) setOpen(false); });
</script>''')
write(SRC/'components/Header.astro',s)

# Reorder existing sections, retaining the original markup, sizing and cards.
s=original('components/HomeV2.astro')
s=s[:s.index('<script>')]
front,body=s.split('---',2)[1:]
sections=re.findall(r'<section\b.*?</section>',body,re.S)
assert len(sections)==9,len(sections)
hero,about,statement,services,products,mission,serve,videos,closing=sections
hero=re.sub(r'<video\b.*?</video>', '<img src="/assets/gyoza-chopsticks-dark.jpg" alt={isZh ? "煎餃出餐展示" : "Pan-fried gyoza ready to serve"} class="hero-image absolute inset-0 w-full h-full object-cover" width="1672" height="941" fetchpriority="high" />',hero,flags=re.S)
hero=hero.replace('text-[9.8vw] sm:text-[8.5vw] lg:text-[6.6vw] whitespace-nowrap','text-[9.8vw] sm:text-[8.5vw] lg:text-[6.6vw]')
front=front.replace('/images/products/factory-collage.jpg','/assets/variety-freezer.jpg').replace('Wei Ming factory production collage','Product selection for restaurant kitchens')
services=services.replace('lg:whitespace-nowrap','')
mission=mission.replace('/images/factory/factory-qc-inspection.jpg','/assets/supplier-production.jpg')
s='---'+front+'---\n'+ '\n\n'.join([hero,products,statement,services,serve,mission,'<Journey locale={locale} />',closing])
write(SRC/'components/HomeV2.astro',s)

s=original('components/WholesalePage.astro')
s=re.sub(r'const brands = \[.*?\];','',s,flags=re.S)
s=s.split('<!-- Brand family')[0]
s=s.replace('/images/wholesale/offer-soup.jpg','/assets/soup-dumplings-white.jpg').replace('/images/wholesale/offer-colorful.jpg','/assets/colorful-raw-white.jpg').replace('/images/wholesale/offer-truck.jpg','/assets/delivery-placeholder.svg')
s=s.replace("'助力餐飲,生意更旺!' : 'Built to make your restaurant busier.'", "'選品、採購與補貨溝通。' : 'Product selection, purchasing and reordering.'")
write(SRC/'components/WholesalePage.astro',s)

s=original('components/CatalogSpec.astro')
s=re.sub(r"\s*badge: \{ zh: '市場獨家', en: 'Market Exclusive' \},",'',s)
s=s.replace('每週 2 次配送 · 起訂量與報價請聯絡銷售團隊，認證文件可隨樣品一併提供。','面向德州餐飲客戶供貨，具體配送區域、起訂量及安排請聯絡銷售確認。').replace('Twice-weekly delivery · Contact our sales team for minimums and pricing — certification documents available with samples.','Serving Texas restaurants. Contact sales to confirm delivery coverage, minimums and arrangements.')
s=s.replace('whitespace-nowrap','').replace('min-w-0 truncate','min-w-0').replace('flex items-baseline gap-3','flex flex-wrap items-baseline gap-x-3 gap-y-1').replace('// Single source for both locales; content口径 follows weiming-onepagers/I-back.html.','// Original product names, flavors and packaging retained in both languages.')
write(SRC/'components/CatalogSpec.astro',s)

s=original('components/ProductsPage.astro').replace('需要完整 PDF 目錄與報價?','需要批發報價與包裝資料？').replace('Need the full PDF catalog & pricing?','Need wholesale pricing & pack details?').replace('留下訊息,我們把最新報價單與包裝規格寄到你的信箱——一個工作日內回覆。','留下所需產品與數量，銷售團隊將跟進報價及包裝資料。').replace("Drop us a line — we'll email the latest pricing sheet and packaging specs within one business day.",'Tell us your products and quantities. Our team will follow up with pricing and packaging information.')
write(SRC/'components/ProductsPage.astro',s)

for name in ['Footer','ContactPage']:
 s=original(f'components/{name}.astro')
 s=re.sub(r'<!--.*?-->', '',s,flags=re.S)
 s=s.replace('data-cf-site="weiming"','data-contact-mode="mock"').replace('weimingfood.com footer','dealer-footer').replace('weimingfood.com/contact','dealer-contact')
 s=s.replace('FDA · USDA · SQF · Made in USA', '{isZh ? "服務德州餐飲店" : "Serving Texas Restaurants"}')
 s=s.replace('/images/brand/weiming-icon.png','/assets/brand-placeholder.svg').replace('alt="Wei Ming"','alt={isZh ? "Logo 待補" : "Logo pending"}')
 s=s.replace("'紐約 Maspeth 工廠' : 'Our Maspeth, NY Plant'", "'銷售聯絡資訊' : 'Sales Contact'")
 s=re.sub(r'<div class="mt-5 aspect-\[4/3\].*?</div>', '<div class="mt-5 border border-dashed border-black/20 p-8 text-brand-ink/50 text-sm">{isZh ? "公開地址及地圖待補" : "Public address and map to be added"}</div>',s,flags=re.S)
 # Do not render a duplicate hidden form on the contact page.
 if name=='Footer':
  s=s.replace('<div class:list={[\'lg:col-span-5', '{!hideForm && <div class:list={[\'lg:col-span-5',1)
  s=s.replace('</form>\n      </div>','</form>\n      </div>}',1)
 for field,limit in [('name',100),('company',200),('email',254),('phone',40),('message',5000)]:
  s=s.replace(f'name="{field}"',f'name="{field}" maxlength="{limit}"')
 s=s.replace('data-cf-form','data-cf-form method="post" action="/api/contact"')
 write(SRC/f'components/{name}.astro',s)

# Disable pending contact destinations, never create fake tel/mailto links.
for path in (SRC/'components').glob('*.astro'):
 if path.stem not in ['HomeV2','Header','Footer','ContactPage','ProductsPage','CatalogSpec','WholesalePage']: continue
 s=path.read_text(encoding='utf8')
 s=s.replace('href={telHref}', 'href={company.phone ? telHref : undefined} aria-disabled={!company.phone || undefined}')
 s=s.replace('href={`mailto:${company.email}`}', 'href={company.email ? `mailto:${company.email}` : undefined} aria-disabled={!company.email || undefined}')
 for field,en,zh in [('phone','Phone to be added','電話待補'),('email','Email to be added','電郵待補'),('address','Address to be added','地址待補'),('website','Domain to be added','網域待補'),('fax','Fax to be added','傳真待補')]:
  s=s.replace('{company.'+field+'}', '{company.'+field+' || (isZh ? "['+zh+']" : "['+en+']")}')
 s=s.replace('/images/products/yabba-gyoza-white.jpg','/assets/cooked-gyoza.jpg')
 s=s.replace('/images/products/','/assets/')
 s=re.sub(r'<!--.*?-->', '',s,flags=re.S)
 write(path,s)

# Only reviewed still images enter the public bundle. Original videos and labeled packaging stay in reference.
for source,target in {
 'colorful-raw-white.jpg':'colorful-raw-white.jpg','soup-dumplings-white.jpg':'soup-dumplings-white.jpg',
 'rice-balls-white.jpg':'rice-balls-white.jpg','yabba-gyoza-white.jpg':'cooked-gyoza.jpg',
 'gyoza-chopsticks-dark.jpg':'gyoza-chopsticks-dark.jpg','variety-freezer.jpg':'variety-freezer.jpg',
 'factory-qc-inspection.jpg':'supplier-production.jpg'
}.items(): shutil.copy2(ROOT/'reference/media'/source,ROOT/'public/assets'/target)

# Reuse the eight original route files with distributor titles and metadata.
for lang in ['en','zh-Hant']:
 for page,component in [('index','HomeV2'),('products','ProductsPage'),('wholesale','WholesalePage'),('contact','ContactPage')]:
  base='../' if lang=='en' else '../../'
  prefix='' if lang=='en' else '/zh-Hant'
  route=prefix+('/' if page=='index' else '/'+page+'/')
  title={'index':('Restaurant Supply in Texas','德州餐飲供應'),'products':('Products & Specifications','產品與規格'),'wholesale':('Wholesale & Delivery','批發與配送'),'contact':('Contact & Pricing','聯絡與報價')}[page][lang!='en']
  path=SRC/'pages'/('' if lang=='en' else 'zh-Hant')/(page+'.astro')
  write(path,f'''---
import BaseLayout from '{base}layouts/BaseLayout.astro';
import {component} from '{base}components/{component}.astro';
import {{ site }} from '{base}data/site';
const locale = '{lang}';
---
<BaseLayout locale={{locale}} title={{site.legalName[locale] + ' — {title}'}} currentPath="{route}">
  <{component} locale={{locale}} />
</BaseLayout>
''')
print('Adapted original Astro components and eight routes.')
