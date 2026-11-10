import { describe, expect, it } from "vitest";
import {
    format,
    parseUserInput,
    weekColumn,
    weekdayLabels,
    monthNames
} from "../src/date/format";
import { PlainDateTime } from "../src/date/plain";
import {
    formatTime,
    fromTimeString,
    parseTime,
    toTimeString
} from "../src/date/time";
import { dayOutside, parseBound } from "../src/date/range";

const d = PlainDateTime.fromISO("2026-11-10T14:05:09")!;

describe("format", () => {
    it("jalali in Persian with Persian digits", () => {
        expect(
            format(d, "yyyy/MM/dd", { calendar: "jalali", locale: "fa" })
        ).toBe("۱۴۰۵/۰۸/۱۹");
        expect(
            format(d, "d MMMM yyyy", { calendar: "jalali", locale: "fa" })
        ).toBe("۱۹ آبان ۱۴۰۵");
        expect(
            format(d, "EEEE d MMMM yyyy", { calendar: "jalali", locale: "fa" })
        ).toBe("سه‌شنبه ۱۹ آبان ۱۴۰۵");
    });
    it("gregorian in English keeps ASCII", () => {
        expect(format(d, "yyyy-MM-dd HH:mm:ss")).toBe("2026-11-10 14:05:09");
        expect(format(d, "EEEE d MMMM yyyy", { locale: "en" })).toBe(
            "Tuesday 10 November 2026"
        );
        expect(format(d, "h:mm a")).toBe("2:05 PM");
    });
    it("jalali month names in English", () => {
        expect(format(d, "MMMM", { calendar: "jalali", locale: "en" })).toBe(
            "Aban"
        );
    });
    it("quoted literals are untouched, including digits", () => {
        expect(format(d, "'Q4' yyyy", { locale: "fa" })).toBe("Q4 ۲۰۲۶");
    });
    it("12-hour edge cases", () => {
        expect(
            format(PlainDateTime.fromISO("2026-01-01T00:30")!, "h:mm a")
        ).toBe("12:30 AM");
        expect(
            format(PlainDateTime.fromISO("2026-01-01T12:30")!, "hh:mm a", {
                locale: "fa"
            })
        ).toBe("۱۲:۳۰ ب.ظ");
    });
});

describe("week layout", () => {
    it("weekdayLabels order for Saturday and Monday starts", () => {
        expect(weekdayLabels("fa", 0)).toEqual([
            "ش",
            "ی",
            "د",
            "س",
            "چ",
            "پ",
            "ج"
        ]);
        expect(weekdayLabels("en", 1)[0]).toBe("Su");
        expect(weekdayLabels("en", 2)[0]).toBe("Mo");
    });
    it("weekColumn: Tuesday 2026-11-10 in a Saturday-first and a Monday-first week", () => {
        const days = d.days;
        expect(weekColumn(days, 0)).toBe(3); // Sat, Sun, Mon, Tue
        expect(weekColumn(days, 2)).toBe(1); // Mon, Tue
        expect(weekColumn(PlainDateTime.fromISO("2026-11-07")!.days, 0)).toBe(
            0
        ); // a Saturday
    });
    it("month names exist for every calendar/locale", () => {
        for (const l of ["fa", "en"])
            for (const c of ["jalali", "gregorian"] as const)
                expect(monthNames(c, l)).toHaveLength(12);
    });
});

