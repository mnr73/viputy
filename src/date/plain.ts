import { getCalendar, shiftMonth, type CalendarId, type Ymd } from "./calendar";
import { civilFromDays, daysFromCivil, mod, weekdayOfDays } from "./gregorian";

export type Unit = "year" | "month" | "day" | "hour" | "minute" | "second";

export interface DurationLike {
    years?: number;
    months?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

export interface DateTimeParts {
    year: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
}

const pad = (n: number, len = 2) => String(n).padStart(len, "0");
const ISO =
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:[.,]\d+)?)?)?(?:Z|[+-]\d{2}(?::?\d{2})?)?$/;

/**
 * A wall-clock date and time with no time zone: immutable, Luxon-like, ISO in
 * and out. Internally `days` since 1970-01-01 plus `seconds` of the day, so
 * comparisons are plain number comparisons and nothing depends on the machine's
 * time zone or on `Date`.
 *
 * Unlike Luxon, invalid input returns `null` instead of an "invalid" object,
 * and a trailing `Z`/offset in an ISO string is ignored (the wall-clock time
 * as written is kept).
 */
export class PlainDateTime {
    private constructor(
        readonly days: number,
        readonly seconds: number
    ) {}

    static fromDays(days: number, seconds = 0): PlainDateTime {
        return new PlainDateTime(days, seconds);
    }

    /** `YYYY-MM-DD` or `YYYY-MM-DD[T ]HH:mm[:ss[.fff]]` (+ optional Z/offset, ignored). */
    static fromISO(text: string | null | undefined): PlainDateTime | null {
        const m = ISO.exec((text ?? "").trim());
        if (!m) return null;
        const [y, mo, d, h = 0, mi = 0, s = 0] = m
            .slice(1)
            .map((x) => (x === undefined ? 0 : Number(x)));
        return PlainDateTime.fromObject({
            year: y!,
            month: mo,
            day: d,
            hour: h,
            minute: mi,
            second: s
        });
    }

    /** Build from parts of the given calendar. Returns `null` if they do not exist. */
    static fromObject(
        p: DateTimeParts,
        calendar: CalendarId = "gregorian"
    ): PlainDateTime | null {
        const {
            year,
            month = 1,
            day = 1,
            hour = 0,
            minute = 0,
            second = 0
        } = p;
        const cal = getCalendar(calendar);
        if (!cal.isValid(year, month, day)) return null;
        if (!(
            hour >= 0 &&
            hour < 24 &&
            minute >= 0 &&
            minute < 60 &&
            second >= 0 &&
            second < 60
        ))
            return null;
        if (![hour, minute, second].every(Number.isInteger)) return null;
        return new PlainDateTime(
            cal.toDays(year, month, day),
            hour * 3600 + minute * 60 + second
        );
    }

    /** Local wall-clock components of a JS Date. */
    static fromJSDate(d: Date): PlainDateTime | null {
        if (Number.isNaN(d.getTime())) return null;
        return PlainDateTime.fromObject({
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            day: d.getDate(),
            hour: d.getHours(),
            minute: d.getMinutes(),
            second: d.getSeconds()
        });
    }

    /** Current local time. Call on the client only (it differs between server and client). */
    static now(): PlainDateTime {
        return PlainDateTime.fromJSDate(new Date())!;
    }

    static compare(a: PlainDateTime, b: PlainDateTime): number {
        return a.days - b.days || a.seconds - b.seconds;
    }

    /** Parts in the given calendar (Gregorian by default). */
    get(calendar: CalendarId = "gregorian"): Ymd {
        return getCalendar(calendar).fromDays(this.days);
    }

    get year() {
        return civilFromDays(this.days).year;
    }
    get month() {
        return civilFromDays(this.days).month;
    }
    get day() {
        return civilFromDays(this.days).day;
    }
    get hour() {
        return Math.floor(this.seconds / 3600);
    }
    get minute() {
        return Math.floor((this.seconds % 3600) / 60);
    }
    get second() {
        return this.seconds % 60;
    }
    /** ISO weekday: 1 = Monday ... 7 = Sunday (same as Luxon). */
    get weekday() {
        return weekdayOfDays(this.days) || 7;
    }

