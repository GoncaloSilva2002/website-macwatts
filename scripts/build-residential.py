"""Build the residential landing page using the shared visual system."""
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
soup = BeautifulSoup((ROOT / 'templates/home.html').read_text(encoding='utf-8'), 'html.parser')
def content(selector, html):
    node = soup.select_one(selector)
    node.clear()
    node.append(BeautifulSoup(html, 'html.parser'))

soup.title.string = 'MacWatts — Uma nova energia para a sua casa'
soup.select_one('meta[name=description]')['content'] = 'Painéis solares, baterias, bombas de calor e carregadores elétricos para a sua casa. Conheça as soluções residenciais da MacWatts.'
soup.body['class'] = 'residential'
content('.audience-inner nav', '<a href="index.html">Empresarial ↗</a><a href="residencial/index.html" class="selected" aria-current="page">Residencial</a>')
content('.audience-inner > span', 'Mais conforto. Mais eficiência. A sua casa, com outra energia.')
content('#main-nav', '<a href="#solucoes">Soluções</a><a href="#solar">Solar e baterias</a><a href="#mobilidade">Mobilidade</a><a href="#duvidas">Dúvidas</a><a href="contactos/index.html">Contactos</a><a class="button button-small" href="contactos/index.html">Pedir proposta <span aria-hidden="true">↗</span></a>')
soup.select_one('.brand')['href'] = 'residencial/index.html'
soup.select_one('.brand')['aria-label'] = 'MacWatts — Residencial'
for logo in soup.select('.brand img, .footer-brand img'):
    logo['src'] = 'assets/cd34105af2-logo-white-w-macwhatts.png'
    logo['width'] = '194'
    logo['height'] = '110'
soup.select_one('.hero-image')['src'] = 'assets/99407cc5f5-yamu_jay-ai-generated-9109553-scaled.jpg'
soup.select_one('.hero-image')['alt'] = 'Família em frente a uma casa com painéis solares'
if soup.select_one('.hero .eyebrow'):
    soup.select_one('.hero .eyebrow').decompose()
content('h1', 'A sua casa.<br>A sua energia.<br><span>Um novo futuro.</span>')
content('.hero-description', 'Aproveite o sol, guarde energia e torne a sua casa mais eficiente. Soluções pensadas para o seu dia a dia, com acompanhamento da nossa equipa.')
content('.hero-actions', '<a class="button" href="contactos/index.html">Encontre a solução para a sua casa <span aria-hidden="true">↗</span></a><a class="text-link light-link" href="#solucoes">Conhecer as soluções <span aria-hidden="true">↓</span></a>')
content('.hero-bottom > span', 'Solar · Baterias · Conforto · Mobilidade')
content('.results', '<div class="wrap home-benefits"><div><span>01</span><strong>Produza em casa</strong><p>Aproveite a energia do sol.</p></div><div><span>02</span><strong>Guarde para depois</strong><p>Mais controlo com armazenamento.</p></div><div><span>03</span><strong>Carregue à sua porta</strong><p>Energia para as suas deslocações.</p></div></div>')
content('.solutions .section-heading h2', 'Uma casa mais eficiente.<br>À sua medida.')
content('.solutions .section-heading > p', 'Da produção de eletricidade ao conforto da sua casa, conheça as soluções que podem fazer parte do seu dia a dia.')
cards = [
('01 / Solar e baterias', 'O sol no telhado.<br>A energia em sua casa.', 'Produza eletricidade e combine painéis solares com baterias para aproveitar melhor a energia.', 'paineis-solares-e-baterias/index.html'),
('02 / Bombas de calor', 'Mais conforto.<br>Maior eficiência.', 'Conheça as soluções de bombas de calor e encontre a opção adequada às necessidades da sua habitação.', 'bombas-de-calor/index.html'),
('03 / Mobilidade elétrica', 'Chegue a casa.<br>Ligue ao futuro.', 'Carregadores para o seu veículo elétrico, com gestão de carga e monitorização.', 'carregadores-para-veiculos-eletricos/index.html'),
('04 / Consultoria', 'Conheça a sua casa.<br>Melhore a sua energia.', 'Auditoria e certificação energética para conhecer o desempenho da sua habitação.', 'auditoria-e-certificacao-energetica/index.html')]
for node, (label, heading, description, href) in zip(soup.select('.service-card'), cards):
    node['href'] = href
    node.select_one('.service-number').string = label
    node.h3.clear()
    node.h3.append(BeautifulSoup(heading, 'html.parser'))
    node.p.string = description
