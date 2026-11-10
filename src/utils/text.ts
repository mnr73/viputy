const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Persian/Arabic-Indic digits -> ASCII. Use before parsing user input. */
export function toLatinDigits(s: string): string {
    return s.replace(/[۰-۹٠-٩]/g, (c) => {
        const i = FA_DIGITS.indexOf(c);
        return String(i >= 0 ? i : AR_DIGITS.indexOf(c));
    });
}

/** ASCII digits -> Persian digits. Display only; never send to a server. */
export function toPersianDigits(s: string | number): string {
    return String(s).replace(/\d/g, (d) => FA_DIGITS[Number(d)]!);
}

/** Digits in the given locale (Persian digits for fa, unchanged otherwise). */
export function localizeDigits(s: string | number, locale: string): string {
    return locale.startsWith("fa") ? toPersianDigits(s) : String(s);
}

/**
 * Canonical form for searching/comparing Persian text: Arabic ي/ك -> ی/ک,
 * digits -> ASCII, diacritics/kashida removed, ZWNJ -> space, lowercase.
 */
export function normalizeText(s: string): string {
    return toLatinDigits(s)
        .replace(/ي/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
        .replace(/\u200c/g, " ")
        .toLowerCase()
        .trim();
}

/** Arabic ي/ك (and ە/ۀ-style variants are left alone) -> Persian ی/ک. Same length, safe on a live caret. */
export function fixPersianLetters(s: string): string {
    return s.replace(/ي/g, "ی").replace(/ك/g, "ک");
}

/**
 * Split `text` around the first match of `query` (Persian-normalized) so a
 * list item can bold it. Returns [text, "", ""] when nothing can be marked.
 */
export function highlight(
    text: string,
    query: string
): [string, string, string] {
    const q = normalizeText(query);
    const n = normalizeText(text);
    if (!q || n.length !== text.length) return [text, "", ""];
    const i = n.indexOf(q);
    if (i < 0) return [text, "", ""];
    return [
        text.slice(0, i),
        text.slice(i, i + q.length),
        text.slice(i + q.length)
    ];
}
