# -*- coding: utf-8 -*-
"""Build the residential financing page using the shared solar-page design."""
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
soup = BeautifulSoup((ROOT / 'residencial/paineis-solares-bateria.html').read_text(encoding='utf-8'), 'html.parser')
soup.title.string = 'Financiamento | MacWatts Residencial'
soup.select_one('meta[name="description"]')['content'] = 'Conheça as soluções de financiamento MacWatts para projetos de eficiência energética e fale com a nossa equipa sobre as opções para a sua habitação.'
soup.main.replace_with(BeautifulSoup('''
<main id="conteudo">
  <section class="solar-hero">
    <img src="../assets/297c093ea5-bombas-calor.jpg" alt="Habitação com soluções de eficiência energética" width="1024" height="559" fetchpriority="high"/>
    <div class="wrap">
      <p class="eyebrow">Residencial / Financiamento</p>
      <h1>Mais eficiência em casa.<br/><span>Um projeto ao seu alcance.</span></h1>
      <p class="solar-lead">Conheça as soluções de financiamento MacWatts para projetos de eficiência energética. Fale com a nossa equipa sobre o investimento e as opções adequadas à sua habitação.</p>
      <div class="solar-actions"><a class="button" href="contactos.html">Pedir uma proposta</a><a class="text-link" href="#solucoes">Conhecer as soluções ↓</a></div>
    </div>
  </section>
  <section class="section" id="solucoes"><div class="wrap">
    <div class="section-heading"><div><p class="eyebrow">Investir na eficiência</p><h2>A energia da sua casa.<br/>Com um plano para avançar.</h2></div><p>Explore algumas das soluções de energia e fale connosco sobre as possibilidades de financiamento do seu projeto.</p></div>
    <div class="solar-ranges">
      <article class="service-card"><p class="eyebrow">01 / Solar e armazenamento</p><h3>Produza e guarde energia.</h3><p>Projetos de fotovoltaico para autoconsumo e armazenamento de energia.</p><a class="text-link" href="paineis-solares-bateria.html">Conhecer os painéis solares ↗</a></article>
      <article class="service-card"><p class="eyebrow">02 / Conforto térmico</p><h3>Melhore o conforto da casa.</h3><p>Soluções de bombas de calor para responder às necessidades da sua habitação.</p><a class="text-link" href="bombas-calor.html">Conhecer as bombas de calor ↗</a></article>
      <article class="service-card"><p class="eyebrow">03 / Mobilidade elétrica</p><h3>Carregue a sua viatura em casa.</h3><p>Projetos de instalação de carregadores para veículos elétricos.</p><a class="text-link" href="carregadores.html">Conhecer os carregadores ↗</a></article>
    </div>
    <p class="solar-note">A disponibilidade do financiamento, o modelo e as condições são definidos na avaliação e na proposta de cada projeto.</p>
  </div></section>
  <section class="section solar-included"><div class="wrap feature-grid">
    <div class="feature-copy"><p class="eyebrow">Do projeto ao financiamento</p><h2>Uma equipa.<br/>Ao longo de todo o processo.</h2><p>Na MacWatts encontra um parceiro com competências na engenharia da solução, execução, operação, manutenção e financiamento do projeto.</p><p>O ponto de partida é uma solução que se traduza em poupança energética, com uma avaliação dos pressupostos e do investimento necessário.</p><a class="text-link" href="contactos.html">Fale-nos do seu projeto ↗</a></div>
    <div class="feature-visual"><img src="../assets/9170d7193c-team-work-environment-project-scaled.jpg" alt="Equipa a analisar um projeto e as suas necessidades" loading="lazy"/></div>
  </div></section>
  <section class="section"><div class="wrap feature-grid">
    <div class="feature-visual"><img src="../assets/residential-service-1.webp" alt="Habitação com painéis solares para autoconsumo" width="800" height="450" loading="lazy"/></div>
    <div class="feature-copy"><p class="eyebrow">Financiamento e poupança</p><h2>O investimento de hoje.<br/>A eficiência de amanhã.</h2><p>Entre os modelos apresentados pela MacWatts estão os modelos ESCO, em que o financiamento do investimento é suportado pelas poupanças energéticas geradas pelo sistema.</p><p>Neste modelo, a MacWatts assume o projeto de investimento, incluindo a operação e manutenção durante o período contratual. A aplicação à sua habitação e as condições concretas devem ser confirmadas com a equipa.</p><a class="text-link" href="contactos.html">Conhecer as opções para a minha casa ↗</a></div>
  </div></section>
  <section class="section solar-included"><div class="wrap">
    <div class="section-heading"><div><p class="eyebrow">Outros projetos</p><h2>Mais soluções.<br/>A mesma atenção à energia.</h2></div></div>
    <div class="feature-copy"><p>A MacWatts apresenta também financiamento para comunidades de energia, sistemas de controlo, gestão e monitorização de energia, iluminação e baterias de condensadores. Fale com a equipa para avaliar o enquadramento do seu projeto.</p></div>
  </div></section>
  <section class="contact-banner"><div class="wrap contact-inner"><div><p class="eyebrow">Vamos falar?</p><h2>O seu próximo projeto<br/>começa com uma conversa.</h2><p>Peça uma proposta e conheça as opções de financiamento para a sua habitação.</p></div><a class="button button-dark" href="contactos.html">Pedir uma proposta <span aria-hidden="true">↗</span></a></div></section>
</main>
''', 'html.parser').main)
for link in soup.select('a[href]'):
    if link['href'].endswith('/financiamento.html') or link['href'] == '../financiamento/index.html':
        link['href'] = 'financiamento.html'
        link['aria-current'] = 'page'
    if link.get_text(strip=True) == 'Pedir proposta':
        link['href'] = 'contactos.html'
import runpy
runpy.run_path(str(ROOT / 'scripts/audit-financing-icons.py'))['add_icons'](soup, 'financing')
(ROOT / 'residencial/financiamento.html').write_text(str(soup), encoding='utf-8')
