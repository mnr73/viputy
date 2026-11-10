# ViDateRange

انتخاب بازه‌ی تاریخ: از یک روز تا یک روز، با پیش‌نمایش hover، دو تقویم کنار هم و presetهای آماده.

<script setup>
import { ref } from "vue";
const a = ref({ start: "2026-11-16", end: "2026-11-30" });
const b = ref({ start: null, end: null });
const c = ref({ start: null, end: null });
</script>

<div class="demo">
  <ViDateRange v-model="a" label="بازه‌ی گزارش" clearable />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ a }}</div>
  <ViDateRange v-model="b" label="حداکثر ۳۱ روز" :presets="['last7', 'last30', 'thisMonth']" :max-days="31" hint="بازه‌ی طولانی‌تر خودکار کوتاه می‌شود" />
  <ViDateRange v-model="c" label="بدون preset، یک ماه، در محدوده‌ی آذر و دی" :presets="false" :months="1" min="2026-11-01" max="2026-12-31" />
</div>

```vue
<ViDateRange v-model="range" label="بازه‌ی گزارش" clearable />
<ViDateRange v-model="range" :presets="['last7', 'thisMonth']" :max-days="31" />
<ViDateRange v-model="range" :months="1" :presets="false" min="2026-11-01" />
```

## مقدار

یک شیء با دو رشته‌ی ISO میلادی (روز، بدون ساعت):

```ts
{ start: "2026-11-16", end: "2026-11-30" }   // هر دو null = خالی
```

بعد از اولین کلیک `end` تا کلیک دوم `null` است. اگر کاربر تاریخ پایان را قبل از شروع بزند، جای آن‌ها عوض می‌شود. با `name="period"` فیلدهای hidden به نام‌های `period[start]` و `period[end]` برای `<form>` اضافه می‌شود.

## انتخاب

- **دو کلیک:** اول شروع، بعد پایان. بین دو کلیک، با رفتن موس روی روزها بازه‌ی میانی پیش‌نمایش داده می‌شود (حاشیه‌ی خط‌چین روی روز پایانِ پیش‌نمایش).
- **دو تقویم** کنار هم (`months`، پیش‌فرض ۲؛ روی موبایل ۱).
- **preset‌ها:** «امروز»، «دیروز»، «۷ روز اخیر»، «۳۰ روز اخیر»، «این ماه»، «ماه قبل». «این ماه» و «ماه قبل» با تقویم فعال حساب می‌شوند: در تقویم جلالی آبان یعنی ۱ تا ۳۰ آبان، نه ماه میلادی. preset‌ای که با `min`/`max` سازگار نباشد غیرفعال می‌شود. با تغییر دستی بازه، «بازه‌ی دلخواه» انتخاب‌شده نشان داده می‌شود.
- **تایپ:** هر دو فیلد قابل تایپ‌اند (`۱۴۰۵/۰۸/۲۵`). پایان قبل از شروع یا خارج از بازه خطا نشان می‌دهد و مقدار را عوض نمی‌کند.
- `max-days`: بازه‌ی بلندتر از آن، روی پایان کوتاه می‌شود.

## Props

| Prop | توضیح |
|---|---|
| `modelValue` | `{ start, end }` یا `null` |
| `calendars` / `calendar` | مثل ViDate |
| `min` / `max` | حدود ISO (`max` کل روز را شامل است) |
| `is-disabled` / `marked` | مثل ViDate |
| `months` | تعداد ماه کنار هم (۲) |
| `presets` | `true` / `false` / فهرستی از `today yesterday last7 last30 thisMonth lastMonth` |
| `max-days` | بیشترین طول بازه |
| `allow-same-day` | شروع و پایان یک روز (پیش‌فرض `true`) |
| `show-count` | تعداد روزها در پایین (`۱۵ روز`) |
| `clearable` / `mobile` / `name` | |
| `week-start` / `weekend` | |
| props مشترک | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

روی موبایل پنل sheet است: یک ماه، presetها به‌صورت ردیف افقی بالای تقویم، و دکمه‌های «پاک کردن» و «اعمال» ثابت پایین.

## ViCalendar در حالت بازه

برای ساخت انتخابگر بازه‌ی دلخواه، `ViCalendar` را با `range-start` و `range-end` بده؛ روزهای بین آن‌ها هایلایت می‌شود و تا وقتی `range-end` خالی است، hover پیش‌نمایش می‌دهد و رویداد `hover` ISO روز زیر موس را می‌دهد. کلیک‌ها همچنان `update:modelValue` می‌فرستند؛ معنی هر کلیک با توست.
