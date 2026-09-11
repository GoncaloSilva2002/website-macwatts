"""Decorative icons for the residential heat-pump benefits."""
from pathlib import Path
from bs4 import BeautifulSoup


def add_icons(soup):
    drawings = [
        '<path d="M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3z"/><path d="M8 12l3 3 5-6"/>',
        '<path d="M13 2L4 14h7l-1 8 10-13h-7l1-7z"/>',
        '<path d="M20 3C9 3 3 7 4 14c1 5 6 7 10 4 5-3 6-9 6-15z"/><path d="M3 21L15 9"/>',
    ]
    for card, drawing in zip(soup.select('#vantagens .service-card'), drawings):
        for old in card.select('.benefit-icon'):
            old.decompose()
        icon = BeautifulSoup('<svg class="benefit-icon" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + drawing + '</svg>', 'html.parser').svg
        icon['viewBox'] = icon.attrs.pop('viewbox')
        card.select_one('h3').insert_before(icon)


if __name__ == '__main__':
    path = Path(__file__).resolve().parents[1] / 'residencial/bombas-calor.html'
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    add_icons(soup)
    path.write_text(str(soup), encoding='utf-8')
