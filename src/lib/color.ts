/** Lightens a hex color by mixing it with white — used to derive a pastel background tint
 * from a foreground color (e.g. for a category icon's chip background). */
export function tintWithWhite(hex: string, amount = 0.86) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
