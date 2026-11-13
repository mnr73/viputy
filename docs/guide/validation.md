# اعتبارسنجی و ViForm

هر اینپوتی `rules` می‌گیرد. وقتی یک قاعده رد شود اینپوت قرمز می‌شود و پیام زیر آن می‌آید. برای قاعده‌های رایج چیزی لازم نیست import کنی.

<script setup>
import { ref } from "vue";
import { defineRule } from "../../src";
const name = ref("");
const age = ref(null);
const mobile = ref("");
const nid = ref("");
const city = ref(null);
const tags = ref([]);
const agree = ref(false);
const username = ref("");
defineRule("noSpaces", (v) => (/\s/.test(v) ? "فاصله مجاز نیست" : true));
const taken = async (v) => { await new Promise((r) => setTimeout(r, 600)); return ["admin", "root"].includes(v) ? `«${v}» قبلاً ثبت شده` : true; };

const f = ref({ name: "", email: "", pass: "", pass2: "", terms: false });
const errors = ref({});
const submitting = ref(false);
const sent = ref("");
async function send(values) {
  submitting.value = true; errors.value = {};
  await new Promise((r) => setTimeout(r, 700));
  submitting.value = false;
  if (values.email === "taken@x.com") errors.value = { email: ["این ایمیل قبلاً ثبت شده (از سرور)"] };
  else sent.value = JSON.stringify(values);
}
</script>

<div class="demo">
  <ViInput v-model="name" label="نام" :rules="['required', { minLength: 3 }, { maxLength: 20 }]" />
  <ViInput v-model="age" label="سن" type="number" :rules="{ required: true, min: 18, max: 99 }" />
  <ViInput v-model="mobile" label="موبایل" type="tel" :rules="['required', 'phone']" />
  <ViInput v-model="nid" label="کد ملی" :rules="['nationalId']" />
  <ViSelect v-model="city" label="شهر" :options="['تهران', 'شیراز', 'تبریز']" :rules="['required']" />
  <ViTag v-model="tags" label="مهارت‌ها (۲ تا ۴)" :rules="['required', { minItems: 2 }, { maxItems: 4 }]" />
  <ViInput v-model="username" label="نام کاربری (admin را امتحان کن)" :rules="['required', 'noSpaces', taken]" hint="روی سرور بررسی می‌شود" />
  <ViCheckbox v-model="agree" label="قوانین را می‌پذیرم" :rules="{ required: true }" />
</div>

```vue
<ViInput v-model="name" label="نام" :rules="['required', { minLength: 3 }, { maxLength: 20 }]" />
<ViInput v-model="age" type="number" :rules="{ required: true, min: 18, max: 99 }" />
<ViCheckbox v-model="agree" :rules="{ required: true }" label="قوانین را می‌پذیرم" />
```

## نوشتن قاعده

دو شکل دارد و می‌شود قاطی کرد:

```ts
["required", { minLength: 3 }, myFunction]        // آرایه ترتیب را نگه می‌دارد
{ required: true, minLength: 3, pattern: /^[a-z]+$/ } // آبجکت کوتاه‌تر است
```

قاعده‌ها **به ترتیب** بررسی می‌شوند و اولین خطا نمایش داده می‌شود. **مقدار خالی همه‌ی قاعده‌ها را رد می‌کند به‌جز `required`** (و `equals`)، پس فیلد اختیاری با `email` اگر خالی بماند اشکالی ندارد. برای اجباری شدن `required` اضافه کن.

| قاعده | بررسی |
|---|---|
| `required` | خالی نباشد: `""`، فاصله، `null`، `[]`، بازه‌ی تاریخ خالی و چک‌باکس تیک‌نخورده رد می‌شوند. `0` یک مقدار است |
| `minLength` `maxLength` `length` `lengthBetween: [a, b]` | نویسه‌های متن (ایموجی یکی حساب می‌شود) یا تعداد عضو فهرست |
| `minItems` `maxItems` | تگ، فایل، گزینه‌ی انتخاب‌شده |
| `min` `max` `between: [a, b]` | عدد (ارقام فارسی و `1,200` اشکالی ندارد)، تاریخ ISO، تاریخ‌ساعت ISO و `HH:mm` |
| `integer` | عدد صحیح |
| `pattern: /re/` | یک عبارت منظم |
| `email` `url` | `url` به `http(s)://` و دامنه‌ی نقطه‌دار نیاز دارد |
| `phone` | موبایل ایران با هر املا: `0912…`، `+98912…`، `0098912…`، `912…` |
| `nationalId` | کد ملی ایران با رقم کنترل |
| `cardNumber` | ۱۶ رقم با رقم کنترل درست |
| `digits` | فقط رقم (فارسی هم) |
| `oneOf: [..]` `notOneOf: [..]` | مقدار مجاز یا ممنوع |
| `equals: "password"` | برابر فیلد `password` در همان `ViForm` (یا یک مقدار ساده). روی مقدار خالی هم اجرا می‌شود |

