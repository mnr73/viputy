import {
    civilFromDays,
    daysFromCivil,
    gregorianMonthLength,
    isGregorianLeap,
    type Ymd
} from "./gregorian";
import {
    daysToJalali,
    isJalaliLeap,
    jalaliMonthLength,
    jalaliToDays
} from "./jalali";

export type CalendarId = "gregorian" | "jalali";
export type { Ymd };

export interface Calendar {
    id: CalendarId;
    fromDays(days: number): Ymd;
    toDays(year: number, month: number, day: number): number;
    monthLength(year: number, month: number): number;
    isLeap(year: number): boolean;
    /** Whether the year/month/day triple exists in this calendar. */
    isValid(year: number, month: number, day: number): boolean;
}

function make(c: Omit<Calendar, "isValid">): Calendar {
    return {
        ...c,
        isValid(y, m, d) {
            if (
                ![y, m, d].every(Number.isInteger) ||
                m < 1 ||
                m > 12 ||
                d < 1
            ) {
                return false;
            }
            try {
                return d <= c.monthLength(y, m);
            } catch {
                return false; // year outside the supported range
            }
        }
    };
}

export const gregorian = make({
    id: "gregorian",
    fromDays: civilFromDays,
    toDays: daysFromCivil,
    monthLength: gregorianMonthLength,
    isLeap: isGregorianLeap
});

export const jalali = make({
    id: "jalali",
    fromDays: daysToJalali,
    toDays: jalaliToDays,
    monthLength: jalaliMonthLength,
    isLeap: isJalaliLeap
});

export const calendars: Record<CalendarId, Calendar> = { gregorian, jalali };
export const getCalendar = (id: CalendarId): Calendar => calendars[id];

/** Month arithmetic in a given calendar: shifts (year, month) by `n` months. */
export function shiftMonth(year: number, month: number, n: number) {
    const total = year * 12 + (month - 1) + n;
    return {
        year: Math.floor(total / 12),
        month: (((total % 12) + 12) % 12) + 1
    };
}
