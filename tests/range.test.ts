import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";
import { ViCalendar, ViDateRange, ViSimpleDate, viputy } from "../src";
import { PlainDateTime } from "../src/date/plain";
import { presetRange, spanDays } from "../src/date/presets";

afterEach(() => {
    document.body.innerHTML = "";
});
const flush = async () => {
    await nextTick();
    await nextTick();
    await new Promise((r) => setTimeout(r, 0));
};
const fa = { global: { plugins: [[viputy, { locale: "fa" }]] as any } };
const en = { global: { plugins: [[viputy, { locale: "en" }]] as any } };
const dt = (s: string) => PlainDateTime.fromISO(s)!;

describe("presets", () => {
    const now = dt("2026-11-10T15:00"); // 19 Aban 1405, a Tuesday
    it("simple day presets", () => {
        expect(
            presetRange("today", now, "gregorian").map((d) => d.toISODate())
        ).toEqual(["2026-11-10", "2026-11-10"]);
        expect(
            presetRange("yesterday", now, "gregorian").map((d) => d.toISODate())
        ).toEqual(["2026-11-09", "2026-11-09"]);
        expect(
            presetRange("last7", now, "gregorian").map((d) => d.toISODate())
        ).toEqual(["2026-11-04", "2026-11-10"]);
        const [a, b] = presetRange("last30", now, "gregorian");
        expect(spanDays(a, b)).toBe(30);
    });
    it("this/last month follow the chosen calendar", () => {
        expect(
            presetRange("thisMonth", now, "gregorian").map((d) => d.toISODate())
        ).toEqual(["2026-11-01", "2026-11-30"]);
        // Aban 1405 = 23 Oct .. 21 Nov 2026
        expect(
            presetRange("thisMonth", now, "jalali").map((d) => d.toISODate())
        ).toEqual(["2026-10-23", "2026-11-21"]);
        // Mehr 1405 = 23 Sep .. 22 Oct 2026
        expect(
            presetRange("lastMonth", now, "jalali").map((d) => d.toISODate())
        ).toEqual(["2026-09-23", "2026-10-22"]);
        expect(
            presetRange("lastMonth", dt("2026-01-15"), "gregorian").map((d) =>
                d.toISODate()
            )
        ).toEqual(["2025-12-01", "2025-12-31"]);
    });
    it("last month at the start of a Jalali year goes to Esfand (29 or 30 days)", () => {
        const farvardin = dt("2026-03-25"); // 4 Farvardin 1405
        const [a, b] = presetRange("lastMonth", farvardin, "jalali");
        expect(a.get("jalali")).toEqual({ year: 1404, month: 12, day: 1 });
        expect(b.get("jalali")).toEqual({ year: 1404, month: 12, day: 29 });
    });
});

describe("ViCalendar range mode", () => {
    it("marks start, mid, end and previews on hover while the end is pending", async () => {
        const w = mount(ViCalendar, {
            props: {
                modelValue: null,
                rangeStart: "2026-11-10",
                rangeEnd: null
            },
            ...en
        });
        await flush();
        const cell = (iso: string) =>
            w.get(`.vi-day[data-days="${dt(iso).days}"]`);
        expect(cell("2026-11-10").attributes("data-selected")).toBeDefined();
        await cell("2026-11-13").trigger("mouseenter");
        const box = (iso: string) =>
            cell(iso).element.closest(".vi-cal__cellbox") as HTMLElement;
        expect(box("2026-11-10").dataset.band).toBe("start");
        expect(box("2026-11-11").dataset.band).toBe("mid");
        expect(box("2026-11-13").dataset.band).toBe("end");
        expect(box("2026-11-13").dataset.preview).toBe("end");
        expect(box("2026-11-14").dataset.band).toBeUndefined();
        expect(w.emitted("hover")!.at(-1)).toEqual(["2026-11-13"]);
        // hovering before the start previews backwards
        await cell("2026-11-08").trigger("mouseenter");
        expect(box("2026-11-08").dataset.band).toBe("start");
        expect(box("2026-11-10").dataset.band).toBe("end");
    });
    it("a finished range ignores hover", async () => {
        const w = mount(ViCalendar, {
            props: {
                modelValue: null,
                rangeStart: "2026-11-10",
                rangeEnd: "2026-11-12"
            },
            ...en
        });
        await flush();
        await w
            .get(`.vi-day[data-days="${dt("2026-11-20").days}"]`)
            .trigger("mouseenter");
        expect(w.findAll(".vi-cal__cellbox[data-band]")).toHaveLength(3);
    });
});

