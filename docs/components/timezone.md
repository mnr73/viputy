# ViTimeZone

انتخابگر جست‌وجوپذیر منطقه‌ی زمانی IANA (مثل `Asia/Tehran`). زیرش یک `ViSelect` است، پس `label`، `clearable`، `mobile`، `disabled` و بقیه همان‌طور کار می‌کنند.

<script setup>
import { ref } from "vue";
import { detectTimeZone } from "../../src";
const a = ref("Asia/Tehran");
const b = ref(null);
const c = ref("Europe/London");
const mine = ref(detectTimeZone() ?? "UTC");
</script>

<div class="demo">
  <ViTimeZone v-model="a" label="منطقه‌ی زمانی جلسه" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ a }}</div>
  <ViTimeZone v-model="b" label="خالی، با دکمه‌ی پاک‌کردن" clearable />
  <ViTimeZone v-model="c" label="فقط چند منطقه" :zones="['UTC', 'Asia/Tehran', 'Europe/London', 'America/New_York']" />
  <ViTimeZone v-model="mine" label="پیش‌فرض: منطقه‌ی مرورگر (فقط سمت کلاینت)" />
</div>

```vue
<ViTimeZone v-model="zone" label="منطقه‌ی زمانی" />
<ViTimeZone v-model="zone" :zones="['UTC', 'Asia/Tehran', 'Europe/London']" clearable />
```

## مقدار id است نه offset

`v-model` شناسه‌ی IANA است (`"Asia/Tehran"`). فهرست `UTC+03:30 · Asia/Tehran` را نشان می‌دهد تا بشود با شهر، نام یا offset جست‌وجو کرد، ولی offset ذخیره نمی‌شود: با ساعت تابستانی و با قانون عوض می‌شود (ایران تا ۱۴۰۱ در تابستان `+04:30` بود). offsetها برای تاریخ `at` حساب می‌شوند (پیش‌فرض: اکنون).

| prop | معنی |
|---|---|
| `modelValue` | شناسه‌ی IANA یا `null` |
| `at` | رشته‌ی ISO یا `Date` که offsetها برایش نشان داده می‌شوند. پیش‌فرض: اکنون |
| `zones` | فهرست را به این شناسه‌ها محدود می‌کند. پیش‌فرض: همه‌ی منطقه‌هایی که مرورگر می‌شناسد به‌علاوه‌ی `UTC` |
| بقیه‌ی propها | به `ViSelect` می‌رسند |

اگر `modelValue` در فهرست مرورگر نباشد (مثلاً `Asia/Kolkata` که مرورگر `Asia/Calcutta` می‌گوید) باز هم نمایش داده می‌شود، پس مقدار ذخیره‌شده گم نمی‌شود.

## قرار چندکشوری

سه چیز را جدا نگه دار: ساعت دیواری از `ViDate`، منطقه از `ViTimeZone`، و لحظه را سرور بسازد.

```vue
<ViDate v-model="at" time="hm" label="جلسه" />
<ViTimeZone v-model="zone" label="منطقه‌ی زمانی" />
```
```ts
const zone = ref(detectTimeZone() ?? "UTC"); // فقط سمت کلاینت صدا بزن
await api.post("/meetings", { at: at.value, zone: zone.value });
// { at: "2026-10-24T00:00", zone: "Asia/Tehran" }
```
```php
$utc = Carbon::parse($request->at, $request->zone)->utc(); // 2026-10-23T20:30:00Z
```

برای رویداد آینده ساعت دیواری و منطقه را ذخیره کن، و لحظه‌ی UTC را هم برای مرتب‌سازی. offset تنها (`+03:30`) تغییر قانون را دنبال نمی‌کند. viputy خودش زمان را تبدیل نمی‌کند: تبدیل کار سرور است، یا کد خودت با `Intl` / Luxon اگر ناچاری رشته‌ی ISO با offset بفرستی.

## توابع کمکی

```ts
import { detectTimeZone, formatOffset, timeZoneOptions } from "@mnr73/viputy";

detectTimeZone();                 // "Asia/Tehran" (مرورگر؛ اگر خوانده نشد null)
formatOffset(210);                // "UTC+03:30"
timeZoneOptions("fa", new Date()) // [{ value, label, description, offset }, ...] مرتب بر اساس offset
```
