# مهاجرت از ۰.۳ به ۱.۰

نسخه ۱.۰ بازنویسی کامل است و سازگاری عقب‌رو ندارد. بازه‌ی `^0.3` شامل ۱.۰ نمی‌شود، پس تا وقتی خودت نسخه را بالا نبری چیزی خراب نمی‌شود. کد قدیم روی شاخه‌ی `legacy/0.x` و تگ `v0.3.32` است.

## تفاوت‌های اصلی

| ۰.۳ | ۱.۰ |
|---|---|
| کلاس‌های Tailwind داخل قالب | متغیرهای CSS با پیشوند `--vi-*` و `@layer vi`، بدون نیاز به Tailwind |
| مدل `DateTime` از Luxon | رشته‌ی ISO (`"2026-11-10"`)، بدون کتابخانه‌ی تاریخ |
| تبدیل جلالی با قاعده‌ی ۳۳ ساله (در بعضی سال‌ها غلط) | موتور جدید با جدول کبیسه، تست‌شده برای ۱۸۰۰ تا ۲۳۰۰ |
| بدون نصب | `app.use(viputy, { locale: "fa" })` و `import "@mnr73/viputy/style.css"` |

## تغییر نام‌ها

| ۰.۳ | ۱.۰ |
|---|---|
| `ViCheckBox` / `ViCheckSlider` | `ViCheckbox` / `ViSwitch` |
| `ViSimpleSelect`، `ViSimpleDropdown`، `ViDropdown` | `ViSelect` یا ساخت با `ViField` و `ViPopup` |
| `ViFrame`، `ViNoFrame`، `ViPart` | `ViField` (به‌جای `ViNoFrame`: `bare`) |
| `title` | `label` |
| `noFrame` | `bare` |
| `status="true"` | `status="success"` |
| `inputDir` | `dir` |
| `datalist` | `suggestions` |
| `ViInput accept="number"` و `format` | `type="number"` و `grouped` (و `persian-digits`) |
| `ViSelect search` / `compareKey` | `searchable` / `by` |
| `fullPopup` | `mobile="fullscreen"` |
| `calender` (غلط املایی) | `calendar` یا `calendars` |
| `signedDate` | `marked` |
| `persianFormat` / `gregorianFormat` | `displayFormat` |
| رویداد `change` | `update:modelValue` (و `open` / `close`) |

## تبدیل مقدار

```ts
// قبل: DateTime از Luxon      بعد: رشته‌ی ISO
dt.toISODate();                          // "2026-11-10"
dt.toFormat("yyyy-MM-dd'T'HH:mm");       // با ساعت
PlainDateTime.fromISO(value)?.toJSDate(); // اگر کد قدیمی Date می‌خواهد
```

قرارداد با سرور عوض نمی‌شود: نسخه‌ی قبل هم ISO می‌فرستاد.

## فهرست کار برای هر فایل

۱. importها را با جدول بالا درست کن و یک بار `@mnr73/viputy/style.css` را وارد کن.
۲. `title` را به `label`، `noFrame` را به `bare` و `status="true"` را به `status="success"` تغییر بده.
۳. در کامپوننت‌های تاریخ، نوع مدل را از `DateTime | null` به `string | null` ببر و importهای Luxon را که فقط برای viputy بودند حذف کن.
۴. `ViSelect`: `compare-key` به `by`، `search` به `searchable`.
۵. کلاس‌های Tailwind که برای چیدمان به viputy می‌دادی را روی ریشه با `class` نگه دار.
۶. `npm run typecheck` بزن و هر فرم را یک بار در RTL و نزدیک لبه‌ی پایین صفحه و در عرض ۳۹۰ امتحان کن.

از ۰.۳ منتقل نشده‌اند: `class` روی بخش‌های داخلی (به‌جایش prop `ui`)، `actionKeys` در `ViDropdown`، و نوع‌های Luxon در propها.

برای ایجنت‌ها: اسکیل [`skills/viputy`](/guide/ai-skill) همین جدول را دارد و می‌تواند مهاجرت را انجام دهد.
