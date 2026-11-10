# ViInput

اینپوت تک‌خطی برای متن، ایمیل، گذرواژه و **عدد**. عدد با ارقام فارسی هم تایپ می‌شود، جداکننده‌ی هزارگان دارد و مقدار `v-model` همیشه یک `number` واقعی است.

<script setup>
import { ref } from "vue";
const name = ref("");
const price = ref(2450000);
const pass = ref("");
const email = ref("milad@");
</script>

<div class="demo">
  <ViInput v-model="name" label="نام و نام خانوادگی" placeholder="نام را وارد کنید" clearable hint="دکمه‌ی پاک کردن فقط در hover و focus" />
  <ViInput v-model="price" type="number" grouped persian-digits label="قیمت" suffix="ریال" :min="0" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">مقدار در v-model: {{ price }} ({{ typeof price }})</div>
  <ViInput v-model="pass" type="password" label="گذرواژه" />
  <ViInput v-model="email" type="email" label="ایمیل" status="error" message="ایمیل معتبر نیست" />
  <ViInput label="کد ملی" disabled model-value="0012345678" />
</div>

```vue
<ViInput v-model="name" label="نام" clearable />
<ViInput v-model="price" type="number" grouped persian-digits suffix="ریال" :min="0" />
<ViInput v-model="pass" type="password" label="گذرواژه" />
```

## رفتار

- تایپ «ي» و «ك» عربی خودکار به «ی» و «ک» فارسی تبدیل می‌شود (`fix-letters`، پیش‌فرض روشن).
- `type="number"`: ارقام فارسی/عربی، `٬` `،` `٫` پذیرفته می‌شود. حروف رد می‌شوند. `min`/`max` هنگام blur اعمال می‌شود. اگر `min >= 0` علامت منفی مجاز نیست. اگر خالی باشد `null` برمی‌گردد. جایگاه caret هنگام اضافه شدن جداکننده حفظ می‌شود.
- ایمیل، URL، تلفن، گذرواژه و عدد به‌طور پیش‌فرض `ltr` هستند.
- هر attribute دیگر (`name`، `autocomplete` ...) به `<input>` می‌رسد؛ `class` و `style` به ریشه.

## Props

| Prop | توضیح |
|---|---|
| `modelValue` | `string \| number \| null` |
| `type` | `text`, `password`, `email`, `tel`, `url`, `search`, `number` |
| `placeholder` | |
| `clearable` | دکمه‌ی پاک کردن |
| `prefix` / `suffix` | متن ثابت قبل/بعد از مقدار |
| `decimals` | حداکثر رقم اعشار (`0` = فقط صحیح) |
| `min` / `max` | فقط `number` |
| `grouped` | جداکننده‌ی هزارگان |
| `persian-digits` | نمایش ارقام فارسی |
| `fix-letters` | تبدیل ي/ك عربی (پیش‌فرض `true`) |
| `suggestions` | پیشنهاد مقدار (datalist) |
| `dir` | `ltr` / `rtl` / `auto` |
| props مشترک | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

Slotها: `before`، `after`، `label`، `meta`. Expose: `focus()`، `blur()`، `el`.
