import { describe, expect, it } from "vitest";
import {
    acceptList,
    describeAccept,
    extOf,
    formatBytes,
    kindOf,
    matchesAccept,
    moveItem,
    parseBytes,
    serverMessage,
    splitProgress,
    validateFile
} from "../src/utils/upload";

const f = (name: string, type = "", size = 100) => ({ name, type, size });

describe("parseBytes", () => {
    it("numbers, units, decimals, Persian digits", () => {
        expect(parseBytes(2048)).toBe(2048);
        expect(parseBytes("10MB")).toBe(10 * 1024 * 1024);
        expect(parseBytes("500 kb")).toBe(500 * 1024);
        expect(parseBytes("1.5GB")).toBe(1.5 * 1024 ** 3);
        expect(parseBytes("1,5 MB")).toBe(1.5 * 1024 ** 2);
        expect(parseBytes("۱۰MB")).toBe(10 * 1024 * 1024);
        expect(parseBytes("100")).toBe(100);
    });
    it("rejects nonsense instead of guessing", () => {
        expect(parseBytes("lots")).toBeUndefined();
        expect(parseBytes("10 parsecs")).toBeUndefined();
        expect(parseBytes(-1)).toBeUndefined();
        expect(parseBytes(NaN)).toBeUndefined();
        expect(parseBytes(undefined)).toBeUndefined();
    });
});

describe("formatBytes", () => {
    it("picks the unit and localises", () => {
        expect(formatBytes(0)).toBe("0 byte");
        expect(formatBytes(1536)).toBe("1.5 kB");
        expect(formatBytes(10 * 1024 * 1024)).toBe("10 MB");
        expect(formatBytes(10 * 1024 * 1024, "fa")).toBe("۱۰ مگابایت");
        expect(formatBytes(1536, "fa")).toBe("۱٫۵ کیلوبایت");
    });
});

describe("accept", () => {
    it("parses a string or an array", () => {
        expect(acceptList(" .PDF , image/* ")).toEqual([".pdf", "image/*"]);
        expect(acceptList([".png"])).toEqual([".png"]);
        expect(acceptList(undefined)).toEqual([]);
    });
    it("matches extensions (any case), exact types and wildcards", () => {
        const t = acceptList(".pdf,image/*,application/zip");
        expect(matchesAccept(f("A.PDF"), t)).toBe(true);
        expect(matchesAccept(f("x", "image/webp"), t)).toBe(true);
        expect(matchesAccept(f("x", "application/zip"), t)).toBe(true);
        expect(matchesAccept(f("x.exe", "application/x-msdownload"), t)).toBe(
            false
        );
        expect(matchesAccept(f("anything"), [])).toBe(true);
    });
    it("an extension must be the END of the name", () => {
        expect(matchesAccept(f("report.pdf.exe"), [".pdf"])).toBe(false);
    });
    it("describes the allowed types for a message", () => {
        const labels = { images: "Images", videos: "Videos", audio: "Audio" };
        expect(describeAccept([".pdf", ".docx", "image/*"], labels)).toBe(
            "PDF DOCX Images"
        );
        expect(
            describeAccept(
                [
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ],
                labels
            )
        ).toBe("");
        expect(
            describeAccept([".a", ".b", ".c", ".d", ".e"], labels)
        ).toContain("…");
    });
});

describe("validateFile", () => {
    const rules = { tokens: [".pdf"], maxSize: 1000, minSize: 10 };
    it("returns the first broken rule", () => {
        expect(validateFile(f("a.pdf", "", 500), rules)).toBeNull();
        expect(validateFile(f("a.png", "", 500), rules)).toBe("type");
        expect(validateFile(f("a.pdf", "", 5000), rules)).toBe("size-max");
        expect(validateFile(f("a.pdf", "", 1), rules)).toBe("size-min");
        expect(validateFile(f("a.pdf", "", 1000), rules)).toBeNull(); // the limit itself is fine
    });
    it("name pattern and length", () => {
        expect(
            validateFile(f("ok-1.pdf"), { namePattern: /^[a-z0-9-]+\.pdf$/ })
        ).toBeNull();
        expect(
            validateFile(f("Bad Name.pdf"), {
                namePattern: /^[a-z0-9-]+\.pdf$/
            })
        ).toBe("name");
        expect(
            validateFile(f("x".repeat(30) + ".pdf"), { maxNameLength: 20 })
        ).toBe("name-length");
    });
    it("a global (/g) pattern does not alternate between pass and fail", () => {
        const rx = /\.pdf$/g;
        for (let i = 0; i < 4; i++)
            expect(validateFile(f("a.pdf"), { namePattern: rx })).toBeNull();
    });
});

describe("kindOf / extOf", () => {
    it("by type, then by extension", () => {
        expect(kindOf({ name: "a.JPG" })).toBe("image");
        expect(kindOf({ name: "x", type: "image/png" })).toBe("image");
        expect(kindOf({ name: "a.pdf" })).toBe("pdf");
        expect(kindOf({ name: "a.mp4" })).toBe("video");
        expect(kindOf({ name: "a.mp3" })).toBe("audio");
        expect(kindOf({ name: "a.xlsx" })).toBe("sheet");
        expect(kindOf({ name: "a.docx" })).toBe("doc");
        expect(kindOf({ name: "a.zip" })).toBe("archive");
        expect(kindOf({ name: "a.bin" })).toBe("other");
    });
    it("extOf ignores a leading dot and takes the last extension", () => {
        expect(extOf("a.tar.gz")).toBe("gz");
        expect(extOf(".gitignore")).toBe("");
        expect(extOf("noext")).toBe("");
    });
});

describe("moveItem", () => {
    it("moves and clamps, never mutates", () => {
        const a = [1, 2, 3, 4];
        expect(moveItem(a, 0, 2)).toEqual([2, 3, 1, 4]);
        expect(moveItem(a, 3, 0)).toEqual([4, 1, 2, 3]);
        expect(moveItem(a, 1, 99)).toEqual([1, 3, 4, 2]);
        expect(moveItem(a, 9, 0)).toEqual(a);
        expect(a).toEqual([1, 2, 3, 4]);
    });
});

describe("splitProgress", () => {
    it("fills the first file first", () => {
        expect(splitProgress([100, 100], 0.25)).toEqual([0.5, 0]);
        expect(splitProgress([100, 100], 0.5)).toEqual([1, 0]);
        expect(splitProgress([100, 100], 0.75)).toEqual([1, 0.5]);
        expect(splitProgress([100, 100], 1)).toEqual([1, 1]);
    });
    it("handles empty files and out-of-range input", () => {
        expect(splitProgress([0, 100], 0.5)).toEqual([1, 0.5]);
        expect(splitProgress([100], 5)).toEqual([1]);
        expect(splitProgress([100], -1)).toEqual([0]);
        expect(splitProgress([], 0.5)).toEqual([]);
    });
});

describe("serverMessage", () => {
    it("reads Laravel-style bodies", () => {
        expect(serverMessage({ message: "Too big" })).toBe("Too big");
        expect(
            serverMessage({
                message: "The given data was invalid.",
                errors: { file: ["Must be a PDF."] }
            })
        ).toBe("Must be a PDF.");
        expect(serverMessage("<html>")).toBe("");
        expect(serverMessage(null)).toBe("");
    });
});
