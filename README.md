# drigorlepski.com.br

Reconstrução do site do **Dr. Igor Lepski Calil** — mesmo visual do site atual (WordPress/Elementor), agora em **Astro** (HTML estático) com o **blog vindo de um WordPress headless**.

- Páginas institucionais: HTML gerado no build (rápido, ótimo para SEO, nada para invadir no servidor).
- Navegação sem recarregar a aba (`<ClientRouter />` + prefetch no hover).
- Blog: os posts existentes viram páginas estáticas no build **e** a lista é atualizada em tempo real pela API do WordPress — post novo aparece sem novo deploy.
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
  .htaccess              ← HTTPS, redirects das URLs antigas, rota "coringa" do blog, cache
  images/                ← imagens (provisórias por enquanto — ver ASSETS.md)
src/
  config/site.ts         ← WhatsApp, telefone, endereços, GTM, Typekit, links dos vídeos, menu
  styles/global.css      ← cores, fontes, grade (seção / container 1140px / colunas)
  layouts/BaseLayout.astro
  components/            ← Header, Footer, botões, cards, carrossel de depoimentos, vídeo…
  components/blog/       ← React: grade de posts, artigo, página coringa
  lib/wp.ts              ← integração com a API do WordPress
  data/                  ← depoimentos, publicações, posts-seed.json (os 3 posts atuais)
  pages/                 ← uma página por rota
scripts/gerar-placeholders.py
```

## Conteúdo que costuma mudar

| O quê | Onde |
|---|---|
| Endereço do WordPress do blog | `src/config/site.ts` → `wpUrl` |
| WhatsApp, telefone, endereços, Instagram | `src/config/site.ts` |
| Links dos vídeos (Reels do Instagram ou YouTube) | `src/config/site.ts` → `videos` |
| Depoimentos | `src/data/reviews.ts` |
| Publicações científicas | `src/data/publications.ts` |
| Imagens | `public/images/` (mesmo nome de arquivo — ver `ASSETS.md`) |
| Textos das páginas | `src/pages/*.astro` |

## Fontes

- **akagi-pro** e **haboro-soft-extended** vêm do **Adobe Fonts** (kit `orb8hga`, o mesmo do site atual). O kit é da conta Adobe de quem fez o site antigo — confirme com a agência se pode ser reutilizado ou crie um kit novo e troque `typekitId` em `src/config/site.ts`. No Adobe Fonts, adicione o domínio `drigorlepski.com.br` ao projeto web.
- **Poppins** vem empacotada no projeto (`@fontsource/poppins`), sem depender do Google Fonts.

## Blog (WordPress headless)

1. Instale um **WordPress novo e limpo** num subdomínio (ex.: `cms.drigorlepski.com.br`). Não migre arquivos nem banco do site antigo.
2. Cadastre os posts (o conteúdo dos 3 atuais está em `src/data/posts-seed.json`).
3. Coloque o endereço em `src/config/site.ts` → `wpUrl: 'https://cms.drigorlepski.com.br'` e rode o build.
   O valor fica gravado nos arquivos gerados: não precisa de `.env` nem de nada na Hostinger.
   (Para testar outro WordPress só no seu computador, crie um `.env` com `PUBLIC_WP_URL=...` — ele tem prioridade.)
4. Teste o CORS (a resposta precisa trazer `Access-Control-Allow-Origin`):
   ```bash
   curl -I -H "Origin: https://drigorlepski.com.br" "https://cms.drigorlepski.com.br/wp-json/wp/v2/posts"
   ```

Como funciona:

- **No build**, cada post vira `/blog/<slug>/index.html` (SEO e prévia no WhatsApp completos).
- **No navegador**, `/blog` e o bloco "Blog" da Home buscam a lista atualizada na API.
- **Post publicado depois do último deploy**: o `.htaccess` manda `/blog/<slug>/` para a página coringa `/blog/post/`, que lê o slug da URL e carrega o artigo da API.
- Sem `wpUrl` (ou com o WordPress fora do ar no build), o site usa `src/data/posts-seed.json`.

Recomendado no WordPress: atualizações automáticas, 2FA, XML-RPC desligado, `DISALLOW_FILE_EDIT`, cache da REST API (ex.: plugin *WP REST Cache*) e redirecionar o front do WordPress para o site principal (deixando só `/wp-admin` e `/wp-json`).

## Build e deploy na Hostinger

```bash
npm run build                 # gera a pasta dist/
cd dist && zip -r ../site.zip . && cd ..
```

No hPanel: **Arquivos → Gerenciador de Arquivos → `public_html`** → envie `site.zip` → **Extrair**.

> ⚠️ O `.htaccess` é um arquivo oculto. Ele precisa ir junto (o `zip -r .` acima já inclui). Se compactar pelo Windows/macOS, confira se ele está no zip.

Só é preciso subir de novo quando mudar layout, textos ou imagens — posts novos do blog aparecem sozinhos.

## Google Tag Manager

O container `GTM-PDJRHLZ3` (o mesmo de hoje) é carregado em todas as páginas. Como a navegação não recarrega a página, a cada troca o site envia o evento `virtual_page_view` para o `dataLayer` (com `page_path` e `page_title`). No GTM, use um acionador de **Evento personalizado** `virtual_page_view` (ou "Alteração no histórico") para contar as visualizações.

## Imagens

```bash
npm run baixar-imagens        # baixa as imagens originais do site atual (ver ASSETS.md)
npm run placeholders          # cria provisórias para as que estiverem faltando (não sobrescreve as reais)
```
