# ViTimeZone

A searchable picker for an IANA time zone (`Asia/Tehran`). It is a `ViSelect` underneath, so `label`, `clearable`, `mobile`, `disabled` and the rest work the same.

<script setup>
import { ref } from "vue";
import { detectTimeZone } from "../../../src";
const a = ref("Asia/Tehran");
const b = ref(null);
const c = ref("Europe/London");
const mine = ref(detectTimeZone() ?? "UTC");
</script>

<div class="demo">
  <ViTimeZone v-model="a" label="Meeting time zone" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ a }}</div>
  <ViTimeZone v-model="b" label="Empty, clearable" clearable />
  <ViTimeZone v-model="c" label="Only these zones" :zones="['UTC', 'Asia/Tehran', 'Europe/London', 'America/New_York']" />
  <ViTimeZone v-model="mine" label="Defaults to the browser's zone (client only)" />
</div>

```vue
<ViTimeZone v-model="zone" label="Time zone" />
<ViTimeZone v-model="zone" :zones="['UTC', 'Asia/Tehran', 'Europe/London']" clearable />
```

## The value is an id, not an offset

`v-model` is the IANA id (`"Asia/Tehran"`). The list shows `UTC+03:30 · Asia/Tehran` so people can search by city, by name or by offset, but the offset is never stored: it changes with daylight saving and with law (Iran was `+04:30` in summer until 2022). Offsets are computed for the date in `at` (default: now).

| Prop | Meaning |
|---|---|
| `modelValue` | IANA id or `null` |
| `at` | ISO string or `Date` whose offsets are shown. Default: now |
| `zones` | Limit the list to these ids. Default: every zone the browser knows, plus `UTC` |
| other props | forwarded to `ViSelect` |

A `modelValue` the browser's list lacks (for example `Asia/Kolkata` where the browser says `Asia/Calcutta`) is still shown, so a saved value never disappears.

## Meeting across countries

Keep three things apart: the wall-clock time from `ViDate`, the zone from `ViTimeZone`, and let the server build the instant.

```vue
<ViDate v-model="at" time="hm" label="Meeting" />
<ViTimeZone v-model="zone" label="Time zone" />
```
```ts
const zone = ref(detectTimeZone() ?? "UTC"); // call on the client only
await api.post("/meetings", { at: at.value, zone: zone.value });
// { at: "2026-10-24T00:00", zone: "Asia/Tehran" }
```
```php
$utc = Carbon::parse($request->at, $request->zone)->utc(); // 2026-10-23T20:30:00Z
```

Store the wall-clock time and the zone for a future event, plus the UTC instant for sorting. An offset alone (`+03:30`) cannot follow a law change. viputy does not convert times itself; the conversion belongs to the server, or to your own code with `Intl` / Luxon if you must send an ISO string with an offset.

## Helpers

```ts
import { detectTimeZone, formatOffset, timeZoneOptions } from "@mnr73/viputy";

detectTimeZone();                 // "Asia/Tehran" (browser; null if unreadable)
formatOffset(210);                // "UTC+03:30"
timeZoneOptions("fa", new Date()) // [{ value, label, description, offset }, ...] sorted by offset
```
