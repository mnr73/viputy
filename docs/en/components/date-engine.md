# Date engine

viputy does not depend on Luxon (or any date library). A small core, `PlainDateTime`, behaves like Luxon but without time zones: ISO in, ISO out.

```ts
import { PlainDateTime, format, jalaliToDays, daysToJalali } from "@mnr73/viputy";

const d = PlainDateTime.fromISO("2026-11-10T14:30");     // null if invalid
d.get("jalali");                                         // { year: 1405, month: 8, day: 19 }
d.plus({ months: 1 }, "jalali").toISODate();             // months move in the Jalali calendar
d.startOf("month", "jalali").toISODate();
format(d, "EEEE d MMMM yyyy", { calendar: "jalali", locale: "fa" }); // سه‌شنبه ۱۹ آبان ۱۴۰۵
PlainDateTime.fromObject({ year: 1405, month: 8, day: 19 }, "jalali")!.toISO();
```

## What it has

- `PlainDateTime`: immutable. `fromISO`, `fromObject`, `fromJSDate`, `now`, `plus`/`minus`, `startOf`/`endOf`, `hasSame`, `equals`, `compare`, `toISO`/`toISODate`/`toISOTime`, `get(calendar)`, `daysInMonth`, `isLeapYear`, `weekday` (1 = Monday ... 7 = Sunday, as in Luxon).
- Differences from Luxon: invalid input returns `null` (no "invalid" object), and a trailing `Z` or offset in an ISO string is ignored (the wall-clock time is kept).
- `plus({ months }, "jalali")` moves a Jalali month and clamps the day to the target month (31 Shahrivar + 1 month = 30 Mehr). This is the 0.3 bug where Gregorian arithmetic skipped a month.
- Format and parse: `format(dt, "yyyy/MM/dd", { calendar, locale })` with Persian digits for `fa`, `parseUserInput`, `parseTime`, `formatTime`.
- Jalali uses the leap-year "breaks" table (like jalaali-js), not the 33-year rule. It was compared day by day with the browser's `Intl` for 1800 to 2123 and round-trips all 182,986 days between 1800 and 2300. Supported years: -61 to 3177.
- `useCalendar` for building your own calendar: month navigation, day grid, month and weekday names.

## Warning

`PlainDateTime.now()` and `fromJSDate` read the machine's local time. Server (SSR) and client differ, so both components only use them on the client after mount.
