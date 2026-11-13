import { describe, expect, it } from "vitest";
import {
    civilFromDays,
    daysFromCivil,
    weekdayOfDays
} from "../src/date/gregorian";
import {
    daysToJalali,
    isJalaliLeap,
    jalaliMonthLength,
    jalaliToDays
} from "../src/date/jalali";
import { gregorian, jalali, shiftMonth } from "../src/date/calendar";
import { PlainDateTime } from "../src/date/plain";

const g = (y: number, m: number, d: number) => daysFromCivil(y, m, d);

describe("gregorian", () => {
    it("epoch and known weekdays", () => {
        expect(g(1970, 1, 1)).toBe(0);
        expect(weekdayOfDays(g(1970, 1, 1))).toBe(4); // Thursday
        expect(weekdayOfDays(g(2026, 11, 10))).toBe(2); // Tuesday
    });
    it("round-trips every day 1600..2400", () => {
        // 292k days: one cheap check per day, one assertion at the end (292k `expect` calls hit the 5 s limit on a busy machine)
        let bad = 0;
        for (let d = g(1600, 1, 1); d <= g(2400, 12, 31); d++) {
            const c = civilFromDays(d);
            if (daysFromCivil(c.year, c.month, c.day) !== d) bad++;
        }
        expect(bad).toBe(0);
    });
    it("leap rules", () => {
        expect(gregorian.isLeap(2000)).toBe(true);
        expect(gregorian.isLeap(1900)).toBe(false);
        expect(gregorian.monthLength(2024, 2)).toBe(29);
        expect(gregorian.monthLength(2023, 2)).toBe(28);
    });
});

describe("jalali", () => {
    it("known anchor dates", () => {
        expect(daysToJalali(g(2025, 3, 21))).toEqual({
            year: 1404,
            month: 1,
            day: 1
        });
        expect(daysToJalali(g(2026, 11, 10))).toEqual({
            year: 1405,
            month: 8,
            day: 19
        });
        expect(daysToJalali(g(2024, 3, 20))).toEqual({
            year: 1403,
            month: 1,
            day: 1
        });
        expect(daysToJalali(g(1979, 2, 11))).toEqual({
            year: 1357,
            month: 11,
            day: 22
        });
        expect(jalaliToDays(1370, 1, 1)).toBe(g(1991, 3, 21));
    });
    it("known leap years (astronomical, not the 33-year rule alone)", () => {
        for (const y of [
            1370, 1375, 1379, 1383, 1387, 1391, 1395, 1399, 1403, 1408
        ]) {
            expect(isJalaliLeap(y), String(y)).toBe(true);
        }
        for (const y of [1400, 1401, 1402, 1404, 1405, 1406, 1407]) {
            expect(isJalaliLeap(y), String(y)).toBe(false);
        }
        expect(jalaliMonthLength(1403, 12)).toBe(30);
        expect(jalaliMonthLength(1404, 12)).toBe(29);
        expect(jalaliMonthLength(1404, 6)).toBe(31);
        expect(jalaliMonthLength(1404, 7)).toBe(30);
    });
    it("round-trips every day 1800..2300 (Gregorian)", () => {
        for (let d = g(1800, 1, 1); d <= g(2300, 12, 31); d++) {
            const j = daysToJalali(d);
            expect(jalaliToDays(j.year, j.month, j.day)).toBe(d);
            expect(j.day).toBeLessThanOrEqual(
                jalaliMonthLength(j.year, j.month)
            );
        }
    });
    it("consecutive days are consecutive Jalali dates", () => {
        let prev = daysToJalali(g(1900, 1, 1));
        for (let d = g(1900, 1, 2); d <= g(2100, 12, 31); d++) {
            const j = daysToJalali(d);
            const nextDay = prev.day < jalaliMonthLength(prev.year, prev.month);
            const expected = nextDay
                ? { year: prev.year, month: prev.month, day: prev.day + 1 }
                : prev.month < 12
                  ? { year: prev.year, month: prev.month + 1, day: 1 }
                  : { year: prev.year + 1, month: 1, day: 1 };
            expect(j).toEqual(expected);
            prev = j;
        }
    });
    it("agrees with the browser's ICU Persian calendar for 1800..2123", () => {
        const fmt = new Intl.DateTimeFormat("en-u-ca-persian-nu-latn", {
            timeZone: "UTC",
            year: "numeric",
            month: "numeric",
            day: "numeric"
        });
        const bad: string[] = [];
        for (let d = g(1800, 1, 1); d <= g(2123, 12, 31); d++) {
            const p = fmt.formatToParts(new Date(d * 86400000));
            const n = (t: string) => Number(p.find((x) => x.type === t)!.value);
            const j = daysToJalali(d);
            if (
                j.year !== (n("year") || n("relatedYear")) ||
                j.month !== n("month") ||
                j.day !== n("day")
            ) {
                bad.push(`${d}`);
                if (bad.length > 3) break;
            }
        }
        expect(bad).toEqual([]);
    });
    it("rejects years outside the supported range", () => {
        expect(() => jalaliToDays(3300, 1, 1)).toThrow(RangeError);
        expect(jalali.isValid(3300, 1, 1)).toBe(false);
    });
    it("validates dates", () => {
        expect(jalali.isValid(1404, 12, 30)).toBe(false);
        expect(jalali.isValid(1403, 12, 30)).toBe(true);
        expect(jalali.isValid(1404, 7, 31)).toBe(false);
        expect(jalali.isValid(1404, 13, 1)).toBe(false);
        expect(jalali.isValid(1404, 1, 0)).toBe(false);
        expect(jalali.isValid(1404.5, 1, 1)).toBe(false);
    });
});

