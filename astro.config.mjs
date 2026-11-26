// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://drigorlepski.com.br',
  // Site 100% estático: o build gera HTML puro em dist/, que é enviado para o public_html da Hostinger.
  output: 'static',
  trailingSlash: 'always',
  build: {
    // /sobre/ -> dist/sobre/index.html (funciona direto no Apache/LiteSpeed da Hostinger)
    format: 'directory',
  },
  integrations: [
    sitemap(),
  ],
  // Baixa a próxima página quando o mouse passa por cima do link.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
