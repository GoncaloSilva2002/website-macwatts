"""Decorative icons for the residential charging benefits."""
from pathlib import Path
from bs4 import BeautifulSoup


def add_icons(soup):
    drawings = [
        '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
        '<path d="M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3z"/><path d="M8 12l3 3 5-6"/>',
        '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4m-3 14h2m0-11-3 5h4l-3 4"/>',
    ]
    for card, drawing in zip(soup.select('#vantagens .service-card'), drawings):
        for old in card.select('.benefit-icon'):
            old.decompose()
        icon = BeautifulSoup('<svg class="benefit-icon" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + drawing + '</svg>', 'html.parser').svg
        # BeautifulSoup's HTML parser lowercases SVG attribute names.
        icon['viewBox'] = icon.attrs.pop('viewbox')
        card.select_one('h3').insert_before(icon)


if __name__ == '__main__':
    path = Path(__file__).resolve().parents[1] / 'residencial/carregadores.html'
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    add_icons(soup)
    path.write_text(str(soup), encoding='utf-8')
