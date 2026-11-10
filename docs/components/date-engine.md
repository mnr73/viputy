# موتور تاریخ

viputy برای تاریخ به Luxon (یا هیچ کتابخانه‌ی دیگری) وابسته نیست. هسته‌ی کوچکی دارد که با `PlainDateTime` شبیه Luxon کار می‌کند ولی بدون منطقه‌ی زمانی: همیشه ISO می‌گیرد و ISO می‌دهد.

```ts
import { PlainDateTime, format, jalaliToDays, daysToJalali } from "@mnr73/viputy";

const d = PlainDateTime.fromISO("2026-11-10T14:30");     // null if invalid
d.get("jalali");                                         // { year: 1405, month: 8, day: 19 }
d.plus({ months: 1 }, "jalali").toISODate();             // months move in the Jalali calendar
d.startOf("month", "jalali").toISODate();
format(d, "EEEE d MMMM yyyy", { calendar: "jalali", locale: "fa" }); // سه‌شنبه ۱۹ آبان ۱۴۰۵
PlainDateTime.fromObject({ year: 1405, month: 8, day: 19 }, "jalali")!.toISO();
```

## چه چیزی دارد

- `PlainDateTime`: غیرقابل‌تغییر. `fromISO`، `fromObject`، `fromJSDate`، `now`، `plus`/`minus`، `startOf`/`endOf`، `hasSame`، `equals`، `compare`، `toISO`/`toISODate`/`toISOTime`، `get(calendar)`، `daysInMonth`، `isLeapYear`، `weekday` (۱ = دوشنبه … ۷ = یکشنبه مثل Luxon).
- فرق با Luxon: تاریخ نامعتبر `null` برمی‌گرداند (شیء invalid نه)، و `Z` یا offset انتهای ISO نادیده گرفته می‌شود (ساعت دیواری حفظ می‌شود).
- `plus({ months }, "jalali")` ماه جلالی جلو می‌برد و روز را به طول ماه مقصد می‌رساند (۳۱ شهریور + ۱ ماه = ۳۰ مهر). این همان باگ نسخه‌ی ۰.۳ است که با حساب میلادی ماهی را رد می‌کرد.
- فرمت و پارس: `format(dt, "yyyy/MM/dd", { calendar, locale })` با ارقام فارسی برای `fa`، `parseUserInput`، `parseTime`، `formatTime`.
- جلالی: از جدول «شکست‌های کبیسه» (مثل jalaali-js) استفاده می‌کند، نه قاعده‌ی ۳۳ ساله. با `Intl` مرورگر برای ۱۸۰۰ تا ۲۱۲۳ میلادی روز به روز مقایسه شده و تبدیل رفت‌وبرگشت همه‌ی ۱۸۲٬۹۸۶ روز بین ۱۸۰۰ و ۲۳۰۰ درست است. پشتیبانی: سال ۶۱- تا ۳۱۷۷.
- `useCalendar` برای ساخت تقویم دلخواه: ناوبری ماه، شبکه‌ی روزها، نام ماه و هفته.

## هشدار

`PlainDateTime.now()` و `fromJSDate` ساعت محلیِ همان ماشین را می‌خوانند. روی سرور (SSR) و کلاینت متفاوت‌اند؛ هر دو کامپوننت فقط روی کلاینت و بعد از mount از آن‌ها استفاده می‌کنند.
