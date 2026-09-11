# MacWatts — HTML, CSS e JavaScript

## Organização empresarial

O menu **Soluções** organiza 14 serviços em quatro áreas: Energia, Consultoria, Operações e manutenção e Financiamento. A página `empresarial/index.html` reúne todos os serviços. As 17 páginas empresariais existentes incluem uma navegação de regresso ao catálogo e à respetiva área.

O catálogo central está em `scripts/build-business-navigation.py`. Execute `python scripts/build-business-navigation.py` depois de reconstruir uma página inicial ou de projeto para atualizar os menus. O exportador também executa esta atualização. Os estilos estão em `css/business-navigation.css`; o menu funciona por clique, teclado e toque.

Cópia estática de https://staging.macwatts.pt/, recolhida em 9 de setembro de 2026, com uma nova página inicial empresarial. Inclui 58 páginas públicas interligadas, imagens, fontes e estilos locais. Não necessita de WordPress, PHP ou base de dados.

A página inicial foi redesenhada: apresentação fixa, navegação simplificada, cartões de serviços, projetos com fotografias uniformes, indicadores compactos no telemóvel e contacto destacado. A página `residencial/index.html` segue o mesmo estilo, com soluções para a casa, secções de solar e mobilidade, perguntas frequentes e acesso ao simulador externo original. Todas as páginas internas partilham o cabeçalho, rodapé, tipografia, cores e botões do novo estilo, preservando os conteúdos existentes.

O residencial partilha `css/home.css` e `js/home.js`, com adaptações em `css/residential.css`. A referência `templates/residential.html` é preservada pelo exportador. `scripts/build-residential.py` permite reconstruí-la a partir do modelo empresarial; substitui alterações manuais no HTML residencial.

A página `south-atlantic/index.html` também utiliza o novo estilo: fotografia de abertura, indicadores do projeto e galeria ampliável com teclado. Os estilos específicos estão em `css/project.css` e a galeria em `js/project.js`. A referência `templates/south-atlantic.html` é preservada pelo exportador. Para reconstruir: `python scripts/build-south-atlantic.py`. Para verificar a página com o servidor ativo: `node scripts/verify-project.js`.

## Abrir

Abra `index.html` no navegador ou execute, com Node.js instalado:

```sh
npm start
```

Aceda a http://localhost:8080. O servidor de desenvolvimento usa apenas módulos nativos de Node.js. Também pode publicar os ficheiros num alojamento estático.

## Ficheiros

- `index.html`: página inicial empresarial.
- `templates/home.html`: cópia de referência da nova página inicial, preservada pelo exportador. Ao editar `index.html`, atualize também este ficheiro antes de voltar a executar o exportador.
- `css/home.css` e `js/home.js`: estilos e menu responsivo da nova página inicial, independentes do Elementor.
- `residencial/index.html`, `contactos/index.html` e restantes pastas: páginas internas.
- `assets/`: imagens, fontes e CSS originais, guardados localmente. Os nomes incluem um identificador para evitar colisões.
- `css/style.css`: adaptações para a versão estática e comportamento responsivo.
- `js/main.js`: menus, carrosséis com teclado e toque, visualização de imagens e formulário.
- `clone-report.json`: inventário da cópia e falhas de recolha.

O HTML mantém as classes originais para preservar os estilos; as interações usam JavaScript simples, sem executar os scripts de WordPress ou Elementor.

## Contactos e ligações externas

O formulário valida o email e prepara uma mensagem na aplicação de email do visitante. O visitante confirma o envio nessa aplicação; não existe envio direto por servidor. O mapa incorporado, o LinkedIn e as restantes ligações externas precisam de internet.

## Verificação

Com o servidor ativo, execute `npm install` e `npm test`. A verificação usa Playwright e Microsoft Edge, descobre as 58 páginas públicas em larguras de 1440 e 390 píxeis, procura imagens em falta, erros JavaScript e transbordo horizontal, e verifica o cabeçalho, rodapé, título principal e menu móvel de cada página. Também verifica as ligações da página inicial, as perguntas frequentes e a validação do email no formulário de contactos. Guarda `verification-report.json` e duas capturas de ecrã.

## Atualizar a cópia

`scripts/clone.py` documenta a recolha. Requer Python e `beautifulsoup4`. Executá-lo volta a descarregar as páginas e substitui os HTML e estilos originais locais. Preserve alterações manuais antes de o executar. As adaptações em `css/style.css` e `js/main.js` são mantidas.

Os conteúdos, as imagens e a identidade visual são os do website de origem.

## Estilo partilhado nas páginas internas

`css/site-pages.css` adapta os conteúdos exportados ao estilo de `css/home.css`, incluindo serviços, projetos, notícias, arquivos e páginas legais. `python scripts/unify-site.py` aplica o cabeçalho e o rodapé partilhados às páginas antigas; páginas já convertidas são preservadas. O exportador executa este passo automaticamente depois de atualizar a navegação empresarial.
