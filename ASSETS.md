# Imagens do site

Todas as imagens ficam em **`public/images/`**. Hoje essas pastas têm **imagens provisórias** (cinza, com o nome e o tamanho escritos) geradas por `npm run placeholders`.

## Atalho: baixar as imagens do site atual

```bash
npm run baixar-imagens               # baixa as 24 imagens + favicon e gera a og-image
npm run baixar-imagens -- --videos   # também baixa os 2 vídeos MP4 em ./videos-originais (para o YouTube)
```

O script pega os originais em `drigorlepski.com.br/wp-content/uploads/2026/06/`, confere se cada arquivo é mesmo uma imagem e **re-codifica** tudo (descarta metadados e qualquer conteúdo escondido — o site antigo está com malware). Rode enquanto o site antigo ainda estiver no ar, ou seja, antes de apontar o domínio para a Hostinger.

## Trocar manualmente

Salve o arquivo real **com o mesmo nome** por cima do provisório. Não precisa mexer em código.

> Dica: exporte em `.png` (ou mantenha a extensão indicada) e passe por um compressor (TinyPNG, Squoosh) antes. Fotos grandes podem ser `.jpg`, mas aí o nome do arquivo e a referência no código mudam juntos.

| Arquivo em `public/images/` | Nome no site antigo (WordPress) | Tamanho de referência | Onde aparece |
|---|---|---|---|
| `logo.png` | `Grupo-137.png` | 1098×323 (fundo transparente, versão clara) | Cabeçalho, rodapé (faixa e copyright) |
| `home-hero-bg.png` | `b-e1782133112685.png` | ~1920×1080 | Fundo do topo da Home (foto do doutor à direita) |
| `home-bio.png` | `Componente-3-–-1.png` | 625×755 (já com o quadrado verde e o contorno) | Home — bloco "Referência nacional…" |
| `hospital-einstein.png` | `Screenshot-2026-05-26-at-15.39.39-….png` | 883×277 | Home — "Hospitais onde atuo" (de preferência o logo oficial em boa resolução) |
| `hospital-vila-santa-catarina.png` | `images.png` | 883×249 | Home — "Hospitais onde atuo" (idem) |
| `icon-figado.png` | `icon2.png` | 295×278 | Card "Transplante de Fígado" |
| `icon-intestino.png` | `icon.png` | 290×276 | Card "Transplante de Intestino" e cards da página de Intestino |
| `icon-pancreas.png` | `icon3.png` | 295×276 | Card "Transplante de Pâncreas" |
| `icon-multivisceral.png` | `icon1.png` | 293×278 | Card "Transplante Multivisceral" e cards das páginas de Cirurgia |
| `cirurgia-hepato-bilio-pancreatica.png` | `como-funciona-a-hepatectomia-…-destacada.png` | 494×477 | Home (Cirurgias) e topo da página Hepato-Bílio-Pancreática |
| `cirurgia-aparelho-digestivo.png` | `Screenshot-2026-05-27-at-10.22.16.png` | 494×477 | Home (Cirurgias) e topo da página Aparelho Digestivo |
| `review-avatar.png` | `Componente-1-–-1-1.png` | 72×72 (aparece com 36×36, redondo) | Depoimentos |
| `cta-doctor.png` | `card1.png` | 777×553 | Rodapé — "Receba uma avaliação…" (todas as páginas) |
| `salvatore.png` | `salvatore.png` | 986×156 (transparente, clara) | Rodapé — "Produzido por" |
| `hero-transplantes-bg.png` | `Retangulo-74.png` | ~1920×400 (gradiente verde) | Topo das páginas de Transplante, Blog e artigos |
| `hero-cirurgias-bg.png` | `Retangulo-74-1.png` | ~1920×400 | Topo das páginas de Cirurgia |
| `transplante-figado.png` | `istockphoto_1465361950.png` | foto (recortada em "cover") | Topo — Transplante de Fígado |
| `transplante-intestino.png` | `istockphoto_1360862667.png` | foto | Topo — Transplante de Intestino |
| `transplante-pancreas.png` | `istockphoto_1467893187.png` | foto | Topo — Transplante de Pâncreas |
| `sobre-hero.png` | `IMG_1377.png` | 599×732 | Sobre — topo |
| `sobre-fotos.png` | `Componente-4-–-1.png` | 622×853 (duas fotos + detalhes) | Sobre — "Conheça melhor quem atenderá você!" |
| `video-apresentacao-capa.jpg` | — | 1080×1920 (vertical) | Capa do vídeo da Home/Sobre **só enquanto não houver ID do YouTube** (com o ID, a capa vem do YouTube) |
| `video-hepato-bilio-pancreatica-capa.jpg` | — | 1080×1920 (vertical) | Idem, página Hepato-Bílio-Pancreática |
| `og-image.png` | — (gerada pelo script a partir do fundo da Home) | 1200×630 | Prévia ao compartilhar o link no WhatsApp/Facebook |
| `blog/istockphoto_1474957957.png` | mesmo nome | 1287×410 | Destaque do post "Transplantado pode fazer atividade física?" (só enquanto o WordPress novo não existir) |
| `blog/adobestock_572577392.png` | mesmo nome | 1302×410 | Destaque do post "Refluxo que não melhora com remédio" (idem) |
| `blog/shutterstock_1024477424.png` | mesmo nome | 2057×748 | Destaque do post "Vida após o transplante" (idem) |

Também em `public/`: **`favicon.png`** (64×64) e **`apple-touch-icon.png`** (180×180) — gerados pelo script a partir do `fav.png` do site antigo (que estava na biblioteca, mas não era usado).

## Vídeos

Os vídeos vêm dos Reels do Instagram (embed oficial, sem legenda). Os links ficam em `src/config/site.ts` → `videos`:

- `apresentacao` — Home e Sobre
- `hepatoBilioPancreatica` — página Cirurgia Hepato-Bílio-Pancreática

Também aceita link do YouTube no lugar do Instagram. As capas `video-…-capa.jpg` só aparecem se o campo ficar vazio.
