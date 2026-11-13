import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { ViDate, ViDateRange, viputy } from "../src";

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

describe("phone sheet footers keep confirm on the right (thumb side)", () => {
    // happy-dom does not lay out, so assert the rule that does it, in the shipped CSS.
    const css = async (f: string) => {
        const fs = (await import(/* @vite-ignore */ "node:" + "fs")) as {
            readFileSync(p: string, enc: string): string;
        };
        return fs.readFileSync(`src/styles/${f}`, "utf8");
    };
    it("RTL reverses the footer rows so the last button (confirm) is on the physical right", async () => {
        const c = await css("popup.css");
        expect(c).toMatch(
            /\.vi-layer\[dir="rtl"\] \.vi-sheet__foot \.vi-date__foot,/
        );
        expect(c).toMatch(
            /\.vi-layer\[dir="rtl"\] \.vi-sheet__foot \.vi-sheet__actions,/
        );
        expect(c).toMatch(
            /\.vi-layer\[dir="rtl"\] \.vi-sheet__body \.vi-timepop__foot \{\s*flex-direction: row-reverse;/
        );
    });
    it("a lone ViTime confirm is pushed to the physical right", async () => {
        expect(await css("popup.css")).toMatch(
            /\.vi-sheet__body \.vi-timepop__foot > \.vi-btn \{\s*margin-left: auto;/
        );
    });
    it("confirm is last in the DOM of every footer (right edge in LTR)", async () => {
        const w = await open({ time: "hm" });
        const btns = Array.from(
            document.body.querySelectorAll(
                ".vi-sheet__foot .vi-date__foot > .vi-btn"
            )
        );
        expect(btns.at(-1)!.classList.contains("vi-btn--primary")).toBe(true);
        w.unmount();
    });
});

describe("one footer for every phone date sheet", () => {
    it("a date-only ViDate shows its value in the same row as the date/time buttons, as plain text", async () => {
        const w = await open({ modelValue: "2026-11-10" });
        const part = document.body.querySelector<HTMLElement>(
            ".vi-sheet__foot .vi-date__part"
        );
        expect(part).toBeTruthy();
        expect(part!.hasAttribute("data-static")).toBe(true);
        expect(part!.tagName).toBe("DIV"); // not a button: nothing to press
        expect(part!.textContent).toContain("1405/08/19");
        expect(
            document.body.querySelector(".vi-sheet__foot .vi-date__summary")
        ).toBeNull();
        w.unmount();
    });
    it("the desktop popover keeps its one-line summary", async () => {
        const w = await open({ modelValue: "2026-11-10", time: "hm" }, false);
        expect(document.body.querySelector(".vi-date__summary")).toBeTruthy();
        expect(document.body.querySelector(".vi-date__part")).toBeNull();
        w.unmount();
    });
    it("ViDateRange on a phone: value row, calendar switch, clear, apply (confirm last)", async () => {
        phone(true);
        const w = mount(ViDateRange, {
            props: { modelValue: { start: "2026-11-10", end: "2026-11-20" } },
            attachTo: document.body,
            global: { plugins: [[viputy, { locale: "en" }]] as any }
        });
        await w.find("input").trigger("click");
        await flush();
        const foot = document.body.querySelector(
            ".vi-sheet__foot .vi-date__foot"
        )!;
        expect(
            foot.querySelector(".vi-date__part[data-static]")!.textContent
        ).toContain("11 days");
        expect(foot.querySelector(".vi-seg")).toBeTruthy();
        const btns = Array.from(foot.querySelectorAll(":scope > .vi-btn"));
        expect(btns.map((b) => b.textContent?.trim())).toEqual([
            "Clear",
            "Apply"
        ]);
        expect(btns.at(-1)!.classList.contains("vi-btn--primary")).toBe(true);
        w.unmount();
    });
});

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
    it("a date-only field uses the same footer: a plain value row, no date/time buttons", async () => {
        const w = await open({ modelValue: "2026-11-10" });
        expect($(".vi-panel--sheet")).toBeTruthy();
        expect(
            parts().filter((p) => !p.hasAttribute("data-static"))
        ).toHaveLength(0);
        expect($(".vi-date__summary")).toBeNull();
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
