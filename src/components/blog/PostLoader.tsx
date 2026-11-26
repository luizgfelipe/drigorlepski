/**
 * Página "coringa" do blog: atende qualquer /blog/<slug>/ que ainda não tenha página estática
 * (posts publicados depois do último deploy). Lê o slug da URL e busca o post na API do WordPress.
 */
import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { getPostBySlug, type Post } from '../../lib/wp';
import PostView from './PostView';
import './post.css';

export default function PostLoader() {
  const [state, setState] = useState<{ status: 'loading' | 'ok' | 'notfound'; post?: Post; html?: string }>({
    status: 'loading',
  });

  useEffect(() => {
    const slug = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() ?? '');
    if (!slug || slug === 'post') {
      setState({ status: 'notfound' });
      return;
    }
    getPostBySlug(slug)
      .then((post) => {
        if (!post) return setState({ status: 'notfound' });
        document.title = `${post.title} – Dr Igor Lepski`;
        setState({ status: 'ok', post, html: DOMPurify.sanitize(post.content) });
      })
      .catch(() => setState({ status: 'notfound' }));
  }, []);

  if (state.status === 'loading') return <p className="post-status">Carregando artigo…</p>;
  if (state.status === 'notfound' || !state.post)
    return (
      <p className="post-status">
        Artigo não encontrado. <a href="/blog/">Ver todos os artigos</a>
      </p>
    );
  return <PostView post={state.post} html={state.html ?? ''} />;
}
