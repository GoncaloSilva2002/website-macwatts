"""Central catalogue and navigation for all existing business services.
Run after exporting or rebuilding a landing page to refresh shared navigation.
"""
from pathlib import Path
from bs4 import BeautifulSoup
import os
import json

ROOT = Path(__file__).resolve().parent.parent
GROUPS = [
    ('energia', 'Energia', 'Produzir, armazenar e consumir energia com mais eficiência e menos dependência da rede.', [
        ('fotovoltaico', 'Fotovoltaico', 'Autoconsumo dimensionado para o seu perfil de consumo, com garantia de produção.'),
        ('armazenamento', 'Armazenamento', 'Baterias para aproveitar o excedente solar e proteger equipamentos críticos.'),
        ('monitorizacao-e-gestao-de-energia', 'Monitorização e gestão de energia', 'Consumos, produção e alarmes de vários edifícios numa só plataforma.'),
        ('mobilidade-eletrica', 'Mobilidade elétrica', 'Postos de carregamento para frota e clientes, com gestão na plataforma MEC.'),
        ('compensacao-de-energia-reativa', 'Compensação de energia reativa', 'Baterias de condensadores para eliminar os custos de energia reativa.'),
        ('iluminacao', 'Iluminação', 'Iluminação de elevado rendimento, dimensionada para os requisitos de cada espaço.'),
        ('bombas-de-calor', 'Bombas de calor', 'Eletrifique consumos térmicos e reduza a dependência do gás natural.'),
    ]),
    ('consultoria', 'Consultoria', 'Diagnóstico técnico e independente para decidir com base em dados.', [
        ('projeto', 'Projeto', 'Projeto de execução integrado, com um único interlocutor para todas as especialidades.'),
        ('auditoria-e-certificacao-energetica', 'Auditoria e certificação energética', 'Auditorias energéticas, SGCIE e certificação, com plano de racionalização de consumos.'),
        ('auditoria-tecnica', 'Auditoria técnica', 'Inspeção da infraestrutura elétrica e serviço de técnico responsável (TRIESP).'),
        ('contratacao-e-venda-de-energia', 'Contratação e venda de energia', 'Escolha independente do tarifário e valorização do excedente fotovoltaico.'),
    ]),
    ('operacoes-e-manutencao', 'Operações e manutenção', 'Desempenho, segurança e continuidade ao longo da vida da instalação.', [
        ('instalacoes-fotovoltaicas', 'Instalações fotovoltaicas', 'Manutenção preventiva e corretiva, com acompanhamento do Performance Ratio.'),
        ('gestao-integrada-da-manutencao', 'Gestão integrada da manutenção', 'Planeamento preventivo e resposta a anomalias em 24/48 h na infraestrutura elétrica.'),
    ]),
    ('financiamento', 'Financiamento', 'Modelos sem investimento inicial ou com financiamento, ajustados ao seu projeto.', [
        ('', 'Soluções de financiamento', 'Modelos ESCO pagos pelas poupanças geradas ou financiamento do projeto.'),
    ]),
]

def rel(destination, output):
    path, _, fragment = destination.partition('#')
    return os.path.relpath(ROOT / path, output.parent).replace('\\', '/') + ('#' + fragment if fragment else '')

def service_path(group, slug):
    return f'empresarial/{group}/' + (slug + '/' if slug else '') + 'index.html'

def menu(output):
    columns = ''
    for group, title, description, services in GROUPS:
        links = ''.join(f'<a href="{rel(service_path(group, slug), output)}">{name}</a>' for slug, name, _ in services)
        columns += f'<div class="business-menu-column"><h2>{title}</h2>{links}</div>'
    return BeautifulSoup('<details class="business-menu"><summary>Soluções <span aria-hidden="true">⌄</span></summary>'
        f'<div class="business-menu-panel"><div class="business-menu-intro"><span>Soluções empresariais</span><a href="{rel("empresarial/index.html", output)}">Ver todas as soluções ↗</a></div>'
        f'<div class="business-menu-columns">{columns}</div></div></details>', 'html.parser')

def enhance(path, output=None):
    output = output or path
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    nav = soup.select_one('#main-nav')
    if nav:
        old = nav.select_one('.business-menu')
        if old:
            old.decompose()
        else:
            first = nav.find('a')
            if first and first.get_text(strip=True) == 'Soluções':
                first.decompose()
        nav.insert(0, menu(output))
    if not soup.select_one('link[data-business-navigation]'):
        soup.head.append(soup.new_tag('link', rel='stylesheet', href=rel('css/business-navigation.css', output) + '?v=3', **{'data-business-navigation': 'true'}))
    section = soup.select_one('.solutions .section-heading')
    if section and not section.select_one('.all-solutions-link'):
        section.append(BeautifulSoup(f'<a class="text-link all-solutions-link" href="{rel("empresarial/index.html", output)}">Todas as soluções <span aria-hidden="true">↗</span></a>', 'html.parser'))
    path.write_text(str(soup), encoding='utf-8')

