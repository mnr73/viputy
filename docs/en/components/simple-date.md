# ViSimpleDate

Three "day / month / year" fields for dates that are awkward to type or find in a calendar (birth dates, contract starts). Each part is a `ViSelect`.

<script setup>
import { ref } from "vue";
const a = ref("2026-11-10");
const b = ref(null);
const c = ref("2025-03-10");
const d = ref(null);
</script>

<div class="demo">
  <ViSimpleDate v-model="a" label="Birth date" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ a }}</div>
  <ViSimpleDate v-model="b" label="Contract start (empty)" shortcuts :from-year="1380" :to-year="1420" />
  <ViSimpleDate v-model="c" label="End date (Esfand 1403 is a leap month)" shortcuts />
  <ViSimpleDate v-model="d" label="Opens the next part after each pick" auto-advance />
</div>

```vue
<ViSimpleDate v-model="birth" label="Birth date" />
<ViSimpleDate v-model="start" shortcuts :from-year="1380" :to-year="1420" />
```

## Behaviour

- The value is a Gregorian ISO string (`"2026-11-10"`) and is **emitted only when all three parts are set**. Until then the chosen parts stay inside the component, so a half-filled date is not lost. Clearing one part sets the value to `null`.
- The day list follows the month length (31, 30, and 29 or 30 for Esfand depending on the leap year). If the month gets shorter the chosen day is shortened (31 Shahrivar becomes 30 Mehr).
- `min`/`max` set the year range and disable days outside. Without them the years run from `from-year` to `to-year` (default: 100 years back to 20 ahead).
- `shortcuts`: "First of month" and "Last of month" buttons. For Esfand a note shows the month length ("Esfand 1403 has 30 days; last of month = 30").
- The year is searchable. The order is day / month / year; `year-first` makes it year / month / day.

## Props

| Prop | Notes |
|---|---|
| `modelValue` | ISO or `null` |
| `calendar` | default: Jalali under `fa` |
| `min` / `max` | ISO bounds |
| `from-year` / `to-year` | year range when there is no `min`/`max` |
| `auto-advance` | opens the next empty part |
| `shortcuts` | first of month / last of month |
| `year-first` | year, month, day order |
| `name` | hidden input for `<form>` |
| `mobile` | as in ViSelect |
| shared props | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |
