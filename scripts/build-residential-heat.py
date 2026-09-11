"""Build the residential heat-pump page using the solar page's shared shell."""
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
soup = BeautifulSoup((ROOT / 'residencial/paineis-solares-bateria.html').read_text(encoding='utf-8'), 'html.parser')
soup.title.string = 'Bombas de calor | MacWatts Residencial'
soup.select_one('meta[name="description"]')['content'] = 'Soluções de bombas de calor para aquecer a água em sua casa, dimensionadas para o seu agregado familiar e combinadas com autoconsumo solar.'
main = BeautifulSoup('''
<main id="conteudo">
  <section class="solar-hero">
    <img src="../assets/297c093ea5-bombas-calor.jpg" alt="Habitação com soluções de conforto e energia" width="1024" height="559" fetchpriority="high"/>
    <div class="wrap">
      <p class="eyebrow">Residencial / Bombas de calor</p>
      <h1>Água quente em casa.<br/><span>Mais eficiência, todos os dias.</span></h1>
      <p class="solar-lead">Procura uma solução eficiente para aquecer a água em sua casa? A MacWatts associa a bomba de calor a um kit de autoconsumo, combinando a eficiência do equipamento com a sustentabilidade energética.</p>
      <div class="solar-actions"><a class="button" href="contactos.html">Pedir uma proposta</a><a class="text-link" href="#vantagens">Conhecer as vantagens ↓</a></div>
    </div>
  </section>
  <section class="section" id="vantagens">
    <div class="wrap">
      <div class="section-heading"><div><p class="eyebrow">Conforto com confiança</p><h2>Três vantagens.<br/>Uma solução para sua casa.</h2></div><p>Conheça as vantagens de escolher a MacWatts para a instalação da sua bomba de calor.</p></div>
      <div class="solar-ranges">
        <article class="service-card"><p class="eyebrow">01 / Certificação</p><h3>Técnicos e equipamentos certificados.</h3><p>Conte com técnicos e equipamentos certificados para a instalação da bomba de calor na sua habitação.</p></article>
        <article class="service-card"><p class="eyebrow">02 / Eficiência</p><h3>Conforto com elevado rendimento.</h3><p>Instalamos soluções e equipamentos com elevado rendimento, dimensionados para as necessidades da sua casa.</p></article>
        <article class="service-card"><p class="eyebrow">03 / Sustentabilidade</p><h3>Mais espaço para as renováveis.</h3><p>A transição do gás natural para o elétrico permite introduzir as energias renováveis no aquecimento da água.</p></article>
      </div>
    </div>
  </section>
  <section class="section solar-included">
    <div class="wrap feature-grid">
      <div class="feature-copy"><p class="eyebrow">À medida da sua habitação</p><h2>A sua família.<br/>O seu conforto.</h2><p>Na MacWatts dimensionamos a solução que melhor se adequa ao seu agregado familiar e ao consumo energético da habitação.</p><p>Fale com a nossa equipa para encontrar os equipamentos adequados às suas necessidades.</p><a class="text-link" href="contactos.html">Fale-nos da sua casa ↗</a></div>
      <div class="feature-visual"><img src="../assets/297c093ea5-bombas-calor.jpg" alt="Habitação para instalação de soluções de eficiência energética" width="1024" height="559" loading="lazy"/></div>
    </div>
  </section>
  <section class="section">
    <div class="wrap feature-grid">
      <div class="feature-visual"><img src="../assets/residential-service-1.webp" alt="Painéis solares numa habitação" width="800" height="450" loading="lazy"/></div>
      <div class="feature-copy"><p class="eyebrow">Bomba de calor e autoconsumo</p><h2>O sol e o conforto.<br/>Na mesma solução.</h2><p>Ao associar a bomba de calor a um kit de autoconsumo, aliamos a eficiência do equipamento à sustentabilidade energética.</p><p>Conheça também as soluções solares residenciais e fale connosco sobre a combinação adequada à sua casa.</p><a class="text-link" href="paineis-solares-bateria.html">Conhecer os painéis solares ↗</a></div>
    </div>
  </section>
  <section class="contact-banner"><div class="wrap contact-inner"><div><p class="eyebrow">Vamos falar?</p><h2>Mais conforto começa<br/>com uma conversa.</h2><p>Entre em contacto com a nossa equipa e peça uma proposta para a sua habitação.</p></div><a class="button button-dark" href="contactos.html">Pedir uma proposta <span aria-hidden="true">↗</span></a></div></section>
</main>
''', 'html.parser').main
soup.main.replace_with(main)
for link in soup.select('a[href]'):
    if link['href'] == '../bombas-de-calor/index.html':
        link['href'] = 'bombas-calor.html'
        link['aria-current'] = 'page'
    elif link['href'] == '../paineis-solares-e-baterias/index.html':
        link['href'] = 'paineis-solares-bateria.html'
    if link.get_text(strip=True) == 'Pedir proposta':
        link['href'] = 'contactos.html'
import runpy
runpy.run_path(str(ROOT / 'scripts/heat-icons.py'))['add_icons'](soup)
(ROOT / 'residencial/bombas-calor.html').write_text(str(soup), encoding='utf-8')
