# itrainer

Página institucional da academia, com identidade visual escura e moderna.

## Estrutura do projeto

| Arquivo               | Responsabilidade                                   |
| --------------------- | -------------------------------------------------- |
| `index.html`          | Estrutura e conteúdo da página                     |
| `css/styles.css`      | Estilos e identidade visual                        |
| `js/config.js`        | Dados editáveis (contato, horários, redes sociais) |
| `js/main.js`          | Interações (menu, animações, formulário, dados)    |
| `manifest.json`       | Torna o app instalável (PWA)                       |
| `assets/icon.svg`     | Ícone do app                                       |
| `assets/images/`      | Fotos locais da academia (opcional)                |

## Como executar

Abra o `index.html` no navegador ou publique no GitHub Pages.

## Como publicar no GitHub Pages

1. `git add .`
2. `git commit -m "Página itrainer com arquivos separados"`
3. `git push`
4. No GitHub: Settings → Pages → Deploy from branch `main` / pasta `(root)`

## Como editar os dados

Todos os dados de contato, horários e redes sociais ficam em `js/config.js`.
Altere lá e o site atualiza sozinho.