content('.service-card:nth-child(2) svg', '<path d="M5 22 24 5l19 17M10 18v25h28V18M17 25h14v12H17zM20 29h8m-8 4h8"/>')
content('.service-extra', '<span>Quer avaliar as opções para a sua casa?</span><a class="text-link" href="financiamento/index.html">Conhecer o financiamento ↗</a><a class="text-link" href="contratacao-e-venda-de-energia/index.html">Contratação e venda de energia ↗</a>')
solar = '''<section id="solar" class="section residential-feature"><div class="wrap feature-grid"><div class="feature-visual"><img src="assets/23a77d47d6-WhatsApp-Image-2026-06-08-at-12.46.31.jpeg" alt="Solução de energia solar residencial" loading="lazy"><span class="feature-caption">Solar + armazenamento</span></div><div class="feature-copy"><p class="eyebrow">Uma energia mais sua</p><h2>O sol produz.<br>A sua casa aproveita.</h2><p>Uma solução fotovoltaica começa por conhecer os seus consumos. A produção e o armazenamento são dimensionados para as necessidades da sua habitação.</p><ul class="feature-list"><li>Painéis solares e soluções com inversor híbrido.</li><li>Armazenamento para utilizar energia noutros momentos.</li><li>Monitorização para acompanhar a sua instalação.</li></ul><a class="button" href="paineis-solares-e-baterias/index.html">Conhecer o kit solar <span aria-hidden="true">↗</span></a><a class="text-link simulator-link" href="https://main.d1ewoiy1pgag7s.amplifyapp.com/" target="_blank" rel="noopener noreferrer">Simular a minha solução <span aria-hidden="true">↗</span><span class="external-note">Abre o simulador externo</span></a></div></div></section>
<section id="mobilidade" class="section residential-mobility"><div class="wrap feature-grid"><div class="feature-copy"><p class="eyebrow">Pronto para o dia seguinte</p><h2>O seu carregador.<br>No melhor lugar: casa.</h2><p>Ganhe a comodidade de carregar o seu veículo onde vive, com uma solução adaptada à instalação elétrica da sua habitação.</p><ul class="feature-list"><li>Gama de carregadores dos 7,4 kW aos 22 kW.</li><li>Gestão dinâmica de carga em função do consumo da casa.</li><li>Aplicação para monitorizar e gerir o carregamento.</li></ul><a class="text-link" href="carregadores-para-veiculos-eletricos/index.html">Explorar carregadores <span aria-hidden="true">↗</span></a></div><div class="feature-visual"><img src="assets/34df7626b5-person-taking-care-electric-car-scaled.jpg" alt="Carregamento de um veículo elétrico" loading="lazy"><span class="feature-caption">Mobilidade elétrica em casa</span></div></div></section>'''
soup.select_one('.projects').replace_with(BeautifulSoup(solar, 'html.parser'))
brands = [
    ('LONGi', 'f389b43927-LONGi-logo-new.png'),
    ('JA Solar', 'b8a46d42c9-new-logos-ja-solar.png'),
    ('Jinko Solar', 'f3903fff88-4929f869da28c2f656cdb0503dbef12f.png'),
    ('Trina Solar', 'cb6137b26d-Trina_-_logo.png'),
    ('Huawei', 'd97a4dee7d-Huawei-Logo.png'),
    ('Fox ESS', '422c69c370-logo-new.png'),
    ('Tesla', 'a80a5d7a45-Tesla_logo.png'),
]
brand_items = ''.join(f'<li><img src="assets/{filename}" alt="{name}" loading="lazy"></li>' for name, filename in brands)
soup.select_one('#solar').append(BeautifulSoup(
    '<div class="wrap solar-brands"><div class="brands-heading"><p class="eyebrow">Tecnologia que faz parte das nossas soluções</p>'
    '<h3>As marcas com que trabalhamos.</h3></div>'
    f'<ul class="brand-grid" aria-label="Marcas de equipamentos solares e armazenamento">{brand_items}</ul></div>',
    'html.parser'))