describe("parseUserInput", () => {
    it("accepts Persian digits and mixed separators; 4-digit year decides the calendar", () => {
        expect(parseUserInput("۱۴۰۵/۰۸/۱۹")).toEqual({
            date: { year: 1405, month: 8, day: 19 },
            calendar: "jalali"
        });
        expect(parseUserInput("1405-8-19")!.calendar).toBe("jalali");
        expect(parseUserInput("2026.11.10")).toEqual({
            date: { year: 2026, month: 11, day: 10 },
            calendar: "gregorian"
        });
    });
    it("day-first input", () => {
        expect(parseUserInput("19/8/1405")!.date).toEqual({
            year: 1405,
            month: 8,
            day: 19
        });
    });
    it("time part", () => {
        expect(parseUserInput("1405/8/19 14:30")!.time).toEqual({
            hour: 14,
            minute: 30,
            second: 0
        });
        expect(parseUserInput("1405/8/19 ۰۹:۱۵:۲۰")!.time).toEqual({
            hour: 9,
            minute: 15,
            second: 20
        });
    });
    it("rejects junk and ambiguous short years", () => {
        for (const bad of [
            "",
            "abc",
            "1405/8",
            "5/8/19",
            "1405/8/19/1",
            "14050819"
        ])
            expect(parseUserInput(bad)).toBeNull();
    });
});

describe("time helpers", () => {
    it("toTimeString / fromTimeString round trip", () => {
        expect(toTimeString(9 * 3600 + 45 * 60 + 30, true)).toBe("09:45:30");
        expect(toTimeString(14 * 3600 + 30 * 60)).toBe("14:30");
        expect(fromTimeString("09:45:30")).toBe(35130);
        expect(fromTimeString("24:00")).toBeNull();
        expect(fromTimeString("9:45")).toBeNull();
        expect(fromTimeString(null)).toBeNull();
    });
    it("parseTime is lenient", () => {
        expect(parseTime("14:30")).toBe(14 * 3600 + 1800);
        expect(parseTime("۱۴:۳۰")).toBe(14 * 3600 + 1800);
        expect(parseTime("2:30 pm")).toBe(14 * 3600 + 1800);
        expect(parseTime("۰۲:۳۰ ب.ظ")).toBe(14 * 3600 + 1800);
        expect(parseTime("12:00 am")).toBe(0);
        expect(parseTime("12:15 pm")).toBe(12 * 3600 + 900);
        expect(parseTime("14.30.15")).toBe(14 * 3600 + 1815);
    });
    it("parseTime rejects impossible times", () => {
        for (const bad of [
            "",
            "25:00",
            "12:60",
            "13:00 pm",
            "0:30 am",
            "abc",
            "12"
        ])
            expect(parseTime(bad)).toBeNull();
    });
    it("formatTime 24h / 12h / seconds / Persian", () => {
        expect(formatTime(14 * 3600 + 1800, { locale: "fa" })).toBe("۱۴:۳۰");
        expect(
            formatTime(14 * 3600 + 1800, { hour12: true, locale: "fa" })
        ).toBe("۰۲:۳۰ ب.ظ");
        expect(formatTime(0, { hour12: true })).toBe("12:00 AM");
        expect(formatTime(9 * 3600 + 45 * 60 + 30, { seconds: true })).toBe(
            "09:45:30"
        );
    });
});

describe("range bounds", () => {
    it("date-only max includes the whole day, min starts at 00:00", () => {
        expect(parseBound("2026-12-31", "max")!.toISO()).toBe(
            "2026-12-31T23:59:59"
        );
        expect(parseBound("2026-12-31", "min")!.toISO()).toBe(
            "2026-12-31T00:00:00"
        );
        expect(parseBound("2026-12-31T10:00", "max")!.toISO()).toBe(
            "2026-12-31T10:00:00"
        );
        expect(parseBound("", "min")).toBeNull();
        expect(parseBound("junk", "max")).toBeNull();
    });
    it("dayOutside", () => {
        const min = parseBound("2026-11-05", "min");
        const max = parseBound("2026-11-15", "max");
        const day = (s: string) => PlainDateTime.fromISO(s)!.days;
        expect(dayOutside(day("2026-11-04"), min, max)).toBe(true);
        expect(dayOutside(day("2026-11-15"), min, max)).toBe(false);
        expect(dayOutside(day("2026-11-16"), min, max)).toBe(true);
        expect(dayOutside(day("2030-01-01"), null, null)).toBe(false);
    });
});
