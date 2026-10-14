# MacWatts — HTML, CSS e JavaScript

## Organização empresarial

O menu **Soluções** organiza 14 serviços em quatro áreas: Energia, Consultoria, Operações e manutenção e Financiamento. A página `empresarial/index.html` reúne todos os serviços. As 17 páginas empresariais existentes incluem uma navegação de regresso ao catálogo e à respetiva área.

O catálogo central está em `scripts/build-business-navigation.py`. Execute `python scripts/build-business-navigation.py` depois de reconstruir uma página inicial ou de projeto para atualizar os menus. O exportador também executa esta atualização. Os estilos estão em `css/business-navigation.css`; o menu funciona por clique, teclado e toque.

Cópia de https://staging.macwatts.pt/, recolhida em 9 de setembro de 2026, com uma nova página inicial empresarial. Inclui 58 páginas públicas interligadas, imagens, fontes e estilos locais. As páginas públicas são ficheiros estáticos; a área de administração usa um servidor Node e não necessita de WordPress, PHP ou base de dados.

A página inicial foi redesenhada: apresentação fixa, navegação simplificada, cartões de serviços, projetos com fotografias uniformes, indicadores compactos no telemóvel e contacto destacado. A página `residencial/index.html` segue o mesmo estilo, com soluções para a casa, secções de solar e mobilidade, perguntas frequentes e acesso ao simulador externo original. Todas as páginas internas partilham o cabeçalho, rodapé, tipografia, cores e botões do novo estilo, preservando os conteúdos existentes.

O residencial partilha `css/home.css` e `js/home.js`, com adaptações em `css/residential.css`. A referência `templates/residential.html` é preservada pelo exportador. `scripts/build-residential.py` permite reconstruí-la a partir do modelo empresarial; substitui alterações manuais no HTML residencial.

A página `south-atlantic/index.html` também utiliza o novo estilo: fotografia de abertura, indicadores do projeto e galeria ampliável com teclado. Os estilos específicos estão em `css/project.css` e a galeria em `js/project.js`. A referência `templates/south-atlantic.html` é preservada pelo exportador. Para reconstruir: `python scripts/build-south-atlantic.py`. Para verificar a página com o servidor ativo: `node scripts/verify-project.js`.

## Abrir

Abra `index.html` no navegador ou execute, com Node.js instalado:

```sh
npm start
```

Aceda a http://localhost:8080. O servidor usa Node.js e Nodemailer para o envio de email. As páginas públicas podem ser alojadas como ficheiros estáticos; para usar a área de administração e o envio de contactos, o alojamento tem de executar o servidor Node.

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

O formul&#225;rio envia as mensagens diretamente pelo servidor do site. Para ativar o envio, configure as credenciais SMTP descritas abaixo. O formul&#225;rio recebe a resposta no endere&#231;o indicado pelo visitante; o destinat&#225;rio predefinido &#233; leads@macwatts.pt. O mapa incorporado, o LinkedIn e as restantes liga&#231;&#245;es externas precisam de internet.

## Verificação

Com o servidor ativo, execute `npm install` e `npm test`. A verificação usa Playwright e Microsoft Edge, descobre as 58 páginas públicas em larguras de 1440 e 390 píxeis, procura imagens em falta, erros JavaScript e transbordo horizontal, e verifica o cabeçalho, rodapé, título principal e menu móvel de cada página. Também verifica as ligações da página inicial, as perguntas frequentes e a validação do email no formulário de contactos. Guarda `verification-report.json` e duas capturas de ecrã.

## Atualizar a cópia

`scripts/clone.py` documenta a recolha. Requer Python e `beautifulsoup4`. Executá-lo volta a descarregar as páginas e substitui os HTML e estilos originais locais. Preserve alterações manuais antes de o executar. As adaptações em `css/style.css` e `js/main.js` são mantidas.

Os conteúdos, as imagens e a identidade visual são os do website de origem.

## Estilo partilhado nas páginas internas

`css/site-pages.css` adapta os conteúdos exportados ao estilo de `css/home.css`, incluindo serviços, projetos, notícias, arquivos e páginas legais. `python scripts/unify-site.py` aplica o cabeçalho e o rodapé partilhados às páginas antigas; páginas já convertidas são preservadas. O exportador executa este passo automaticamente depois de atualizar a navegação empresarial.

## Adicionar notícias

No formulário de administração, escolhe **Residencial** ou **Empresarial** e, se existir, cola o link HTTPS da fonte. A página da notícia é criada com o estilo do site; o cartão aparece na lista e na página inicial da categoria escolhida, e o artigo inclui um botão para abrir a fonte original.

A gestão das notícias é feita na área de administração em `/admin/`, protegida por palavra-passe. O formulário permite criar e eliminar artigos. Para criar, recebe o título, uma imagem PNG/JPG/WebP até 8 MB e o texto.

### Configuração local

Cria um ficheiro `.env` na raiz do projeto com `NEWS_ADMIN_PASSWORD` definido para uma palavra-passe com pelo menos 6 caracteres. Depois executa `npm start` e abre `http://localhost:8080/admin/`. O ficheiro `.env` não é enviado para o GitHub.

### Configuração no Render

O serviço precisa de ser um **Web Service Node**, com `npm start` como comando de arranque. Se o serviço atual for um Static Site, cria um Web Service para este repositório; o Render não permite alterar o tipo de serviço existente. Define estas variáveis no separador **Environment** do Render:

- `HOST` = `0.0.0.0`
- `NEWS_ADMIN_PASSWORD` = uma palavra-passe com pelo menos 6 caracteres
- `GITHUB_REPO_TOKEN` = token fine-grained do GitHub com acesso de leitura e escrita ao conteúdo deste repositório
- `GITHUB_OWNER` = `GoncaloSilva2002`
- `GITHUB_REPOSITORY` = `website-macwatts`
- `GITHUB_BRANCH` = `main`
- `ADMIN_COOKIE_SECURE` = `true`
- `SMTP_HOST` = servidor SMTP do fornecedor de email
- `SMTP_PORT` = `587` (ou `465`, conforme o fornecedor)
- `SMTP_SECURE` = `false` para a porta 587; `true` para a 465
- `SMTP_USER` e `SMTP_PASS` = credenciais SMTP
- `CONTACT_FROM` = endere&#231;o autorizado para envio (opcional; por defeito usa `SMTP_USER`)
- `CONTACT_TO` = destinat&#225;rio dos pedidos (opcional; por defeito `leads@macwatts.pt`)

O servidor valida a palavra-passe e mantém a sessão num cookie HttpOnly. Ao publicar, cria um commit no GitHub; o Render atualiza o site quando o serviço está ligado a esse repositório e ramo. Não coloques a palavra-passe nem o token no HTML ou no JavaScript. O endpoint `POST /api/contact` recebe os formulários e envia-os por SMTP. Define as mesmas variáveis SMTP no `.env` local para enviar mensagens durante o desenvolvimento.
