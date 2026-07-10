import { Loja } from './types';

const DEFAULT_ICON = 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png';

export function updatePWAManifest(loja: Loja | null) {
  const iconUrl = loja?.pwa_icon_url || DEFAULT_ICON;
  const name = loja?.nome || 'Delivery Whitelabel';
  const shortName = loja ? loja.nome.slice(0, 12) : 'Delivery WL';

  const manifest = {
    name,
    short_name: shortName,
    description: `Cardápio online - ${name}`,
    start_url: loja ? `/#/${loja.slug_url}` : '/',
    scope: '/',
    display: 'standalone',
    background_color: loja?.cor_tema || '#fff7ed',
    theme_color: loja?.cor_tema || '#f97316',
    orientation: 'portrait-primary',
    lang: 'pt-BR',
    icons: [
      { src: iconUrl, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: iconUrl, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };

  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  const blobUrl = URL.createObjectURL(blob);

  let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'manifest';
    document.head.appendChild(link);
  }

  if ((link as any)._blobUrl) {
    URL.revokeObjectURL((link as any)._blobUrl);
  }
  link.href = blobUrl;
  (link as any)._blobUrl = blobUrl;

  // Also update theme-color and apple-touch-icon
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', loja?.cor_tema || '#f97316');

  const appleIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
  if (appleIcon) appleIcon.href = iconUrl;
}
