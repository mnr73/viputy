import { describe, expect, it } from "vitest";
import {
    DEFAULT_SWATCHES,
    hexToRgb,
    normalizeHex,
    readableOn,
    rgbToHex
} from "../src";
import { cleanHexInput } from "../src/utils/color";
import {
    backspaceAt,
    cleanOtp,
    deleteAt,
    otpCells,
    setCell
} from "../src/utils/otp";

describe("otp utils", () => {
    it("cleanOtp keeps allowed characters, turns Persian digits into ASCII, cuts to length", () => {
        expect(cleanOtp("۱۲۳-۴۵۶", "number", 6)).toBe("123456");
        expect(cleanOtp(" 12 34 ", "number", 6)).toBe("1234");
        expect(cleanOtp("ab12", "number", 6)).toBe("12");
        expect(cleanOtp("ab12-Z", "alphanumeric", 6)).toBe("ab12Z");
        expect(cleanOtp("1234567890", "number", 4)).toBe("1234");
        expect(cleanOtp("a b", "text", 6)).toBe("ab");
        expect(cleanOtp("", "number", 4)).toBe("");
    });
    it("otpCells pads to the length", () => {
        expect(otpCells("12", 4)).toEqual(["1", "2", "", ""]);
        expect(otpCells(null, 3)).toEqual(["", "", ""]);
        expect(otpCells("123456", 4)).toEqual(["1", "2", "3", "4"]);
    });
    it("setCell replaces a full box and never leaves a hole", () => {
        expect(setCell("", 0, "1", 4)).toBe("1");
        expect(setCell("1", 1, "2", 4)).toBe("12");
        expect(setCell("12", 0, "9", 4)).toBe("92");
        expect(setCell("", 3, "7", 4)).toBe("7"); // box 4 of an empty code fills the first free box
        expect(setCell("123", 3, "4", 4)).toBe("1234");
    });
    it("backspace clears the box, or steps back and clears the one before", () => {
        expect(backspaceAt("123", 2, 4)).toEqual({ value: "12", focus: 2 });
        expect(backspaceAt("123", 3, 4)).toEqual({ value: "12", focus: 2 }); // empty box: clear the previous one
        expect(backspaceAt("123", 0, 4)).toEqual({ value: "23", focus: 0 }); // the rest shifts left, no hole
        expect(backspaceAt("", 0, 4)).toEqual({ value: "", focus: 0 });
        expect(backspaceAt("1234", 3, 4)).toEqual({ value: "123", focus: 3 });
    });
    it("delete removes that character and shifts the rest", () => {
        expect(deleteAt("1234", 1, 4)).toBe("134");
        expect(deleteAt("12", 3, 4)).toBe("12");
    });
});

describe("color utils", () => {
    it("normalizeHex accepts every spelling and lower-cases", () => {
        expect(normalizeHex("#FFF")).toBe("#ffffff");
        expect(normalizeHex("2563EB")).toBe("#2563eb");
        expect(normalizeHex("  #2563eb ")).toBe("#2563eb");
        expect(normalizeHex("#۲۵۶۳eb")).toBe("#2563eb");
        expect(normalizeHex("#12")).toBeNull();
        expect(normalizeHex("#12345")).toBeNull();
        expect(normalizeHex("zzz")).toBeNull();
        expect(normalizeHex("")).toBeNull();
        expect(normalizeHex(null)).toBeNull();
    });
    it("alpha only when asked; fully opaque collapses to 6 digits", () => {
        expect(normalizeHex("#2563eb80")).toBeNull();
        expect(normalizeHex("#2563eb80", true)).toBe("#2563eb80");
        expect(normalizeHex("#2563ebff", true)).toBe("#2563eb");
        expect(normalizeHex("#f008", true)).toBe("#ff000088");
    });
    it("hex <-> rgb round-trips", () => {
        expect(hexToRgb("#2563eb")).toEqual({ r: 37, g: 99, b: 235, a: 1 });
        expect(hexToRgb("#00000080")!.a).toBeCloseTo(0.5, 1);
        expect(rgbToHex({ r: 37, g: 99, b: 235, a: 1 })).toBe("#2563eb");
        expect(rgbToHex({ r: 0, g: 0, b: 0, a: 0.5 })).toBe("#00000080");
        expect(hexToRgb("nope")).toBeNull();
    });
    it("cleanHexInput keeps hex characters only", () => {
        expect(cleanHexInput("#25g63eb")).toBe("#2563EB");
        expect(cleanHexInput("")).toBe("");
        expect(cleanHexInput("1234567")).toBe("#123456");
        expect(cleanHexInput("12345678", true)).toBe("#12345678");
    });
    it("readableOn picks black on light and white on dark", () => {
        expect(readableOn("#ffffff")).toBe("#000000");
        expect(readableOn("#facc15")).toBe("#000000");
        expect(readableOn("#000000")).toBe("#ffffff");
        expect(readableOn("#2563eb")).toBe("#ffffff");
    });
    it("every default swatch is a valid, unique hex", () => {
        const all = DEFAULT_SWATCHES.map((c) => normalizeHex(c));
        expect(all.every(Boolean)).toBe(true);
        expect(new Set(all).size).toBe(DEFAULT_SWATCHES.length);
    });
});