روی `ViInput`، `ViText`، `ViSelect`، `ViTag`، `ViDate`، `ViTime`، `ViDateRange`، `ViSimpleDate`، `ViTimeZone`، `ViUpload`، `ViQueryBuilder`، `ViCheckbox`، `ViSwitch` و `ViRadioGroup` کار می‌کند. برای فهرست‌ها (`ViSelect multiple`، `ViTag`، `ViUpload`، `ViQueryBuilder`) قاعده‌های طول، تعداد عضو را می‌شمارند.

## کی بررسی می‌کند

`validate-on` روی اینپوت (یا روی `ViForm`):

| | |
|---|---|
| `"blur"` (پیش‌فرض) | وقتی کاربر از فیلد خارج شد. فیلد popup دار (select، تاریخ) وقتی پنل بسته شد بررسی می‌کند |
| `"change"` / `"input"` | با هر تغییر / هر کلید |
| `"submit"` | فقط وقتی فرم ارسال شد |

تایپ کردن قبل از اولین خطا هیچ‌وقت اذیت نمی‌کند. **بعد از نمایش خطا، فیلد با هر تغییر دوباره بررسی می‌کند**، پس خطا همان لحظه‌ی درست شدن می‌رود.

## پیام‌ها

هر قاعده یک پیام پیش‌فرض فارسی و انگلیسی دارد. جاینگهدارهای `{label}`، `{min}`، `{max}`، `{n}`، `{value}` و `{list}` پر می‌شوند.

```vue
<!-- ۱. روی یک اینپوت، بر اساس نام قاعده -->
<ViInput label="نام" :rules="['required', { minLength: 3 }]"
  :messages="{ required: 'پر کردن «{label}» الزامی است', minLength: '{label} حداقل {min} حرف باشد' }" />

<!-- ۲. روی یک قاعده -->
<ViInput :rules="[{ minLength: 3, message: 'خیلی کوتاه است' }]" />

<!-- ۳. برای کل برنامه -->
app.use(viputy, { locale: "fa", rules: { fa: { required: "پر کردن «{label}» الزامی است" } } })
```

اولویت: `message` خود قاعده، بعد `messages` اینپوت، بعد `rules` برنامه، بعد متن داخلی. propهای `status` و `message` که خودت بدهی **همیشه برنده‌اند**: اینپوتی که `message="..."` دارد متن قاعده را نشان نمی‌دهد.

## قاعده‌ی خودت

قاعده یک تابع است. برای خطا یک **رشته** برگردان، و برای درست بودن `true` یا هیچ. می‌تواند async باشد (بررسی نام کاربری روی سرور): تا وقتی اجرا می‌شود فیلد چیزی نشان نمی‌دهد و جوابی که بعد از تایپ بیشتر کاربر برسد کنار گذاشته می‌شود.

```ts
const unique = async (v) => (await api.exists(v)) ? "این نام قبلاً ثبت شده" : true;

// با پارامتر در پیام
{ validate: (v) => v.startsWith("09"), message: "باید با {prefix} شروع شود", params: { prefix: "09" } }

// استفاده از پیام داخلی، یا متن و پارامتر خودت
(v) => ({ key: "min", params: { min: 18 } })
(v) => ({ message: "{n} مورد دیگر لازم است", params: { n: 2 } })

// یک بار ثبت کن، همه‌جا با نام استفاده کن
import { defineRule } from "@mnr73/viputy";
defineRule("noSpaces", (v) => (/\s/.test(v) ? "فاصله مجاز نیست" : true));
// <ViInput :rules="['required', 'noSpaces']" />
```

تابع `(value, { label, values(), submitted })` می‌گیرد. `values()` فیلدهای دیگر `ViForm` را با `name` می‌دهد. قاعده‌ای که خطا پرتاب کند به‌جای خراب کردن صفحه، پیام خطایش را نشان می‌دهد. اگر قاعده‌ی `{ validate }` باید روی مقدار خالی هم اجرا شود `skipEmpty: false` بگذار.

