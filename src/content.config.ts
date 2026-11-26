/**
 * Posts do blog: um arquivo .md por post em src/content/blog/.
 * O nome do arquivo vira o endereço: meu-post.md -> /blog/meu-post/
 * Arquivos que começam com _ (ex.: _modelo.md) são ignorados.
 * Passo a passo para publicar: README.md -> "Blog".
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/[^_]*.md' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      /** 2026-12-01 (ou 2026-12-01T10:00:00 para ordenar posts do mesmo dia) */
      data: z.coerce.date(),
      /** imagem de capa em src/assets/blog/ — ex.: ../../assets/blog/minha-imagem.jpg (o build avisa se não existir) */
      imagem: image(),
      /** descrição da imagem (acessibilidade) */
      imagemAlt: z.string().default(''),
      /** resumo do card e da descrição do Google; se vazio, usa as primeiras 30 palavras do texto */
      resumo: z.string().optional(),
      /** true = não publica (fica só no repositório) */
      rascunho: z.boolean().default(false),
    }),
});

export const collections = { blog };
