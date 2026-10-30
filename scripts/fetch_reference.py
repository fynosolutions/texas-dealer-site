from pathlib import Path
from urllib.request import urlopen, Request
from concurrent.futures import ThreadPoolExecutor
import json
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://www.weimingfood.com'
routes = ['', 'products/', 'wholesale/', 'contact/', 'zh-Hant/', 'zh-Hant/products/', 'zh-Hant/wholesale/', 'zh-Hant/contact/']
def get(pair):
    url, path = pair
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read())
    return path.name
with ThreadPoolExecutor(max_workers=6) as pool:
    print(list(pool.map(get, [(BASE+'/'+r, ROOT/'reference'/((r.strip('/').replace('/', '-') or 'home')+'.html')) for r in routes])))
soup = BeautifulSoup((ROOT/'reference/home.html').read_text(encoding='utf-8'), 'html.parser')
css = soup.select_one('link[href*="/_astro/"][rel="stylesheet"]')['href']
get((BASE+css, ROOT/'public/assets/original.css'))
paths = sorted({i['src'] for f in (ROOT/'reference').glob('*.html') for i in BeautifulSoup(f.read_text(encoding='utf-8'), 'html.parser').select('img[src]') if '/products/' in i['src'] or '/factory/' in i['src']})
manifest = [{'source': BASE+p, 'local': 'reference/media/'+Path(p).name, 'status': 'pending visual inspection'} for p in paths]
with ThreadPoolExecutor(max_workers=6) as pool:
    print(list(pool.map(get, [(m['source'], ROOT/m['local']) for m in manifest])))
(ROOT/'reference/media-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
