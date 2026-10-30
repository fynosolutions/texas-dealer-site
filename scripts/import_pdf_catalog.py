"""Transcribed and visually checked against pages 3-4 of the supplied PDF.
Only product names, pack specifications and case counts are imported. No prices.
"""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
groups=[]
def group(id,en,zh,page,rows):
    groups.append(dict(id=id,en=en,zh=zh,sourcePage=page,items=[dict(id=f'{id}-{i+1}',en=r[0],zh=r[1],pack=r[2],caseCount=r[3]) for i,r in enumerate(rows)]))
g='30 g/piece · 2 lb/bag · 10 bags/case'
group('five-color','5-Color Gyoza','五彩鍋貼',3,[
 ('Beef & Celery · Purple','西芹牛肉 · 紫',g,'300'),
 ('Pork & Napa · White','白菜豬肉 · 白',g,'300'),
 ('Chicken & Corn · Yellow','玉米雞肉 · 黃',g,'300'),
 ('Shrimp & Water Chestnut · Pink','鮮蝦馬蹄 · 粉',g,'300'),
 ('Vegetable · Green','素菜 · 綠',g,'300')])
g='21 g/piece · 2 lb/bag · 8 bags/case'
group('cooked-gyoza','Fully Cooked Gyoza','全熟煎餃',3,[
 ('Vegetable','素菜煎餃',g,'Approx. 346'),('Beef & Vegetable','牛肉蔬菜煎餃',g,'Approx. 346'),
 ('Chicken & Cabbage','雞肉包菜煎餃',g,'Approx. 346'),('Pork & Napa','豬肉白菜煎餃',g,'Approx. 346')])
g='17 g/piece · 8 oz/bag · 40 bags/case'
group('popcorn-wonton','Popcorn Wonton','爆米花炸雲吞',3,[('Beef & Cheese','牛肉芝士',g,'534'),('Chicken & Cabbage','雞肉白菜',g,'534')])
group('mini-dumplings','Mini Dumplings','精緻小水餃',3,[('Mini Dumplings','精緻小水餃','17 g/piece · 1 lb/bag · 20 bags/case','534')])
group('raw-dumplings','Raw Dumplings','餐館水餃（生）',3,[
 ('Pork & Vegetable','豬肉','38 g/piece · 25 pieces/bag · 8 bags/case','200'),
 ('Chicken & Vegetable','雞肉','38 g/piece · 25 pieces/bag · 8 bags/case','200'),
 ('Mushroom & Mixed Vegetable','冬菇素菜','36 g/piece · 25 pieces/bag · 8 bags/case','200')])
g='36 g/piece · 30 pieces/bag · 10 bags/case'
group('soup-dumplings','Soup Dumplings','灌湯小籠包',3,[('Pork','豬肉灌湯',g,'300'),('Chicken','雞肉灌湯',g,'300')])
group('cooked-wonton','Cooked Wonton (Not Fried)','熟雲吞（未炸）',3,[('Ready to Reheat','復熱即食','56 pieces/bag · 10 bags/case','560')])
g='200 g/bag · 30 bags/case'
group('rice-balls','Glutinous Rice Balls','湯圓',3,[
 ('Millet · Black Sesame','大黃米黑芝麻',g,'300'),('Millet · Peanut','大黃米花生',g,'300'),
 ('Rainbow','彩虹',g,'600'),('Peanut','花生',g,'300'),('Bean Paste','豆沙',g,'300'),('Black Sesame','黑芝麻',g,'300'),
 ('Fried Rice Balls','炸不爆 · 油炸湯圓','300 g/bag · 30 bags/case','300')])
g='90 g × 6 pieces/bag · 10 bags/case'
group('buns','Buns','饅頭',4,[('Traditional Steamed Bun','北方傳統饅頭',g,'60'),('Wheat Bran Bun','全麥養生饅頭',g,'60'),('Milk Bun','牛奶饅頭',g,'60'),('Brown Sugar Bun','紅糖饅頭',g,'60')])
g='80 g × 6 pieces/bag · 18 bags/case'
group('blossom-buns','Blossom Buns','開花饅頭',4,[('Pumpkin','南瓜開花饅頭',g,'108'),('Purple Sweet Potato','紫薯開花饅頭',g,'108')])
group('dim-sum','Dim Sum · Cruller · Noodles','點心 · 油條 · 麵食',4,[
 ('Sticky Rice with Chicken & Mushrooms','菌菇糯米雞','100 g × 6 pieces/bag · 24 bags/case','144'),
 ('Scallion Pancake','蔥香小油餅','120 g × 4 pieces/bag · 12 bags/case','48'),
 ('Chinese Cruller · Small','中式油條（小）','50 g × 6 pieces/bag · 14 bags/case','84'),
 ('Chinese Cruller · Large','中式油條（大）','100 g × 3 pieces/bag · 14 bags/case','42'),
 ('Udon Noodles','烏冬麵','200 g × 3 packs/bag · 20 bags/case','60')])
group('spring-rolls','Spring Rolls','春卷系列',4,[
 ('Vegetable Spring Roll','什錦素菜春卷','25 g × 20 pieces/bag · 20 bags/case','400'),
 ('Vegetable Spring Roll · Large','什錦素菜春卷 L','42.6 g × 10 pieces/bag · 20 bags/case','200'),
 ('Pre-Fried Vegetable Spring Roll','預炸什錦素菜春卷','25 g × 20 pieces/bag · 20 bags/case','400'),
 ('Pre-Fried Flat Vegetable Spring Roll','預炸素三鮮扁春卷','40 g × 8 pieces/bag · 40 bags/case','320')])
g='100 g × 12 pieces/bag · 8 bags/case'
group('mala-cake','Mala Cake','馬拉糕',4,[('Brown Sugar','紅糖馬拉糕',g,'96'),('Pumpkin','南瓜馬拉糕',g,'96')])
assert sum(len(g['items']) for g in groups)==42
(root/'src/data/products.json').write_text(json.dumps(groups,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Imported 42 product rows in 13 categories, without prices.')
