# ViQueryBuilder

نوار فیلتر: با `@` یک فیلد را انتخاب می‌کنی، بعد عملگر و مقدار، و یک بج ساخته می‌شود. خروجی یک آرایه‌ی ساده است که می‌شود به JSON یا query string تبدیل کرد.

<script setup>
import { ref } from "vue";
import { fromQueryString, toQueryString } from "../../src";

const fields = [
  {
    key: "user", label: "کاربر", type: "entity", multiple: false,
    search: async (q) => {
      await new Promise((r) => setTimeout(r, 300));
      return [
        { key: 42, label: "میلاد نظری", description: "مدیر فروش" },
        { key: 7, label: "میلاد کاظمی", description: "پشتیبانی" },
        { key: 9, label: "جمیلا مرادی", description: "مالی" }
      ].filter((u) => u.label.includes(q.trim()));
    }
  },
  { key: "age", label: "سن", type: "number", operators: ">,=,<,<=,>=,between", multiple: true, min: 0 },
  {
    key: "type", label: "نوع", type: "select",
    operators: ["in", "nin"],
    options: [{ key: 1, label: "خرید" }, { key: 2, label: "فروش" }, { key: 3, label: "مرجوعی" }]
  },
  {
    key: "date", label: "تاریخ", type: "date", operators: [">", "<", "between"],
    variants: [{ key: "create", label: "ایجاد" }, { key: "update", label: "ویرایش" }]
  },
  { key: "note", label: "توضیحات", type: "text" },
  { key: "paid", label: "تایید شده", type: "boolean" }
];
const filters = ref([
  { key: "type", op: "in", value: [1, 2] },
  { key: "age", op: "<", value: 30 }
]);
</script>

<div class="demo">
  <ViQueryBuilder v-model="filters" :fields="fields" label="فیلترها" clearable />
  <pre dir="ltr" style="margin: 12px 0 0; font-size: 12px">{{ JSON.stringify(filters, null, 1) }}</pre>
  <pre dir="ltr" style="margin: 0; font-size: 12px; white-space: pre-wrap; word-break: break-all">?{{ toQueryString(filters) }}</pre>
</div>

```vue
<script setup>
import { ref } from "vue";
import { ViQueryBuilder, toQueryString } from "@mnr73/viputy";

const fields = [
  { key: "user", label: "کاربر", type: "entity", search: (q) => api.users(q) },
  { key: "age", label: "سن", type: "number", operators: ">,=,<,<=,>=", multiple: true },
  { key: "type", label: "نوع", type: "select", options: [{ key: 1, label: "خرید" }, { key: 2, label: "فروش" }] },
  { key: "date", label: "تاریخ", type: "date", variants: [{ key: "create", label: "ایجاد" }, { key: "update", label: "ویرایش" }] }
];
const filters = ref([]);
</script>

<template>
  <ViQueryBuilder v-model="filters" :fields="fields" />
</template>
```

## مرحله‌ها

1. `@` یا کلیک → فهرست فیلدها (با تایپ فیلتر می‌شود؛ فیلد استفاده‌شده پنهان است مگر `multiple`).
2. اگر فیلد `variants` دارد → «کدام مورد؟» (مثلاً تاریخ ایجاد / ویرایش).
3. عملگر. اگر فقط یکی مجاز باشد این مرحله رد می‌شود.
4. مقدار، بسته به `type`: عدد و متن تایپ می‌شود، `select` و `entity` فهرست دارند، `date` تقویم باز می‌کند، `between` دو مقدار می‌خواهد.

روی بج کلیک کنی ویرایش می‌شود. `Backspace` در input خالی آخرین بج را انتخاب می‌کند و بار دوم حذفش می‌کند. `Esc` بج ناقص را لغو می‌کند. در فهرست چندانتخابی `Enter` ردیف فعال را تیک می‌زند و `Ctrl/Cmd+Enter` فیلتر را اضافه می‌کند.

## تعریف فیلد

| کلید | توضیح |
|---|---|
| `key` · `label` | شناسه و عنوان |
| `type` | `text` (پیش‌فرض) · `number` · `date` · `select` · `entity` · `boolean` |
| `operators` | آرایه یا رشته‌ی `">,=,<"`. هر یک از `= != < <= > >= in nin between empty nempty contains starts` |
| `operator` | عملگر اول فهرست (پیش‌فرض اولین مجاز) |
| `options` | برای `select` و `entity`: رشته، `{ key, label }` یا گروه `{ label, options }` |
| `search` | برای `entity`: `(q) => Promise<options>` با debounce. نمایش برچسب در بج ذخیره می‌شود (`display`) و در خروجی نمی‌آید |
| `variants` | نسخه‌های یک فیلد: `[{ key, label }]`. در خروجی `variant` و در query string `date_create` |
| `multiple` | اجازه‌ی افزودن دوباره‌ی همان فیلد (مثلاً سن < ۳۰ و سن > ۲۰) |
| `min` · `max` | برای عدد و تاریخ |
| `validate` | `(value, op) => "پیام خطا"` |

عملگرهای پیش‌فرض: متن `contains = != starts empty`، عدد `= < <= > >= between`، تاریخ `> = < between empty`، انتخابی `in`، `entity` و بولی `=`.

## خروجی

```ts
type QueryItem = {
  key: string;
  op: Operator;
  value?: unknown;    // عدد/رشته، یا آرایه برای in/nin/between؛ برای empty نیست
  variant?: string;
};
```

تاریخ‌ها همیشه ISO میلادی (`2026-11-01`) هستند و فقط موقع نمایش جلالی می‌شوند.

```ts
import { toQueryString, fromQueryString } from "@mnr73/viputy";

toQueryString(filters);
// filter[user]=42&filter[age][lt]=30&filter[date_create][gt]=2026-11-01&filter[type][in]=1,2

filters.value = fromQueryString(location.search, fields); // بارگذاری از URL
```

نام عملگرها در query string: `ne lt lte gt gte in nin between empty nempty contains starts` و `=` بدون پسوند. اگر یک فیلد با یک عملگر را دو بار داشته باشی (`age >= 20` و `age >= 25`) در query string روی هم می‌نویسند؛ برای آن‌ها JSON بفرست.

## Props

| Prop | توضیح |
|---|---|
| `v-model` | آرایه‌ی `QueryItem` |
| `fields` | تعریف فیلدها |
| `placeholder` | متن راهنما |
| `trigger` | پیشوند شروع، پیش‌فرض `@`. تایپ هر متن هم فهرست را فیلتر می‌کند |
| `clearable` | دکمه‌ی پاک‌کردن همه |
| `calendar` | `jalali` / `gregorian` برای مقدار تاریخ |
| `auto-scroll` | مثل ViPopup |
| `label` `hint` `status` `disabled` `readonly` … | مثل `ViField` |
