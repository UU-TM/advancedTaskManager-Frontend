import type { CSSProperties } from "react";
import type { Board } from "@/types/domain";

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

export type AmbientTone = {
  /** Hue source. Mixed into light or dark surfaces. */
  accent: string;
  /** Dark glass when the background itself is dark. */
  dark: boolean;
};

export type AmbientPalette = {
  card: string;
  list: string;
  chrome: string;
  fg: string;
  muted: string;
  mutedFg: string;
  border: string;
  background: string;
};

const INK: RGB = { r: 14, g: 24, b: 21 };
const WHITE: RGB = { r: 255, g: 255, b: 255 };

/** Memorable hues for the shipped photos. Sampling the file often lands on gray. */
const PHOTO_TONE: Record<string, AmbientTone> = {
  "/board-backgrounds/shore.jpg": { accent: "#1f8b96", dark: false },
  "/board-backgrounds/forest.jpg": { accent: "#3e6a4c", dark: false },
  "/board-backgrounds/peaks.jpg": { accent: "#7d8b86", dark: false },
  "/board-backgrounds/lake.jpg": { accent: "#1c7f9c", dark: false },
  "/board-backgrounds/mist.jpg": { accent: "#6d8c86", dark: false },
  "/board-backgrounds/dunes.jpg": { accent: "#c4a15c", dark: false },
  "/board-backgrounds/canyon.jpg": { accent: "#e15a32", dark: false },
  "/board-backgrounds/rim.jpg": { accent: "#c47a45", dark: false },
  "/board-backgrounds/autumn.jpg": { accent: "#c4622a", dark: true },
  "/board-backgrounds/meadow.jpg": { accent: "#8b4db8", dark: false },
  "/board-backgrounds/night.jpg": { accent: "#243056", dark: true },
  "/board-backgrounds/aurora.jpg": { accent: "#178a4a", dark: true },
  "/board-backgrounds/paper-grid.svg": { accent: "#8aa399", dark: false },
  "/board-backgrounds/teal-dots.svg": { accent: "#3d9a90", dark: false },
  "/board-backgrounds/contour.svg": { accent: "#6d8c86", dark: false },
  "/board-backgrounds/dusk-waves.svg": { accent: "#14645c", dark: true },
};

