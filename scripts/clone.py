"""Export the public MacWatts pages and their assets as a static website.

Run: python scripts/clone.py (requires beautifulsoup4).
"""
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
from bs4 import BeautifulSoup
import hashlib
import json
import os
import re

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://staging.macwatts.pt/'
HOSTS = {'staging.macwatts.pt', 'macwatts.pt', 'www.macwatts.pt'}
assets = {}
pages = {}
errors = []

def fetch(url):
    with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60) as response:
        return response.read()

def page_url(url):
    p = urlsplit(urljoin(BASE, url))
    if p.netloc not in HOSTS or p.query or '/wp-' in p.path:
        return None
    if Path(p.path).suffix:
        return None
    return BASE.rstrip('/') + (p.path.rstrip('/') + '/' if p.path.rstrip('/') else '/')

def page_path(url):
    return ROOT / urlsplit(url).path.strip('/') / 'index.html'

def relative(path, parent):
    return os.path.relpath(path, parent).replace('\\', '/')

def asset_path(url):
    clean = unquote(urlsplit(url).path)
    name = re.sub(r'[^a-zA-Z0-9._-]', '-', Path(clean).name) or 'asset'
    if 'fonts.googleapis.com' in url:
        name = 'manrope.css'
    return ROOT / 'assets' / (hashlib.sha256(url.encode()).hexdigest()[:10] + '-' + name)

def register(url, base=BASE):
    url = urljoin(base, url)
    if not url.startswith(('https://', 'http://')):
        return None
    if url not in assets:
        assets[url] = asset_path(url)
    return assets[url]

def css_urls(css, base, parent):
    def replace(match):
        url = match.group(1).strip(' \"\'')
        if url.startswith(('data:', '#')):
            return match.group(0)
        path = register(url, base)
        return 'url("' + relative(path, parent) + '")' if path else match.group(0)
    return re.sub(r'url\(([^)]+)\)', replace, css)

def get_page(url):
    try:
        return url, fetch(url).decode('utf-8')
    except Exception as exc:
        errors.append({'url': url, 'error': str(exc)})
        return url, None

pending = {BASE}
seen = set()
while pending:
    batch = sorted(pending - seen)
    if not batch:
        break
    seen.update(batch)
    pending = set()
    with ThreadPoolExecutor(max_workers=8) as pool:
        for url, html in pool.map(get_page, batch):
            if not html:
                continue
            soup = BeautifulSoup(html, 'html.parser')
            pages[url] = soup
            for anchor in soup.select('a[href]'):
                link = page_url(urljoin(url, anchor['href']))
                if link and link not in seen:
                    pending.add(link)
    print('Pages:', len(pages), 'pending:', len(pending), flush=True)

for url, soup in pages.items():
    output = page_path(url)
    parent = output.parent
    for tag in soup.select('script, link[rel="alternate"], link[rel="profile"], link[rel="EditURI"], link[rel="shortlink"], link[rel="https://api.w.org/"], meta[name="generator"]'):
        tag.decompose()
    for tag in soup.select('link[href]'):
        if 'stylesheet' in tag.get('rel', []) or 'icon' in ' '.join(tag.get('rel', [])):
            path = register(tag['href'], url)
            if path:
                tag['href'] = relative(path, parent)
    for tag in soup.select('[src], [poster]'):
        if tag.name == 'iframe':
            tag['loading'] = 'lazy'
            continue
        for attr in ('src', 'poster'):
            if tag.get(attr):
                path = register(tag[attr], url)
                if path:
                    tag[attr] = relative(path, parent)
    for tag in soup.select('[srcset]'):
        choices = []
        for item in tag['srcset'].split(','):
            parts = item.strip().split()
            if parts:
                path = register(parts[0], url)
                if path:
                    choices.append(' '.join([relative(path, parent)] + parts[1:]))
        tag['srcset'] = ', '.join(choices)
    for tag in soup.select('style'):
        tag.string = css_urls(tag.get_text(), url, parent)
    for tag in soup.select('[style]'):
        tag['style'] = css_urls(tag['style'], url, parent)
    for tag in soup.select('a[href]'):
        original = urljoin(url, tag['href'])
        if re.search(r'\.(jpg|jpeg|png|webp|pdf)$', urlsplit(original).path, re.I):
            path = register(original)
            if path:
                tag['href'] = relative(path, parent)
        dest = page_url(original)
        if dest in pages:
            tag['href'] = relative(page_path(dest), parent) + ('#' + urlsplit(original).fragment if urlsplit(original).fragment else '')
        if tag.get('target') == '_blank':
            tag['rel'] = 'noopener noreferrer'
        label = tag.get_text(' ', strip=True)
        if 'geral@macwatts.pt' in label:
            tag['href'] = 'mailto:geral@macwatts.pt'
        elif '927 855 924' in label:
            tag['href'] = 'tel:+351927855924'
    for form in soup.select('form'):
        form['action'] = '#'
        form['data-static-form'] = 'true'
    for tag in soup.select('.elementor-counter-number'):
        tag.string = tag.get('data-to-value', tag.get_text())
    for tag in soup.select('img'):
        if not tag.get('alt') and 'logo' in tag.get('src', ''):
            tag['alt'] = 'MacWatts'
    for tag in soup.select('[data-settings]'):
        # Preserve layout settings, but eliminate remote asset references from builder metadata.
        del tag['data-settings']
    css = soup.new_tag('link', rel='stylesheet', href=relative(ROOT / 'css/style.css', parent))
    soup.head.append(css)
    js = soup.new_tag('script', src=relative(ROOT / 'js/main.js', parent), defer=True)
    soup.body.append(js)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(str(soup), encoding='utf-8')

completed = set()
while set(assets) - completed:
    batch = sorted(set(assets) - completed)
    completed.update(batch)
    def save_asset(url):
        path = assets[url]
        try:
            if path.exists() and path.suffix != '.css':
                data = path.read_bytes()
            else:
                data = fetch(url)
            return url, path, data
        except Exception as exc:
            errors.append({'url': url, 'error': str(exc)})
            return url, path, None
    with ThreadPoolExecutor(max_workers=10) as pool:
        for url, path, data in pool.map(save_asset, batch):
            if data is None:
                continue
            if path.suffix == '.css':
                data = css_urls(data.decode('utf-8'), url, path.parent).encode('utf-8')
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
    print('Assets:', len(completed), 'pending:', len(set(assets) - completed), flush=True)

if (ROOT / 'templates/home.html').exists():
    (ROOT / 'index.html').write_text((ROOT / 'templates/home.html').read_text(encoding='utf-8'), encoding='utf-8')
if (ROOT / 'templates/residential.html').exists():
    (ROOT / 'residencial/index.html').write_text((ROOT / 'templates/residential.html').read_text(encoding='utf-8'), encoding='utf-8')
if (ROOT / 'templates/south-atlantic.html').exists():
    (ROOT / 'south-atlantic/index.html').write_text((ROOT / 'templates/south-atlantic.html').read_text(encoding='utf-8'), encoding='utf-8')
(ROOT / 'clone-report.json').write_text(json.dumps({'source': BASE, 'pages': [relative(page_path(u), ROOT) for u in pages], 'assets': len(assets), 'errors': errors}, ensure_ascii=False, indent=2), encoding='utf-8')
import subprocess
import sys
if (ROOT / 'scripts/build-business-navigation.py').exists():
    subprocess.run([sys.executable, str(ROOT / 'scripts/build-business-navigation.py')], check=True)
print('Done:', len(pages), 'pages;', len(assets), 'assets;', len(errors), 'errors', flush=True)
