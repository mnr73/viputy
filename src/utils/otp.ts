import { toLatinDigits } from "./text";

export type OtpType = "number" | "alphanumeric" | "text";

/** Characters one box accepts. `number`: digits (Persian/Arabic digits are turned into ASCII). */
export function otpPattern(type: OtpType): RegExp {
    return type === "number"
        ? /^[0-9]$/
        : type === "alphanumeric"
          ? /^[0-9A-Za-z]$/
          : /^\S$/u;
}

/**
 * What the user typed or pasted, cleaned: ASCII digits, no spaces/dashes, only allowed characters, cut to
 * `length`. A pasted "۱۲۳-۴۵۶" becomes "123456".
 */
export function cleanOtp(raw: string, type: OtpType, length: number): string {
    const ok = otpPattern(type);
    const out: string[] = [];
    for (const ch of Array.from(toLatinDigits(raw ?? ""))) {
        if (!ok.test(ch)) continue; // drops spaces, dashes, letters in `number`
        out.push(ch);
        if (out.length >= length) break;
    }
    return out.join("");
}

/** The code as one box per character: `["1","2","",""]`. */
export function otpCells(
    value: string | null | undefined,
    length: number
): string[] {
    const chars = Array.from(value ?? "");
    return Array.from({ length }, (_, i) => chars[i] ?? "");
}

/**
 * Value after `ch` is typed into box `i`. A box that is already full is replaced; a gap before `i` is not
 * allowed (typing in box 4 of an empty code fills from the first free box), so the code never has holes.
 */
export function setCell(
    value: string,
    i: number,
    ch: string,
    length: number
): string {
    const cells = otpCells(value, length);
    const at = Math.min(
        i,
        cells.findIndex((c) => c === "") === -1
            ? i
            : cells.findIndex((c) => c === "")
    );
    cells[at] = ch;
    return cells.join("").slice(0, length);
}

/** Value after Backspace in box `i`: clears box `i` if it has a character, else the one before it. */
export function backspaceAt(
    value: string,
    i: number,
    length: number
): { value: string; focus: number } {
    const cells = otpCells(value, length);
    const target = cells[i] ? i : Math.max(0, i - 1);
    cells.splice(target, 1);
    cells.push("");
    return { value: cells.join(""), focus: target };
}

/** Value after Delete in box `i`: removes that character and shifts the rest left. */
export function deleteAt(value: string, i: number, length: number): string {
    const cells = otpCells(value, length);
    cells.splice(i, 1);
    cells.push("");
    return cells.join("");
}
