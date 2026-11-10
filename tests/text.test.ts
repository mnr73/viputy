import { describe, expect, it } from "vitest";
import {
    fixPersianLetters,
    highlight,
    localizeDigits,
    normalizeText,
    toLatinDigits,
    toPersianDigits
} from "../src/utils/text";

describe("text utils", () => {
    it("converts digits both ways", () => {
        expect(toLatinDigits("۱۴۰۵/٠٨/۲۵")).toBe("1405/08/25");
        expect(toPersianDigits(2450000)).toBe("۲۴۵۰۰۰۰");
        expect(localizeDigits(12, "fa-IR")).toBe("۱۲");
        expect(localizeDigits(12, "en")).toBe("12");
    });
    it("normalizes Arabic letters, ZWNJ and case", () => {
        expect(normalizeText("عليكم")).toBe("علیکم");
        expect(normalizeText("می\u200cخواهم")).toBe("می خواهم");
        expect(normalizeText("  Vue۳ ")).toBe("vue3");
    });
    it("fixPersianLetters keeps length", () => {
        expect(fixPersianLetters("كيف")).toBe("کیف");
        expect(fixPersianLetters("كيف")).toHaveLength(3);
    });
    it("highlight splits around the match", () => {
        expect(highlight("فرانت‌اند", "فر")).toEqual(["", "فر", "انت‌اند"]);
        expect(highlight("Vue", "u")).toEqual(["V", "u", "e"]);
        expect(highlight("Vue", "zz")).toEqual(["Vue", "", ""]);
        expect(highlight("Vue", "")).toEqual(["Vue", "", ""]);
    });
});
