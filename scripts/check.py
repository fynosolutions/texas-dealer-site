from pathlib import Path
from bs4 import BeautifulSoup
import re, json
from urllib.parse import urlsplit, unquote
root=Path(__file__).resolve().parents[1]
dist=root/'dist'
pages=[page for page in dist.rglob('*.html') if page != dist/'404.html']
assert (dist/'404.html').exists(), 'Pages needs a 404 page to disable SPA fallback'
assert len(pages)==8
bad=re.compile(r'wei\s*ming|味鸣|味鳴|weiming|feast-contact|929.?607|Maspeth|5301 Grand|30%|US-Only|一個工作日|one business day|free samples|免費試樣|weekly delivery|每週配送|market.exclusive|全美唯一|市場獨家|vegetable.dyed|蔬菜染色|Restaurant-Ready',re.I)
for f in pages:
 text=f.read_text(encoding='utf8')
 assert not bad.search(text),(f,bad.search(text).group())
 soup=BeautifulSoup(text,'html.parser')
 assert len(soup.select('h1'))==1,f
 assert len(soup.select('form'))==1,f
 for el in soup.select('[src],link[href],a[href]'):
  target=el.get('src') or el.get('href')
  if target.startswith('/'):
   parsed=urlsplit(target)
   file=dist/unquote(parsed.path).lstrip('/')
   assert file.exists(),(f,target)
   if parsed.fragment:
    target_page=file/'index.html' if file.is_dir() else file
    target_soup=BeautifulSoup(target_page.read_text(encoding='utf8'),'html.parser')
    assert target_soup.find(id=unquote(parsed.fragment)),(f,target)
 assert not soup.select('iframe,video'),f
 if f.parent.name=='products':
  groups=json.loads((root/'src/data/products.json').read_text(encoding='utf8'))
  source=json.loads((root/'reference/catalog-specs.json').read_text(encoding='utf8'))
  items=[item for group in groups for item in group['items']]
  rows=soup.select('[data-product-id]')
  assert len(rows)==len(items)==len(source)==29
  for row,item,original in zip(rows,items,source):
   assert row['data-product-id']==item['id']
   assert row.select_one('[data-pack]')['aria-label']==item['pack']
   assert row.select_one('[data-case-count]')['aria-label']=='Case quantity: '+item['caseCount']
   assert re.findall(r'\d+(?:\.\d+)?',row.select_one('[data-pack]').get_text())==re.findall(r'\d+(?:\.\d+)?',item['pack'])
   assert re.findall(r'\d+',row.select_one('[data-case-count]').get_text())==re.findall(r'\d+',item['caseCount'])
   assert re.findall(r'\d+(?:\.\d+)?',item['pack'])==re.findall(r'\d+(?:\.\d+)?',original['pack']),item['id']
   assert item['caseCount']==original['caseCount'],item['id']
  catalog=soup.select_one('[data-product-catalog]').get_text(' ',strip=True)
  assert not re.search(r'\$|USD|unit price|case price|整箱價|單價',catalog,re.I)
  assert len(soup.select('main h3'))==9
print('PASS: 8 routes, 29 PDF product rows, 9 categories, pack/count match, no catalog prices, assets and forms.')
