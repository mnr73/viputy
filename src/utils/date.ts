import { DateTime } from 'luxon';
import {
  getPersianMonthDays,
  gregorianToPersian,
  persianToGregorian
} from './persianDate';

type JalaaliDate = { jy: number; jm: number; jd: number };
type GregorianDate = { gy: number; gm: number; gd: number };

/**
 * Converts a Luxon DateTime object to a Jalaali date object.
 */
export function luxonToJalaali(luxonDate: DateTime): JalaaliDate {
  if (!luxonDate || typeof luxonDate.year !== 'number') {
    throw new Error('Invalid Luxon DateTime object');
  }
  const dateObject = gregorianToPersian(luxonDate.toJSDate());
  return { jy: dateObject.year, jm: dateObject.month, jd: dateObject.day };
}

/**
 * Converts a Jalaali (Persian) date (year, month, day) to Gregorian (year, month, day).
 */
export function jalaaliYMDToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  const dateObject = persianToGregorian(jy, jm, jd);
  return {
    gy: dateObject.year,
    gm: dateObject.month,
    gd: dateObject.day
  };
}

/**
 * Returns the number of days in a given month and year, for either Persian (Jalaali) or Gregorian calendar.
 */
export function getDaysInMonthByType(
  year: number,
  month: number,
  persian: boolean
): number|undefined {
  if (persian) {
    return getPersianMonthDays(year, month);
  } else {
    return DateTime.fromObject({ year, month }).daysInMonth;
  }
}
