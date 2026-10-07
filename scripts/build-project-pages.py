from pathlib import Path
import subprocess

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
PROJECTS = [
    'primor', 'batherafarm', 'bombeiros-voluntarios-de-moncao', 'ert',
    'medlog-alcochete', 'misericordia-nossa-senhora-dos-milagres',
    'prazer-do-pao', 'premium-for-leather', 'ribeiros', 'air-olesa'
]

METRICS = {
    'air-olesa': ('Évora', ('80', '116', '55', '1 411')),
    'batherafarm': ('Santo Isidro de Pegões', ('1000', '1682', '791', '20 283')),
    'bombeiros-voluntarios-de-moncao': ('Monção', ('36', '48', '23', '590')),
    'ert': ('São João da Madeira', ('312', '258', '122', '3 129')),
    'medlog-alcochete': ('Alcochete', ('138', '206', '97', '2 488')),
    'misericordia-nossa-senhora-dos-milagres': ('Oliveira de Frades', ('185', '259', '122', '3 129')),
    'prazer-do-pao': ('Barcelos', ('33', '43', '21', '539')),
    'premium-for-leather': ('Castelo de Paiva', ('48', '64', '31', '795')),
    'primor': ('V.N. Famalicão', ('15', '', '', '')),
    'ribeiros': ('Montijo', ('236', '362', '171', '4 385')),
}

METRIC_LABELS = (
    ('Potência instalada', 'kWp'),
    ('Produção de energia', 'MWh'),
    ('CO₂ equivalente evitado', 'tCO₂e'),
    ('Equivalência em árvores', 'árvores'),
)

PROJECT_CATEGORIES = {'primor': 'Mobilidade elétrica'}


def text_or_empty(node):
    return node.get_text(' ', strip=True) if node else ''


def unique_project_images(soup):
    metric_icons = {
        '0ea446d493-local.png',
        '5f31c1d361-energia-solar.png',
        'ebb8d0b31b-energia-verde.png',
        '7d63b7e63b-co2.png',
        '5f499e0cef-arvore.png',
        '8a0e05efe8-estacao-para-carregar.png',
    }
    images = []
    candidates = soup.select('.project-cover img[src], .project-gallery img[src]') or soup.select('main img[src]')
    for image in candidates:
        src = image.get('src', '')
        if src and 'logo' not in src.lower() and Path(src).name not in metric_icons and src not in images:
            images.append(src)
    return images