describe("ViDateRange", () => {
    const make = (props: Record<string, unknown> = {}, locale = fa) => {
        const w = mount(ViDateRange, {
            attachTo: document.body,
            props: {
                ...props,
                "onUpdate:modelValue": (v: unknown) =>
                    w.setProps({ modelValue: v as never })
            },
            ...locale
        });
        return w;
    };
    const inputs = (w: ReturnType<typeof mount>) =>
        w.findAll("input.vi-range__input");
    const type = async (
        el: ReturnType<ReturnType<typeof mount>["get"]>,
        v: string
    ) => {
        (el.element as HTMLInputElement).value = v;
        await el.trigger("input");
        await el.trigger("blur");
    };
    const dayBtn = (iso: string) =>
        document.querySelector<HTMLElement>(
            `.vi-panel .vi-day[data-days="${dt(iso).days}"]`
        );
    const last = (w: ReturnType<typeof mount>) =>
        w.emitted("update:modelValue")!.at(-1)![0];

    it("shows both ends in Jalali with Persian digits", async () => {
        const w = make({
            modelValue: { start: "2026-11-16", end: "2026-11-30" }
        });
        await flush();
        expect(
            inputs(w).map((i) => (i.element as HTMLInputElement).value)
        ).toEqual(["۱۴۰۵/۰۸/۲۵", "۱۴۰۵/۰۹/۰۹"]);
        w.unmount();
    });
    it("two clicks pick start then end and close; months=2 are consecutive", async () => {
        const w = make({ modelValue: { start: null, end: null } });
        await inputs(w)[0]!.trigger("click");
        await flush();
        expect(
            [...document.querySelectorAll(".vi-panel .vi-cal__month")].map(
                (e) => e.textContent
            )
        ).toHaveLength(2);
        dayBtn("2026-11-16")!.click();
        await flush();
        expect(last(w)).toEqual({ start: "2026-11-16", end: null });
        expect(document.querySelector(".vi-panel")).toBeTruthy();
        expect(document.querySelector(".vi-date__summary")!.textContent).toBe(
            "تاریخ پایان را انتخاب کنید"
        );
        dayBtn("2026-11-30")!.click();
        await flush();
        expect(last(w)).toEqual({ start: "2026-11-16", end: "2026-11-30" });
        expect(document.querySelector(".vi-panel")).toBeNull();
        w.unmount();
    });
    it("clicking the end before the start swaps them", async () => {
        const w = make({ modelValue: { start: null, end: null } });
        await inputs(w)[0]!.trigger("click");
        await flush();
        dayBtn("2026-11-20")!.click();
        await flush();
        dayBtn("2026-11-12")!.click();
        await flush();
        expect(last(w)).toEqual({ start: "2026-11-12", end: "2026-11-20" });
        w.unmount();
    });
    it("a preset sets the range and closes", async () => {
        const w = make({ modelValue: { start: null, end: null } });
        await inputs(w)[0]!.trigger("click");
        await flush();
        const preset = [
            ...document.querySelectorAll<HTMLElement>(".vi-preset")
        ].find((b) => b.textContent!.trim() === "۷ روز اخیر")!;
        preset.click();
        await flush();
        const v = last(w) as { start: string; end: string };
        expect(spanDays(dt(v.start), dt(v.end))).toBe(7);
        expect(document.querySelector(".vi-panel")).toBeNull();
        w.unmount();
    });
    it("typing both ends, Persian digits, validates order", async () => {
        const w = make({ modelValue: { start: null, end: null } });
        await flush();
        await type(inputs(w)[0]!, "۱۴۰۵/۰۸/۲۵");
        expect(last(w)).toEqual({ start: "2026-11-16", end: null });
        await type(inputs(w)[1]!, "۱۴۰۵/۰۹/۰۸");
        expect(last(w)).toEqual({ start: "2026-11-16", end: "2026-11-29" });
        // end before start: error, value unchanged
        const count = w.emitted("update:modelValue")!.length;
        (inputs(w)[1]!.element as HTMLInputElement).value = "۱۴۰۵/۰۸/۰۱";
        await inputs(w)[1]!.trigger("input");
        expect(w.get(".vi-field__msg").text()).toBe("پایان قبل از شروع است");
        await inputs(w)[1]!.trigger("blur");
        expect(w.emitted("update:modelValue")!.length).toBe(count);
        expect((inputs(w)[1]!.element as HTMLInputElement).value).toBe(
            "۱۴۰۵/۰۹/۰۸"
        );
        w.unmount();
    });
    it("min/max, max-days and isDisabled constrain the range", async () => {
        const w = make({
            modelValue: { start: null, end: null },
            min: "2026-11-05",
            max: "2026-11-25",
            maxDays: 5
        });
        await inputs(w)[0]!.trigger("click");
        await flush();
        expect(dayBtn("2026-11-04")!.hasAttribute("disabled")).toBe(true);
        expect(dayBtn("2026-11-26")!.hasAttribute("disabled")).toBe(true);
        dayBtn("2026-11-10")!.click();
        await flush();
        dayBtn("2026-11-20")!.click(); // 11 days -> clamped to 5
        await flush();
        expect(last(w)).toEqual({ start: "2026-11-10", end: "2026-11-14" });
        w.unmount();
    });
    it("clear empties both", async () => {
        const w = make({
            modelValue: { start: "2026-11-10", end: "2026-11-12" },
            clearable: true
        });
        await flush();
        await w.get(".vi-clear").trigger("click");
        expect(last(w)).toEqual({ start: null, end: null });
        w.unmount();
    });
    it("hidden inputs submit name[start] and name[end]", async () => {
        const w = make({
            modelValue: { start: "2026-11-10", end: "2026-11-12" },
            name: "period"
        });
        await flush();
        expect(
            [
                ...document.querySelectorAll<HTMLInputElement>(
                    'input[type="hidden"]'
                )
            ].map((i) => [i.name, i.value])
        ).toEqual([
            ["period[start]", "2026-11-10"],
            ["period[end]", "2026-11-12"]
        ]);
        w.unmount();
    });
    it("English locale uses ISO text and Gregorian by default order", async () => {
        const w = make(
            {
                modelValue: { start: "2026-11-10", end: "2026-11-12" },
                calendars: ["gregorian"]
            },
            en
        );
        await flush();
        expect(
            inputs(w).map((i) => (i.element as HTMLInputElement).value)
        ).toEqual(["2026-11-10", "2026-11-12"]);
        w.unmount();
    });
});

