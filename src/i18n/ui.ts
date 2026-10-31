import { site } from '../data/site';
export const languages = {en:'EN','zh-Hant':'繁體'} as const;
export type Locale = keyof typeof languages;
export const defaultLocale: Locale = 'en';
export const company = site;
export const t: Record<string, Record<Locale,string>> = {
  "nav.home": {
    "en": "Home",
    "zh-Hant": "首頁"
  },
  "nav.products": {
    "en": "Products",
    "zh-Hant": "產品系列"
  },
  "nav.wholesale": {
    "en": "Wholesale",
    "zh-Hant": "批發與配送"
  },
  "nav.contact": {
    "en": "Contact",
    "zh-Hant": "聯絡我們"
  },
  "nav.requestSamples": {
    "en": "Get Wholesale Pricing",
    "zh-Hant": "獲取批發報價"
  },
  "hero.title1": {
    "en": "Wholesale Asian Foods",
    "zh-Hant": "德州餐飲食品批發"
  },
  "hero.title2": {
    "en": "for Texas Restaurants",
    "zh-Hant": ""
  },
  "hero.titleItalic": {
    "en": "",
    "zh-Hant": ""
  },
  "hero.seoTail": {
    "en": "— wholesale food supply for Texas restaurants",
    "zh-Hant": "— 面向德州餐飲店的食品批發供應"
  },
  "hero.subtitle": {
    "en": "Dumplings, gyoza, buns and dim sum for your menu. Contact sales for product availability, wholesale pricing and delivery arrangements.",
    "zh-Hant": "水餃、煎餃、包點與點心，服務餐廳採購及補貨。聯絡銷售確認產品、批發報價與配送安排。"
  },
  "product.colorful.name": {
    "en": "5-Color Gyoza",
    "zh-Hant": "五彩鍋貼"
  },
  "product.colorful.body": {
    "en": "Five colors and five fillings, with 30 g pieces. An option for appetizer plates and set menus.",
    "zh-Hant": "五色造型、五種餡料，每顆 30g，適合前菜拼盤與套餐搭配。"
  },
  "product.soup.name": {
    "en": "Soup Dumplings",
    "zh-Hant": "灌湯小籠包"
  },
  "product.soup.body": {
    "en": "Pork or chicken, 36 g each. A soup dumpling option for dine-in and takeout menus.",
    "zh-Hant": "豬肉／雞肉口味，每顆 36g，適合堂食及外賣菜單選品。"
  },
  "product.gyoza.name": {
    "en": "Fully Cooked Gyoza",
    "zh-Hant": "全熟煎餃"
  },
  "product.gyoza.body": {
    "en": "Four flavors. 2 lb per bag, 8 bags per case. Fully cooked; follow the product packaging for heating instructions.",
    "zh-Hant": "四種口味，2 lb／袋，8 袋／箱。全熟產品，加熱方法請依產品包裝指引。"
  },
  "product.fried-rice-ball.name": {
    "en": "Fried Rice Balls",
    "zh-Hant": "炸不爆 · 油炸湯圓"
  },
  "product.fried-rice-ball.body": {
    "en": "Black sesame filled glutinous rice balls for dessert and snack menus. Follow the product packaging for preparation instructions.",
    "zh-Hant": "黑芝麻餡湯圓，適合甜品與小食菜單。製作方式請依產品包裝指引。"
  },
  "closing.title": {
    "en": "For Every Menu We Supply.",
    "zh-Hant": "為每一份菜單，提供採購支持。"
  },
  "closing.body": {
    "en": "Tell us what your restaurant needs. Contact our team for wholesale pricing and delivery arrangements in Texas.",
    "zh-Hant": "告訴我們餐廳的採購需求，洽詢批發報價與德州配送安排。"
  },
  "closing.cta": {
    "en": "Get Wholesale Pricing",
    "zh-Hant": "獲取批發報價"
  },
  "footer.brand.title": {
    "en": "YAYA DUMPLING WHOLESALE",
    "zh-Hant": "YAYA DUMPLING WHOLESALE"
  },
  "footer.rights": {
    "en": "© 2026 YAYA DUMPLING WHOLESALE. All rights reserved.",
    "zh-Hant": "© 2026 YAYA DUMPLING WHOLESALE。版權所有。"
  },
  "products.hero.title": {
    "en": "Full Catalog · Specs & Case Counts",
    "zh-Hant": "完整產品目錄 · 規格與箱裝"
  },
  "products.hero.body": {
    "en": "Compare our full product range, flavors, pack sizes and case counts. Contact sales to confirm your product selection, quantities and wholesale pricing.",
    "zh-Hant": "查看完整產品、口味、包裝規格與箱裝數量，並聯絡銷售確認選品、數量及批發報價。"
  },
  "wholesale.hero.title": {
    "en": "A Wholesale Program Built for Restaurants",
    "zh-Hant": "為餐館量身打造的批發合作"
  },
  "wholesale.hero.body": {
    "en": "Product selection, purchasing and delivery coordination for Texas restaurants. Tell us what your kitchen needs.",
    "zh-Hant": "為德州餐飲店提供選品、採購及配送溝通服務。歡迎告訴我們後廚的實際需求。"
  },
  "wholesale.offers.title": {
    "en": "Products & Purchasing",
    "zh-Hant": "產品與採購"
  },
  "wholesale.offers.sub": {
    "en": "Menu selection · Wholesale pricing · Delivery coordination",
    "zh-Hant": "菜單選品 · 批發報價 · 配送溝通"
  },
  "wholesale.offers.o1.stat": {
    "en": "",
    "zh-Hant": ""
  },
  "wholesale.offers.o1.title": {
    "en": "36g Soup Dumplings",
    "zh-Hant": "36g 灌湯小籠包"
  },
  "wholesale.offers.o1.body": {
    "en": "Available in pork and chicken. Share your expected order quantity and delivery location for wholesale pricing and delivery arrangements.",
    "zh-Hant": "提供豬肉與雞肉口味。告知我們預計採購數量及送貨地點，獲取批發報價與配送安排。"
  },
  "wholesale.offers.o2.stat": {
    "en": "",
    "zh-Hant": ""
  },
  "wholesale.offers.o2.title": {
    "en": "5-Color Gyoza · Five Colors, Five Fillings",
    "zh-Hant": "五彩鍋貼 · 五色五味"
  },
  "wholesale.offers.o2.body": {
    "en": "Five colors and five fillings, with 30 g pieces, for appetizer platters and set menus.",
    "zh-Hant": "五種顏色、五種餡料，每顆 30g，為前菜拼盤和套餐提供更多搭配選擇。"
  },
  "wholesale.offers.o3.stat": {
    "en": "Ask Sales",
    "zh-Hant": "洽詢銷售"
  },
  "wholesale.offers.o3.title": {
    "en": "Texas Delivery",
    "zh-Hant": "德州配送"
  },
  "wholesale.offers.o3.body": {
    "en": "Share your delivery city, ZIP Code, products and expected case quantities. Sales will confirm coverage, order minimums, delivery fees and estimated arrival.",
    "zh-Hant": "請提供送貨城市、ZIP Code、產品及預計箱數。銷售將確認配送範圍、起訂要求、配送費與預計到貨時間。"
  },
  "wholesale.offers.trust.1": {
    "en": "Product selection",
    "zh-Hant": "選品溝通"
  },
  "wholesale.offers.trust.2": {
    "en": "Wholesale quotations",
    "zh-Hant": "批發報價"
  },
  "wholesale.offers.trust.3": {
    "en": "Delivery coordination",
    "zh-Hant": "配送安排"
  },
  "wholesale.offers.trust.4": {
    "en": "Reordering support",
    "zh-Hant": "補貨溝通"
  },
  "wholesale.terms.title": {
    "en": "Purchasing & Delivery",
    "zh-Hant": "採購與配送須知"
  },
  "wholesale.terms.t1.label": {
    "en": "Delivery Coverage",
    "zh-Hant": "配送範圍"
  },
  "wholesale.terms.t1.value": {
    "en": "Provide your delivery city and ZIP Code so our team can confirm coverage.",
    "zh-Hant": "請提供送貨城市與 ZIP Code，由銷售確認是否可配送。"
  },
  "wholesale.terms.t2.label": {
    "en": "Order Minimums",
    "zh-Hant": "起訂要求"
  },
  "wholesale.terms.t2.value": {
    "en": "Share the products and expected case quantities you need. Sales will confirm minimums based on your product selection and delivery location.",
    "zh-Hant": "請提供所需產品與預計箱數。銷售將依產品組合及送貨地點確認起訂要求。"
  },
  "wholesale.terms.t3.label": {
    "en": "Quote & Delivery",
    "zh-Hant": "報價與配送"
  },
  "wholesale.terms.t3.value": {
    "en": "Delivery fees and estimated arrival are confirmed with your quote. Delivery is arranged after your order is confirmed.",
    "zh-Hant": "報價時一併確認配送費及預計到貨時間，訂單確認後安排配送。"
  },
  "wholesale.terms.t4.label": {
    "en": "Samples (Optional)",
    "zh-Hant": "試樣（可選）"
  },
  "wholesale.terms.t4.value": {
    "en": "Ask sales about sample products, quantities and any fees. If charges apply, we will explain them and obtain your agreement before arranging samples.",
    "zh-Hant": "可向銷售洽詢試樣品種、數量與相關費用。如有費用，將在安排前告知並取得您的確認。"
  },
  "contact.hero.title": {
    "en": "Let's Talk",
    "zh-Hant": "我們聊聊"
  },
  "contact.hero.body": {
    "en": "Tell us your products, quantities and delivery location. Our sales team will follow up on your purchasing needs.",
    "zh-Hant": "請告訴我們所需產品、採購數量及送貨地點，銷售團隊將跟進您的採購需求。"
  },
  "contact.form.name": {
    "en": "Name",
    "zh-Hant": "姓名"
  },
  "contact.form.company": {
    "en": "Company / Restaurant",
    "zh-Hant": "公司 / 餐廳"
  },
  "contact.form.email": {
    "en": "Email",
    "zh-Hant": "電郵"
  },
  "contact.form.phone": {
    "en": "Phone",
    "zh-Hant": "電話"
  },
  "contact.form.message": {
    "en": "Message",
    "zh-Hant": "訊息"
  },
  "contact.form.submit": {
    "en": "Send Request",
    "zh-Hant": "送出"
  },
  "contact.form.note": {
    "en": "Please include the products, quantities and delivery location you need. We will use your contact details to respond to your inquiry.",
    "zh-Hant": "請註明所需產品、數量及配送地點。我們將使用您提供的聯絡資料回覆詢盤。"
  },
  "contact.form.sending": {
    "en": "Sending…",
    "zh-Hant": "送出中…"
  },
  "contact.form.success": {
    "en": "Thank you. Your inquiry has been submitted for email delivery.",
    "zh-Hant": "謝謝，您的詢盤已提交至郵件服務。"
  },
  "contact.form.error": {
    "en": "Unable to submit. Your entries have been kept.",
    "zh-Hant": "無法提交，已保留您填寫的內容。"
  },
  "about.hero.body": {
    "en": "We serve restaurant operators in Texas, helping kitchens choose products, coordinate purchases and discuss replenishment and delivery.",
    "zh-Hant": "我們服務德州餐飲店，協助後廚選品、組合採購，並溝通補貨與配送安排。"
  },
  "about.mission.body": {
    "en": "Our products are sourced from a partner food manufacturer. We focus on product selection, wholesale quotations and order coordination for restaurant customers. The production facilities shown belong to our supplier.",
    "zh-Hant": "產品由合作食品工廠供應。我們專注為餐飲客戶提供選品、批發報價與訂購溝通服務；圖示生產設施屬於合作供應工廠。"
  },
  "home2.types.title": {
    "en": "Featured Products",
    "zh-Hant": "主推產品"
  },
  "home2.mission.title": {
    "en": "Our Supply Background",
    "zh-Hant": "合作供應背景"
  },
  "home2.mission.sub": {
    "en": "Production expertise. Purchasing support.",
    "zh-Hant": "生產端供貨，銷售端服務。"
  },
  "home2.footer.form.title": {
    "en": "Contact us",
    "zh-Hant": "聯絡我們"
  },
  "journey.cta": {
    "en": "Get Wholesale Pricing",
    "zh-Hant": "獲取批發報價"
  },
  "hero.catalog": {
    "en": "View Product Catalog",
    "zh-Hant": "查看產品目錄"
  }
};
export function tr(key: string, locale: Locale): string {
  if (!t[key]) throw new Error(`Missing translation: ${key}`);
  return t[key][locale];
}
