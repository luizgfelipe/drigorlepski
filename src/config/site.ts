/**
 * Dados centrais do site. Mude aqui e o site inteiro atualiza.
 */

export const SITE = {
  name: 'Dr. Igor Lepski Calil',
  titleSuffix: 'Dr Igor Lepski',
  defaultTitle: 'Dr Igor Lepski – Cirurgião do aparelho digestivo e transplantes',
  description:
    'Dr. Igor Lepski Calil — Cirurgião do Aparelho Digestivo e Transplante de Órgãos Abdominais. Atendimento presencial em São Paulo e online.',
  url: 'https://drigorlepski.com.br',
  locale: 'pt_BR',

  /** Google Tag Manager (mesmo ID do site atual) */
  gtmId: 'GTM-PDJRHLZ3',

  /**
   * Kit do Adobe Fonts (Typekit) com as fontes akagi-pro e haboro-soft-extended.
   * É o kit usado hoje no site. Ele pertence à conta Adobe de quem criou o site:
   * confirme com a agência se pode ser reutilizado (ou gere um kit novo e troque o ID).
   */
  typekitId: 'orb8hga',

  /** Link do WhatsApp (rastreador tintim, o mesmo usado hoje em todos os botões) */
  whatsappUrl:
    'https://tintim.link/whatsapp/e4b416da-27c4-411c-a661-310b71571c20/7f1bf3d0-64aa-4ab2-95b7-2026f8bb752a',
  phoneDisplay: '(11) 91892-0208',
  instagramUrl: 'https://www.instagram.com/drigorlepskicalil/',

  addresses: [
    'Rua Atlântica, 337 - Jardim America São Paulo - SP, 01440-000',
    'Av. Brasil, 2016 - Jardim America São Paulo - SP, 01430-001',
  ],

  crm: 'CRM-SP 130079 · RQE 100065/100066',

  /**
   * IDs dos vídeos no YouTube (não listados).
   * Cole só o ID — ex.: em https://www.youtube.com/watch?v=AbCdEf12345 o ID é "AbCdEf12345".
   * Enquanto estiver vazio, aparece a imagem de capa com o botão de play desativado.
   */
  youtube: {
    apresentacao: '', // Home e Sobre — "Video-apresentacao-Igor-2.mp4"
    hepatoBilioPancreatica: '', // Página Cirurgia Hepato-Bílio-Pancreática
  },
} as const;

export type NavItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

export const NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Sobre', href: '/sobre/' },
  {
    label: 'Transplantes',
    children: [
      { label: 'Transplante de Fígado', href: '/transplante-de-figado/' },
      { label: 'Transplante de Intestino', href: '/transplante-de-intestino/' },
      { label: 'Transplante de Pâncreas', href: '/transplante-de-pancreas/' },
      { label: 'Transplante Multivisceral', href: '/transplante-multivisceral/' },
    ],
  },
  {
    label: 'Cirurgias',
    children: [
      { label: 'Cirurgia do Aparelho Digestivo', href: '/cirurgia-do-aparelho-digestivo/' },
      { label: 'Cirurgia Hepato-Bílio-Pancreática', href: '/cirurgia-hepato-bilio-pancreatica/' },
    ],
  },
  { label: 'Blog', href: '/blog/' },
  { label: 'Contato', href: '/contato/' },
];

/** Caminho das imagens (pasta public/images). Veja ASSETS.md para a lista completa. */
export const img = (file: string) => `/images/${file}`;