for name in PROJECTS:
    path = ROOT / name / 'index.html'
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    soup.body['class'] = ['business-home', 'project-page']
    for logo in soup.select('.site-header .brand img, .site-footer .footer-brand img'):
        logo['src'] = '../assets/cd34105af2-logo-white-w-macwhatts.png'
    original_html = subprocess.run(
        ['git', 'show', f'HEAD:{name}/index.html'],
        cwd=ROOT, check=True, capture_output=True,
    ).stdout.decode('utf-8', errors='replace')
    original_soup = BeautifulSoup(original_html, 'html.parser')
    title = text_or_empty(soup.select_one('.project-intro h1') or soup.select_one('.page-intro h1'))
    images = unique_project_images(original_soup)
    if not title or not images:
        continue

    location, values = METRICS[name]
    category = PROJECT_CATEGORIES.get(name, 'Energia solar')
    solution_href = '../empresarial/energia/mobilidade-eletrica/index.html' if name == 'primor' else '../empresarial/energia/fotovoltaico/index.html'
    solution_label = 'Conhecer a solução de mobilidade elétrica' if name == 'primor' else 'Conhecer a solução fotovoltaica'

    main = soup.new_tag('main', id='conteudo', attrs={'class': ['project-page']})
    main.append(BeautifulSoup(f'''
        <section class="project-intro"><div class="wrap">
          <nav class="breadcrumbs" aria-label="Localização"><a href="../index.html">Início</a><span aria-hidden="true">/</span><a href="../index.html#projetos">Projetos</a><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>
          <div class="project-title-row"><div><p class="eyebrow">{category} · Projeto executado</p><h1>{title}</h1></div><p class="location"><span aria-hidden="true">↗</span> {location}, Portugal</p></div>
          <p class="project-lead">Uma solução à medida.<br/>Energia pensada para gerar resultados.</p>
        </div></section>
    ''', 'html.parser'))

    cover = images[0]
    main.append(BeautifulSoup(f'''
        <figure class="project-cover wrap"><img src="{cover}" alt="Projeto {title}" fetchpriority="high"><figcaption><span>{title} / {location}</span><span>{category}</span></figcaption></figure>
    ''', 'html.parser'))

    metric_markup = ''.join(
        f'<div><dt>{label}</dt><dd>{value or "—"} <span>{unit}</span></dd></div>'
        for (label, unit), value in zip(METRIC_LABELS, values)
    )
    main.append(BeautifulSoup(f'''
        <section class="project-numbers section"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">O projeto em números</p><h2>Energia que se traduz<br/>em resultados.</h2></div><a class="text-link" href="{solution_href}">{solution_label} <span aria-hidden="true">↗</span></a></div><dl class="project-metrics">{metric_markup}</dl></div></section>
    ''', 'html.parser'))

    gallery = ''.join(
        f'<button class="gallery-item {"gallery-wide" if index == 0 else ""}" data-gallery-image="{src}" aria-label="Ampliar fotografia {index + 1} do projeto {title}"><img src="{src}" alt="Projeto {title}" loading="lazy"><span>{index + 1:02d} / Projeto <b aria-hidden="true">↗</b></span></button>'
        for index, src in enumerate(images[:6])
    )
    main.append(BeautifulSoup(f'''
        <section class="section project-gallery" id="galeria"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">Um olhar mais próximo</p><h2>O projeto, de todos os ângulos.</h2></div><p>Explore as fotografias do projeto.<br/>Selecione uma imagem para ampliar.</p></div><div class="gallery-grid">{gallery}</div></div></section>
    ''', 'html.parser'))

    related = []
    for candidate in PROJECTS:
        if candidate == name:
            continue
        candidate_soup = BeautifulSoup((ROOT / candidate / 'index.html').read_text(encoding='utf-8'), 'html.parser')
        candidate_title = text_or_empty(candidate_soup.select_one('.project-intro h1'))
        candidate_image = candidate_soup.select_one('.project-cover img')
        if candidate_title and candidate_image:
            related.append((candidate, candidate_title, candidate_image.get('src', '')))
        if len(related) == 2:
            break
    related_markup = ''.join(
        f'<a class="project-card" href="../{candidate}/index.html"><div class="project-image"><img alt="Projeto {candidate_title}" loading="lazy" src="{candidate_image}"></div><div class="project-info"><div><p>{PROJECT_CATEGORIES.get(candidate, "Energia solar")}</p><h3>{candidate_title}</h3></div><span aria-hidden="true" class="round-arrow">↗</span></div></a>'
        for candidate, candidate_title, candidate_image in related
    )
    main.append(BeautifulSoup(f'''
        <section class="section more-projects"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">Mais energia em ação</p><h2>Conheça outros projetos.</h2></div><a class="text-link" href="../index.html#projetos">Voltar aos projetos <span aria-hidden="true">↗</span></a></div><div class="related-grid">{related_markup}</div></div></section>
    ''', 'html.parser'))
    main.append(BeautifulSoup('''
        <section class="contact-banner"><div class="wrap contact-inner"><div><p class="eyebrow">O próximo projeto pode ser o seu</p><h2>Que energia imagina<br/>para a sua empresa?</h2><p>Fale connosco sobre os seus objetivos.</p></div><a class="button button-dark" href="../contactos/index.html">Vamos falar do seu projeto <span aria-hidden="true">↗</span></a></div></section>
    ''', 'html.parser'))

    old = soup.select_one('main')
    old.replace_with(main)
    if not soup.select_one('link[href*="project.css"]'):
        soup.head.append(soup.new_tag('link', rel='stylesheet', href='../css/project.css'))
    if not soup.select_one('script[src*="project.js"]'):
        soup.body.append(soup.new_tag('script', src='../js/project.js', defer=True))
    path.write_text(str(soup), encoding='utf-8')


# South Atlantic is the reference project page; keep its content intact while
# making its header use exactly the same shell as the business homepage.
south_path = ROOT / 'south-atlantic/index.html'
south = BeautifulSoup(south_path.read_text(encoding='utf-8'), 'html.parser')
south.body['class'] = ['business-home', 'project-page']
for logo in south.select('.site-header .brand img, .site-footer .footer-brand img'):
    logo['src'] = '../assets/cd34105af2-logo-white-w-macwhatts.png'
south_path.write_text(str(south), encoding='utf-8')
