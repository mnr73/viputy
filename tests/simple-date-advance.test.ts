import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { ViSimpleDate, viputy } from "../src";

afterEach(() => {
    document.body.innerHTML = "";
});
const flush = async () => {
    await nextTick();
    await nextTick();
    await new Promise((r) => setTimeout(r, 0));
};
const make = (props: Record<string, unknown>) =>
    mount(ViSimpleDate, {
        props: { calendar: "gregorian", ...props },
        attachTo: document.body,
        global: { plugins: [[viputy, { locale: "en" }]] as any }
    });
const triggers = () =>
    Array.from(
        document.body.querySelectorAll<HTMLElement>(".vi-select__trigger")
    );
const panelOpen = () => document.body.querySelectorAll(".vi-panel").length;
const panelRows = () =>
    document.body.querySelectorAll('.vi-panel [role="option"]').length;
const pick = async (label: string) => {
    const o = Array.from(
        document.body.querySelectorAll<HTMLElement>('.vi-panel [role="option"]')
    ).find((x) => x.textContent?.trim() === label)!;
    o.click();
    await flush();
};

describe("ViSimpleDate auto-advance", () => {
    it("is off by default: picking a day opens nothing", async () => {
        const w = make({});
        triggers()[0]!.click();
        await flush();
        await pick("12");
        expect(panelOpen()).toBe(0);
        w.unmount();
    });
    it("opens month after day, year after month, and stops after the last part", async () => {
        const w = make({ autoAdvance: true });
        triggers()[0]!.click();
        await flush();
        expect(panelRows()).toBe(31); // days
        await pick("12");
        expect(panelRows()).toBe(12); // months
        await pick("May");
        expect(panelRows()).toBeGreaterThan(100); // years
        await pick(String(new Date().getFullYear()));
        expect(panelOpen()).toBe(0);
        expect(w.emitted("update:modelValue")?.at(-1)).toEqual([
            `${new Date().getFullYear()}-05-12`
        ]);
        w.unmount();
    });
    it("skips parts that are already filled", async () => {
        const y = new Date().getFullYear();
        const w = make({ autoAdvance: true, modelValue: `${y}-05-01` });
        await flush();
        triggers()[0]!.click(); // day
        await flush();
        await pick("12");
        expect(panelOpen()).toBe(0); // month and year are already set
        w.unmount();
    });
    it("follows `year-first`: year, then month, then day", async () => {
        const w = make({ autoAdvance: true, yearFirst: true });
        triggers()[0]!.click(); // year
        await flush();
        await pick(String(new Date().getFullYear()));
        expect(panelRows()).toBe(12); // months
        await pick("March");
        expect(panelRows()).toBe(31); // days
        w.unmount();
    });
    it("does not advance a disabled or read-only field", async () => {
        const w = make({ autoAdvance: true, readonly: true });
        triggers()[0]!.click();
        await flush();
        expect(panelOpen()).toBe(0);
        w.unmount();
    });
});
