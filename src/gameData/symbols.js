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

function rgb([r, g, b]) {
  return `rgb(${r}, ${g}, ${b})`;
}

function mixRgb(colors) {
  const sum = colors.reduce(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0]
  );
  return sum.map((value) => Math.round(value / colors.length));
}

function lightenRgb([r, g, b], amount) {
  return [
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(b + (255 - b) * amount),
  ];
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
    return `linear-gradient(160deg, ${rgba(colors[0], 0.58)} 0%, ${rgba(colors[0], 0.22)} 55%, ${rgba(colors[0], 0.08)} 100%)`;
  }
  const last = colors.length - 1;
  const stops = colors.map((rgb, index) => `${rgba(rgb, 0.5)} ${Math.round((index / last) * 100)}%`);
  return `linear-gradient(135deg, ${stops.join(', ')})`;
}

export function getCardSymbolGradientStyle(symbols = []) {
  const gradient = getCardSymbolGradient(symbols);
  const colors = uniqueSymbolColors(symbols);
  const style = {
    '--card-symbol-gradient': gradient,
    ...(gradient === 'none' ? {} : { backgroundImage: gradient }),
  };

  if (colors.length > 0) {
    const mixed = mixRgb(colors);
    style['--card-symbol-border'] = rgb(mixed);
    style['--card-symbol-border-hover'] = rgb(lightenRgb(mixed, 0.22));
  }

  return style;
}
