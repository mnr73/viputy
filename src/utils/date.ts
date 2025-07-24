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

export function jalaaliYMDToLuxon(
  jy: number,
  jm: number,
  jd: number
): DateTime {
  const gregorianDate = jalaaliYMDToGregorian(jy, jm, jd);
  return DateTime.fromObject({
    year: gregorianDate.gy,
    month: gregorianDate.gm,
    day: gregorianDate.gd
  });
}

/**
 * Converts a Jalaali (Persian) date (year, month, day) to Gregorian (year, month, day).
 */
export function jalaaliYMDToGregorian(
  jy: number,
  jm: number,
  jd: number
): GregorianDate {
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
): number | undefined {
  if (persian) {
    return getPersianMonthDays(year, month);
  } else {
    return DateTime.fromObject({ year, month }).daysInMonth;
  }
}

interface WeekInfo {
  firstDay: number;
}

interface LocaleWithWeekInfo extends Intl.Locale {
  weekInfo: WeekInfo;
}

type CalendarType = 'gregorian' | 'persian';

/**
 * Returns month names for both Persian and Gregorian calendars
 */
export function getMonthNames(): Record<
  number,
  { persian: string; gregorian: string }
> {
  return {
    1: { persian: 'فروردین', gregorian: 'January' },
    2: { persian: 'اردیبهشت', gregorian: 'February' },
    3: { persian: 'خرداد', gregorian: 'March' },
    4: { persian: 'تیر', gregorian: 'April' },
    5: { persian: 'مرداد', gregorian: 'May' },
    6: { persian: 'شهریور', gregorian: 'June' },
    7: { persian: 'مهر', gregorian: 'July' },
    8: { persian: 'آبان', gregorian: 'August' },
    9: { persian: 'آذر', gregorian: 'September' },
    10: { persian: 'دی', gregorian: 'October' },
    11: { persian: 'بهمن', gregorian: 'November' },
    12: { persian: 'اسفند', gregorian: 'December' }
  };
}

/**
 * Week day names for both Persian and Gregorian calendars
 */
export const weekDaysArray: {
  num: number;
  persian: string;
  gregorian: string;
}[] = [
  { num: 1, persian: 'د', gregorian: 'Mon' },
  { num: 2, persian: 'س', gregorian: 'Tue' },
  { num: 3, persian: 'چ', gregorian: 'Wed' },
  { num: 4, persian: 'پ', gregorian: 'Thu' },
  { num: 5, persian: 'ج', gregorian: 'Fri' },
  { num: 6, persian: 'ش', gregorian: 'Sat' },
  { num: 7, persian: 'ی', gregorian: 'Sun' }
];

/**
 * Returns week days array ordered by the first day of the week for the specified calendar type
 */
export function getWeekDays(
  calendarType: CalendarType = 'gregorian'
): { num: number; persian: string; gregorian: string }[] {
  const localeInfo = getLocalDateInfo(calendarType);
  const firstDay = localeInfo.weekInfo.firstDay;

  return [
    ...weekDaysArray.slice(firstDay - 1),
    ...weekDaysArray.slice(0, firstDay - 1)
  ];
}

/**
 * Returns the position of the first day of month in the calendar week
 * For example: if calendar is Persian and first day of month is Monday, returns 2
 */
export function getFirstDayOfMonthPosition(
  year: number | null,
  month: number | null,
  calendarType: CalendarType = 'gregorian'
): number {
  if (calendarType === 'gregorian') {
    let now = DateTime.now();
    let firstDayOfMonth: DateTime;

    firstDayOfMonth = DateTime.fromObject({
      year: year || now.year,
      month: month || now.month,
      day: 1
    });

    return firstDayOfMonth.weekday;
  }

  let defaultMonth = 1;
  let defaultYear = 1370;
  if (year == null || month == null) {
    let now = DateTime.now().setLocale('fa-IR-u-nu-latn');
    defaultMonth = parseInt(
      now.toLocaleString({
        month: 'numeric'
      })
    );
    defaultYear = parseInt(
      now.toLocaleString({
        year: 'numeric'
      })
    );

    if (month == null && year == null) {
      let diff = parseInt(
        now.toLocaleString({
          day: 'numeric'
        })
      );
      return now.minus({ days: diff - 2 }).weekday;
    }
  }
  let gregorianDate = jalaaliYMDToGregorian(
    year || defaultYear,
    month || defaultMonth,
    1
  );

  let firstDayOfMonth = DateTime.now().set({
    year: gregorianDate.gy,
    month: gregorianDate.gm,
    day: gregorianDate.gd
  });

  return firstDayOfMonth.weekday + 1;
}

/**
 * return local date info
 */
export function getLocalDateInfo(
  calendarType: CalendarType = 'gregorian'
): LocaleWithWeekInfo {
  const persian = new Intl.Locale('fa-IR-u-nu-latn') as LocaleWithWeekInfo;
  if (!persian.weekInfo) {
    persian.weekInfo = { firstDay: 6 };
  }

  const gregory = new Intl.Locale('en-US') as LocaleWithWeekInfo;
  if (!gregory.weekInfo) {
    gregory.weekInfo = { firstDay: 7 };
  }

  return calendarType === 'gregorian' ? gregory : persian;
}
