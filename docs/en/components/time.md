# ViTime

Pick a time: 24-hour or 12-hour (AM/PM), with seconds, a minute step and `min`/`max`.

<script setup>
import { ref } from "vue";
const a = ref("09:45:30");
const b = ref("14:30");
const c = ref(null);
</script>

<div class="demo">
  <ViTime v-model="a" label="Start (with seconds)" seconds />
  <ViTime v-model="b" label="Reminder (12-hour, 5-min step)" hour12 :minute-step="5" clearable />
  <ViTime v-model="c" label="Working hours" min="08:00" max="18:00" hint="From 08:00 to 18:00" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ a }} · {{ b }} · {{ c }}</div>
</div>

```vue
<ViTime v-model="start" seconds />
<ViTime v-model="remind" hour12 :minute-step="5" />
<ViTime v-model="work" min="08:00" max="18:00" />
```

## Value

A `HH:mm` or (with `seconds`) `HH:mm:ss` string, always **24-hour with ASCII digits** (`"14:30"`), even when the display reads `02:30 PM`. Typing is free: `14:30`, `2:30 pm`, `۰۲:۳۰ ب.ظ`, `14.30`. An impossible (`25:00`) or out-of-range time shows an error.

## Props

| Prop | Notes |
|---|---|
| `modelValue` | `HH:mm[:ss]` or `null` |
| `seconds` | seconds column |
| `hour12` | 12-hour display |
| `minute-step` | minute step (1, 5, 10, 15, 30) |
| `min` / `max` | `HH:mm[:ss]`; times outside are disabled |
| `clearable` / `mobile` / `name` | as in ViDate |
| shared props | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

`ViTimePanel` is the hour/minute columns on their own, for your custom inputs.
