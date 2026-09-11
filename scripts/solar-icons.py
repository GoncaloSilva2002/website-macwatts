"""Decorative icons for the residential solar ranges."""
from pathlib import Path
from bs4 import BeautifulSoup


def add_icons(soup):
    drawings = [
        '<path d="M5 7h14l2 12H3L5 7zm-1 6h16M9 7l-1 12m7-12 1 12M12 19v3m-4 0h8"/>',
        '<path d="M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3z"/><path d="M8 12l3 3 5-6"/>',
        '<path d="M12 3l9 9-9 9-9-9 9-9zm-9 9h18M12 3l4 9-4 9-4-9 4-9z"/>',
    ]
    for card, drawing in zip(soup.select('#kits .service-card'), drawings):
        for old in card.select('.benefit-icon'):
            old.decompose()
        icon = BeautifulSoup('<svg class="benefit-icon" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + drawing + '</svg>', 'html.parser').svg
        icon['viewBox'] = icon.attrs.pop('viewbox')
        card.select_one('h3').insert_before(icon)


if __name__ == '__main__':
    path = Path(__file__).resolve().parents[1] / 'residencial/paineis-solares-bateria.html'
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    add_icons(soup)
    path.write_text(str(soup), encoding='utf-8')
