/**
 * Blog: posts em Markdown dentro do projeto (src/content/blog/*.md).
 * Tudo é resolvido no build — o site final não chama nenhuma API.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import sharp from 'sharp';
import { join } from 'node:path';

export type BlogEntry = CollectionEntry<'blog'>;

export type Post = {
  slug: string;
  date: Date;
  title: string;
  /** resumo em texto puro (30 palavras, igual ao site antigo) */
  excerpt: string;
  image: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
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

const sizeCache = new Map<string, { width?: number; height?: number }>();

/** largura/altura da capa (evita a página "pular" enquanto a imagem carrega) */
async function imageSize(src: string): Promise<{ width?: number; height?: number }> {
  if (!sizeCache.has(src)) {
    try {
      const file = join(process.cwd(), 'public', src);
      const { width, height } = await sharp(file).metadata();
      sizeCache.set(src, { width, height });
    } catch {
      console.warn(`[blog] Imagem não encontrada em public${src}`);
      sizeCache.set(src, {});
    }
  }
  return sizeCache.get(src)!;
}

/** Todos os posts publicados, do mais novo para o mais antigo. */
export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('blog', (e) => !e.data.rascunho);
  const posts = await Promise.all(
    entries.map(async (entry) => {
      const { width, height } = await imageSize(entry.data.imagem);
      return {
        slug: entry.id,
        date: entry.data.data,
        title: entry.data.titulo,
        excerpt: toExcerpt(entry.data.resumo?.trim() || markdownToText(entry.body ?? '')),
        image: entry.data.imagem,
        imageAlt: entry.data.imagemAlt,
        imageWidth: width,
        imageHeight: height,
        entry,
      } satisfies Post;
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
