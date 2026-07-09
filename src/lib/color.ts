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

/** Converts a hex color to an rgba() string at the given alpha — used to derive a secondary
 * tone (muted label, divider) from a theme color like `textOnAccent`, whose actual value
 * (white or near-black) depends on the theme, so a hardcoded white/black rgba can't be reused. */
export function withAlpha(hex: string, alpha: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
