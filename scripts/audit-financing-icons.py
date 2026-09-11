"""Decorative icons for audit and financing cards, preserving edited content."""
from pathlib import Path
from bs4 import BeautifulSoup

DRAWINGS = {
    'audit': [
        '<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L21 21M7 12V9m3 3V7m3 5v-2"/>',
        '<path d="M4 4v16h16M7 7l5 5 3-3 5 7m-5 0h5v-5"/>',
        '<path d="M3 4h8l10 10-7 7L3 10V4z"/><circle cx="7" cy="8" r="1"/><path d="M11 15l5-5m-5 0h.01M16 15h.01"/>',
    ],
    'financing': [
        '<path d="M5 7h14l2 12H3L5 7zm-1 6h16M9 7l-1 12m7-12 1 12M12 19v3m-4 0h8"/>',
        '<path d="M9 14.5V5a3 3 0 016 0v9.5a5 5 0 11-6 0zM12 8v10"/><circle cx="12" cy="18" r="1"/>',
        '<rect x="4" y="3" width="11" height="18" rx="2"/><path d="M10 6L7 11h5l-3 4m6-7h2l3 3v6a2 2 0 01-4 0v-3M7 18h5"/>',
    ],
}


def add_icons(soup, kind):
    for card, drawing in zip(soup.select('.solar-ranges .service-card'), DRAWINGS[kind]):
        for old in card.select('.benefit-icon'):
            old.decompose()
        icon = BeautifulSoup('<svg class="benefit-icon" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + drawing + '</svg>', 'html.parser').svg
        icon['viewBox'] = icon.attrs.pop('viewbox')
        card.select_one('h3').insert_before(icon)


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    for filename, kind in [('autditoria.html', 'audit'), ('financiamento.html', 'financing')]:
        path = root / 'residencial' / filename
        soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
        add_icons(soup, kind)
        path.write_text(str(soup), encoding='utf-8')