const GRADIENT_TONE: Record<string, AmbientTone> = {
  lagoon: { accent: "#3d9a90", dark: false },
  meadow: { accent: "#7ea36a", dark: false },
  dune: { accent: "#d7b48a", dark: false },
  dusk: { accent: "#14645c", dark: true },
  ember: { accent: "#e08a4a", dark: false },
  fog: { accent: "#8aa399", dark: false },
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string): RGB | null {
  const raw = hex.trim().replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw.length === 8
        ? raw.slice(0, 6)
        : raw;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const c = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mix(a: RGB, b: RGB, amountOfB: number): RGB {
  const t = clamp(amountOfB, 0, 1);
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  if (h < 0) h += 6;
  return { h: h * 60, s, l };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function relLum(rgb: RGB): number {
  const lin = (n: number) => {
    const s = n / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
}

function contrast(a: RGB, b: RGB): number {
  const l1 = relLum(a);
  const l2 = relLum(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** A mid pigment so pale swatches and neon ones both tint surfaces. */
function pigment(hex: string): RGB {
  const rgb = hexToRgb(hex) ?? { r: 90, g: 130, b: 120 };
  const hsl = rgbToHsl(rgb);
  if (hsl.s < 0.22) {
    hsl.s = Math.min(hsl.s, 0.1);
    hsl.l = clamp(hsl.l, 0.5, 0.78);
    return hslToRgb(hsl);
  }
  hsl.s = clamp(hsl.s, 0.38, 0.78);
  hsl.l = clamp(hsl.l, 0.36, 0.5);
  return hslToRgb(hsl);
}

const LIGHT_FG = hexToRgb("#14201c")!;
const DARK_FG = hexToRgb("#f4f7f5")!;

/** Ink for text that sits on the wallpaper itself, not on a card or list. */
export function wallpaperInk(dark: boolean): string {
  return dark ? "#f4f7f5" : "#14201c";
}

export function ambientPalette(accent: string, dark: boolean): AmbientPalette {
  const tint = pigment(accent);
  if (dark) {
    let cardMix = 0.4;
    let card = mix(INK, tint, cardMix);
    while (contrast(card, DARK_FG) < 4.6 && cardMix > 0.12) {
      cardMix -= 0.04;
      card = mix(INK, tint, cardMix);
    }
    let listMix = Math.min(0.62, cardMix + 0.16);
    let list = mix(INK, tint, listMix);
    while (contrast(list, DARK_FG) < 4.6 && listMix > cardMix) {
      listMix -= 0.03;
      list = mix(INK, tint, listMix);
    }
    // Navy-on-navy photos barely move the mix. Lift the card so it sits above the list.
    const gap =
      Math.abs(card.r - list.r) + Math.abs(card.g - list.g) + Math.abs(card.b - list.b);
    if (gap < 40) {
      const lifted = mix(card, { r: 176, g: 190, b: 184 }, 0.28);
      if (contrast(lifted, DARK_FG) >= 4.6) card = lifted;
    }
    return {
      card: rgbToHex(card),
      list: rgbToHex(list),
      chrome: rgbToHex(mix(INK, tint, cardMix * 0.85)),
      fg: "#f4f7f5",
      muted: rgbToHex(mix(INK, tint, Math.max(0.16, cardMix - 0.08))),
      mutedFg: "#c5d4ce",
      border: rgbToHex(mix({ r: 46, g: 64, b: 58 }, tint, 0.35)),
      background: rgbToHex(mix(INK, tint, 0.22)),
    };
  }

  let cardMix = 0.3;
  let card = mix(WHITE, tint, cardMix);
  while (contrast(card, LIGHT_FG) < 4.6 && cardMix > 0.08) {
    cardMix -= 0.03;
    card = mix(WHITE, tint, cardMix);
  }
  let listMix = Math.min(0.62, cardMix + 0.26);
  let list = mix(WHITE, tint, listMix);
  while (contrast(list, LIGHT_FG) < 4.6 && listMix > cardMix) {
    listMix -= 0.03;
    list = mix(WHITE, tint, listMix);
  }
  return {
    card: rgbToHex(card),
    list: rgbToHex(list),
    chrome: rgbToHex(mix(WHITE, tint, Math.min(0.4, cardMix + 0.08))),
    fg: "#14201c",
    muted: rgbToHex(mix(WHITE, tint, Math.min(0.48, cardMix + 0.14))),
    mutedFg: "#3d524b",
    border: rgbToHex(mix(WHITE, tint, Math.min(0.5, cardMix + 0.16))),
    background: rgbToHex(mix(WHITE, tint, 0.12)),
  };
}

export function boardAmbientTone(
  board: Pick<Board, "backgroundType" | "backgroundValue"> | null | undefined,
): AmbientTone | null {
  const type = board?.backgroundType;
  const value = board?.backgroundValue?.trim();
  if (!type || !value) return null;

  if (type === "COLOR") {
    if (!hexToRgb(value)) return null;
    const { l } = rgbToHsl(hexToRgb(value)!);
    return { accent: value, dark: l < 0.42 };
  }
  if (type === "GRADIENT") return GRADIENT_TONE[value] ?? null;
  if (type === "IMAGE") return PHOTO_TONE[value.toLowerCase()] ?? null;
  return null;
}

/** Tokens for cards, chrome, and the sidebar when a board has its own background. */
export function ambientSurfaceVars(
  tone: AmbientTone,
  themeDark: boolean,
): CSSProperties {
  const palette = ambientPalette(tone.accent, themeDark || tone.dark);
  return {
    "--card": palette.card,
    "--card-foreground": palette.fg,
    "--popover": palette.card,
    "--popover-foreground": palette.fg,
    "--foreground": palette.fg,
    "--background": palette.background,
    "--kanban-list-bg": palette.list,
    "--muted": palette.muted,
    "--muted-foreground": palette.mutedFg,
    "--border": palette.border,
    "--input": palette.border,
    "--secondary": palette.list,
    "--secondary-foreground": palette.fg,
    "--sidebar": palette.card,
    "--sidebar-foreground": palette.fg,
    "--sidebar-accent": palette.muted,
    "--sidebar-accent-foreground": palette.fg,
    "--sidebar-border": palette.border,
    "--kanban-add-list-bg": palette.list,
    "--board-chrome": palette.chrome,
    color: palette.fg,
  } as CSSProperties;
}

/** CSS variables scoped to the board shell. Undefined when the board has no background. */
export function boardAmbientVars(
  board: Pick<Board, "backgroundType" | "backgroundValue"> | null | undefined,
  themeDark: boolean,
): CSSProperties | undefined {
  const tone = boardAmbientTone(board);
  if (!tone) return undefined;
  return ambientSurfaceVars(tone, themeDark);
}
