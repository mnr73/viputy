import { toLatinDigits } from "./text";

/** `#RGB`, `#RGBA`, `#RRGGBB` or `#RRGGBBAA` (with or without `#`, any case, Persian digits) -> `#rrggbb[aa]` or null. */
export function normalizeHex(
    input: string | null | undefined,
    alpha = false
): string | null {
    if (!input) return null;
    let s = toLatinDigits(String(input)).trim().replace(/^#/, "").toLowerCase();
    if (!/^[0-9a-f]+$/.test(s)) return null;
    if (s.length === 3 || s.length === 4) s = [...s].map((c) => c + c).join("");
    if (s.length !== 6 && s.length !== 8) return null;
    if (s.length === 8 && !alpha) return null;
    if (s.length === 8 && s.endsWith("ff")) s = s.slice(0, 6);
    return `#${s}`;
}

/** Every character a hex field may hold while the user types (no length check). */
export function cleanHexInput(raw: string, alpha = false): string {
    const s = toLatinDigits(raw)
        .replace(/[^0-9a-fA-F]/g, "")
        .slice(0, alpha ? 8 : 6);
    return s ? `#${s.toUpperCase()}` : "";
}

export interface Rgb {
    r: number;
    g: number;
    b: number;
    a: number;
}

export function hexToRgb(hex: string): Rgb | null {
    const h = normalizeHex(hex, true);
    if (!h) return null;
    const s = h.slice(1);
    const n = (i: number) => parseInt(s.slice(i, i + 2), 16);
    return {
        r: n(0),
        g: n(2),
        b: n(4),
        a: s.length === 8 ? Math.round((n(6) / 255) * 100) / 100 : 1
    };
}

export function rgbToHex({ r, g, b, a = 1 }: Rgb): string {
    const h = (v: number) =>
        Math.max(0, Math.min(255, Math.round(v)))
            .toString(16)
            .padStart(2, "0");
    return `#${h(r)}${h(g)}${h(b)}${a < 1 ? h(a * 255) : ""}`;
}

/** WCAG relative luminance (0 black .. 1 white). */
export function luminance(hex: string): number {
    const c = hexToRgb(hex);
    if (!c) return 0;
    const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}

/** Black or white, whichever reads better on `hex` (for a check mark on a swatch). */
export function readableOn(hex: string): "#000000" | "#ffffff" {
    return luminance(hex) > 0.4 ? "#000000" : "#ffffff";
}

export const DEFAULT_SWATCHES = [
    "#EF4444",
    "#F97316",
    "#F59E0B",
    "#EAB308",
    "#84CC16",
    "#22C55E",
    "#10B981",
    "#14B8A6",
    "#06B6D4",
    "#0EA5E9",
    "#2563EB",
    "#6366F1",
    "#8B5CF6",
    "#A855F7",
    "#EC4899",
    "#F43F5E",
    "#B91C1C",
    "#C2410C",
    "#B45309",
    "#A16207",
    "#4D7C0F",
    "#15803D",
    "#047857",
    "#0F766E",
    "#0E7490",
    "#0369A1",
    "#1D4ED8",
    "#4338CA",
    "#6D28D9",
    "#7E22CE",
    "#BE185D",
    "#BE123C",
    "#FFFFFF",
    "#E5E7EB",
    "#9CA3AF",
    "#6B7280",
    "#4B5563",
    "#374151",
    "#1F2937",
    "#000000"
];
