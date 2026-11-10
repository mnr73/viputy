import { computed, ref, toValue, watch, type MaybeRefOrGetter } from "vue";
import { getCalendar, shiftMonth, type CalendarId } from "../date/calendar";
import { monthNames, weekColumn, weekdayLabels } from "../date/format";
import { PlainDateTime } from "../date/plain";

export interface CalendarDay {
    date: PlainDateTime;
    /** Day of month in the displayed calendar. */
    day: number;
    /** Belongs to the shown month (false for leading/trailing filler days). */
    inMonth: boolean;
    /** The same day in the *other* calendar (shown as a small hint). */
    alt: number;
    weekend: boolean;
    iso: string;
}

export interface MonthGrid {
    year: number;
    month: number;
    title: string;
    days: Array<CalendarDay | null>;
}

export interface UseCalendarInput {
    calendar: MaybeRefOrGetter<CalendarId>;
    locale: MaybeRefOrGetter<string>;
    /** 0 = Saturday ... 6 = Friday. Default: Saturday for Jalali/fa, Sunday otherwise. */
    weekStart?: MaybeRefOrGetter<number | undefined>;
    /** Weekend days as 0=Sat..6=Fri. Default Friday for fa, Saturday and Sunday otherwise. */
    weekend?: MaybeRefOrGetter<number[] | undefined>;
    /** Month to show first (any day of it). */
    initial?: MaybeRefOrGetter<PlainDateTime | null | undefined>;
    /** Fill leading/trailing days of neighbouring months. */
    fill?: MaybeRefOrGetter<boolean | undefined>;
}

/**
 * Navigation state and grids for any calendar UI. The visible month is kept as
 * a (year, month) pair in the *active calendar* and moved with calendar-aware
 * arithmetic, so Jalali months never skip or repeat.
 */
export function useCalendar(input: UseCalendarInput) {
    const calendarId = computed(() => toValue(input.calendar));
    const locale = computed(() => toValue(input.locale));
    const cal = computed(() => getCalendar(calendarId.value));
    const other = computed(() =>
        getCalendar(calendarId.value === "jalali" ? "gregorian" : "jalali")
    );
    const fa = computed(() => locale.value.startsWith("fa"));
    const weekStart = computed(
        () =>
            toValue(input.weekStart) ??
            (calendarId.value === "jalali" || fa.value ? 0 : 1)
    );
    const weekend = computed(
        () => toValue(input.weekend) ?? (fa.value ? [6] : [0, 1])
    );

    const start = () => toValue(input.initial) ?? PlainDateTime.now();
    const first = start().get(calendarId.value);
    const view = ref({ year: first.year, month: first.month });

    watch(calendarId, (id) => {
        // keep showing the same real day when the calendar switches
        const days = getCalendar(
            calendarId.value === "jalali" ? "gregorian" : "jalali"
        ).toDays(view.value.year, view.value.month, 1);
        const p = getCalendar(id).fromDays(days);
        view.value = { year: p.year, month: p.month };
    });

    function goTo(date: PlainDateTime) {
        const p = date.get(calendarId.value);
        view.value = { year: p.year, month: p.month };
    }
    /** False when the calendar cannot represent that month (e.g. Jalali year > 3177). */
    function supports(year: number, month: number): boolean {
        try {
            cal.value.monthLength(year, month);
            return true;
        } catch {
            return false;
        }
    }
    function move(months: number) {
        const next = shiftMonth(view.value.year, view.value.month, months);
        if (supports(next.year, next.month)) view.value = next;
    }
    function setYear(year: number) {
        if (supports(year, view.value.month))
            view.value = { year, month: view.value.month };
    }
    function setMonth(month: number) {
        view.value = { year: view.value.year, month };
    }

    function grid(offset = 0): MonthGrid {
        const { year, month } = shiftMonth(
            view.value.year,
            view.value.month,
            offset
        );
        const c = cal.value;
        const o = other.value;
        const len = c.monthLength(year, month);
        const firstDay = c.toDays(year, month, 1);
        const lead = weekColumn(firstDay, weekStart.value);
        const fill = toValue(input.fill) ?? false;
        const days: Array<CalendarDay | null> = [];
        const mk = (n: number, inMonth: boolean): CalendarDay => {
            const d = firstDay + n;
            const date = PlainDateTime.fromDays(d);
            const col = weekColumn(d, weekStart.value);
            const satIdx = (col + weekStart.value) % 7;
            return {
                date,
                day: c.fromDays(d).day,
                inMonth,
                alt: o.fromDays(d).day,
                weekend: weekend.value.includes(satIdx),
                iso: date.toISODate()
            };
        };
        for (let i = lead; i > 0; i--) days.push(fill ? mk(-i, false) : null);
        for (let n = 0; n < len; n++) days.push(mk(n, true));
        while (days.length % 7)
            days.push(fill ? mk(days.length - lead, false) : null);
        return {
            year,
            month,
            title: `${monthNames(calendarId.value, locale.value)[month - 1]} ${year}`,
            days
        };
    }

    const weekdays = computed(() =>
        weekdayLabels(locale.value, weekStart.value)
    );
    const weekdayCells = computed(() =>
        weekdays.value.map((label, i) => ({
            label,
            weekend: weekend.value.includes((i + weekStart.value) % 7)
        }))
    );
    const months = computed(() => monthNames(calendarId.value, locale.value));

    return {
        view,
        grid,
        goTo,
        move,
        setYear,
        setMonth,
        supports,
        weekdays,
        weekdayCells,
        months,
        weekStart,
        calendarId,
        cal
    };
}
