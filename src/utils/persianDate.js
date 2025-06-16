/**
 * Converts Persian (Shamsi/Jalali) date to Gregorian date
 * @param {number} persianYear - Persian year (e.g., 1402)
 * @param {number} persianMonth - Persian month (1-12)
 * @param {number} persianDay - Persian day (1-31)
 * @returns {Object} Object with year, month, day properties in Gregorian calendar
 */
export function persianToGregorian(persianYear, persianMonth, persianDay) {
  // Validate inputs
  if (
    persianYear < 1 ||
    persianMonth < 1 ||
    persianMonth > 12 ||
    persianDay < 1 ||
    persianDay > 31
  ) {
    throw new Error('Invalid Persian date values');
  }

  // Use a more direct algorithm
  const jy = persianYear;
  const jm = persianMonth;
  const jd = persianDay;

  let gy, gm, gd;

  const jy0 = jy - 979;
  const jp =
    365 * jy0 + Math.floor(jy0 / 33) * 8 + Math.floor(((jy0 % 33) + 3) / 4);
  let jdays = jp;

  for (let i = 0; i < jm - 1; i++) {
    jdays += getPersianMonthDays(i + 1, jy);
  }
  jdays += jd - 1;

  const gdays = jdays + 79;
  gy = 1600 + 400 * Math.floor(gdays / 146097);
  let gd1 = gdays % 146097;

  if (gd1 >= 36525) {
    gd1--;
    gy += 100 * Math.floor(gd1 / 36524);
    gd1 = gd1 % 36524;
    if (gd1 >= 365) gd1++;
  }

  gy += 4 * Math.floor(gd1 / 1461);
  gd1 %= 1461;

  if (gd1 >= 366) {
    gd1--;
    gy += Math.floor(gd1 / 365);
    gd1 = gd1 % 365;
  }

  gd = gd1 + 1;

  const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0)) {
    months[1] = 29;
  }

  gm = 1;
  while (gm <= 12 && gd > months[gm - 1]) {
    gd -= months[gm - 1];
    gm++;
  }

  return { year: gy, month: gm, day: gd };
}

/**
 * Converts JavaScript Date to Persian (Shamsi/Jalali) date
 * @param {Date} jsDate - JavaScript Date object
 * @returns {Object} Object with year, month, day properties in Persian calendar
 */
export function gregorianToPersian(jsDate) {
  if (!jsDate || !(jsDate instanceof Date) || isNaN(jsDate.getTime())) {
    throw new Error('Invalid JavaScript Date object');
  }

  // Use Intl.DateTimeFormat to extract Jalaali (Persian) year, month, day
  const parts = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).formatToParts(jsDate);

  const dateObj = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      dateObj[part.type] = Number(part.value);
    }
  }

  const { year, month, day } = dateObj;
  return { year, month, day };
}

/**
 * Gets the number of days in a Persian month
 * @param {number} year - Persian year (for leap year calculation)
 * @param {number} month - Persian month (1-12)
 * @returns {number} Number of days in the month
 */
export function getPersianMonthDays(year, month) {
  // First 6 months have 31 days
  if (month <= 6) {
    return 31;
  }

  // Months 7-11 have 30 days
  if (month <= 11) {
    return 30;
  }

  // Last month (12) has 29 days, 30 in leap years
  return isPersianLeapYear(year) ? 30 : 29;
}

/**
 * Checks if a Persian year is a leap year
 * @param {number} year - Persian year
 * @returns {boolean} True if leap year
 */
export function isPersianLeapYear(year) {
  // Simple 33-year cycle algorithm
  const yearInCycle = year % 33;
  const leapYears = [1, 5, 9, 13, 17, 22, 26, 30];
  return leapYears.includes(yearInCycle);
}
