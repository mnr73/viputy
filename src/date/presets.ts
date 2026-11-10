import { PlainDateTime } from "./plain";
import type { CalendarId } from "./calendar";

export type PresetKey =
    "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "lastMonth";

export interface RangeValue {
    /** ISO `YYYY-MM-DD` (or date-time when the picker has `time`). */
    start: string | null;
    end: string | null;
}

/** Inclusive day range of a preset, relative to `now`, calendar-aware for "month" presets. */
export function presetRange(
    key: PresetKey,
    now: PlainDateTime,
    calendar: CalendarId
): [PlainDateTime, PlainDateTime] {
    const today = now.startOf("day");
    switch (key) {
        case "today":
            return [today, today];
        case "yesterday": {
            const y = today.minus({ days: 1 });
            return [y, y];
        }
        case "last7":
            return [today.minus({ days: 6 }), today];
        case "last30":
            return [today.minus({ days: 29 }), today];
        case "thisMonth":
            return [
                today.startOf("month", calendar),
                today.endOf("month", calendar).startOf("day")
            ];
        case "lastMonth": {
            const prev = today
                .startOf("month", calendar)
                .minus({ months: 1 }, calendar);
            return [prev, prev.endOf("month", calendar).startOf("day")];
        }
    }
}

export const ALL_PRESETS: PresetKey[] = [
    "today",
    "yesterday",
    "last7",
    "last30",
    "thisMonth",
    "lastMonth"
];

/** Days between two ISO dates, inclusive. */
export function spanDays(a: PlainDateTime, b: PlainDateTime): number {
    return Math.abs(b.days - a.days) + 1;
}
