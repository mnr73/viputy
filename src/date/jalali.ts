import { civilFromDays, daysFromCivil, mod, type Ymd } from "./gregorian";

/*
 * Jalali (Persian) calendar.
 *
 * Uses the leap-year "breaks" table (Borkowski), the same data behind the
 * widely used jalaali-js. Unlike the 33-year arithmetic rule it tracks the
 * astronomical calendar, so it is valid for Jalali years -61 .. 3177.
 */
const BREAKS = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178
];

const div = (a: number, b: number) => Math.trunc(a / b);

interface JalCal {
    /** 0 when `jy` is a leap year, otherwise 1..3 (years since the last leap year). */
    leap: number;
    /** Gregorian year in which Farvardin 1 of `jy` falls. */
    gy: number;
    /** March day of Farvardin 1. */
    march: number;
}

function jalCal(jy: number): JalCal {
    const last = BREAKS.length - 1;
    if (jy < BREAKS[0]! || jy >= BREAKS[last]!) {
        throw new RangeError(`Jalali year out of range: ${jy}`);
    }
    const gy = jy + 621;
    let leapJ = -14;
    let jp = BREAKS[0]!;
    let jump = 0;
    for (let i = 1; i <= last; i++) {
        const jm = BREAKS[i]!;
        jump = jm - jp;
        if (jy < jm) break;
        leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
        jp = jm;
    }
    let n = jy - jp;
    leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
    const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    const march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    let leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;
    return { leap, gy, march };
}

/** Supported Jalali years: -61 .. 3177. */
export const JALALI_MIN_YEAR = BREAKS[0]!;
export const JALALI_MAX_YEAR = BREAKS[BREAKS.length - 1]! - 1;

export const isJalaliLeap = (jy: number) => jalCal(jy).leap === 0;

export function jalaliMonthLength(jy: number, jm: number): number {
    if (jy < JALALI_MIN_YEAR || jy > JALALI_MAX_YEAR) {
        throw new RangeError(`Jalali year out of range: ${jy}`);
    }
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isJalaliLeap(jy) ? 30 : 29;
}

/** Jalali date -> days since 1970-01-01. */
export function jalaliToDays(jy: number, jm: number, jd: number): number {
    const { gy, march } = jalCal(jy);
    return (
        daysFromCivil(gy, 3, march) +
        (jm - 1) * 31 -
        div(jm, 7) * (jm - 7) +
        jd -
        1
    );
}

/** Days since 1970-01-01 -> Jalali date. */
export function daysToJalali(days: number): Ymd {
    const gy = civilFromDays(days).year;
    let jy = gy - 621;
    const r = jalCal(jy);
    const first = daysFromCivil(gy, 3, r.march);
    let k = days - first;
    if (k >= 0) {
        if (k <= 185) {
            return { year: jy, month: 1 + div(k, 31), day: mod(k, 31) + 1 };
        }
        k -= 186;
    } else {
        jy -= 1;
        k += 179;
        if (r.leap === 1) k += 1;
    }
    return { year: jy, month: 7 + div(k, 30), day: mod(k, 30) + 1 };
}
