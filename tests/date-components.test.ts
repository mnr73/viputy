import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";
import { ViCalendar, ViDate, ViTime, viputy } from "../src";

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
const days = (w: ReturnType<typeof mount>) =>
    w.findAll(".vi-day:not([data-outside])");

describe("ViCalendar", () => {
    it("draws the Jalali month of the value with Persian digits and Saturday first", async () => {
        const w = mount(ViCalendar, {
            props: { modelValue: "2026-11-10" },
            ...fa
        });
        await flush();
        expect(w.get(".vi-cal__month").text()).toBe("آبان ۱۴۰۵");
        expect(w.findAll(".vi-cal__wd")[0]!.text()).toBe("ش");
        expect(days(w)).toHaveLength(30);
        expect(w.get("[data-selected]").text()).toBe("۱۹");
        // Aban 1405 starts on a Saturday? 2026-10-23 is Friday -> column 6 (Friday)
        const first = w.get(".vi-day[data-days]:not([data-outside])");
        expect(
            [...first.element.closest(".vi-cal__row")!.children].indexOf(
                first.element.closest(".vi-cal__cellbox")!
            )
        ).toBe(6);
    });
    it("English locale -> Gregorian, Sunday first, weekend Sat/Sun", async () => {
        const w = mount(ViCalendar, {
            props: { modelValue: "2026-11-10" },
            ...en
        });
        await flush();
        expect(w.get(".vi-cal__month").text()).toBe("November 2026");
        expect(w.findAll(".vi-cal__wd")[0]!.text()).toBe("Su");
        expect(
            w.findAll(".vi-day[data-weekend]:not([data-outside])").length
        ).toBe(9); // 4 Sat + 5 Sun? Nov 2026
    });
    it("clicking a day emits the ISO date", async () => {
        const w = mount(ViCalendar, {
            props: { modelValue: "2026-11-10" },
            ...fa
        });
        await flush();
        await days(w)[0]!.trigger("click"); // 1 Aban 1405 = 2026-10-23
        expect(w.emitted("update:modelValue")![0]).toEqual(["2026-10-23"]);
    });
    it("month navigation never skips or repeats a Jalali month", async () => {
        const w = mount(ViCalendar, {
            props: { modelValue: "2026-10-23" },
            ...fa
        });
        await flush();
        const seen: string[] = [];
        for (let i = 0; i < 14; i++) {
            seen.push(w.get(".vi-cal__month").text());
            await w.get(".vi-cal__next").trigger("click");
        }
        expect(seen).toEqual([
            "آبان ۱۴۰۵",
            "آذر ۱۴۰۵",
            "دی ۱۴۰۵",
            "بهمن ۱۴۰۵",
            "اسفند ۱۴۰۵",
            "فروردین ۱۴۰۶",
            "اردیبهشت ۱۴۰۶",
            "خرداد ۱۴۰۶",
            "تیر ۱۴۰۶",
            "مرداد ۱۴۰۶",
            "شهریور ۱۴۰۶",
            "مهر ۱۴۰۶",
            "آبان ۱۴۰۶",
            "آذر ۱۴۰۶"
        ]);
        for (let i = 0; i < 14; i++)
            await w.get(".vi-cal__prev").trigger("click");
        expect(w.get(".vi-cal__month").text()).toBe("آبان ۱۴۰۵");
    });
    it("Esfand has 30 days in a leap year, 29 otherwise", async () => {
        const leap = mount(ViCalendar, {
            props: { modelValue: "2025-03-15" },
            ...fa
        }); // 25 Esfand 1403 (leap)
        await flush();
        expect(leap.get(".vi-cal__month").text()).toBe("اسفند ۱۴۰۳");
        expect(days(leap)).toHaveLength(30);
        const plain = mount(ViCalendar, {
            props: { modelValue: "2026-03-15" },
            ...fa
        }); // Esfand 1404
        await flush();
        expect(days(plain)).toHaveLength(29);
    });
    it("min/max disable days and navigation", async () => {
        const w = mount(ViCalendar, {
            props: {
                modelValue: "2026-11-10",
                min: "2026-11-05",
                max: "2026-11-15"
            },
            ...en
        });
        await flush();
        const dis = w.findAll(".vi-day:disabled:not([data-outside])").length;
        expect(dis).toBe(30 - 11);
        expect(
            (w.get(".vi-cal__prev").element as HTMLButtonElement).disabled
        ).toBe(true);
        expect(
            (w.get(".vi-cal__next").element as HTMLButtonElement).disabled
        ).toBe(true);
        await w.findAll(".vi-day:disabled")[0]!.trigger("click");
        expect(w.emitted("update:modelValue")).toBeUndefined();
    });
    it("two months side by side show consecutive months", async () => {
        const w = mount(ViCalendar, {
            props: { modelValue: "2026-11-10", months: 2 },
            ...fa
        });
        await flush();
        expect(w.findAll(".vi-cal__month").map((e) => e.text())).toEqual([
            "آبان ۱۴۰۵",
            "آذر ۱۴۰۵"
        ]);
        expect(w.findAll('[role="grid"]')).toHaveLength(2);
    });
    it("alt days show the other calendar's number", async () => {
        const w = mount(ViCalendar, {
            props: { modelValue: "2026-11-10", altDays: true },
            ...fa
        });
        await flush();
        expect(w.get("[data-selected] .vi-day__alt").text()).toBe("10");
        expect(w.get(".vi-cal__alt").text()).toContain("Oct");
    });
    it("month and year pickers", async () => {
        const w = mount(ViCalendar, {
            props: { modelValue: "2026-11-10" },
            ...fa
        });
        await flush();
        await w.get(".vi-cal__title").trigger("click");
        expect(w.findAll(".vi-cal__cell")).toHaveLength(12);
        await w.findAll(".vi-cal__cell")[0]!.trigger("click"); // Farvardin
        expect(w.get(".vi-cal__month").text()).toBe("فروردین ۱۴۰۵");
    });
    it("keyboard: arrows move focus, PageDown goes to the next month", async () => {
        const w = mount(ViCalendar, {
            props: { modelValue: "2026-11-10" },
            attachTo: document.body,
            ...en
        });
        await flush();
        const grid = w.get('[role="grid"]');
        await grid.trigger("keydown", { key: "ArrowRight" });
        await flush();
        expect(
            (document.activeElement as HTMLElement).getAttribute("aria-label")
        ).toContain("11 November 2026");
        await grid.trigger("keydown", { key: "PageDown" });
        await flush();
        expect(w.get(".vi-cal__month").text()).toBe("December 2026");
        w.unmount();
    });
    it("disabled predicate", async () => {
        const w = mount(ViCalendar, {
            props: {
                modelValue: "2026-11-10",
                isDisabled: (iso: string) => iso.endsWith("-15")
            },
            ...en
        });
        await flush();
        expect(w.findAll(".vi-day:disabled:not([data-outside])")).toHaveLength(
            1
        );
    });
});

