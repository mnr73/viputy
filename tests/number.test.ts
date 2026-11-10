import { describe, expect, it } from "vitest";
import {
    caretAfterFormat,
    cleanNumber,
    formatNumber,
    toNumber
} from "../src/utils/number";

describe("cleanNumber", () => {
    it("accepts Persian digits and separators", () => {
        expect(cleanNumber("۲٬۴۵۰٬۰۰۰")).toBe("2450000");
        expect(cleanNumber("۱۲٫۵")).toBe("12.5");
        expect(cleanNumber("1,234.50")).toBe("1234.50");
    });
    it("keeps in-progress input", () => {
        expect(cleanNumber("12.")).toBe("12.");
        expect(cleanNumber("-")).toBe("-");
        expect(cleanNumber(".5")).toBe("0.5");
    });
    it("strips junk, leading zeros and extra dots", () => {
        expect(cleanNumber("abc1x2")).toBe("12");
        expect(cleanNumber("007")).toBe("7");
        expect(cleanNumber("1.2.3")).toBe("1.23");
        expect(cleanNumber("0")).toBe("0");
    });
    it("honours decimals and sign rules", () => {
        expect(cleanNumber("1.2345", 2)).toBe("1.23");
        expect(cleanNumber("1.5", 0)).toBe("1");
        expect(cleanNumber("-5", null, false)).toBe("5");
        expect(cleanNumber("−5")).toBe("-5");
    });
});

describe("toNumber / formatNumber", () => {
    it("toNumber", () => {
        expect(toNumber("")).toBeNull();
        expect(toNumber("-")).toBeNull();
        expect(toNumber("12.5")).toBe(12.5);
    });
    it("groups and localizes", () => {
        expect(formatNumber("2450000", { group: true })).toBe("2,450,000");
        expect(formatNumber("-1234.5", { group: true })).toBe("-1,234.5");
        expect(formatNumber("2450000", { group: true, persian: true })).toBe(
            "۲٬۴۵۰٬۰۰۰"
        );
        expect(formatNumber("12.5", { persian: true })).toBe("۱۲٫۵");
        expect(formatNumber("12.", { group: true })).toBe("12.");
    });
    it("round-trips through clean", () => {
        for (const n of ["0", "1234567", "-98765.43", "100"]) {
            const shown = formatNumber(n, { group: true, persian: true });
            expect(cleanNumber(shown)).toBe(n);
        }
    });
});

describe("caretAfterFormat", () => {
    it("keeps the caret after the same digit when a separator appears", () => {
        // typed "1234" (caret 4) -> "1,234": caret should be 5
        expect(caretAfterFormat("1234", 4, "1,234")).toBe(5);
        // caret after first digit stays after first digit
        expect(caretAfterFormat("1234", 1, "1,234")).toBe(1);
        expect(caretAfterFormat("", 0, "")).toBe(0);
    });
});
