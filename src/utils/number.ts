import { toLatinDigits, toPersianDigits } from "./text";

/**
 * Turns whatever the user typed (Persian/Arabic digits, ٬ , ، separators, ٫,
 * unicode minus) into a plain ASCII number string such as "-1234.5".
 * Keeps in-progress input like "12." or "-" intact. `decimals` caps the fraction.
 */
export function cleanNumber(
    raw: string,
    decimals?: number | null,
    allowNegative = true
): string {
    let s = toLatinDigits(raw)
        .replace(/٫/g, ".")
        .replace(/[−–‐]/g, "-")
        .replace(/[,٬،\s\u00a0]/g, "");
    const neg = allowNegative && s.startsWith("-");
    s = s.replace(/[^\d.]/g, "");
    const dot = s.indexOf(".");
    let int = dot >= 0 ? s.slice(0, dot) : s;
    let frac: string | undefined;
    if (dot >= 0 && decimals !== 0) {
        frac = s.slice(dot + 1).replace(/\./g, "");
        if (decimals != null) frac = frac.slice(0, decimals);
    }
    int = int.replace(/^0+(?=\d)/, "");
    if (int === "" && frac !== undefined) int = "0";
    return (neg ? "-" : "") + int + (frac !== undefined ? "." + frac : "");
}

/** "" and "-" are not numbers yet -> null. */
export function toNumber(clean: string): number | null {
    if (clean === "" || clean === "-") return null;
    const n = Number(clean);
    return Number.isFinite(n) ? n : null;
}

export interface FormatOptions {
    /** Thousands separators. */
    group?: boolean;
    /** Persian digits and separators (۱٬۲۳۴٫۵). */
    persian?: boolean;
}

/** Display form of a cleaned number string. */
export function formatNumber(clean: string, o: FormatOptions = {}): string {
    const neg = clean.startsWith("-");
    const body = neg ? clean.slice(1) : clean;
    const dot = body.indexOf(".");
    let int = dot >= 0 ? body.slice(0, dot) : body;
    const frac = dot >= 0 ? body.slice(dot + 1) : undefined;
    if (o.group) int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    let out = (neg ? "-" : "") + int + (frac !== undefined ? "." + frac : "");
    if (o.persian)
        out = toPersianDigits(out).replace(/,/g, "٬").replace(/\./g, "٫");
    return out;
}

const SIGNIFICANT = /[\d٠-٩۰-۹.٫-]/;

/** Caret position in `after` that sits after the same number of digits as `caret` did in `before`. */
export function caretAfterFormat(
    before: string,
    caret: number,
    after: string
): number {
    let n = 0;
    for (let i = 0; i < caret; i++) if (SIGNIFICANT.test(before[i]!)) n++;
    if (n === 0) return 0;
    for (let i = 0; i < after.length; i++) {
        if (SIGNIFICANT.test(after[i]!) && --n === 0) return i + 1;
    }
    return after.length;
}
