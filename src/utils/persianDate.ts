export interface PersianDate {
  year: number;
  month: number;
  day: number;
}

export interface GregorianDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Converts Persian (Shamsi/Jalali) date to Gregorian date
 */
export function persianToGregorian(
  persianYear: number,
  persianMonth: number,
  persianDay: number
): GregorianDate {
  if (
    persianYear < 1 ||
    persianMonth < 1 ||
    persianMonth > 12 ||
    persianDay < 1 ||
    persianDay > 31
  ) {
    throw new Error('Invalid Persian date values');
  }

  const jy = persianYear;
  const jm = persianMonth;
  const jd = persianDay;

  const jy0 = jy - 979;
  const jp =
    365 * jy0 + Math.floor(jy0 / 33) * 8 + Math.floor(((jy0 % 33) + 3) / 4);
  let jdays = jp;

  for (let i = 0; i < jm - 1; i++) {
    jdays += getPersianMonthDays(jy, i + 1);
  }
  jdays += jd - 1;

  const gdays = jdays + 79;
  let gy = 1600 + 400 * Math.floor(gdays / 146097);
  let gd1 = gdays % 146097;

  if (gd1 >= 36525) {
    gd1--;
    gy += 100 * Math.floor(gd1 / 36524);
    gd1 %= 36524;
    if (gd1 >= 365) gd1++;
  }

  gy += 4 * Math.floor(gd1 / 1461);
  gd1 %= 1461;

  if (gd1 >= 366) {
    gd1--;
    gy += Math.floor(gd1 / 365);
    gd1 %= 365;
  }

  let gd = gd1 + 1;
  const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0)) {
    months[1] = 29;
  }

  let gm = 1;
  while (gm <= 12 && gd > months[gm - 1]) {
    gd -= months[gm - 1];
    gm++;
  }

  return { year: gy, month: gm, day: gd };
}

/**
 * Converts JavaScript Date to Persian (Shamsi/Jalali) date
 */
export function gregorianToPersian(jsDate: Date): PersianDate {
  if (!jsDate || !(jsDate instanceof Date) || isNaN(jsDate.getTime())) {
    throw new Error('Invalid JavaScript Date object');
  }

  const parts = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).formatToParts(jsDate);

  const dateObj: Record<string, number> = {};
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
 */
export function getPersianMonthDays(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isPersianLeapYear(year) ? 30 : 29;
}

/**
 * Checks if a Persian year is a leap year
 */
export function isPersianLeapYear(year: number): boolean {
  const yearInCycle = year % 33;
  const leapYears = [1, 5, 9, 13, 17, 22, 26, 30];
  return leapYears.includes(yearInCycle);
}