faq = '''<section id="duvidas" class="section residential-faq"><div class="wrap faq-grid"><div><p class="eyebrow">Antes de dar o próximo passo</p><h2>As suas dúvidas.<br>Respostas claras.</h2><p>Cada casa é diferente. A nossa equipa ajuda a avaliar o seu caso.</p><a class="text-link" href="contactos/index.html">Falar com a equipa ↗</a></div><div class="faq-items"><details><summary>Qual é a solução solar indicada para a minha casa?</summary><p>Depende do seu consumo, dos horários em que utiliza eletricidade e das condições do espaço disponível. Podemos avaliar essas necessidades e apresentar uma proposta dimensionada para a sua habitação.</p></details><details><summary>Preciso de instalar uma bateria?</summary><p>Uma bateria permite guardar energia para utilização posterior. A sua adequação depende do perfil de consumo e da produção prevista. A equipa pode ajudar a comparar as opções.</p></details><details><summary>Posso ter um carregador em casa?</summary><p>A instalação depende das condições do local e da instalação elétrica disponível. Fale com a nossa equipa para avaliar a potência e a solução adequadas ao seu veículo e à sua habitação.</p></details><details><summary>Existem soluções de financiamento?</summary><p>A MacWatts apresenta opções de financiamento para soluções residenciais. Consulte a <a href="financiamento/index.html">página de financiamento</a> ou peça informações à equipa sobre as condições aplicáveis.</p></details></div></div></section>'''
soup.select_one('.about').replace_with(BeautifulSoup(faq, 'html.parser'))
content('.news .section-heading h2', 'Novidades para uma<br>casa mais sustentável.')
news = [
('apoio-a-concretizacao-de-comunidades-de-energia-renovavel-e-autoconsumo-coletivo/index.html','7ab5977ef5-Screenshot-from-2026-06-09-12-15-45-1.png','Comunidades de energia renovável e autoconsumo coletivo'),
('programa-de-apoio-a-condominios-residenciais/index.html','21d838c928-Screenshot-from-2026-06-09-12-11-43-1.png','Programa de Apoio a Condomínios Residenciais')]
for node, (href, image, heading) in zip(soup.select('.news-card'), news):
    node['href'] = href
    node.img['src'] = 'assets/' + image
    node.img['alt'] = heading
    node.h3.string = heading
    node.select_one('.news-meta').clear()
    node.select_one('.news-meta').append(BeautifulSoup('Residencial <span>9 junho 2026</span>', 'html.parser'))
    node.select_one('.news-image')['class'] = 'news-image'
content('.contact-banner h2', 'Uma nova energia<br>começa à sua porta.')
content('.contact-banner p:not(.eyebrow)', 'Conte-nos como é a sua casa. Pensamos na solução consigo.')
for a in soup.select('.footer-grid a'):
    if a.get('href') == 'residencial/index.html':
        a['href'] = 'index.html'
        a.string = 'Soluções empresariais'
footer_links = soup.select('.footer-grid > div')[2]
footer_links.clear()
footer_links.append(BeautifulSoup('<h2>Para sua casa</h2><a href="paineis-solares-e-baterias/index.html">Solar e baterias</a><a href="bombas-de-calor/index.html">Bombas de calor</a><a href="carregadores-para-veiculos-eletricos/index.html">Carregadores elétricos</a><a href="financiamento/index.html">Financiamento</a>', 'html.parser'))
soup.head.append(soup.new_tag('link', rel='stylesheet', href='css/residential.css'))
# The landing page lives one directory below the website root.
for node in soup.select('[href], [src]'):
    for attr in ('href', 'src'):
        value = node.get(attr, '')
        if value and not value.startswith(('#','http:','https:','mailto:','tel:')):
            node[attr] = '../' + value
output = str(soup)
(ROOT / 'residencial/index.html').write_text(output, encoding='utf-8')
(ROOT / 'templates/residential.html').write_text(output, encoding='utf-8')