describe("ViDate", () => {
    const make = (props: Record<string, unknown> = {}, locale = fa) => {
        const w = mount(ViDate, {
            attachTo: document.body,
            props: {
                ...props,
                "onUpdate:modelValue": (v: string | null) =>
                    w.setProps({ modelValue: v })
            },
            ...locale
        });
        return w;
    };
    it("shows the Jalali text for an ISO value and parses typed Persian input", async () => {
        const w = make({
            modelValue: "2026-11-10",
            calendars: ["jalali", "gregorian"]
        });
        await flush();
        const input = w.get("input.vi-date__input");
        expect((input.element as HTMLInputElement).value).toBe("۱۴۰۵/۰۸/۱۹");
        (input.element as HTMLInputElement).value = "۱۴۰۵/۰۹/۰۱";
        await input.trigger("input");
        await input.trigger("blur");
        expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["2026-11-22"]);
        w.unmount();
    });
    it("Gregorian input is accepted too and shown in the active calendar", async () => {
        const w = make({ modelValue: null });
        await flush();
        const input = w.get("input.vi-date__input");
        (input.element as HTMLInputElement).value = "2026-11-10";
        await input.trigger("input");
        await input.trigger("blur");
        expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["2026-11-10"]);
        expect((input.element as HTMLInputElement).value).toBe("۱۴۰۵/۰۸/۱۹");
        w.unmount();
    });
    it("invalid and out-of-range text show an error and do not emit", async () => {
        const w = make({ modelValue: null, min: "2026-11-01" });
        await flush();
        const input = w.get("input.vi-date__input");
        (input.element as HTMLInputElement).value = "۱۴۰۵/۱۳/۴۰";
        await input.trigger("input");
        expect(w.get(".vi-field").attributes("data-status")).toBe("error");
        expect(w.get(".vi-field__msg").text()).toBe("تاریخ معتبر نیست");
        (input.element as HTMLInputElement).value = "2026-10-01";
        await input.trigger("input");
        expect(w.get(".vi-field__msg").text()).toBe("خارج از بازه‌ی مجاز");
        await input.trigger("blur");
        expect(w.emitted("update:modelValue")).toBeUndefined();
        w.unmount();
    });
    it("picking a day in the popup closes it (date only) and emits ISO", async () => {
        const w = make({ modelValue: null });
        await w.get("input.vi-date__input").trigger("click");
        await flush();
        expect(document.querySelector(".vi-cal")).toBeTruthy();
        (
            document.querySelectorAll<HTMLElement>(
                ".vi-day:not([data-outside])"
            )[4] as HTMLElement
        ).click();
        await flush();
        expect(w.emitted("update:modelValue")!.at(-1)![0]).toMatch(
            /^\d{4}-\d{2}-\d{2}$/
        );
        expect(document.querySelector(".vi-cal")).toBeNull();
        w.unmount();
    });
    it("time=hm outputs ISO date-time, keeps the time when the day changes", async () => {
        const w = make({
            modelValue: "2026-11-10T14:30",
            time: "hm",
            calendars: ["jalali"]
        });
        await flush();
        expect(
            (w.get("input.vi-date__input").element as HTMLInputElement).value
        ).toBe("۱۴۰۵/۰۸/۱۹ ۱۴:۳۰");
        await w.get("input.vi-date__input").trigger("click");
        await flush();
        (
            document.querySelectorAll<HTMLElement>(
                ".vi-day:not([data-outside])"
            )[0] as HTMLElement
        ).click(); // 1 Aban
        await flush();
        expect(w.emitted("update:modelValue")!.at(-1)).toEqual([
            "2026-10-23T14:30"
        ]);
        expect(document.querySelector(".vi-cal")).toBeTruthy(); // stays open to pick the time
        const hourBtn = [
            ...document
                .querySelectorAll<HTMLElement>(".vi-time__col")[0]!
                .querySelectorAll("button")
        ].find((b) => b.textContent!.trim() === "۰۹")!;
        hourBtn.click();
        await flush();
        expect(w.emitted("update:modelValue")!.at(-1)).toEqual([
            "2026-10-23T09:30"
        ]);
        w.unmount();
    });
    it("time=hms includes seconds", async () => {
        const w = make({ modelValue: "2026-11-10T14:30:15", time: "hms" });
        await flush();
        expect(
            (w.get("input.vi-date__input").element as HTMLInputElement).value
        ).toBe("۱۴۰۵/۰۸/۱۹ ۱۴:۳۰:۱۵");
        w.unmount();
    });
    it("calendar switch changes the displayed text, not the value", async () => {
        const w = make({ modelValue: "2026-11-10" });
        await w.get("input.vi-date__input").trigger("click");
        await flush();
        const seg = [...document.querySelectorAll<HTMLElement>(".vi-seg__btn")];
        expect(seg.map((b) => b.textContent!.trim())).toEqual([
            "جلالی",
            "میلادی"
        ]);
        seg[1]!.click();
        await flush();
        expect(
            (w.get("input.vi-date__input").element as HTMLInputElement).value
        ).toBe("۲۰۲۶/۱۱/۱۰"); // fa locale: Persian digits, Gregorian date
        expect(w.emitted("update:modelValue")).toBeUndefined();
        w.unmount();
    });
    it("clearable and empty text clear the value", async () => {
        const w = make({ modelValue: "2026-11-10", clearable: true });
        await flush();
        await w.get(".vi-clear").trigger("click");
        expect(w.emitted("update:modelValue")!.at(-1)).toEqual([null]);
        w.unmount();
    });
    it("a date-only max includes that day", async () => {
        const w = make({ modelValue: null, max: "2026-11-10", time: "hm" });
        await flush();
        const input = w.get("input.vi-date__input");
        (input.element as HTMLInputElement).value = "2026-11-10 23:00";
        await input.trigger("input");
        await input.trigger("blur");
        expect(w.emitted("update:modelValue")!.at(-1)).toEqual([
            "2026-11-10T23:00"
        ]);
        w.unmount();
    });
    it("closing the popup returns focus to the input without reopening it (regression)", async () => {
        const w = make({ modelValue: "2026-11-10", time: "hm" });
        await w.get("input.vi-date__input").trigger("click");
        await flush();
        expect(document.querySelector(".vi-cal")).toBeTruthy();
        (document.querySelector(".vi-btn--primary") as HTMLElement).click(); // Confirm
        await flush();
        (w.get("input.vi-date__input").element as HTMLInputElement).focus(); // what ViPopup does on close
        await flush();
        expect(document.querySelector(".vi-cal")).toBeNull();
        w.unmount();
    });
    it("hidden input submits ISO", async () => {
        const w = make({ modelValue: "2026-11-10", name: "when" });
        await flush();
        expect(
            (w.get('input[type="hidden"]').element as HTMLInputElement).value
        ).toBe("2026-11-10");
        w.unmount();
    });
});

