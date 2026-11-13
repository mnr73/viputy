# ViColor

انتخابگر رنگ: یک مربع رنگ و کد HEX در فیلد، و در پنل یک شبکه‌ی رنگ آماده، جعبه‌ی HEX و دکمه‌ی رنگ دلخواه. روی `ViField` و `ViPopup` ساخته شده (طرح «رنگ برند» در برد اینپوت کاستوم)، پس `label`، `status`، `rules`، `ViForm` و شیت موبایل همان‌طور کار می‌کنند.

<script setup>
import { ref } from "vue";
const a = ref("#2563eb");
const b = ref(null);
const c = ref("#ef444480");
const d = ref("#16a34a");
const brand = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#7c3aed", "#0f172a"];
</script>

<div class="demo">
  <ViColor v-model="a" label="رنگ برند" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ a }}</div>
  <ViColor v-model="b" label="خالی، با دکمه‌ی پاک‌کردن" clearable :rules="['required']" />
  <ViColor v-model="c" label="با شفافیت" alpha />
  <ViColor v-model="d" label="فقط رنگ‌های برند" :swatches="brand" :custom="false" />
</div>

```vue
<ViColor v-model="color" label="رنگ برند" />
<ViColor v-model="color" alpha clearable />
<ViColor v-model="color" :swatches="['#2563eb', '#16a34a', '#dc2626']" :custom="false" />
```

## مقدار

`v-model` یک رشته‌ی HEX با حروف کوچک است: `#2563eb`. با `alpha` ممکن است دو رقم شفافیت هم داشته باشد (`#2563eb80`)؛ رنگ کاملاً مات همیشه ۶ رقمی می‌ماند. مقدار خالی `null` است. هر املایی پذیرفته می‌شود: `#FFF`، `2563EB`، رقم فارسی (`#۲۵۶۳eb`)؛ بعد از تایید به شکل استاندارد درمی‌آید.

## کار با پنل

- **شبکه**: با فلش‌ها حرکت می‌کنی (یکی یکی و ردیف به ردیف)، `Home` و `End` به اول و آخر. رنگ انتخاب‌شده تیک دارد (تیک روی رنگ روشن سیاه و روی رنگ تیره سفید است). روی دسکتاپ با باز شدن پنل فوکوس روی رنگ فعلی می‌نشیند.
- **HEX**: وقتی ۶ (یا ۸) رقم کامل شد زنده اعمال می‌شود. ناقص قرمز می‌شود و مقدار قبلی می‌ماند. Enter اعمال و پنل را می‌بندد.
- **رنگ دلخواه**: دکمه‌ی رنگین‌کمان، انتخابگر خود مرورگر را باز می‌کند (`custom` را `false` کنی برمی‌دارد).
- **تایپ در خود فیلد**: هم کار می‌کند؛ با Enter یا ترک فیلد اعمال می‌شود. `#f00` به `#ff0000` تبدیل می‌شود.
- **شفافیت** (`alpha`): یک اسلایدر. انتخاب یک رنگ آماده شفافیت فعلی را نگه می‌دارد.
- **موبایل**: شیت پایین با دکمه‌های پاک‌کردن و تایید (تایید سمت راست). کیبورد خودش باز نمی‌شود؛ روی جعبه‌ی HEX بزن.

## prop‌ها

| prop | پیش‌فرض | معنی |
|---|---|---|
| `modelValue` | | `#rrggbb` یا `#rrggbbaa` یا `null` |
| `swatches` | ۴۰ رنگ رایج | رنگ‌های شبکه (هر املای HEX) |
| `alpha` | `false` | اسلایدر شفافیت و مقدار ۸ رقمی |
| `custom` | `true` | دکمه‌ی انتخابگر رنگ مرورگر |
| `clearable` | `false` | دکمه‌ی پاک‌کردن |
| `placeholder` | `#RRGGBB` | |
| `mobile` | `"sheet"` | `"sheet"`، `"fullscreen"` یا `false` |
| `auto-scroll` | `true` | مثل ViSelect |
| `name` | | `<input type="hidden">` برای فرم معمولی |
| `label` `hint` `message` `status` `required` `disabled` `readonly` `ui` `rules` `messages` `validate-on` | | مثل بقیه‌ی اینپوت‌ها |

توابع کمکی: `normalizeHex(input, alpha?)`، `hexToRgb`، `rgbToHex`، `readableOn(hex)` (سیاه یا سفید برای متن روی رنگ)، `DEFAULT_SWATCHES`.
