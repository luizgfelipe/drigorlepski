/**
 * Imagens do site (src/assets/images/). Passam pelo otimizador do Astro no build:
 * viram WebP, ganham versões menores para o celular e nome com hash (cache longo).
 *
 * - <Img src={asset('logo.png')} … /> para imagens no HTML (src/components/Img.astro)
 * - await bgImage('home-hero-bg.png') para imagens de fundo (CSS background-image)
 */
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
});

/** imagem de src/assets/images/ pelo nome do arquivo */
export function asset(name: string): ImageMetadata {
  const file = files[`../assets/images/${name}`];
  if (!file) throw new Error(`Imagem não encontrada: src/assets/images/${name}`);
  return file.default;
}

/** URL otimizada (WebP) para usar em background-image */
export async function bgImage(name: string): Promise<string> {
  const { src } = await getImage({ src: asset(name), format: 'webp' });
  return src;
}
