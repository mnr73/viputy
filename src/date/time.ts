import { toLatinDigits } from "../utils/text";
import { digits } from "./format";

const pad = (n: number) => String(n).padStart(2, "0");

/** Seconds of day -> `HH:mm` or `HH:mm:ss` (24-hour, ASCII). The value format of ViTime. */
export function toTimeString(sec: number, withSeconds = false): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${pad(h)}:${pad(m)}` + (withSeconds ? `:${pad(sec % 60)}` : "");
}

/** `HH:mm[:ss]` (ASCII, 24-hour) -> seconds of day, or null. */
export function fromTimeString(text: string | null | undefined): number | null {
    const m = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec((text ?? "").trim());
    if (!m) return null;
    return build(Number(m[1]), Number(m[2]), Number(m[3] ?? 0));
}

function build(h: number, m: number, s: number): number | null {
    if (h > 23 || m > 59 || s > 59) return null;
    return h * 3600 + m * 60 + s;
}

/**
 * Lenient parser for what users type: `14:30`, `۱۴:۳۰`, `2:30 pm`, `۰۲:۳۰ ب.ظ`,
 * `14.30`, `14:30:15`.
 */
export function parseTime(text: string): number | null {
    const t = toLatinDigits(text)
        .trim()
        .toLowerCase()
        .replace(/ق\.?\s*ظ\.?/g, "am")
        .replace(/ب\.?\s*ظ\.?/g, "pm");
    const m = /^(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?\s*(am|pm|a|p)?$/.exec(t);
    if (!m) return null;
    let h = Number(m[1]);
    const period = m[4]?.[0];
    if (period) {
        if (h < 1 || h > 12) return null;
        h = (h % 12) + (period === "p" ? 12 : 0);
    }
    return build(h, Number(m[2]), Number(m[3] ?? 0));
}

export interface TimeFormatOptions {
    seconds?: boolean;
    hour12?: boolean;
    locale?: string;
}

/** Display text for a time of day: `۱۴:۳۰`, `۰۲:۳۰ ب.ظ`, `09:45:30`. */
export function formatTime(sec: number, o: TimeFormatOptions = {}): string {
    const locale = o.locale ?? "en";
    const h = Math.floor(sec / 3600);
    const hour = o.hour12 ? h % 12 || 12 : h;
    let out = `${pad(hour)}:${pad(Math.floor((sec % 3600) / 60))}`;
    if (o.seconds) out += `:${pad(sec % 60)}`;
    out = digits(out, locale);
    if (o.hour12) {
        const fa = locale.startsWith("fa");
        out += " " + (h < 12 ? (fa ? "ق.ظ" : "AM") : fa ? "ب.ظ" : "PM");
    }
    return out;
}