enhance(ROOT / 'index.html')
enhance(ROOT / 'templates/home.html', ROOT / 'index.html')
for file in ['south-atlantic/index.html', 'templates/south-atlantic.html']:
    if (ROOT / file).exists():
        enhance(ROOT / file, ROOT / 'south-atlantic/index.html')

# Use the same visual identity for the complete service directory.
output = ROOT / 'empresarial/index.html'
soup = BeautifulSoup((ROOT / 'templates/home.html').read_text(encoding='utf-8'), 'html.parser')
soup.title.string = 'Todas as soluções empresariais | MacWatts'
soup.select_one('meta[name=description]')['content'] = 'Explore todas as soluções MacWatts para empresas: energia, consultoria, operações e manutenção e financiamento.'
soup.body['class'] = 'business-home business-directory'
soup.main.clear()
tabs = ''.join(f'<a href="#{group}">{title} <span>↓</span></a>' for group, title, _, _ in GROUPS)
sections = ''
for index, (group, title, description, services) in enumerate(GROUPS, 1):
    cards = ''.join(f'<a class="directory-card" href="{service_path(group, slug)}"><h3>{name}</h3><p>{desc}</p><span>Conhecer a solução <b aria-hidden="true">↗</b></span></a>' for slug, name, desc in services)
    sections += f'<section id="{group}" class="directory-group"><div class="wrap"><div class="directory-group-heading"><div><p class="eyebrow">0{index} / Área de atuação</p><h2>{title}</h2></div><p>{description}</p></div><div class="directory-grid">{cards}</div></div></section>'
soup.main.append(BeautifulSoup(f'<section class="directory-intro"><div class="wrap"><a class="directory-back" href="index.html">← Página inicial</a><p class="eyebrow">Soluções empresariais</p><h1>Soluções de energia<br>para a indústria.</h1><p>Da produção de energia à manutenção e ao financiamento, um único parceiro para reduzir custos, garantir a continuidade da operação e cumprir as obrigações energéticas.</p><nav class="directory-tabs" aria-label="Áreas de soluções">{tabs}</nav></div></section>{sections}<section class="contact-banner"><div class="wrap contact-inner"><div><p class="eyebrow">Ajudamos a encontrar o caminho</p><h2>Não sabe por onde começar?</h2><p>Envie-nos as faturas ou o diagrama de cargas. Indicamos as soluções com maior impacto na sua operação.</p></div><a class="button button-dark" href="contactos/index.html">Falar com a equipa ↗</a></div></section>', 'html.parser'))
for a in soup.select('#main-nav > a'):
    if a['href'].startswith('#'):
        a['href'] = 'index.html' + a['href']
for node in soup.select('[href], [src]'):
    for attr in ['href', 'src']:
        value = node.get(attr, '')
        if value and not value.startswith(('#', 'http:', 'https:', 'mailto:', 'tel:')):
            node[attr] = '../' + value
output.write_text(str(soup), encoding='utf-8')
(ROOT / 'templates/empresarial.html').write_text(str(soup), encoding='utf-8')

# Existing detail pages retain their content and gain a consistent route back.
for group, title, _, services in GROUPS:
    paths = {f'empresarial/{group}/index.html': title}
    paths.update({service_path(group, slug): name for slug, name, _ in services})
    for file, name in paths.items():
        page = ROOT / file
        html = BeautifulSoup(page.read_text(encoding='utf-8'), 'html.parser')
        old = html.select_one('.business-wayfinding')
        if old:
            old.decompose()
        header = html.select_one('[data-elementor-type="header"]')
        if not header:
            continue
        crumb = BeautifulSoup(f'<nav class="business-wayfinding" aria-label="Navegação de serviços"><div><a href="{rel("index.html", page)}">Empresarial</a><span aria-hidden="true">/</span><a href="{rel("empresarial/index.html#" + group, page)}">{title}</a><span aria-hidden="true">/</span><span aria-current="page">{name}</span><a class="all-business-services" href="{rel("empresarial/index.html", page)}">Todas as soluções ↗</a></div></nav>', 'html.parser')
        # Place in the content after its opening banner to preserve overlay headers.
        content = html.select_one('[data-elementor-type="wp-page"], [data-elementor-type="single-page"]')
        if content and content.find(recursive=False):
            content.find(recursive=False).insert_after(crumb)
        else:
            header.insert_after(crumb)
        if not html.select_one('link[data-business-navigation]'):
            html.head.append(html.new_tag('link', rel='stylesheet', href=rel('css/business-navigation.css', page) + '?v=3', **{'data-business-navigation': 'true'}))
        page.write_text(str(html), encoding='utf-8')
report_path = ROOT / 'clone-report.json'
if report_path.exists():
    report = json.loads(report_path.read_text(encoding='utf-8'))
    if 'empresarial/index.html' not in report['pages']:
        report['pages'].append('empresarial/index.html')
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print('Business navigation updated: 4 areas, 14 services, 17 existing pages and a new directory.')
