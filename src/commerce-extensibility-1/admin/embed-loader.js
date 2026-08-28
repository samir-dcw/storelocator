import { createEmbedConfig } from '../actions/_shared/embed.js';

export function renderMagazineEmbed(host, props) {
  const config = createEmbedConfig(props);
  const root = typeof host === 'string' ? document.querySelector(host) : host;
  if (!root) throw new Error('Embed host not found');
  root.innerHTML = `<div data-magazine-embed="true"><pre>${JSON.stringify(config, null, 2)}</pre></div>`;
  return config;
}
