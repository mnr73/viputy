import { describe, expect, it } from "vitest";
import { createConfig } from "../src/i18n/config";

describe("i18n", () => {
    it("defaults to English LTR", () => {
        const c = createConfig();
        expect(c.t("close")).toBe("Close");
        expect(c.dir.value).toBe("ltr");
    });
    it("fa is RTL with Persian text and params", () => {
        const c = createConfig({ locale: "fa" });
        expect(c.dir.value).toBe("rtl");
        expect(c.t("close")).toBe("بستن");
        expect(c.t("selectedCount", { n: 4 })).toBe("4 مورد انتخاب شده");
    });
    it("regional locale falls back to its language", () => {
        expect(createConfig({ locale: "fa-IR" }).t("clear")).toBe("پاک کردن");
    });
    it("user messages override built-ins; unknown locale falls back to en", () => {
        expect(
            createConfig({
                locale: "fa",
                messages: { fa: { close: "ببند" } }
            }).t("close")
        ).toBe("ببند");
        expect(createConfig({ locale: "de" }).t("close")).toBe("Close");
    });
    it("dir option overrides", () => {
        expect(createConfig({ locale: "en", dir: "rtl" }).dir.value).toBe(
            "rtl"
        );
    });
});