## ViForm

```vue
<ViForm validate-on="submit" :errors="errors" :submitting="busy" @submit="send">
  <ViInput v-model="f.name" name="name" label="نام" :rules="['required']" />
  <ViInput v-model="f.email" name="email" label="ایمیل" :rules="['required', 'email']" />
  <ViInput v-model="f.pass" name="pass" label="رمز" type="password" :rules="['required', { minLength: 8 }]" />
  <ViInput v-model="f.pass2" name="pass2" label="تکرار رمز" type="password" :rules="{ equals: 'pass' }" />
  <ViCheckbox v-model="f.terms" name="terms" label="می‌پذیرم" :rules="{ required: true }" />
  <button type="submit">ثبت‌نام</button>
</ViForm>
```

<div class="demo">
  <ViForm validate-on="submit" :errors="errors" :submitting="submitting" @submit="send" v-slot="s">
    <ViInput v-model="f.name" name="name" label="نام" :rules="['required']" />
    <ViInput v-model="f.email" name="email" label="ایمیل (taken@x.com را امتحان کن)" :rules="['required', 'email']" />
    <ViInput v-model="f.pass" name="pass" label="رمز" type="password" :rules="['required', { minLength: 8 }]" />
    <ViInput v-model="f.pass2" name="pass2" label="تکرار رمز" type="password" :rules="{ equals: 'pass' }" />
    <ViCheckbox v-model="f.terms" name="terms" label="قوانین را می‌پذیرم" :rules="{ required: true }" />
    <button type="submit" class="vi-btn vi-btn--primary" style="max-width: 180px" :disabled="submitting">{{ submitting ? "در حال ارسال…" : "ثبت‌نام" }}</button>
    <div dir="ltr" style="font-size: 12px; color: var(--vp-c-text-2)">{{ sent }}</div>
  </ViForm>
</div>

- **`validate-on`**: پیش‌فرض فیلدهای فرم (`"blur"` یا `"submit"`). با `"submit"` تا ارسال چیزی نمایش داده نمی‌شود و بعد از آن فیلدها زنده بررسی می‌کنند. `validate-on` خود فیلد برنده است.
- **ارسال** همه‌ی فیلدها را یک‌جا بررسی می‌کند (قاعده‌های async هم)، همه‌ی خطاها را نشان می‌دهد، **اولین فیلد نامعتبر را فوکوس می‌دهد** (`focus-first`، پیش‌فرض روشن) و `submit` را emit نمی‌کند. وقتی همه درست بود `@submit` مقدار `values` را می‌دهد: `v-model` هر فیلدی که `name` دارد.
- **`errors`**: خطای سرور خودت بر اساس `name` فیلد، رشته یا آرایه‌ی لاراول (`{ email: ["..."] }`). مثل هر خطای دیگر روی فیلد می‌آید و وقتی پاکش کنی می‌رود. خطای سرور جلوی `status` و `message` خود تو را نمی‌گیرد.
- **`submitting`**: همه‌ی فیلدها را غیرفعال می‌کند و تا پایان درخواست ارسال دوم را نادیده می‌گیرد.
- **`@invalid`** نام فیلدهای نامعتبر را می‌دهد. `novalidate` روشن است، پس حباب‌های خود مرورگر هیچ‌وقت نمی‌آیند.
- propهای اسلات: `submitted`، `valid`، `validating`، `submit()`، `reset()`، `values`. expose: `validate()`، `reset()`، `values()`، `valid`، `submitted`.
- فیلدی که از صفحه برداشته شود (`v-if`) دیگر بررسی نمی‌شود.

## prop‌ها

| | |
|---|---|
| `rules` | آرایه یا آبجکت، بالا را ببین |
| `messages` | `{ ruleName: "متن با {جاینگهدار}" }` |
| `validate-on` | `"blur"` (پیش‌فرض) `"change"` `"input"` `"submit"` |

روی `ViForm`: `validate-on`، `errors`، `submitting`، `disabled`، `focus-first`، `novalidate`.

exportها: `defineRule`، `isNationalId`، `isIranMobile`، `isCardNumber`، `isUrl`، `isEmpty`، `compileRules`، `runRules`، `useValidation` (برای ساخت اینپوت خودت)، `ruleMessages`.

سمت سرور هم اعتبارسنجی کن: قاعده‌های کلاینت برای راحتی کاربرند، نه برای امنیت.