describe("ViTime", () => {
    const make = (props: Record<string, unknown> = {}, locale = fa) => {
        const w = mount(ViTime, {
            attachTo: document.body,
            props: {
                ...props,
                "onUpdate:modelValue": (v: string | null) =>
                    w.setProps({ modelValue: v })
            },
            ...locale
        });
        return w;
    };
    it("value stays 24h ASCII while 12h display uses Persian am/pm", async () => {
        const w = make({ modelValue: "14:30", hour12: true });
        await flush();
        expect(
            (w.get("input.vi-date__input").element as HTMLInputElement).value
        ).toBe("۰۲:۳۰ ب.ظ");
        w.unmount();
    });
    it("parses typed times in several shapes", async () => {
        const w = make({ modelValue: null });
        await flush();
        const input = w.get("input.vi-date__input");
        for (const [typed, expected] of [
            ["۰۹:۴۵", "09:45"],
            ["2:30 pm", "14:30"],
            ["۰۲:۳۰ ب.ظ", "14:30"]
        ] as const) {
            (input.element as HTMLInputElement).value = typed;
            await input.trigger("input");
            await input.trigger("blur");
            expect(w.emitted("update:modelValue")!.at(-1)).toEqual([expected]);
        }
        w.unmount();
    });
    it("min/max reject typed values and disable panel items", async () => {
        const w = make({ modelValue: null, min: "08:00", max: "18:00" });
        await flush();
        const input = w.get("input.vi-date__input");
        (input.element as HTMLInputElement).value = "07:00";
        await input.trigger("input");
        expect(w.get(".vi-field__msg").text()).toBe("خارج از بازه‌ی مجاز");
        await input.trigger("blur");
        expect(w.emitted("update:modelValue")).toBeUndefined();
        await input.trigger("click");
        await flush();
        const col = document.querySelectorAll(".vi-time__col")[0]!;
        const off = [
            ...col.querySelectorAll<HTMLButtonElement>("button")
        ].filter((b) => b.disabled).length;
        expect(off).toBe(8 + 5); // 0..7 and 19..23
        w.unmount();
    });
    it("minute step and seconds column", async () => {
        const w = make({
            modelValue: "09:45:30",
            seconds: true,
            minuteStep: 15
        });
        await flush();
        await w.get("input.vi-date__input").trigger("click");
        await flush();
        const cols = document.querySelectorAll(".vi-time__col");
        expect(cols).toHaveLength(3);
        expect(cols[1]!.querySelectorAll("button")).toHaveLength(4);
        expect(cols[2]!.querySelectorAll("button")).toHaveLength(60);
        expect(
            (w.get("input.vi-date__input").element as HTMLInputElement).value
        ).toBe("۰۹:۴۵:۳۰");
        w.unmount();
    });
    it("12h panel: choosing PM adds 12 hours", async () => {
        const w = make({ modelValue: "09:30", hour12: true });
        await flush();
        await w.get("input.vi-date__input").trigger("click");
        await flush();
        const pm = [
            ...document.querySelectorAll<HTMLElement>(
                ".vi-time__col--period button"
            )
        ][1]!;
        pm.click();
        await flush();
        expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["21:30"]);
        w.unmount();
    });
});

describe("SSR", () => {
    it("renders calendar, date and time on the server", async () => {
        const app = createSSRApp({
            render: () =>
                h("div", [
                    h(ViCalendar, { modelValue: "2026-11-10" }),
                    h(ViDate, { modelValue: "2026-11-10" }),
                    h(ViTime, { modelValue: "14:30" })
                ])
        });
        const html = await renderToString(app);
        expect(html).toContain("vi-cal");
        expect(html).toContain("vi-date__input");
    });
});
