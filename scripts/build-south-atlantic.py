"""Build the South Atlantic project page with the shared header and footer."""
from pathlib import Path
from bs4 import BeautifulSoup

root = Path(__file__).resolve().parent.parent
soup = BeautifulSoup((root / 'templates/home.html').read_text(encoding='utf-8'), 'html.parser')
soup.title.string = 'South Atlantic — Projeto fotovoltaico em Peniche | MacWatts'
soup.select_one('meta[name=description]')['content'] = 'Conheça o projeto fotovoltaico South Atlantic, em Peniche: 269 kWp de potência instalada. Fotografias e indicadores do projeto MacWatts.'
soup.body['class'] = 'project-page'
for a in soup.select('#main-nav a'):
    if a['href'].startswith('#'):
        a['href'] = 'index.html' + a['href']
main = soup.main
main.clear()
main.append(BeautifulSoup('''
<section class="project-intro"><div class="wrap"><nav class="breadcrumbs" aria-label="Localização"><a href="index.html">Início</a><span aria-hidden="true">/</span><a href="index.html#projetos">Projetos</a><span aria-hidden="true">/</span><span aria-current="page">South Atlantic</span></nav><div class="project-title-row"><div><p class="eyebrow">Energia solar · Projeto executado</p><h1>South Atlantic</h1></div><p class="location"><span aria-hidden="true">↗</span> Peniche, Portugal</p></div><p class="project-lead">Uma nova perspetiva sobre a energia.<br>Um projeto fotovoltaico à escala da atividade empresarial.</p></div></section>
<figure class="project-cover wrap"><img src="assets/cbd3f9886d-dji_fly_20241211_151712_156_1733930266746_photo_optimized.jpg" alt="Vista aérea dos painéis solares nas coberturas da South Atlantic em Peniche" width="4000" height="2250" fetchpriority="high"><figcaption><span>South Atlantic / Peniche</span><span>Energia solar fotovoltaica</span></figcaption></figure>
<section class="project-numbers section"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">O projeto em números</p><h2>Energia que se traduz<br>em resultados.</h2></div><a class="text-link" href="empresarial/energia/fotovoltaico/index.html">Conhecer a solução fotovoltaica <span aria-hidden="true">↗</span></a></div><dl class="project-metrics"><div><dt>Potência instalada</dt><dd>269 <span>kWp</span></dd></div><div><dt>Produção de energia</dt><dd>371 <span>MWh</span></dd></div><div><dt>CO₂ equivalente evitado</dt><dd>175 <span>tCO₂e</span></dd></div><div><dt>Equivalência em árvores</dt><dd>4 488 <span>árvores</span></dd></div></dl></div></section>
<section id="galeria" class="section project-gallery"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">Um olhar mais próximo</p><h2>O projeto, de todos os ângulos.</h2></div><p>Explore as fotografias da instalação.<br>Selecione uma imagem para ampliar.</p></div><div class="gallery-grid">
<button class="gallery-item gallery-wide" data-gallery-image="assets/70e5371506-dji_fly_20241211_151836_161_1733930432724_photo_optimized.jpg" aria-label="Ampliar fotografia 1: vista geral da instalação"><img src="assets/70e5371506-dji_fly_20241211_151836_161_1733930432724_photo_optimized.jpg" alt="Vista geral da instalação fotovoltaica South Atlantic" loading="lazy" width="4000" height="2250"><span>01 / Vista geral <b aria-hidden="true">↗</b></span></button>
<button class="gallery-item" data-gallery-image="assets/11c3ea9d0c-dji_fly_20241211_150936_147_1733930070647_photo_optimized.jpg" aria-label="Ampliar fotografia 2: painéis nas coberturas"><img src="assets/11c3ea9d0c-dji_fly_20241211_150936_147_1733930070647_photo_optimized.jpg" alt="Painéis fotovoltaicos nas coberturas da South Atlantic" loading="lazy" width="4000" height="2250"><span>02 / A instalação <b aria-hidden="true">↗</b></span></button>
<button class="gallery-item" data-gallery-image="assets/e2d4235cda-dji_fly_20241211_151754_158_1733930424225_photo_optimized.jpg" aria-label="Ampliar fotografia 3: perspetiva aérea"><img src="assets/e2d4235cda-dji_fly_20241211_151754_158_1733930424225_photo_optimized.jpg" alt="Outra perspetiva aérea do projeto South Atlantic" loading="lazy" width="4000" height="2250"><span>03 / Outra perspetiva <b aria-hidden="true">↗</b></span></button>
</div></div></section>
<section class="section more-projects"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">Mais energia em ação</p><h2>Conheça outros projetos.</h2></div><a class="text-link" href="index.html#projetos">Voltar aos projetos <span aria-hidden="true">↗</span></a></div><div class="related-grid"><a class="project-card" href="batherafarm/index.html"><div class="project-image"><img src="assets/6f78979f49-BATHERAFARM-2.jpg" alt="Instalação solar Batherafarm" loading="lazy" width="4000" height="2250"></div><div class="project-info"><div><p>Energia solar</p><h3>Batherafarm</h3></div><span class="round-arrow" aria-hidden="true">↗</span></div></a><a class="project-card" href="primor/index.html"><div class="project-image"><img src="assets/b587e230b1-PXL_20240924_162108483.MP_.jpg" alt="Carregador elétrico no projeto Primor" loading="lazy" width="2268" height="4032"></div><div class="project-info"><div><p>Mobilidade elétrica</p><h3>Primor</h3></div><span class="round-arrow" aria-hidden="true">↗</span></div></a></div></div></section>
<section class="contact-banner"><div class="wrap contact-inner"><div><p class="eyebrow">O próximo projeto pode ser o seu</p><h2>Que energia imagina<br>para a sua empresa?</h2><p>Fale connosco sobre os seus objetivos.</p></div><a class="button button-dark" href="contactos/index.html">Vamos falar do seu projeto <span aria-hidden="true">↗</span></a></div></section>
''', 'html.parser'))
soup.head.append(soup.new_tag('link', rel='stylesheet', href='css/project.css'))
soup.head.append(soup.new_tag('script', src='js/project.js', defer=True))
for node in soup.select('[href], [src], [data-gallery-image]'):
    for attr in ('href', 'src', 'data-gallery-image'):
        val = node.get(attr, '')
        if val and not val.startswith(('#', 'https:', 'http:', 'mailto:', 'tel:')):
            node[attr] = '../' + val
html = str(soup)
(root / 'south-atlantic/index.html').write_text(html, encoding='utf-8')
(root / 'templates/south-atlantic.html').write_text(html, encoding='utf-8')