    daysInMonth(calendar: CalendarId = "gregorian"): number {
        const { year, month } = this.get(calendar);
        return getCalendar(calendar).monthLength(year, month);
    }

    isLeapYear(calendar: CalendarId = "gregorian"): boolean {
        return getCalendar(calendar).isLeap(this.get(calendar).year);
    }

    /**
     * Add a duration. Years and months move in `calendar` (so adding a month
     * to 30 Mehr gives Aban, not Azar), clamping the day to the target month;
     * days and time then move linearly.
     */
    plus(d: DurationLike, calendar: CalendarId = "gregorian"): PlainDateTime {
        const cal = getCalendar(calendar);
        let days = this.days;
        if (d.years || d.months) {
            const cur = cal.fromDays(this.days);
            const { year, month } = shiftMonth(
                cur.year,
                cur.month,
                (d.years ?? 0) * 12 + (d.months ?? 0)
            );
            days = cal.toDays(
                year,
                month,
                Math.min(cur.day, cal.monthLength(year, month))
            );
        }
        const total =
            this.seconds +
            (d.hours ?? 0) * 3600 +
            (d.minutes ?? 0) * 60 +
            (d.seconds ?? 0);
        days += (d.days ?? 0) + Math.floor(total / 86400);
        return new PlainDateTime(days, mod(total, 86400));
    }

    minus(d: DurationLike, calendar: CalendarId = "gregorian"): PlainDateTime {
        const neg: DurationLike = {};
        for (const k of Object.keys(d) as (keyof DurationLike)[])
            neg[k] = -(d[k] ?? 0);
        return this.plus(neg, calendar);
    }

    startOf(unit: Unit, calendar: CalendarId = "gregorian"): PlainDateTime {
        const cal = getCalendar(calendar);
        const c = cal.fromDays(this.days);
        switch (unit) {
            case "year":
                return new PlainDateTime(cal.toDays(c.year, 1, 1), 0);
            case "month":
                return new PlainDateTime(cal.toDays(c.year, c.month, 1), 0);
            case "day":
                return new PlainDateTime(this.days, 0);
            case "hour":
                return new PlainDateTime(
                    this.days,
                    this.seconds - (this.seconds % 3600)
                );
            case "minute":
                return new PlainDateTime(
                    this.days,
                    this.seconds - (this.seconds % 60)
                );
            default:
                return this;
        }
    }

    /** Last second of the unit (second precision, so 23:59:59 for a day). */
    endOf(unit: Unit, calendar: CalendarId = "gregorian"): PlainDateTime {
        return this.startOf(unit, calendar)
            .plus({ [`${unit}s`]: 1 } as DurationLike, calendar)
            .minus({ seconds: 1 });
    }

    /** True if both fall in the same `unit` of `calendar`. */
    hasSame(
        o: PlainDateTime,
        unit: Unit,
        calendar: CalendarId = "gregorian"
    ): boolean {
        return this.startOf(unit, calendar).equals(o.startOf(unit, calendar));
    }

    equals(o: PlainDateTime | null | undefined): boolean {
        return !!o && this.days === o.days && this.seconds === o.seconds;
    }

    toISODate(): string {
        const { year, month, day } = civilFromDays(this.days);
        return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
    }

    /** `HH:mm:ss` */
    toISOTime(): string {
        return `${pad(this.hour)}:${pad(this.minute)}:${pad(this.second)}`;
    }

    /** `YYYY-MM-DDTHH:mm:ss` (no zone). */
    toISO(): string {
        return `${this.toISODate()}T${this.toISOTime()}`;
    }

    /** A JS Date at this local wall-clock time. */
    toJSDate(): Date {
        const { year, month, day } = civilFromDays(this.days);
        return new Date(
            year,
            month - 1,
            day,
            this.hour,
            this.minute,
            this.second
        );
    }

    toString(): string {
        return this.toISO();
    }
    valueOf(): number {
        return this.days * 86400 + this.seconds;
    }
    toJSON(): string {
        return this.toISO();
    }
}

export { daysFromCivil };
