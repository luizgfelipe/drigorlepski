/**
 * Grade de posts do blog.
 * Vem renderizada do build (bom para SEO) e, no navegador, busca a lista atualizada
 * direto da API do WordPress — post novo aparece sem precisar de deploy.
 */
import { useEffect, useState } from 'react';
import { getPosts, formatDate, postUrl, WP_URL, type Post } from '../../lib/wp';
import './blog.css';

type Props = {
  initialPosts: Post[];
  initialTotalPages?: number;
  perPage?: number;
  /** mostra a paginação numérica (página /blog) */
  paginate?: boolean;
};

export default function BlogGrid({ initialPosts, initialTotalPages = 1, perPage = 9, paginate = false }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!WP_URL) return; // sem WordPress configurado: fica com os posts do build
    let cancelled = false;
    setLoading(true);
    getPosts(page, perPage)
      .then((res) => {
        if (cancelled) return;
        setPosts(res.posts);
        setTotalPages(res.totalPages);
      })
      .catch((err) => console.warn('[blog] Falha ao atualizar posts:', err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, perPage]);

  if (!posts.length) {
    return <p className="posts-status">{loading ? 'Carregando artigos…' : 'Nenhum artigo publicado ainda.'}</p>;
  }

  return (
    <div aria-busy={loading}>
      <div className="posts-grid">
        {posts.map((post) => (
          <article className="post-card" key={post.id}>
            <a className="post-card__thumb" href={postUrl(post.slug)} tabIndex={-1} aria-hidden="true">
              {post.image && <img src={post.image} alt={post.imageAlt} loading="lazy" decoding="async" />}
            </a>
            <div className="post-card__text">
              <h3 className="post-card__title">
                <a href={postUrl(post.slug)}>{post.title}</a>
              </h3>
              <div className="post-card__meta">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </div>
              <div className="post-card__excerpt">
                <p>{post.excerpt}</p>
              </div>
              <a className="post-card__more" href={postUrl(post.slug)} aria-label={`Ler mais: ${post.title}`}>
                Ler mais »
              </a>
            </div>
          </article>
        ))}
      </div>

      {paginate && totalPages > 1 && (
        <nav className="posts-pagination" aria-label="Páginas do blog">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === page ? 'page' : undefined}
              onClick={() => {
                setPage(n);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {n}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
