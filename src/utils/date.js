import jalaali from 'jalaali-js';
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
    return jalaali.toJalaali(year, month, day);
}

/**
 * Converts a Jalaali date object to a Luxon DateTime object.
 * @param {{jy: number, jm: number, jd: number}} jalaaliDate
 * @returns {import('luxon').DateTime}
 */
export function jalaaliToLuxon(jalaaliDate) {
    const { jy, jm, jd } = jalaaliDate;
    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
    // Import DateTime here to avoid circular dependency if needed
    return DateTime.fromObject({ year: gy, month: gm, day: gd });
}

/**
 * Returns the number of days in a given month and year for either a Luxon DateTime or a Jalaali date object.
 * @param {import('luxon').DateTime | {jy: number, jm: number}} dateObj
 * @returns {number}
 */
export function getDaysInMonth(dateObj) {
    if (dateObj && typeof dateObj.year === 'number' && typeof dateObj.month === 'number') {
        if (typeof dateObj.daysInMonth === 'number') {
            return dateObj.daysInMonth;
        }
    } else if (dateObj && typeof dateObj.jy === 'number' && typeof dateObj.jm === 'number') {
        return jalaali.jalaaliMonthLength(dateObj.jy, dateObj.jm);
    } else {
        throw new Error('Invalid date object');
    }
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
        return jalaali.jalaaliMonthLength(year, month);
    } else {
        return DateTime.fromObject({ year, month }).daysInMonth;
    }
}

