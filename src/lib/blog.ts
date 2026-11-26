/**
 * Blog: posts em Markdown dentro do projeto (src/content/blog/*.md).
 * Tudo é resolvido no build — o site final não chama nenhuma API.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';

export type BlogEntry = CollectionEntry<'blog'>;

export type Post = {
  slug: string;
  date: Date;
  title: string;
  /** resumo em texto puro (30 palavras, igual ao site antigo) */
  excerpt: string;
  /** capa (otimizada pelo <Img>, que usa o <Image> do Astro) */
  image: ImageMetadata;
  imageAlt: string;
  entry: BlogEntry;
};

export const PER_PAGE = 9;
const EXCERPT_WORDS = 30;

/** texto puro a partir do Markdown (para o resumo) */
function markdownToText(md: string): string {
  return md
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toExcerpt(text: string): string {
  return text.split(/\s+/).slice(0, EXCERPT_WORDS).join(' ');
}

/** Todos os posts publicados, do mais novo para o mais antigo. */
export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('blog', (e) => !e.data.rascunho);
  const posts = entries.map(
    (entry): Post => ({
      slug: entry.id,
      date: entry.data.data,
      title: entry.data.titulo,
      excerpt: toExcerpt(entry.data.resumo?.trim() || markdownToText(entry.body ?? '')),
      image: entry.data.imagem,
      imageAlt: entry.data.imagemAlt,
      entry,
    }),
  );
  return posts.sort((a, b) => b.date.getTime() - a.date.getTime() || a.slug.localeCompare(b.slug));
}

/** 22/06/2026 */
export function formatDate(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, '0');
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getUTCFullYear()}`;
}

export function postUrl(slug: string): string {
  return `/blog/${slug}/`;
}

/** /blog/ para a página 1, /blog/pagina/2/ em diante */
export function pageUrl(n: number): string {
  return n <= 1 ? '/blog/' : `/blog/pagina/${n}/`;
}

/** larguras para o srcset, sem passar da largura original da imagem */
export function widthsUpTo(max: number, widths: number[]): number[] {
  return [...new Set([...widths.filter((w) => w < max), max])];
}
