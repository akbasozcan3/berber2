const DEFAULT_LOADING_COLOR = "#C8703A";

export function normalizeHexColor(input: string | undefined | null, fallback = DEFAULT_LOADING_COLOR): string {
  const trimmed = (input || "").trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return fallback.toUpperCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHexColor(hex);
  const match = normalized.match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i);
  if (!match) return null;
  return {
    r: Number.parseInt(match[1], 16),
    g: Number.parseInt(match[2], 16),
    b: Number.parseInt(match[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

export function mixHexColor(hex: string, target: "#000000" | "#FFFFFF", ratio: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return DEFAULT_LOADING_COLOR;

  const targetRgb =
    target === "#000000" ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
  const amount = Math.max(0, Math.min(1, ratio));

  return rgbToHex(
    rgb.r + (targetRgb.r - rgb.r) * amount,
    rgb.g + (targetRgb.g - rgb.g) * amount,
    rgb.b + (targetRgb.b - rgb.b) * amount,
  );
}

export function buildRouteProgressTheme(loadingColor: string) {
  const base = normalizeHexColor(loadingColor);
  return {
    base,
    dark: mixHexColor(base, "#000000", 0.28),
    light: mixHexColor(base, "#FFFFFF", 0.42),
    glow: `${base}73`,
  };
}

export const LOADING_COLOR_PRESETS = [
  { label: "Bakır", value: "#C8703A" },
  { label: "Altın", value: "#D4A574" },
  { label: "Bordo", value: "#9E3A2E" },
  { label: "Lacivert", value: "#3B6EA8" },
  { label: "Zümrüt", value: "#3A8F6E" },
  { label: "Mor", value: "#7B4FA3" },
] as const;

export { DEFAULT_LOADING_COLOR };
