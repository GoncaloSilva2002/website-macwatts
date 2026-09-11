# -*- coding: utf-8 -*-
"""Build the residential audit page with the shared solar-page design."""
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
soup = BeautifulSoup((ROOT / 'residencial/paineis-solares-bateria.html').read_text(encoding='utf-8'), 'html.parser')
soup.title.string = 'Auditoria e certificação energética | MacWatts Residencial'
soup.select_one('meta[name="description"]')['content'] = 'Conheça o desempenho energético da sua habitação com a auditoria e certificação energética MacWatts, desde o diagnóstico à implementação de melhorias.'
soup.main.replace_with(BeautifulSoup('''
<main id="conteudo">
  <section class="solar-hero">
    <img src="../assets/9170d7193c-team-work-environment-project-scaled.jpg" alt="Equipa técnica a analisar um projeto" fetchpriority="high"/>
    <div class="wrap"><p class="eyebrow">Residencial / Auditoria e certificação</p><h1>Conheça a sua casa.<br/><span>Melhore a sua energia.</span></h1><p class="solar-lead">Pretende avaliar a eficiência energética da sua habitação? Com uma auditoria efetuada por técnicos especializados, conheça o seu desempenho e as medidas que o podem melhorar.</p><div class="solar-actions"><a class="button" href="contactos.html">Pedir uma proposta</a><a class="text-link" href="#vantagens">Conhecer as vantagens ↓</a></div></div>
  </section>
  <section class="section" id="vantagens"><div class="wrap">
    <div class="section-heading"><div><p class="eyebrow">Decidir com informação</p><h2>Um diagnóstico claro.<br/>Melhores escolhas para casa.</h2></div><p>Da análise dos consumos à identificação de melhorias, conheça as vantagens da auditoria e certificação energética.</p></div>
    <div class="solar-ranges">
      <article class="service-card"><p class="eyebrow">01 / Diagnóstico</p><h3>Saiba onde consome energia.</h3><p>Uma análise detalhada aos consumos e às características da habitação ajuda a compreender o seu comportamento energético.</p></article>
      <article class="service-card"><p class="eyebrow">02 / Redução de consumos</p><h3>Identifique o que pode melhorar.</h3><p>Conheça medidas e metas para reduzir o consumo e alcançar uma melhor classificação energética.</p></article>
      <article class="service-card"><p class="eyebrow">03 / Incentivos</p><h3>Conheça as condições aplicáveis.</h3><p>O certificado energético pode ser relevante para o acesso a incentivos. A elegibilidade e os benefícios dependem das regras de cada medida e do município.</p></article>
    </div>
  </div></section>
  <section class="section solar-included"><div class="wrap feature-grid">
    <div class="feature-copy"><p class="eyebrow">Auditoria e certificação</p><h2>O desempenho da casa.<br/>Com uma avaliação técnica.</h2><p>A auditoria e a emissão do certificado energético permitem compreender o comportamento energético da sua habitação e caracterizar os seus elementos construtivos.</p><p>Com esta informação, poderá conhecer as medidas que permitem aumentar o desempenho energético e valorizar a sua casa.</p><a class="text-link" href="contactos.html">Fale com a nossa equipa ↗</a></div>
    <div class="feature-visual"><img src="../assets/9170d7193c-team-work-environment-project-scaled.jpg" alt="Análise técnica de um projeto em equipa" loading="lazy"/></div>
  </div></section>
  <section class="section"><div class="wrap feature-grid">
    <div class="feature-visual"><img src="../assets/297c093ea5-bombas-calor.jpg" alt="Habitação com soluções de eficiência energética" width="1024" height="559" loading="lazy"/></div>
    <div class="feature-copy"><p class="eyebrow">Da avaliação à melhoria</p><h2>Conhecer é o início.<br/>Melhorar é o próximo passo.</h2><p>A equipa técnica da MacWatts acompanha todo o processo, desde a avaliação e certificação até à implementação de soluções para reduzir o consumo energético.</p><p>As medidas são definidas em função das características e necessidades da sua habitação.</p><a class="text-link" href="index.html#solucoes">Conhecer as soluções residenciais ↗</a></div>
  </div></section>
  <section class="contact-banner"><div class="wrap contact-inner"><div><p class="eyebrow">Vamos falar?</p><h2>Uma casa mais eficiente<br/>começa com um diagnóstico.</h2><p>Peça uma proposta de auditoria e certificação energética para a sua habitação.</p></div><a class="button button-dark" href="contactos.html">Pedir uma proposta <span aria-hidden="true">↗</span></a></div></section>
</main>
''', 'html.parser').main)
for link in soup.select('a[href]'):
    if 'autditoria.html' in link['href'] or link['href'] == '../auditoria-e-certificacao-energetica/index.html':
        link['href'] = 'autditoria.html'
        link['aria-current'] = 'page'
    if link.get_text(strip=True) == 'Pedir proposta':
        link['href'] = 'contactos.html'
# Retain the existing URL used throughout the residential navigation.
import runpy
runpy.run_path(str(ROOT / 'scripts/audit-financing-icons.py'))['add_icons'](soup, 'audit')
(ROOT / 'residencial/autditoria.html').write_text(str(soup), encoding='utf-8')
