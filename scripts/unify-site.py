"""Apply the shared MacWatts design to exported pages without replacing content."""
from pathlib import Path
from copy import deepcopy
import os
from urllib.parse import urlsplit
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]


def unify():
    reference = BeautifulSoup((ROOT / 'index.html').read_text(encoding='utf-8'), 'html.parser')
    count = 0
    for path in sorted(ROOT.rglob('*.html')):
        if {'node_modules', 'assets', 'templates'} & set(path.relative_to(ROOT).parts):
            continue
        soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
        if soup.select_one('.site-header'):
            continue
        prefix = os.path.relpath(ROOT, path.parent).replace('\\', '/') + '/'

        def shared(selector):
            tag = deepcopy(reference.select_one(selector))
            for element in [tag] + tag.select('[href], [src]'):
                for attr in ('href', 'src'):
                    value = element.get(attr)
                    if value and not urlsplit(value).scheme and not value.startswith('//'):
                        element[attr] = value if value == '#conteudo' else prefix + ('index.html' + value if value.startswith('#') else value)
            return tag

        for tag in soup.select('header, footer, .skip-link, .audience-switcher'):
            tag.decompose()
        # Retain original content and interaction hooks; use a single main landmark.
        main = soup.find('main')
        if main is None:
            main = soup.new_tag('main')
            for tag in list(soup.body.children):
                if getattr(tag, 'name', None) not in ('script', 'style'):
                    main.append(tag.extract())
            soup.body.insert(0, main)
        main['id'] = 'conteudo'
        main['class'] = main.get('class', []) + ['unified-content']
        soup.body['class'] = soup.body.get('class', []) + ['unified-page']
        heading = main.select_one('h1, h2, .page-title')
        title = heading.get_text(' ', strip=True) if heading else soup.title.get_text().split(' – ')[0]
        if heading:
            section = heading.find_parent(class_='e-parent')
            if section and section.get_text(' ', strip=True) == title and not section.select_one('img'):
                section.decompose()
            else:
                heading.decompose()
        for heading in main.select('h1'):
            heading.name = 'h2'
        # Empty opening spacers were used behind the old header.
        for section in list(main.select('.e-parent')):
            if not section.get_text(strip=True) and not section.select_one('img, iframe, video, form, a'):
                section.decompose()
        hero = soup.new_tag('section', attrs={'class': 'page-intro'})
        wrap = soup.new_tag('div', attrs={'class': 'wrap'})
        eyebrow = soup.new_tag('p', attrs={'class': 'eyebrow light'})
        eyebrow.string = 'MacWatts / ' + ('Empresarial' if 'empresarial' in path.parts else 'Energia e sustentabilidade')
        h1 = soup.new_tag('h1')
        h1.string = title
        wrap.extend([eyebrow, h1])
        hero.append(wrap)
        main.insert(0, hero)
        for image in main.select('img'):
            if image.get('width') == '512' and image.get('height') == '512':
                image['class'] = image.get('class', []) + ['content-icon']
        if path.parent.name in ('politica-de-privacidade', 'termos-e-condicoes'):
            main['class'].append('legal-content')
        soup.body.insert(0, shared('.site-header'))
        skip = soup.new_tag('a', href='#conteudo', attrs={'class': 'skip-link'})
        skip.string = 'Saltar para o conteúdo'
        soup.body.insert(0, skip)
        soup.body.append(shared('.site-footer'))
        for asset in ('assets/3a65094ad2-manrope.css', 'css/home.css?v=2', 'css/business-navigation.css?v=3', 'css/site-pages.css'):
            for existing in soup.select('link[href]'):
                if existing['href'].split('?')[0].endswith(asset.split('?')[0]):
                    existing.decompose()
            soup.head.append(soup.new_tag('link', rel='stylesheet', href=prefix + asset))
        if not soup.select_one('script[src$="home.js"]'):
            soup.body.append(soup.new_tag('script', src=prefix + 'js/home.js', defer=True))
        path.write_text(str(soup), encoding='utf-8')
        count += 1
    print(f'Updated {count} pages.')


if __name__ == '__main__':
    unify()
