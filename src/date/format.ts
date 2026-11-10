import { getCalendar, type CalendarId } from "./calendar";
import { toPersianDigits } from "../utils/text";
import type { PlainDateTime } from "./plain";

export const MONTHS: Record<string, Record<CalendarId, string[]>> = {
    fa: {
        jalali: [
            "فروردین",
            "اردیبهشت",
            "خرداد",
            "تیر",
            "مرداد",
            "شهریور",
            "مهر",
            "آبان",
            "آذر",
            "دی",
            "بهمن",
            "اسفند"
        ],
        gregorian: [
            "ژانویه",
            "فوریه",
            "مارس",
            "آوریل",
            "مه",
            "ژوئن",
            "ژوئیه",
            "اوت",
            "سپتامبر",
            "اکتبر",
            "نوامبر",
            "دسامبر"
        ]
    },
    en: {
        jalali: [
            "Farvardin",
            "Ordibehesht",
            "Khordad",
            "Tir",
            "Mordad",
            "Shahrivar",
            "Mehr",
            "Aban",
            "Azar",
            "Dey",
            "Bahman",
            "Esfand"
        ],
        gregorian: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ]
    }
};

/** Index 0 = Saturday .. 6 = Friday (the Persian week). */
export const WEEKDAYS_SAT: Record<string, { long: string[]; short: string[] }> =
    {
        fa: {
            long: [
                "شنبه",
                "یکشنبه",
                "دوشنبه",
                "سه‌شنبه",
                "چهارشنبه",
                "پنجشنبه",
                "جمعه"
            ],
            short: ["ش", "ی", "د", "س", "چ", "پ", "ج"]
        },
        en: {
            long: [
                "Saturday",
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday"
            ],
            short: ["Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"]
        }
    };

const lang = (locale: string) => (locale.split("-")[0] === "fa" ? "fa" : "en");
const pad = (n: number) => String(n).padStart(2, "0");

export function monthNames(calendar: CalendarId, locale: string): string[] {
    return MONTHS[lang(locale)]![calendar];
}

/**
 * Weekday header labels in display order for a week that starts on
 * `weekStart` (0 = Saturday, 1 = Sunday, 2 = Monday ... 6 = Friday).
 */
export function weekdayLabels(
    locale: string,
    weekStart: number,
    style: "short" | "long" = "short"
): string[] {
    const all = WEEKDAYS_SAT[lang(locale)]![style];
    return Array.from({ length: 7 }, (_, i) => all[(weekStart + i) % 7]!);
}

/** Column (0..6) of a day within a week that starts on `weekStart`. */
export function weekColumn(days: number, weekStart: number): number {
    // 1970-01-01 was a Thursday; Saturday-based index of a day = (days + 5) mod 7
    const sat = (((days + 5) % 7) + 7) % 7;
    return (((sat - weekStart) % 7) + 7) % 7;
}

export function digits(value: string | number, locale: string): string {
    return lang(locale) === "fa" ? toPersianDigits(value) : String(value);
}

export interface FormatOptions {
    calendar?: CalendarId;
    locale?: string;
}

/**
 * Small token formatter (Luxon-like). Tokens: yyyy yy M MM MMM(name) MMMM(name)
 * d dd H HH h hh m mm s ss a (am/pm) EEEE (weekday name). Wrap literal text in
 * single quotes. Digits are localized for `fa`.
 */
export function format(
    dt: PlainDateTime,
    pattern: string,
    o: FormatOptions = {}
): string {
    const calendar = o.calendar ?? "gregorian";
    const locale = o.locale ?? "en";
    const { year, month, day } = getCalendar(calendar).fromDays(dt.days);
    const h12 = dt.hour % 12 || 12;
    const names = monthNames(calendar, locale);
    const weekIdx = weekColumn(dt.days, 0);
    const map: Record<string, string> = {
        yyyy: String(year).padStart(4, "0"),
        yy: String(year % 100).padStart(2, "0"),
        MMMM: names[month - 1]!,
        MMM: names[month - 1]!,
        MM: pad(month),
        M: String(month),
        EEEE: WEEKDAYS_SAT[lang(locale)]!.long[weekIdx]!,
        dd: pad(day),
        d: String(day),
        HH: pad(dt.hour),
        H: String(dt.hour),
        hh: pad(h12),
        h: String(h12),
        mm: pad(dt.minute),
        m: String(dt.minute),
        ss: pad(dt.second),
        s: String(dt.second),
        a:
            dt.hour < 12
                ? lang(locale) === "fa"
                    ? "ق.ظ"
                    : "AM"
                : lang(locale) === "fa"
                  ? "ب.ظ"
                  : "PM"
    };
    const out = pattern.replace(
        /'([^']*)'|yyyy|yy|MMMM|MMM|MM|M|EEEE|dd|d|HH|H|hh|h|mm|m|ss|s|a/g,
        (tok, lit) =>
            lit !== undefined ? `\u0000${lit}\u0000` : (map[tok] ?? tok)
    );
    // digits only in generated parts, not in quoted literals
    return out
        .split("\u0000")
        .map((part, i) =>
            i % 2 === 1
                ? part
                : lang(locale) === "fa"
                  ? toPersianDigits(part)
                  : part
        )
        .join("");
}

/**
 * Parse what a user typed. Accepts Persian/Arabic digits and `/ - .` separators:
 * `1405/8/19`, `۱۴۰۵-۰۸-۱۹`, `19/8/1405`, `2026/11/10 14:30`. The 4-digit year
 * decides the calendar: below 1700 is Jalali, otherwise Gregorian.
 */
export function parseUserInput(text: string): {
    date: { year: number; month: number; day: number };
    calendar: CalendarId;
    time?: { hour: number; minute: number; second: number };
} | null {
    const t = toLatin(text).trim();
    const m =
        /^(\d{1,4})[/\-.](\d{1,2})[/\-.](\d{1,4})(?:[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(
            t
        );
    if (!m) return null;
    let year: number, month: number, day: number;
    if (m[1]!.length === 4 && m[3]!.length <= 2)
        [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
    else if (m[3]!.length === 4 && m[1]!.length <= 2)
        [year, month, day] = [Number(m[3]), Number(m[2]), Number(m[1])];
    else return null;
    return {
        date: { year, month, day },
        calendar: year < 1700 ? "jalali" : "gregorian",
        ...(m[4] !== undefined && {
            time: {
                hour: Number(m[4]),
                minute: Number(m[5]),
                second: m[6] ? Number(m[6]) : 0
            }
        })
    };
}

function toLatin(s: string): string {
    return s.replace(/[۰-۹٠-٩]/g, (c) => {
        const i = "۰۱۲۳۴۵۶۷۸۹".indexOf(c);
        return String(i >= 0 ? i : "٠١٢٣٤٥٦٧٨٩".indexOf(c));
    });
}
