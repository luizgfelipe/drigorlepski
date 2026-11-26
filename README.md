# drigorlepski.com.br

Reconstrução do site do **Dr. Igor Lepski Calil** — mesmo visual do site atual (WordPress/Elementor), agora em **Astro** (HTML estático). O blog fica dentro do projeto, em arquivos Markdown — **sem WordPress e sem nenhuma API**.

- Páginas institucionais: HTML gerado no build (rápido, ótimo para SEO, nada para invadir no servidor).
- Navegação sem recarregar a aba (`<ClientRouter />` + prefetch no hover).
- Blog: cada post é um arquivo `.md` em `src/content/blog/`. Post novo = novo commit + build + upload.
- Hospedagem: qualquer plano da Hostinger com hPanel (só arquivos estáticos + `.htaccess`).

## Rodar localmente

```bash
npm install
npm run dev               # http://localhost:4321
```

Requer Node 20+ (testado com Node 22).

## Estrutura

```
public/
  .htaccess              ← HTTPS, redirects das URLs antigas, cache
  images/og-image.png    ← prévia ao compartilhar o link (favicons também ficam em public/)
src/
  assets/images/         ← imagens do site (otimizadas no build — ver ASSETS.md)
  assets/blog/           ← capas dos posts do blog
  config/site.ts         ← WhatsApp, telefone, endereços, GTM, Typekit, links dos vídeos, menu
  styles/global.css      ← cores, fontes, grade (seção / container 1140px / colunas)
  layouts/BaseLayout.astro
  components/            ← Header, Footer, botões, cards, carrossel de depoimentos, vídeo…
  content/blog/          ← POSTS DO BLOG (um .md por post) + _modelo.md
  components/blog/       ← grade de posts e paginação
  lib/blog.ts            ← lê os posts, ordena, gera resumo e datas
  data/                  ← depoimentos, publicações
  pages/                 ← uma página por rota
scripts/gerar-placeholders.py
```

## Conteúdo que costuma mudar

| O quê | Onde |
|---|---|
| Posts do blog | `src/content/blog/*.md` (ver "Blog" abaixo) |
| WhatsApp, telefone, endereços, Instagram | `src/config/site.ts` |
| Links dos vídeos (Reels do Instagram ou YouTube) | `src/config/site.ts` → `videos` |
| Depoimentos | `src/data/reviews.ts` |
| Publicações científicas | `src/data/publications.ts` |
| Imagens | `src/assets/images/` (mesmo nome de arquivo — ver `ASSETS.md`) |
| Textos das páginas | `src/pages/*.astro` |

## Fontes

- **akagi-pro** e **haboro-soft-extended** vêm do **Adobe Fonts** (kit `orb8hga`, o mesmo do site atual). O kit é da conta Adobe de quem fez o site antigo — confirme com a agência se pode ser reutilizado ou crie um kit novo e troque `typekitId` em `src/config/site.ts`. No Adobe Fonts, adicione o domínio `drigorlepski.com.br` ao projeto web.
- **Poppins** vem empacotada no projeto (`@fontsource/poppins`), sem depender do Google Fonts.

## Blog

Os posts ficam em `src/content/blog/`, um arquivo Markdown por post. O site final não depende de WordPress nem de nenhuma API: tudo vira HTML no build.

### Publicar um post novo

1. Copie `src/content/blog/_modelo.md` e renomeie. **O nome do arquivo vira o endereço**: `cuidados-pos-transplante.md` → `/blog/cuidados-pos-transplante/` (minúsculas, sem acentos, hífens no lugar de espaços).
2. Salve a imagem de capa em `src/assets/blog/` (ex.: `cuidados-pos-transplante.jpg`, ~1300×410 ou maior). Não precisa comprimir: o build gera as versões em WebP.
3. Preencha o cabeçalho e escreva o texto:
   ```markdown
   ---
   titulo: "Cuidados no pós-transplante"
   data: 2026-12-01
   imagem: ../../assets/blog/cuidados-pos-transplante.jpg
   imagemAlt: "Paciente conversando com o médico"
   ---

   Primeiro parágrafo…

   **Subtítulo em negrito**

   - item de lista
   ```
4. `npm run build`, confira com `npm run preview` e suba a pasta `dist/` (ver abaixo). Faça o commit.

Campos do cabeçalho:

| Campo | Obrigatório | O que faz |
|---|---|---|
| `titulo` | sim | Título do post (também vira o título da aba e do Google) |
| `data` | sim | Data exibida e ordem dos posts (mais novo primeiro). Dois posts no mesmo dia: use `2026-12-01T10:00:00` |
| `imagem` | sim | Caminho da capa a partir do arquivo do post: `../../assets/blog/foto.jpg`. Se o arquivo não existir, o build avisa |
| `imagemAlt` | não | Descrição da imagem (acessibilidade) |
| `resumo` | não | Texto do card e da descrição no Google. Sem ele, usa as primeiras 30 palavras do texto |
| `rascunho` | não | `true` = o post fica no repositório mas não é publicado |

Se faltar um campo obrigatório ou a data estiver errada, o build para e mostra qual arquivo tem o problema.

- `/blog/` mostra 9 posts por página; a partir do 10º post são criadas `/blog/pagina/2/`, `/blog/pagina/3/`…
- A Home mostra os 3 mais recentes.
- Cada post entra no `sitemap-index.xml` automaticamente.
- Para tirar um post do ar, apague o arquivo (ou use `rascunho: true`) e publique de novo.

## Build e deploy na Hostinger

```bash
npm run build                 # gera a pasta dist/
cd dist && zip -r ../site.zip . && cd ..
```

No hPanel: **Arquivos → Gerenciador de Arquivos → `public_html`** → envie `site.zip` → **Extrair**.

> ⚠️ O `.htaccess` é um arquivo oculto. Ele precisa ir junto (o `zip -r .` acima já inclui). Se compactar pelo Windows/macOS, confira se ele está no zip.

Sempre que mudar algo (inclusive um post novo do blog), rode o build e suba a pasta `dist/` de novo.

## Google Tag Manager

O container `GTM-PDJRHLZ3` (o mesmo de hoje) é carregado em todas as páginas. Como a navegação não recarrega a página, a cada troca o site envia o evento `virtual_page_view` para o `dataLayer` (com `page_path` e `page_title`). No GTM, use um acionador de **Evento personalizado** `virtual_page_view` (ou "Alteração no histórico") para contar as visualizações.

## Imagens

```bash
npm run baixar-imagens        # baixa as imagens originais do site atual (ver ASSETS.md)
npm run placeholders          # cria provisórias para as que estiverem faltando (não sobrescreve as reais)
```
