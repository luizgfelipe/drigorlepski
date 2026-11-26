#!/usr/bin/env node
/**
 * Baixa as imagens originais do site antigo (WordPress) e salva em public/images
 * com os nomes usados no site novo (ver ASSETS.md).
 *
 * Cada arquivo é conferido (precisa ser uma imagem PNG/JPG de verdade) e RE-CODIFICADO com o sharp:
 * isso descarta metadados e qualquer conteúdo escondido — importante porque o site antigo está com malware.
 *
 * Uso:
 *   npm run baixar-imagens              → baixa as imagens (sobrescreve os placeholders)
 *   npm run baixar-imagens -- --videos  → também baixa os 2 vídeos MP4 para ./videos-originais (para subir no YouTube)
 *
 * Requer Node 18+.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.IMG_BASE || 'https://drigorlepski.com.br/wp-content/uploads/2026/06/';
const PUBLIC = path.join(ROOT, 'public');

/** [arquivo no site antigo, destino em public/] */
const IMAGES = [
  ['Grupo-137.png', 'images/logo.png'],
  ['b-e1782133112685.png', 'images/home-hero-bg.png'],
  ['Componente-3-–-1.png', 'images/home-bio.png'],
  ['Screenshot-2026-05-26-at-15.39.39-e1782134168975.png', 'images/hospital-einstein.png'],
  ['images.png', 'images/hospital-vila-santa-catarina.png'],
  ['icon2.png', 'images/icon-figado.png'],
  ['icon.png', 'images/icon-intestino.png'],
  ['icon3.png', 'images/icon-pancreas.png'],
  ['icon1.png', 'images/icon-multivisceral.png'],
  ['como-funciona-a-hepatectomia-quando-e-indicada-a-cirurgianbsp-destacada.png', 'images/cirurgia-hepato-bilio-pancreatica.png'],
  ['Screenshot-2026-05-27-at-10.22.16.png', 'images/cirurgia-aparelho-digestivo.png'],
  ['Componente-1-–-1-1.png', 'images/review-avatar.png'],
  ['card1.png', 'images/cta-doctor.png'],
  ['salvatore.png', 'images/salvatore.png'],
  ['Retangulo-74.png', 'images/hero-transplantes-bg.png'],
  ['Retangulo-74-1.png', 'images/hero-cirurgias-bg.png'],
  ['istockphoto_1465361950.png', 'images/transplante-figado.png'],
  ['istockphoto_1360862667.png', 'images/transplante-intestino.png'],
  ['istockphoto_1467893187.png', 'images/transplante-pancreas.png'],
  ['IMG_1377.png', 'images/sobre-hero.png'],
  ['Componente-4-–-1.png', 'images/sobre-fotos.png'],
  ['istockphoto_1474957957.png', 'images/blog/istockphoto_1474957957.png'],
  ['adobestock_572577392.png', 'images/blog/adobestock_572577392.png'],
  ['shutterstock_1024477424.png', 'images/blog/shutterstock_1024477424.png'],
];

const VIDEOS = ['Video-apresentacao-Igor-2.mp4', 'Cirurgia-hepato-bilio-pancreatica-1.mp4'];

const MAGIC = {
  png: [0x89, 0x50, 0x4e, 0x47],
  jpg: [0xff, 0xd8, 0xff],
};

async function download(file) {
  const url = BASE + encodeURIComponent(file);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (baixar-imagens drigorlepski)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function isImage(buf) {
  return Object.values(MAGIC).some((sig) => sig.every((b, i) => buf[i] === b));
}

async function save(dest, buf) {
  const full = path.join(PUBLIC, dest);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, buf);
  return full;
}

const kb = (n) => `${Math.round(n / 1024)} KB`;
let ok = 0;
const failed = [];

console.log('Baixando imagens de', BASE, '\n');

let heroSource = null;

for (const [file, dest] of IMAGES) {
  try {
    const raw = await download(file);
    if (!isImage(raw)) throw new Error('o arquivo baixado não é uma imagem PNG/JPG');
    // re-codifica: valida a imagem e remove metadados/conteúdo extra
    const clean = await sharp(raw).png({ compressionLevel: 9, effort: 10 }).toBuffer();
    await save(dest, clean);
    if (file === 'b-e1782133112685.png') heroSource = clean;
    console.log(`  ✓ ${dest.padEnd(48)} ${kb(raw.length)} → ${kb(clean.length)}`);
    ok++;
  } catch (err) {
    failed.push(dest);
    console.log(`  ✗ ${dest.padEnd(48)} ${err.message}`);
  }
}

// favicon (o site antigo tem um fav.png 500×500 que nem estava em uso)
try {
  const raw = await download('fav.png');
  if (!isImage(raw)) throw new Error('não é imagem');
  await save('favicon.png', await sharp(raw).resize(64, 64).png().toBuffer());
  await save('apple-touch-icon.png', await sharp(raw).resize(180, 180).png().toBuffer());
  console.log('  ✓ favicon.png + apple-touch-icon.png');
} catch (err) {
  console.log('  ✗ favicon.png', err.message);
}

// imagem de prévia para WhatsApp/Facebook (1200×630) a partir do fundo da Home
if (heroSource) {
  const og = await sharp(heroSource).resize(1200, 630, { fit: 'cover', position: 'right' }).png({ compressionLevel: 9 }).toBuffer();
  await save('images/og-image.png', og);
  console.log('  ✓ images/og-image.png (gerada a partir do fundo da Home)');
}

if (process.argv.includes('--videos')) {
  console.log('\nBaixando vídeos (≈ 75 MB no total)…');
  const outDir = path.join(ROOT, 'videos-originais');
  await mkdir(outDir, { recursive: true });
  for (const v of VIDEOS) {
    try {
      const buf = await download(v);
      await writeFile(path.join(outDir, v), buf);
      console.log(`  ✓ videos-originais/${v} (${Math.round(buf.length / 1048576)} MB)`);
    } catch (err) {
      console.log(`  ✗ ${v}: ${err.message}`);
    }
  }
  console.log('  → suba esses vídeos no YouTube como "Não listado" e cole os IDs em src/config/site.ts');
}

console.log(`\n${ok}/${IMAGES.length} imagens baixadas.`);
if (failed.length) {
  console.log('Falharam:', failed.join(', '));
  process.exitCode = 1;
}
