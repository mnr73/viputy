import { DateTime } from 'luxon';
import { getPersianMonthDays, gregorianToPersian, persianToGregorian } from './persianDate';

/**
 * Converts a Luxon DateTime object to a Jalaali date object.
 * @param {import('luxon').DateTime} luxonDate
 * @returns {{jy: number, jm: number, jd: number}}
 */
export function luxonToJalaali(luxonDate) {
    if (!luxonDate || typeof luxonDate.year !== 'number') {
        throw new Error('Invalid Luxon DateTime object');
    }
    const dateObject = gregorianToPersian(luxonDate.toJSDate());
    return { jy: dateObject.year, jm: dateObject.month, jd: dateObject.day };
}

/**
 * Converts a Jalaali (Persian) date (year, month, day) to Gregorian (year, month, day).
 * @param {number} jy - Jalaali year
 * @param {number} jm - Jalaali month (1-12)
 * @param {number} jd - Jalaali day (1-31)
 * @returns {{gy: number, gm: number, gd: number}} Gregorian date object
 */
export function jalaaliYMDToGregorian(jy, jm, jd) {
    const dateObject = persianToGregorian(jy, jm, jd);
    return {
        gy: dateObject.year,
        gm: dateObject.month,
        gd: dateObject.day
    };
}

/**
 * Returns the number of days in a given month and year, for either Persian (Jalaali) or Gregorian calendar.
 * @param {number} year
 * @param {number} month
 * @param {boolean} persian - If true, returns days in Jalaali month; otherwise, Gregorian.
 * @returns {number}
 */
export function getDaysInMonthByType(year, month, persian) {
    if (persian) {
        return getPersianMonthDays(year, month);
    } else {
        return DateTime.fromObject({ year, month }).daysInMonth;
    }
}


