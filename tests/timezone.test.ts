import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import {
    ViTimeZone,
    detectTimeZone,
    formatOffset,
    timeZoneOptions,
    viputy
} from "../src";

const oct = new Date("2026-10-24T12:00:00Z");
const find = (list: ReturnType<typeof timeZoneOptions>, id: string) =>
    list.find((o) => o.value === id)!;

describe("timeZoneOptions", () => {
    it("lists UTC and real zones sorted by offset", () => {
        const l = timeZoneOptions("en", oct);
        expect(l.length).toBeGreaterThan(300);
        expect(find(l, "UTC").offset).toBe(0);
        for (let i = 1; i < l.length; i++)
            expect(l[i]!.offset).toBeGreaterThanOrEqual(l[i - 1]!.offset);
    });
    it("Tehran is +03:30 now but +04:30 in the old summer time", () => {
        expect(
            find(timeZoneOptions("en", oct), "Asia/Tehran").description
        ).toBe("UTC+03:30 \u00b7 Asia/Tehran");
        expect(
            find(
                timeZoneOptions("en", new Date("2020-07-01T08:00:00Z")),
                "Asia/Tehran"
            ).offset
        ).toBe(270);
    });
    it("follows daylight saving: London is +01:00 on 24 Oct, +00:00 on 26 Oct", () => {
        expect(find(timeZoneOptions("en", oct), "Europe/London").offset).toBe(
            60
        );
        expect(
            find(
                timeZoneOptions("en", new Date("2026-10-26T12:00:00Z")),
                "Europe/London"
            ).offset
        ).toBe(0);
    });
    it("handles negative and half-hour offsets", () => {
        const l = timeZoneOptions("en", oct);
        expect(find(l, "America/New_York").offset).toBe(-240);
        expect(
            find(timeZoneOptions("en", oct, ["Asia/Kolkata"]), "Asia/Kolkata")
                .offset
        ).toBe(330);
        expect(formatOffset(-210)).toBe("UTC-03:30");
        expect(formatOffset(0)).toBe("UTC+00:00");
    });
    it("localises the name but keeps Latin offsets", () => {
        const fa = find(timeZoneOptions("fa", oct), "Asia/Tehran");
        expect(fa.label).toContain("ایران");
        expect(fa.description).toBe("UTC+03:30 \u00b7 Asia/Tehran");
    });
    it("restricts to `zones` and skips unknown ids", () => {
        const l = timeZoneOptions("en", oct, ["Asia/Tehran", "Not/AZone"]);
        expect(l.map((o) => o.value)).toEqual(["Asia/Tehran"]);
    });
    it("writes ids with spaces so a city search matches (new york)", () => {
        expect(
            find(timeZoneOptions("en", oct), "America/New_York").description
        ).toBe("UTC-04:00 \u00b7 America/New York");
    });
    it("lists a value the runtime does not (Asia/Kolkata vs Asia/Calcutta)", () => {
        const l = timeZoneOptions("en", oct, undefined, [
            "Asia/Kolkata",
            "Not/AZone"
        ]);
        expect(find(l, "Asia/Kolkata").description).toBe(
            "UTC+05:30 \u00b7 Asia/Kolkata"
        );
        expect(l.some((o) => o.value === "Not/AZone")).toBe(false);
    });
    it('detectTimeZone returns the runtime zone, a valid id ("UTC" on a CI runner)', () => {
        const id = detectTimeZone()!;
        expect(id).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
        expect(
            () => new Intl.DateTimeFormat("en", { timeZone: id })
        ).not.toThrow();
    });
});

describe("ViTimeZone", () => {
    const mountIt = (props: Record<string, unknown> = {}, locale = "en") =>
        mount(ViTimeZone, {
            props,
            global: { plugins: [[viputy, { locale }]] }
        });

    it("shows the current zone by name and emits the IANA id when one is picked", async () => {
        const w = mountIt({
            modelValue: "Asia/Tehran",
            at: "2026-10-24T12:00:00Z",
            zones: ["Asia/Tehran", "Europe/London", "UTC"],
            label: "Zone"
        });
        expect(w.text()).toContain("Zone");
        await w.find(".vi-select__control, [role=combobox]").trigger("click");
        const rows = document.body.querySelectorAll('[role="option"]');
        expect(rows.length).toBe(3);
        (
            Array.from(rows).find((r) =>
                r.textContent?.includes("Europe/London")
            ) as HTMLElement
        ).click();
        expect(w.emitted("update:modelValue")?.[0]).toEqual(["Europe/London"]);
        w.unmount();
    });
    it("uses the localised placeholder", () => {
        expect(mountIt({ zones: ["UTC"] }, "fa").text()).toContain(
            "منطقه زمانی"
        );
    });
});
