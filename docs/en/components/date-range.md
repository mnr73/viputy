# ViDateRange

Pick a date range: from one day to another, with hover preview, two calendars side by side and ready-made presets.

<script setup>
import { ref } from "vue";
const a = ref({ start: "2026-11-16", end: "2026-11-30" });
const b = ref({ start: null, end: null });
const c = ref({ start: null, end: null });
</script>

<div class="demo">
  <ViDateRange v-model="a" label="Report range" clearable />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ a }}</div>
  <ViDateRange v-model="b" label="At most 31 days" :presets="['last7', 'last30', 'thisMonth']" :max-days="31" hint="A longer range is shortened automatically" />
  <ViDateRange v-model="c" label="No presets, one month, limited to Nov–Dec" :presets="false" :months="1" min="2026-11-01" max="2026-12-31" />
</div>

```vue
<ViDateRange v-model="range" label="Report range" clearable />
<ViDateRange v-model="range" :presets="['last7', 'thisMonth']" :max-days="31" />
<ViDateRange v-model="range" :months="1" :presets="false" min="2026-11-01" />
```

## Value

An object with two Gregorian ISO strings (a day, no time):

```ts
{ start: "2026-11-16", end: "2026-11-30" }   // both null = empty
```

After the first click `end` is `null` until the second. If the user picks an end before the start the two are swapped. With `name="period"` hidden inputs `period[start]` and `period[end]` are added for `<form>`.

## Picking

- **Two clicks:** start, then end. Between them, moving the mouse over days previews the range (a dashed outline on the previewed end day).
- **Two calendars** side by side (`months`, default 2; 1 on phones).
- **Presets:** Today, Yesterday, Last 7 days, Last 30 days, This month, Last month. "This month" and "Last month" use the active calendar: in Jalali, Aban means 1 to 30 Aban, not the Gregorian month. A preset that conflicts with `min`/`max` is disabled. After a manual change "Custom range" shows as selected.
- **Typing:** both fields are typable (`2026-11-16`). End before start or out of range shows an error and keeps the value.
- `max-days`: a longer range is shortened at the end.

## Props

| Prop | Notes |
|---|---|
| `modelValue` | `{ start, end }` or `null` |
| `calendars` / `calendar` | as in ViDate |
| `min` / `max` | ISO bounds (`max` includes the whole day) |
| `is-disabled` / `marked` | as in ViDate |
| `months` | months side by side (2) |
| `presets` | `true` / `false` / a list of `today yesterday last7 last30 thisMonth lastMonth` |
| `max-days` | longest allowed range |
| `allow-same-day` | start and end on the same day (default `true`) |
| `show-count` | number of days in the footer |
| `clearable` / `mobile` / `name` | |
| `week-start` / `weekend` | |
| shared props | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

On phones the panel is a sheet: one month, presets as a horizontal row above the calendar, and pinned "Clear" and "Apply" buttons.

## ViCalendar in range mode

To build your own range picker, give `ViCalendar` `range-start` and `range-end`; the days between are highlighted, and while `range-end` is empty hovering previews it and the `hover` event gives the ISO day under the pointer. Clicks still emit `update:modelValue`; what a click means is up to you.
