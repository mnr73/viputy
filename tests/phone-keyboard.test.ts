import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { ViDate, ViPopup, ViTime, viputy } from "../src";

afterEach(() => {
    document.body.innerHTML = "";
});
const phone = (on: boolean) =>
    (window.matchMedia = ((q: string) => ({
        matches: on && q.includes("max-width"),
        media: q,
        addEventListener() {},
        removeEventListener() {}
    })) as any);
const plugins = [[viputy, { locale: "en" }]] as any;

describe("phone keyboard", () => {
    it("date and time inputs ask for no on-screen keyboard when the picker is a sheet", async () => {
        phone(true);
        for (const C of [ViDate, ViTime]) {
            const w = mount(C as any, {
                global: { plugins },
                attachTo: document.body
            });
            await nextTick();
            expect(w.find("input").attributes("inputmode")).toBe("none");
            w.unmount();
        }
    });
    it("on a wide screen they keep the numeric keypad for typing", async () => {
        phone(false);
        const w = mount(ViDate, {
            global: { plugins },
            attachTo: document.body
        });
        await nextTick();
        expect(w.find("input").attributes("inputmode")).toBe("numeric");
    });
    it("a sheet lifts above the keyboard (visual viewport) and drops back", async () => {
        phone(true);
        const vv: any = Object.assign(new EventTarget(), {
            offsetTop: 0,
            height: 800,
            scale: 1
        });
        Object.defineProperty(window, "visualViewport", {
            configurable: true,
            value: vv
        });
        Object.defineProperty(window, "innerHeight", {
            configurable: true,
            value: 800
        });
        mount(ViPopup, {
            props: { modelValue: true },
            slots: { default: "x" },
            global: { plugins },
            attachTo: document.body
        });
        await nextTick();
        await nextTick();
        const panel = () =>
            document.querySelector(".vi-panel--sheet") as HTMLElement;
        expect(panel().style.bottom).toBe("");
        vv.height = 500;
        vv.dispatchEvent(new Event("resize"));
        await nextTick();
        expect(panel().style.bottom).toBe("300px");
        expect(panel().style.maxHeight).toBe("425px");
        vv.height = 800;
        vv.dispatchEvent(new Event("resize"));
        await nextTick();
        expect(panel().style.bottom).toBe("");
    });
});