describe("ViSimpleDate", () => {
    const make = (props: Record<string, unknown> = {}, locale = fa) => {
        const w = mount(ViSimpleDate, {
            attachTo: document.body,
            props: {
                ...props,
                "onUpdate:modelValue": (v: unknown) =>
                    w.setProps({ modelValue: v as never })
            },
            ...locale
        });
        return w;
    };
    const parts = (w: ReturnType<typeof mount>) =>
        w.findAllComponents({ name: "ViSelect" });
    const choose = async (
        w: ReturnType<typeof mount>,
        idx: number,
        text: string
    ) => {
        await parts(w)[idx]!.get(".vi-field__control").trigger("click");
        await flush();
        const opt = [
            ...document.querySelectorAll<HTMLElement>('[role="option"]')
        ].find((o) => o.textContent!.trim().startsWith(text));
        if (!opt)
            throw new Error(
                "no option " +
                    text +
                    " in " +
                    [...document.querySelectorAll('[role="option"]')]
                        .map((o) => o.textContent)
                        .join("|")
            );
        opt.click();
        await flush();
    };
    it("shows the three parts of a value in the active calendar", async () => {
        const w = make({ modelValue: "2026-11-10" });
        await flush();
        expect(parts(w).map((p) => p.get(".vi-select__text").text())).toEqual([
            "۱۹",
            "آبان",
            "۱۴۰۵"
        ]);
        w.unmount();
    });
    it("emits only when year, month and day are all set", async () => {
        const w = make({ modelValue: null });
        await flush();
        await choose(w, 2, "۱۴۰۵");
        await choose(w, 1, "آذر");
        expect(w.emitted("update:modelValue")).toBeUndefined();
        await choose(w, 0, "۱");
        expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["2026-11-22"]);
        w.unmount();
    });
    it("day list follows the month length and clamps when the month gets shorter", async () => {
        const w = make({ modelValue: "2026-03-20" }); // 29 Esfand 1404
        await flush();
        expect(parts(w).map((p) => p.get(".vi-select__text").text())).toEqual([
            "۲۹",
            "اسفند",
            "۱۴۰۴"
        ]);
        await parts(w)[0]!.get(".vi-field__control").trigger("click");
        await flush();
        expect(document.querySelectorAll('[role="option"]')).toHaveLength(29); // 1404 is not leap
        document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
        );
        await flush();
        // move to month 6 (31 days) day 31, then to Mehr (30): day clamps to 30
        await choose(w, 1, "شهریور");
        await choose(w, 0, "۳۱");
        expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["2025-09-22"]);
        await choose(w, 1, "مهر");
        expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["2025-10-22"]);
        w.unmount();
    });
    it("shortcuts: first and last of month, leap Esfand", async () => {
        const w = make({ modelValue: "2025-03-10", shortcuts: true }); // Esfand 1403 is leap
        await flush();
        const [first, last] = w.findAll(".vi-sd__btn");
        await last!.trigger("click");
        expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["2025-03-20"]); // 30 Esfand 1403
        await first!.trigger("click");
        expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["2025-02-19"]); // 1 Esfand 1403
        expect(w.find(".vi-sd__shortcuts .vi-counter").exists()).toBe(true);
        w.unmount();
    });
    it("min/max restrict years and days", async () => {
        const w = make({
            modelValue: null,
            min: "2026-03-21",
            max: "2027-03-20"
        }); // 1405
        await flush();
        await parts(w)[2]!.get(".vi-field__control").trigger("click");
        await flush();
        expect(
            [...document.querySelectorAll('[role="option"]')].map((o) =>
                o.textContent!.trim()
            )
        ).toEqual(["۱۴۰۵"]);
        w.unmount();
    });
    it("hidden input and SSR", async () => {
        const w = make({ modelValue: "2026-11-10", name: "birth" });
        await flush();
        expect(
            (w.get('input[type="hidden"]').element as HTMLInputElement).value
        ).toBe("2026-11-10");
        w.unmount();
        const app = createSSRApp({
            render: () =>
                h("div", [
                    h(ViSimpleDate, { modelValue: "2026-11-10" }),
                    h(ViDateRange, {
                        modelValue: { start: "2026-11-10", end: "2026-11-12" }
                    })
                ])
        });
        const html = await renderToString(app);
        expect(html).toContain("vi-sd__parts");
        expect(html).toContain("vi-range");
    });
});
