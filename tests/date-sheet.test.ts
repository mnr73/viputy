import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { ViDate, viputy } from "../src";

afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
});
const flush = async () => {
    await nextTick();
    await nextTick();
    await new Promise((r) => setTimeout(r, 0));
};
const phone = (narrow: boolean) =>
    vi.stubGlobal("matchMedia", (q: string) => ({
        matches: narrow && q.includes("max-width"),
        media: q,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {}
    }));
const open = async (props: Record<string, unknown>, narrow = true) => {
    phone(narrow);
    const w = mount(ViDate, {
        props: { modelValue: "2026-11-10T14:30", ...props },
        attachTo: document.body,
        global: { plugins: [[viputy, { locale: "en" }]] as any }
    });
    await w.find("input").trigger("click");
    await flush();
    return w;
};
const $ = (s: string) => document.body.querySelector(s) as HTMLElement | null;
const shown = (s: string) => {
    const e = $(s);
    return !!e && e.style.display !== "none";
};
const parts = () =>
    Array.from(document.body.querySelectorAll<HTMLElement>(".vi-date__part"));

describe("ViDate phone sheet with a time", () => {
    it("starts on the date; the footer shows date and time side by side", async () => {
        const w = await open({ time: "hm" });
        expect($(".vi-panel--sheet")).toBeTruthy();
        expect(shown(".vi-cal")).toBe(true);
        expect($(".vi-time")).toBeNull();
        expect($(".vi-date__tabs")).toBeNull(); // no tabs on top
        // label + value in one row; the default calendar is Jalali (19 Aban 1405)
        expect(parts().map((p) => p.textContent)).toEqual([
            "Date1405/08/19",
            "Time14:30"
        ]);
        expect(parts()[0]!.getAttribute("aria-pressed")).toBe("true");
        w.unmount();
    });
    it("picking a day (15 Aban 1405 = 2026-11-06) goes straight to the time", async () => {
        const w = await open({ time: "hm" });
        (
            document.body.querySelectorAll(
                ".vi-day:not([data-outside])"
            )[14] as HTMLElement
        ).click();
        await flush();
        expect(shown(".vi-cal")).toBe(false);
        expect($(".vi-time")).toBeTruthy();
        expect(parts()[1]!.getAttribute("aria-pressed")).toBe("true");
        expect(w.emitted("update:modelValue")?.[0]).toEqual([
            "2026-11-06T14:30"
        ]);
        w.unmount();
    });
    it("the footer buttons switch between date and time", async () => {
        const w = await open({ time: "hm" });
        parts()[1]!.click();
        await flush();
        expect($(".vi-time")).toBeTruthy();
        expect(shown(".vi-cal")).toBe(false);
        parts()[0]!.click();
        await flush();
        expect(shown(".vi-cal")).toBe(true);
        expect($(".vi-time")).toBeNull();
        w.unmount();
    });
    it("the time you pick updates the time button", async () => {
        const w = await open({ time: "hm" });
        parts()[1]!.click();
        await flush();
        const h = Array.from(
            document.body
                .querySelectorAll<HTMLElement>(".vi-time__col")[0]!
                .querySelectorAll("button")
        ).find((b) => b.textContent?.trim() === "16")!;
        h.click();
        await flush();
        expect(w.emitted("update:modelValue")?.at(-1)).toEqual([
            "2026-11-10T16:30"
        ]);
        w.unmount();
    });
    it("reopening starts on the date again", async () => {
        const w = await open({ time: "hm" });
        parts()[1]!.click();
        await flush();
        (
            document.body.querySelector(".vi-sheet__close") as HTMLElement
        ).click();
        await flush();
        await w.find("input").trigger("click");
        await flush();
        expect(shown(".vi-cal")).toBe(true);
        expect($(".vi-time")).toBeNull();
        w.unmount();
    });
    it("a date-only field keeps the plain sheet: no date/time buttons", async () => {
        const w = await open({ modelValue: "2026-11-10" });
        expect($(".vi-panel--sheet")).toBeTruthy();
        expect(parts()).toHaveLength(0);
        expect($(".vi-date__summary")).toBeTruthy();
        w.unmount();
    });
    it("on a wide screen nothing changes: popover with calendar and time side by side", async () => {
        const w = await open({ time: "hm" }, false);
        expect($(".vi-panel--sheet")).toBeNull();
        expect($(".vi-cal")).toBeTruthy();
        expect($(".vi-time")).toBeTruthy();
        expect(parts()).toHaveLength(0);
        w.unmount();
    });
});
