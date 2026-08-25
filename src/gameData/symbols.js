export const SYMBOLS = {
  ATTACK: '🔺',
  BLOCK: '🔹',
  PURPLE: '🟣',
  GREEN: '🟩',
  STAR: '⭐️'
};

// Soft tints mixed into card backgrounds (keeps the dark base readable).
const SYMBOL_RGB = {
  [SYMBOLS.ATTACK]: [196, 52, 42],
  [SYMBOLS.BLOCK]: [46, 120, 196],
  [SYMBOLS.PURPLE]: [142, 68, 173],
  [SYMBOLS.GREEN]: [39, 160, 82],
  [SYMBOLS.STAR]: [214, 168, 42],
};

function normalizeSymbol(symbol) {
  if (!symbol) return '';
  return [...String(symbol)]
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code !== 0xfe0f && code !== 0xfe0e && code !== 0x200d;
    })
    .join('');
}

const NORMALIZED_SYMBOL_RGB = Object.fromEntries(
  Object.entries(SYMBOL_RGB).map(([symbol, rgb]) => [normalizeSymbol(symbol), rgb])
);

function rgba([r, g, b], alpha) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function uniqueSymbolColors(symbols = []) {
  const colors = [];
  const seen = new Set();
  for (const symbol of symbols) {
    const rgb = NORMALIZED_SYMBOL_RGB[normalizeSymbol(symbol)];
    if (!rgb) continue;
    const key = rgb.join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    colors.push(rgb);
  }
  return colors;
}

export function getCardSymbolGradient(symbols = []) {
  const colors = uniqueSymbolColors(symbols);
  if (colors.length === 0) return 'none';
  if (colors.length === 1) {
    return `linear-gradient(160deg, ${rgba(colors[0], 0.42)} 0%, ${rgba(colors[0], 0.12)} 48%, transparent 78%)`;
  }
  const last = colors.length - 1;
  const stops = colors.map((rgb, index) => `${rgba(rgb, 0.34)} ${Math.round((index / last) * 100)}%`);
  return `linear-gradient(135deg, ${stops.join(', ')})`;
}

export function getCardSymbolGradientStyle(symbols = []) {
  return { '--card-symbol-gradient': getCardSymbolGradient(symbols) };
}
