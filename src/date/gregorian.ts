export interface Ymd {
    year: number;
    month: number;
    day: number;
}

const floor = Math.floor;
export const mod = (a: number, b: number) => ((a % b) + b) % b;

/** Days since 1970-01-01 for a proleptic Gregorian date (pure integer math, no Date, no time zones). */
export function daysFromCivil(
    year: number,
    month: number,
    day: number
): number {
    const y = year - (month <= 2 ? 1 : 0);
    const era = floor(y / 400);
    const yoe = y - era * 400;
    const doy = floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
    const doe = yoe * 365 + floor(yoe / 4) - floor(yoe / 100) + doy;
    return era * 146097 + doe - 719468;
}

export function civilFromDays(days: number): Ymd {
    const z = days + 719468;
    const era = floor(z / 146097);
    const doe = z - era * 146097;
    const yoe = floor(
        (doe - floor(doe / 1460) + floor(doe / 36524) - floor(doe / 146096)) /
            365
    );
    const doy = doe - (365 * yoe + floor(yoe / 4) - floor(yoe / 100));
    const mp = floor((5 * doy + 2) / 153);
    const day = doy - floor((153 * mp + 2) / 5) + 1;
    const month = mp < 10 ? mp + 3 : mp - 9;
    return { year: yoe + era * 400 + (month <= 2 ? 1 : 0), month, day };
}

export const isGregorianLeap = (y: number) =>
    (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const gregorianMonthLength = (y: number, m: number) =>
    m === 2 && isGregorianLeap(y) ? 29 : LENGTHS[m - 1]!;

/** 0 = Sunday ... 6 = Saturday. */
export const weekdayOfDays = (days: number) => mod(days + 4, 7);

const pad = (n: number, len: number) => String(n).padStart(len, "0");
export const isoDateOfDays = (days: number) => {
    const { year, month, day } = civilFromDays(days);
    return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
};
