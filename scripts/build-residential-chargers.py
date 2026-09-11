"""Build the residential charging page with the shared solar-page design."""
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
soup = BeautifulSoup((ROOT / 'residencial/paineis-solares-bateria.html').read_text(encoding='utf-8'), 'html.parser')
soup.title.string = 'Carregadores para veículos elétricos | MacWatts Residencial'
soup.select_one('meta[name="description"]')['content'] = 'Carregadores de 7,4 kW a 22 kW para a sua habitação, com gestão dinâmica do carregamento, monitorização remota e integração com a produção solar.'
soup.main.replace_with(BeautifulSoup('''
<main id="conteudo">
  <section class="solar-hero">
    <img src="../assets/34df7626b5-person-taking-care-electric-car-scaled.jpg" alt="Carregamento de um veículo elétrico" fetchpriority="high"/>
    <div class="wrap"><p class="eyebrow">Residencial / Mobilidade elétrica</p><h1>A sua energia.<br/><span>Pronta para a próxima viagem.</span></h1><p class="solar-lead">Carregue a sua viatura em casa com uma solução ajustada às suas necessidades. A MacWatts dispõe de carregadores de 7,4 kW a 22 kW, com gestão dinâmica do carregamento.</p><div class="solar-actions"><a class="button" href="contactos.html">Pedir uma proposta</a><a class="text-link" href="#vantagens">Conhecer as vantagens ↓</a></div></div>
  </section>
  <section class="section" id="vantagens"><div class="wrap">
    <div class="section-heading"><div><p class="eyebrow">Mobilidade à sua medida</p><h2>O seu carregador.<br/>Com acompanhamento próximo.</h2></div><p>Conheça as vantagens de escolher a MacWatts para instalar o carregador na sua habitação.</p></div>
    <div class="solar-ranges">
      <article class="service-card"><p class="eyebrow">01 / Personalização</p><h3>Uma solução para a sua rotina.</h3><p>Um carregador à medida das suas necessidades, com a potência adequada à sua viatura e à instalação da habitação.</p></article>
      <article class="service-card"><p class="eyebrow">02 / Garantia</p><h3>Instalação com confiança.</h3><p>Equipamentos com garantia e instalação efetuada por técnicos certificados.</p></article>
      <article class="service-card"><p class="eyebrow">03 / Aplicação</p><h3>O carregamento na sua mão.</h3><p>Visualize e faça a gestão remota do seu carregador através da plataforma de monitorização.</p></article>
    </div>
  </div></section>
  <section class="section solar-included"><div class="wrap feature-grid">
    <div class="feature-copy"><p class="eyebrow">Gestão dinâmica</p><h2>Energia para o carro.<br/>Equilíbrio para a casa.</h2><p>Associamos ao carregador um sistema dinâmico de gestão do carregamento, que ajusta a energia destinada à viatura em função da disponibilidade da instalação.</p><p>Esta gestão ajuda a evitar cortes no fornecimento de energia à habitação durante o carregamento.</p><a class="text-link" href="contactos.html">Encontre a solução certa ↗</a></div>
    <div class="feature-visual"><img src="../assets/34df7626b5-person-taking-care-electric-car-scaled.jpg" alt="Ligação de um carregador a um veículo elétrico" loading="lazy"/></div>
  </div></section>
  <section class="section"><div class="wrap feature-grid">
    <div class="feature-visual"><img src="../assets/residential-service-1.webp" alt="Habitação com painéis solares para autoconsumo" width="800" height="450" loading="lazy"/></div>
    <div class="feature-copy"><p class="eyebrow">Solar e mobilidade</p><h2>A energia do sol.<br/>Também nas suas viagens.</h2><p>A mesma aplicação permite gerir o carregamento da sua viatura em função da produção solar.</p><p>Junte um carregador ao seu kit de autoconsumo e caminhe com a MacWatts para a sustentabilidade energética e a neutralidade carbónica.</p><a class="text-link" href="paineis-solares-bateria.html">Conhecer os painéis solares ↗</a></div>
  </div></section>
  <section class="contact-banner"><div class="wrap contact-inner"><div><p class="eyebrow">Vamos falar?</p><h2>A próxima viagem<br/>começa em sua casa.</h2><p>Fale com a nossa equipa e peça uma proposta para o seu carregador.</p></div><a class="button button-dark" href="contactos.html">Pedir uma proposta <span aria-hidden="true">↗</span></a></div></section>
</main>
''', 'html.parser').main)
destinations = {
    '../carregadores-para-veiculos-eletricos/index.html': 'carregadores.html',
    '../bombas-de-calor/index.html': 'bombas-calor.html',
    '../paineis-solares-e-baterias/index.html': 'paineis-solares-bateria.html',
}
for link in soup.select('a[href]'):
    link['href'] = destinations.get(link['href'], link['href'])
    if link['href'] == 'carregadores.html':
        link['aria-current'] = 'page'
    if link.get_text(strip=True) == 'Pedir proposta':
        link['href'] = 'contactos.html'
import runpy
runpy.run_path(str(ROOT / 'scripts/charger-icons.py'))['add_icons'](soup)
(ROOT / 'residencial/carregadores.html').write_text(str(soup), encoding='utf-8')
