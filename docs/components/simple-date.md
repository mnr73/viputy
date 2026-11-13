# ViSimpleDate

سه فیلد «روز / ماه / سال» برای تاریخ‌هایی که تایپ یا تقویم برایشان سخت است (تاریخ تولد، شروع قرارداد). هر فیلد یک `ViSelect` است.

<script setup>
import { ref } from "vue";
const a = ref("2026-11-10");
const b = ref(null);
const c = ref("2025-03-10");
const d = ref(null);
</script>

<div class="demo">
  <ViSimpleDate v-model="a" label="تاریخ تولد" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ a }}</div>
  <ViSimpleDate v-model="b" label="تاریخ شروع قرارداد (خالی)" shortcuts :from-year="1380" :to-year="1420" />
  <ViSimpleDate v-model="c" label="تاریخ پایان (اسفند ۱۴۰۳ کبیسه است)" shortcuts />
  <ViSimpleDate v-model="d" label="بعد از هر انتخاب، بخش بعدی خودکار باز می‌شود" auto-advance />
</div>

```vue
<ViSimpleDate v-model="birth" label="تاریخ تولد" />
<ViSimpleDate v-model="start" shortcuts :from-year="1380" :to-year="1420" />
```

## رفتار

- مقدار رشته‌ی ISO میلادی است (`"2026-11-10"`) و **فقط وقتی هر سه بخش پر شد** ارسال می‌شود. تا آن موقع بخش‌های انتخاب‌شده در خود کامپوننت می‌مانند، پس تاریخ نیمه‌کاره گم نمی‌شود. پاک کردن یک بخش مقدار را `null` می‌کند.
- فهرست روزها طول ماه را دنبال می‌کند (۳۱، ۳۰، و برای اسفند ۲۹ یا ۳۰ بر اساس کبیسه بودن سال). اگر ماه کوتاه‌تر شود روز انتخاب‌شده کوتاه می‌شود (۳۱ شهریور → ۳۰ مهر).
- `min`/`max` بازه‌ی سال را تنظیم می‌کنند و روزهای بیرون از بازه را غیرفعال می‌کنند. بدون آن‌ها بازه‌ی سال از `from-year` تا `to-year` است (پیش‌فرض: ۱۰۰ سال قبل تا ۲۰ سال بعد).
- `shortcuts`: دکمه‌های «اول ماه» و «آخر ماه». اگر ماه اسفند باشد یادداشتی طول ماه را نشان می‌دهد («اسفند ۱۴۰۳ ۳۰ روز دارد؛ «آخر ماه» = ۳۰»).
- سال دارای جستجو است. ترتیب پیش‌فرض روز / ماه / سال است و با `year-first` سال / ماه / روز می‌شود.
- `auto-advance`: بعد از انتخاب هر بخش، بخش خالیِ بعدی (روز ← ماه ← سال، یا با `year-first` سال ← ماه ← روز) خودکار باز می‌شود. روی موبایل هم یکی‌یکی شیت باز می‌شود. بخشی که قبلاً پر است رد می‌شود و بعد از آخرین بخش چیزی باز نمی‌شود. پیش‌فرض خاموش است.

## Props

| Prop | توضیح |
|---|---|
| `modelValue` | ISO یا `null` |
| `calendar` | پیش‌فرض: جلالی در `fa` |
| `min` / `max` | حدود ISO |
| `from-year` / `to-year` | بازه‌ی سال وقتی `min`/`max` نیست |
| `auto-advance` | بخش بعدی را خودکار باز می‌کند |
| `shortcuts` | اول ماه / آخر ماه |
| `year-first` | ترتیب سال، ماه، روز |
| `name` | ورودی hidden برای `<form>` |
| `mobile` | مثل ViSelect |
| props مشترک | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |
