import jalaali from 'jalaali-js'
const { jalaaliMonthLength, toGregorian, toJalaali } = jalaali;
import { DateTime } from 'luxon';

/**
 * Converts a Luxon DateTime object to a Jalaali date object.
 * @param {import('luxon').DateTime} luxonDate
 * @returns {{jy: number, jm: number, jd: number}}
 */
export function luxonToJalaali(luxonDate) {
    if (!luxonDate || typeof luxonDate.year !== 'number') {
        throw new Error('Invalid Luxon DateTime object');
    }
    const { year, month, day } = luxonDate;
    return toJalaali(year, month, day);
}

/**
 * Converts a Jalaali date object to a Luxon DateTime object.
 * @param {{jy: number, jm: number, jd: number}} jalaaliDate
 * @returns {import('luxon').DateTime}
 */
export function jalaaliToLuxon(jalaaliDate) {
    const { jy, jm, jd } = jalaaliDate;
    const { gy, gm, gd } = toGregorian(jy, jm, jd);
    // Import DateTime here to avoid circular dependency if needed
    return DateTime.fromObject({ year: gy, month: gm, day: gd });
}

/**
 * Converts a Jalaali (Persian) date (year, month, day) to Gregorian (year, month, day).
 * @param {number} jy - Jalaali year
 * @param {number} jm - Jalaali month (1-12)
 * @param {number} jd - Jalaali day (1-31)
 * @returns {{gy: number, gm: number, gd: number}} Gregorian date object
 */
export function jalaaliYMDToGregorian(jy, jm, jd) {
    return toGregorian(jy, jm, jd);
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
        return jalaaliMonthLength(year, month);
    } else {
        return DateTime.fromObject({ year, month }).daysInMonth;
    }
}