describe("shiftMonth", () => {
    it("wraps years both ways", () => {
        expect(shiftMonth(1404, 12, 1)).toEqual({ year: 1405, month: 1 });
        expect(shiftMonth(1404, 1, -1)).toEqual({ year: 1403, month: 12 });
        expect(shiftMonth(2026, 11, 14)).toEqual({ year: 2028, month: 1 });
        expect(shiftMonth(2026, 1, -13)).toEqual({ year: 2024, month: 12 });
    });
});

describe("PlainDateTime", () => {
    it("parses ISO date, date-time, space, fractions and ignores zone", () => {
        expect(PlainDateTime.fromISO("2026-11-10")!.toISO()).toBe(
            "2026-11-10T00:00:00"
        );
        expect(PlainDateTime.fromISO("2026-11-10T14:30")!.toISO()).toBe(
            "2026-11-10T14:30:00"
        );
        expect(PlainDateTime.fromISO("2026-11-10 14:30:15.123")!.toISO()).toBe(
            "2026-11-10T14:30:15"
        );
        expect(PlainDateTime.fromISO("2026-11-10T14:30:00Z")!.toISO()).toBe(
            "2026-11-10T14:30:00"
        );
        expect(
            PlainDateTime.fromISO("2026-11-10T14:30:00+03:30")!.toISO()
        ).toBe("2026-11-10T14:30:00");
    });
    it("rejects invalid input instead of rolling over", () => {
        for (const bad of [
            "",
            "abc",
            "2026-02-30",
            "2026-13-01",
            "2026-11-10T25:00",
            "2026-11-10T10:61",
            null,
            undefined,
            "26-1-1"
        ]) {
            expect(PlainDateTime.fromISO(bad as string)).toBeNull();
        }
        expect(
            PlainDateTime.fromObject(
                { year: 1404, month: 12, day: 30 },
                "jalali"
            )
        ).toBeNull();
    });
    it("builds from Jalali parts and reads parts in either calendar", () => {
        const d = PlainDateTime.fromObject(
            { year: 1405, month: 8, day: 19, hour: 14, minute: 30 },
            "jalali"
        )!;
        expect(d.toISO()).toBe("2026-11-10T14:30:00");
        expect(d.get("jalali")).toEqual({ year: 1405, month: 8, day: 19 });
        expect(d.get()).toEqual({ year: 2026, month: 11, day: 10 });
        expect([d.year, d.month, d.day, d.hour, d.minute, d.second]).toEqual([
            2026, 11, 10, 14, 30, 0
        ]);
    });
    it("weekday is ISO (Monday=1, Sunday=7)", () => {
        expect(PlainDateTime.fromISO("2026-11-10")!.weekday).toBe(2);
        expect(PlainDateTime.fromISO("2026-11-08")!.weekday).toBe(7);
        expect(PlainDateTime.fromISO("2026-11-09")!.weekday).toBe(1);
    });
    it("plus/minus months move in the chosen calendar (the old Luxon bug)", () => {
        // 30 Mehr + 1 Jalali month = 30 Aban, never Azar; 31 Shahrivar clamps to 30 Mehr
        const mehr30 = PlainDateTime.fromObject(
            { year: 1405, month: 7, day: 30 },
            "jalali"
        )!;
        expect(mehr30.plus({ months: 1 }, "jalali").get("jalali")).toEqual({
            year: 1405,
            month: 8,
            day: 30
        });
        const sh31 = PlainDateTime.fromObject(
            { year: 1405, month: 6, day: 31 },
            "jalali"
        )!;
        expect(sh31.plus({ months: 1 }, "jalali").get("jalali")).toEqual({
            year: 1405,
            month: 7,
            day: 30
        });
        // walk 24 months forward then back: every month visited exactly once
        let d = PlainDateTime.fromObject(
            { year: 1405, month: 1, day: 1 },
            "jalali"
        )!;
        const seen: number[] = [];
        for (let i = 0; i < 24; i++) {
            seen.push(d.get("jalali").month);
            d = d.plus({ months: 1 }, "jalali");
        }
        expect(seen).toEqual(
            [...Array(12).keys(), ...Array(12).keys()].map((x) => x + 1)
        );
        expect(d.minus({ months: 24 }, "jalali").get("jalali")).toEqual({
            year: 1405,
            month: 1,
            day: 1
        });
    });
    it("gregorian month math clamps like Luxon", () => {
        const d = PlainDateTime.fromISO("2026-01-31")!;
        expect(d.plus({ months: 1 }).toISODate()).toBe("2026-02-28");
        expect(
            PlainDateTime.fromISO("2024-02-29")!.plus({ years: 1 }).toISODate()
        ).toBe("2025-02-28");
        expect(d.minus({ months: 2 }).toISODate()).toBe("2025-11-30");
    });
    it("Esfand 30 + 1 Jalali year clamps to 29 in a non-leap year", () => {
        const d = PlainDateTime.fromObject(
            { year: 1403, month: 12, day: 30 },
            "jalali"
        )!;
        expect(d.plus({ years: 1 }, "jalali").get("jalali")).toEqual({
            year: 1404,
            month: 12,
            day: 29
        });
    });
    it("time arithmetic carries into days both ways", () => {
        const d = PlainDateTime.fromISO("2026-11-10T23:30")!;
        expect(d.plus({ minutes: 45 }).toISO()).toBe("2026-11-11T00:15:00");
        expect(d.minus({ hours: 24, minutes: 30 }).toISO()).toBe(
            "2026-11-09T23:00:00"
        );
        expect(
            PlainDateTime.fromISO("2026-01-01T00:00")!
                .minus({ seconds: 1 })
                .toISO()
        ).toBe("2025-12-31T23:59:59");
        expect(d.plus({ days: 30 }).toISODate()).toBe("2026-12-10");
    });
    it("startOf / endOf / hasSame", () => {
        const d = PlainDateTime.fromObject(
            { year: 1405, month: 8, day: 19, hour: 14, minute: 30, second: 5 },
            "jalali"
        )!;
        expect(d.startOf("month", "jalali").get("jalali")).toEqual({
            year: 1405,
            month: 8,
            day: 1
        });
        expect(d.startOf("year", "jalali").get("jalali")).toEqual({
            year: 1405,
            month: 1,
            day: 1
        });
        expect(d.endOf("month", "jalali").get("jalali")).toEqual({
            year: 1405,
            month: 8,
            day: 30
        });
        expect(d.endOf("day").toISOTime()).toBe("23:59:59");
        expect(d.startOf("hour").toISOTime()).toBe("14:00:00");
        expect(d.startOf("minute").toISOTime()).toBe("14:30:00");
        expect(d.hasSame(d.plus({ days: 3 }), "month", "jalali")).toBe(true);
        expect(d.hasSame(d.plus({ days: 20 }), "month", "jalali")).toBe(false);
    });
    it("compare, equals, valueOf and JSON", () => {
        const a = PlainDateTime.fromISO("2026-11-10T10:00")!;
        const b = PlainDateTime.fromISO("2026-11-10T10:00:01")!;
        expect(PlainDateTime.compare(a, b)).toBeLessThan(0);
        expect(a < b).toBe(true);
        expect(a.equals(PlainDateTime.fromISO("2026-11-10T10:00:00"))).toBe(
            true
        );
        expect(JSON.stringify({ at: a })).toBe('{"at":"2026-11-10T10:00:00"}');
    });
    it("daysInMonth and isLeapYear per calendar", () => {
        const d = PlainDateTime.fromObject(
            { year: 1403, month: 12, day: 1 },
            "jalali"
        )!;
        expect(d.daysInMonth("jalali")).toBe(30);
        expect(d.isLeapYear("jalali")).toBe(true);
        expect(PlainDateTime.fromISO("2026-02-01")!.daysInMonth()).toBe(28);
    });
    it("converts to and from JS Date at local wall-clock time", () => {
        const d = PlainDateTime.fromISO("2026-11-10T14:30:05")!;
        const js = d.toJSDate();
        expect([
            js.getFullYear(),
            js.getMonth(),
            js.getDate(),
            js.getHours(),
            js.getMinutes(),
            js.getSeconds()
        ]).toEqual([2026, 10, 10, 14, 30, 5]);
        expect(PlainDateTime.fromJSDate(js)!.equals(d)).toBe(true);
        expect(PlainDateTime.fromJSDate(new Date("nope"))).toBeNull();
    });
    it("handles years before 1000 and far future in ISO", () => {
        expect(
            PlainDateTime.fromISO("0999-12-31")!.plus({ days: 1 }).toISODate()
        ).toBe("1000-01-01");
        expect(
            PlainDateTime.fromISO("2999-12-31")!.plus({ days: 1 }).toISODate()
        ).toBe("3000-01-01");
    });
});
