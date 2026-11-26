/**
 * Integração com o WordPress headless (só o blog).
 * Funciona no build (Astro) e no navegador (componentes React).
 *
 * - Endereço do WordPress: SITE.wpUrl em src/config/site.ts (ou PUBLIC_WP_URL no .env, que tem prioridade).
 * - Sem endereço, ou com o WordPress fora do ar no build, usa os posts de src/data/posts-seed.json.
 */
import seed from '../data/posts-seed.json';
import { SITE } from '../config/site';

/** .env (PUBLIC_WP_URL) tem prioridade; senão usa o endereço fixo em src/config/site.ts */
export const WP_URL: string = (import.meta.env.PUBLIC_WP_URL || SITE.wpUrl || '').replace(/\/+$/, '');

export type Post = {
  id: number;
  slug: string;
  date: string;
  title: string;
  /** resumo em texto puro, já cortado em 30 palavras (igual ao site atual) */
  excerpt: string;
  /** HTML do conteúdo (só preenchido quando pedido) */
  content: string;
  image: string | null;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
};

const EXCERPT_WORDS = 30;

const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  laquo: '«',
  raquo: '»',
  ldquo: '“',
  rdquo: '”',
  lsquo: '‘',
  rsquo: '’',
};

/** decodifica entidades HTML (&#8220;, &hellip; …) sem depender do DOM */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return NAMED[code.toLowerCase()] ?? match;
  });
}

export function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function toExcerpt(html: string): string {
  const text = decodeEntities(stripTags(html))
    .replace(/\[…\]|\[\.\.\.\]/g, '')
    .trim();
  return text.split(/\s+/).slice(0, EXCERPT_WORDS).join(' ');
}

/** 22/06/2026 */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export function postUrl(slug: string): string {
  return `/blog/${slug}/`;
}

/* ---------- normalização ---------- */

type WPPost = {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
      media_details?: { width?: number; height?: number };
    }>;
  };
};

function fromWP(p: WPPost): Post {
  const media = p._embedded?.['wp:featuredmedia']?.[0];
  return {
    id: p.id,
    slug: p.slug,
    date: p.date,
    title: decodeEntities(stripTags(p.title.rendered)),
    excerpt: toExcerpt(p.excerpt.rendered),
    content: p.content?.rendered ?? '',
    image: media?.source_url ?? null,
    imageAlt: media?.alt_text ?? '',
    imageWidth: media?.media_details?.width,
    imageHeight: media?.media_details?.height,
  };
}

type SeedPost = (typeof seed)[number];

function fromSeed(p: SeedPost): Post {
  return {
    id: p.id,
    slug: p.slug,
    date: p.date,
    title: p.title,
    excerpt: toExcerpt(p.excerpt),
    content: p.content,
    image: p.image,
    imageAlt: '',
    imageWidth: p.imageWidth,
    imageHeight: p.imageHeight,
  };
}

export const SEED_POSTS: Post[] = seed.map(fromSeed);

/* ---------- consultas ---------- */

export type PostPage = { posts: Post[]; totalPages: number };

const LIST_FIELDS = 'id,slug,date,title,excerpt,_links,_embedded';

async function wpFetch(path: string, params: Record<string, string | number>): Promise<Response> {
  const url = new URL(`${WP_URL}/wp-json/wp/v2/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`WordPress respondeu ${res.status} em ${url.pathname}`);
  return res;
}

/** Lista paginada (para o blog e o bloco "Blog" da Home). */
export async function getPosts(page = 1, perPage = 9): Promise<PostPage> {
  if (!WP_URL) {
    const start = (page - 1) * perPage;
    return {
      posts: SEED_POSTS.slice(start, start + perPage),
      totalPages: Math.max(1, Math.ceil(SEED_POSTS.length / perPage)),
    };
  }
  const res = await wpFetch('posts', {
    _embed: 'wp:featuredmedia',
    _fields: LIST_FIELDS,
    per_page: perPage,
    page,
  });
  const data = (await res.json()) as WPPost[];
  return {
    posts: data.map(fromWP),
    totalPages: Number(res.headers.get('X-WP-TotalPages') ?? 1),
  };
}

/** Um post pelo slug (com conteúdo). */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!WP_URL) return SEED_POSTS.find((p) => p.slug === slug) ?? null;
  const res = await wpFetch('posts', { slug, _embed: 'wp:featuredmedia' });
  const data = (await res.json()) as WPPost[];
  return data[0] ? fromWP(data[0]) : null;
}

/** Todos os posts com conteúdo — usado no build para gerar as páginas estáticas. */
export async function getAllPostsForBuild(): Promise<Post[]> {
  if (!WP_URL) return SEED_POSTS;
  try {
    const all: Post[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await wpFetch('posts', { _embed: 'wp:featuredmedia', per_page: 100, page });
      totalPages = Number(res.headers.get('X-WP-TotalPages') ?? 1);
      all.push(...((await res.json()) as WPPost[]).map(fromWP));
      page++;
    } while (page <= totalPages);
    return all;
  } catch (err) {
    console.warn(`[blog] Não foi possível buscar os posts em ${WP_URL} — usando posts-seed.json.`, err);
    return SEED_POSTS;
  }
}
