# ViDate و ViCalendar

انتخاب تاریخ (و ساعت) با تقویم جلالی و میلادی، تایپ مستقیم، `min`/`max` و دو ماه کنار هم.

<script setup>
import { ref } from "vue";
const a = ref("2026-11-10");
const b = ref("2026-11-10T14:30");
const c = ref(null);
const d = ref("2026-11-10");
const e = ref("2026-11-10");
</script>

<div class="demo">
  <ViDate v-model="a" label="تاریخ تولد" clearable />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ a }}</div>
  <ViDate v-model="b" label="زمان جلسه" time="hm" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ b }}</div>
  <ViDate v-model="c" label="مهلت تحویل" min="2026-11-05" max="2026-12-20" :marked="['2026-11-25']" hint="بین ۱۴۰۵/۰۸/۱۴ و ۱۴۰۵/۰۹/۲۹" />
  <ViDate v-model="d" label="بازه‌ی گزارش (دو تقویم)" :calendars="['gregorian', 'jalali']" calendar="gregorian" :months="2" />
  <ViDate label="غیرفعال" disabled model-value="2026-11-10" />
  <ViDate v-model="e" label="بدون اسکرول خودکار صفحه" :auto-scroll="false" />
</div>

<div class="demo">
  <ViCalendar v-model="a" alt-days />
</div>

```vue
<ViDate v-model="birth" label="تاریخ تولد" clearable />
<ViDate v-model="meeting" time="hm" />
<ViDate v-model="deadline" min="2026-11-05" max="2026-12-20" />
<ViDate v-model="d" :months="2" :calendars="['gregorian']" />
<ViCalendar v-model="day" alt-days />   <!-- تقویم تنها، بدون فیلد -->
```

## مقدار (v-model)

مقدار همیشه یک **رشته‌ی ISO میلادی** است، مستقل از تقویمی که کاربر می‌بیند:

| `time` | مقدار |
|---|---|
| `false` (پیش‌فرض) | `"2026-11-10"` |
| `"hm"` | `"2026-11-10T14:30"` |
| `"hms"` | `"2026-11-10T14:30:15"` |

بدون منطقه‌ی زمانی (wall-clock). همین رشته مستقیم به سرور (Laravel) می‌رود. نمایش جلالی یا فارسی فقط روی صفحه است. اگر مقدار نامعتبر باشد فیلد خالی نشان داده می‌شود.

## تایپ مستقیم

کاربر می‌تواند تایپ کند: `۱۴۰۵/۸/۱۹`، `1405-08-19`، `2026.11.10`، `19/8/1405` و با ساعت `۱۴۰۵/۰۸/۱۹ ۱۴:۳۰`. سال ۴ رقمی تقویم را تعیین می‌کند (زیر ۱۷۰۰ جلالی). تاریخ ناموجود (مثل ۳۰ اسفند در سال غیرکبیسه) یا خارج از `min`/`max` خطا نشان می‌دهد و مقدار را عوض نمی‌کند.

## min و max

رشته‌ی ISO. `max="2026-12-20"` یعنی **کل آن روز** مجاز است. اگر ساعت هم بدهی (`2026-12-20T10:00`) همان ساعت حد است. با `time` روی روزِ حد، ساعت‌های غیرمجاز غیرفعال می‌شوند. `is-disabled` یک تابع `(iso) => boolean` برای غیرفعال کردن روزهای دلخواه (مثلاً تعطیلات) است و `marked` روزها را قاب‌دار نشان می‌دهد.

## Props

| Prop | توضیح |
|---|---|
| `modelValue` | رشته‌ی ISO یا `null` |
| `calendars` | تقویم‌های قابل انتخاب (پیش‌فرض `['jalali','gregorian']`). یکی بگذاری سوییچ پنهان می‌شود |
| `calendar` | تقویم اولیه |
| `time` | `false` / `"hm"` / `"hms"` |
| `hour12` | نمایش ۱۲ ساعته (مقدار همچنان ۲۴ ساعته است) |
| `minute-step` | گام دقیقه |
| `min` / `max` | حدود ISO |
| `is-disabled` | `(iso) => boolean` |
| `marked` | روزهای قاب‌دار |
| `months` | تعداد ماه کنار هم (۱ یا ۲) |
| `display-format` | الگوی نمایش، مثل `yyyy/MM/dd` |
| `clearable` | |
| `mobile` | `sheet` / `fullscreen` / `false` |
| `name` | ورودی hidden برای `<form>` |
| `week-start` / `weekend` | ۰ = شنبه … ۶ = جمعه |
| props مشترک | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

## روی موبایل

وقتی `time` روشن است، شیت پایین یک بار فقط یک بخش را نشان می‌دهد و دیگر صفحه‌ی بلندی نیست که باید اسکرول کرد. در فوتر دو دکمه کنار هم هستند، **تاریخ** و **ساعت**، هرکدام با مقدارش (`تاریخ ۱۴۰۵/۰۸/۱۹`، `ساعت ۱۴:۳۰`). روی هرکدام بزنی همان بخش باز می‌شود. بعد از انتخاب روز، شیت خودش به ساعت می‌رود. کسی که فقط تاریخ می‌خواهد می‌تواند دوباره روی **تاریخ** بزند یا تایید کند. هر بار باز شدن از تاریخ شروع می‌شود. فیلد فقط‌تاریخ، صفحه‌ی بزرگ و پاپ‌آور دسکتاپ بدون تغییر است.


## ViCalendar

خودِ تقویم بدون فیلد. Props: `modelValue` (ISO روز)، `calendar`، `min`، `max`، `marked`، `is-disabled`، `alt-days` (شماره‌ی روز تقویم دیگر زیر هر روز)، `months`، `week-start`، `weekend`، `initial-view`. عنوان ماه را بزن تا ماه و سال انتخاب شود.

کیبورد: `← → ↑ ↓` حرکت (در RTL جهت چپ و راست جابه‌جا می‌شود)، `Home` / `End` ابتدا و انتهای هفته، `PageUp` / `PageDown` ماه قبل/بعد و با `Shift` سال.

## تقویم و هفته

در `fa` هفته از شنبه شروع می‌شود و جمعه تعطیل (قرمز) است. در `en` از یکشنبه و تعطیلی شنبه و یکشنبه. با `week-start` و `weekend` عوض می‌شود. ماه‌ها در تقویم جلالی با حساب جلالی جابه‌جا می‌شوند، نه با حساب میلادی، پس هیچ ماهی رد یا تکرار نمی‌شود. جلالی برای سال‌های ۶۱- تا ۳۱۷۷ پشتیبانی می‌شود.
