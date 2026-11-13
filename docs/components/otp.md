# ViOtp

کد یک‌بارمصرف (پیامک، ایمیل، احراز دوعاملی): به تعداد نویسه‌ها یک مربع کوچک. با تایپ یک رقم به مربع بعدی می‌رود، با Backspace به قبلی برمی‌گردد و می‌شود کل کد را چسباند. روی `ViField` ساخته شده، پس `label`، `hint`، `status`، `rules` و `ViForm` همان‌طور کار می‌کنند.

<script setup>
import { ref } from "vue";
const a = ref("");
const b = ref("");
const c = ref("");
const d = ref("");
const done = ref("");
const sent = ref("");
const code = ref("");
const busy = ref(false);
const wrong = ref("");
async function verify(v) {
  busy.value = true; wrong.value = "";
  await new Promise((r) => setTimeout(r, 700));
  busy.value = false;
  if (v.code === "123456") sent.value = "کد درست بود"; else { wrong.value = "کد اشتباه است"; code.value = ""; }
}
</script>

<div class="demo">
  <ViOtp v-model="a" label="کد تایید" hint="کد ۶ رقمی پیامک‌شده" @complete="done = $event" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: "{{ a }}" · complete: {{ done || "-" }}</div>
  <ViOtp v-model="b" label="۴ رقم، با خط تیره" :length="4" />
  <ViOtp v-model="c" label="حروف و عدد، با نقطه" :length="6" type="alphanumeric" mask :group="3" />
  <ViOtp v-model="d" label="خطا و غیرفعال" :length="4" status="error" message="کد اشتباه است" />
  <ViOtp model-value="1234" label="غیرفعال" :length="4" disabled />
</div>

```vue
<ViOtp v-model="code" label="کد تایید" :length="6" @complete="verify" />
```

## ارسال خودکار یا دستی

| | |
|---|---|
| `@complete` | وقتی مربع آخر پر شد صدا زده می‌شود (مقدار کد را می‌دهد). برای هر حالتی کار می‌کند: خودت درخواست را بفرست |
| `auto-submit` | داخل `ViForm` (یا `<form>`) به‌محض پر شدن مربع آخر فرم را ارسال می‌کند. قاعده‌های فرم قبل از `@submit` بررسی می‌شوند |
| هیچ‌کدام | کاربر دکمه‌ی خودت را می‌زند (یا Enter روی مربع آخر) |

`complete` فقط یک‌بار برای هر کد کامل صدا زده می‌شود. اگر کاربر یک رقم را پاک کند و دوباره بنویسد، دوباره صدا زده می‌شود.

<div class="demo">
  <ViForm :submitting="busy" @submit="verify">
    <ViOtp v-model="code" name="code" label="کد را بزنید (123456 درست است)" :message="wrong || undefined" :status="wrong ? 'error' : undefined" auto-submit :rules="['required', { length: 6 }]" />
    <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">{{ busy ? "در حال بررسی…" : sent }}</div>
  </ViForm>
</div>

```vue
<ViForm :submitting="busy" @submit="verify">
  <ViOtp v-model="code" name="code" label="کد تایید" auto-submit :rules="['required', { length: 6 }]" />
</ViForm>
```

## رفتار

- **تایپ**: رقم در مربع می‌نشیند و فوکوس به مربع بعدی می‌رود. نویسه‌ی غیرمجاز (حرف در `type="number"`) پذیرفته نمی‌شود. رقم فارسی و عربی به ASCII تبدیل می‌شود و در زبان فارسی با رقم فارسی نشان داده می‌شود ولی `v-model` همیشه ASCII است.
- **Backspace**: مربع پر را خالی می‌کند. روی مربع خالی به مربع قبلی می‌رود و آن را پاک می‌کند. بقیه‌ی مربع‌ها به چپ جابه‌جا می‌شوند تا کد هیچ‌وقت سوراخ نداشته باشد.
- **چسباندن**: هر متنی که شامل کد باشد (`۱۲۳-۴۵۶`، با فاصله‌ی اطراف) تمیز می‌شود و همه‌ی مربع‌ها را پر می‌کند. تکمیل خودکار پیامک (`autocomplete="one-time-code"` روی مربع اول) هم کار می‌کند.
- **جهت‌ها**: مربع‌ها همیشه چپ‌به‌راست چیده می‌شوند (کد مثل عدد خوانده می‌شود). فلش چپ و راست طبق صفحه حرکت می‌کنند. `Home` و `End` به اولین مربع و اولین مربع خالی می‌روند.
- **سوراخ نمی‌ماند**: اگر کاربر روی مربع پنجم بزند و چهارم خالی باشد، فوکوس به اولین مربع خالی می‌رود.
- **موبایل**: `inputmode="numeric"` صفحه‌کلید عددی را باز می‌کند.

## prop‌ها

| prop | پیش‌فرض | معنی |
|---|---|---|
| `modelValue` | `""` | رشته‌ی کد. تا پر شدن همه‌ی مربع‌ها کوتاه‌تر از `length` است |
| `length` | `6` | تعداد مربع‌ها |
| `type` | `"number"` | `"number"` فقط رقم، `"alphanumeric"` رقم و حرف لاتین، `"text"` هر نویسه |
| `mask` | `false` | به‌جای نویسه نقطه نشان بده |
| `group` | | بعد از هر N مربع یک خط تیره (`3` می‌شود `۱۲۳–۴۵۶`) |
| `auto-submit` | `false` | بعد از پر شدن، فرم را ارسال کن |
| `autofocus` | `false` | مربع اول فوکوس بگیرد |
| `persian-digits` | زبان فارسی | رقم فارسی نشان بده (مقدار ASCII می‌ماند) |
| `name` | | یک `<input type="hidden">` برای فرم معمولی و نام فیلد در `ViForm` |
| `label` `hint` `message` `status` `required` `disabled` `readonly` `ui` `rules` `messages` `validate-on` | | مثل بقیه‌ی اینپوت‌ها |

رویدادها: `update:modelValue`، `complete(value)`. متدهای expose: `focus()`، `clear()`.

اندازه با توکن‌های `--vi-otp-size` (عرض مربع، پیش‌فرض `46px`) و `--vi-otp-height` تنظیم می‌شود.
