# ViDate and ViCalendar

Pick a date (and time) with Jalali and Gregorian calendars, direct typing, `min`/`max` and two months side by side.

<script setup>
import { ref } from "vue";
const a = ref("2026-11-10");
const b = ref("2026-11-10T14:30");
const c = ref(null);
const d = ref("2026-11-10");
const e = ref("2026-11-10");
</script>

<div class="demo">
  <ViDate v-model="a" label="Birth date" clearable />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ a }}</div>
  <ViDate v-model="b" label="Meeting time" time="hm" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ b }}</div>
  <ViDate v-model="c" label="Deadline" min="2026-11-05" max="2026-12-20" :marked="['2026-11-25']" hint="Between 2026-11-05 and 2026-12-20" />
  <ViDate v-model="d" label="Report range (two months)" :calendars="['gregorian', 'jalali']" calendar="gregorian" :months="2" />
  <ViDate label="Disabled" disabled model-value="2026-11-10" />
  <ViDate v-model="e" label="No automatic page scroll" :auto-scroll="false" />
</div>

<div class="demo">
  <ViCalendar v-model="a" alt-days />
</div>

```vue
<ViDate v-model="birth" label="Birth date" clearable />
<ViDate v-model="meeting" time="hm" />
<ViDate v-model="deadline" min="2026-11-05" max="2026-12-20" />
<ViDate v-model="d" :months="2" :calendars="['gregorian']" />
<ViCalendar v-model="day" alt-days />   <!-- the calendar alone, no field -->
```

## Value (v-model)

The value is always a **Gregorian ISO string**, whatever calendar the user sees:

| `time` | value |
|---|---|
| `false` (default) | `"2026-11-10"` |
| `"hm"` | `"2026-11-10T14:30"` |
| `"hms"` | `"2026-11-10T14:30:15"` |

No time zone (wall clock). Send the string to the server as is. Jalali or Persian output is display only. An invalid value renders as an empty field.

## Typing

Users can type `۱۴۰۵/۸/۱۹`, `1405-08-19`, `2026.11.10`, `19/8/1405`, and with a time `۱۴۰۵/۰۸/۱۹ ۱۴:۳۰`. The 4-digit year picks the calendar (below 1700 is Jalali). A date that does not exist (30 Esfand in a non-leap year) or lies outside `min`/`max` shows an error and does not change the value.

## min and max

ISO strings. `max="2026-12-20"` allows the **whole day**. A time (`2026-12-20T10:00`) makes that time the limit; with `time` on, disallowed hours are disabled on the boundary day. `is-disabled` is a function `(iso) => boolean` for custom disabled days (holidays), and `marked` outlines days.

## Props

| Prop | Notes |
|---|---|
| `modelValue` | ISO string or `null` |
| `calendars` | calendars the user can switch (default `['jalali','gregorian']`); one value hides the switch |
| `calendar` | initial calendar |
| `time` | `false` / `"hm"` / `"hms"` |
| `hour12` | 12-hour display (the value stays 24-hour) |
| `minute-step` | minute step |
| `min` / `max` | ISO bounds |
| `is-disabled` | `(iso) => boolean` |
| `marked` | outlined days |
| `months` | months side by side (1 or 2) |
| `display-format` | display pattern, e.g. `yyyy/MM/dd` |
| `clearable` | |
| `mobile` | `sheet` / `fullscreen` / `false` |
| `name` | hidden input for a native `<form>` |
| `week-start` / `weekend` | 0 = Saturday ... 6 = Friday |
| shared props | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

## ViCalendar

The calendar itself, without a field. Props: `modelValue` (ISO day), `calendar`, `min`, `max`, `marked`, `is-disabled`, `alt-days` (the other calendar's day number under each day), `months`, `week-start`, `weekend`, `initial-view`. Click the month title to pick a month and year.

Keyboard: `← → ↑ ↓` move (left/right swap in RTL), `Home` / `End` start and end of the week, `PageUp` / `PageDown` previous/next month, with `Shift` the year.

## Calendar and week

Under `fa` the week starts on Saturday and Friday is the weekend (red). Under `en` it starts on Sunday with Saturday and Sunday as weekend. Override with `week-start` and `weekend`. Jalali months move with Jalali arithmetic, not Gregorian, so no month is skipped or repeated. Jalali is supported for years -61 to 3177.
