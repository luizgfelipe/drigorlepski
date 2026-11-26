/**
 * Layout de um artigo. Usado de duas formas:
 *  - no build ([slug].astro): renderizado como HTML estático, sem JavaScript
 *  - na página coringa (PostLoader): renderizado no navegador para posts publicados depois do último deploy
 */
import type { Post } from '../../lib/wp';
import './post.css';

type Props = { post: Post; html: string };

export default function PostView({ post, html }: Props) {
  return (
    <article>
      <section className="section post-hero">
        <div className="container">
          <div className="col w-100">
            <div className="col-inner">
              <div className="post-eyebrow" aria-hidden="true">
                <p className="post-eyebrow__text">Blog</p>
                <span className="post-eyebrow__line" />
              </div>
              <h1 className="post-hero__title">{post.title}</h1>
              {post.image && (
                <div className="post-hero__image">
                  <img
                    src={post.image}
                    alt={post.imageAlt}
                    width={post.imageWidth}
                    height={post.imageHeight}
                    decoding="async"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="section post-body">
        <div className="container">
          <div className="col w-100">
            <div className="col-inner">
              <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
