# ViText

Textarea با شمارنده‌ی کاراکتر. `maxlength` یک حد **نرم** است: کاربر می‌تواند از آن رد شود ولی شمارنده و فیلد قرمز می‌شود و پیام «n کاراکتر بیشتر از حد مجاز» می‌آید. با `strict` حد سخت می‌شود.

<script setup>
import { ref } from "vue";
const a = ref("فرم ثبت‌نام باید ساده و سریع باشد؛ فیلدهای اختیاری را در مرحله‌ی بعد بپرسید.");
const b = ref("سلام، سفارش من با شماره‌ی پیگیری ۱۴۰۵۰۸۱۹ هنوز ارسال نشده و در پنل وضعیت «در حال آماده‌سازی» نشان داده می‌شود.");
</script>

<div class="demo">
  <ViText v-model="a" label="توضیحات" :rows="4" :maxlength="200" />
  <ViText v-model="b" label="پیام به پشتیبانی" :rows="3" :maxlength="60" />
  <ViText label="رشد خودکار" autosize :rows="2" placeholder="بنویس تا بزرگ شود…" />
</div>

```vue
<ViText v-model="text" label="توضیحات" :rows="4" :maxlength="200" />
<ViText v-model="text" autosize />
```

| Prop | توضیح |
|---|---|
| `modelValue` | `string` |
| `rows` | پیش‌فرض ۳ |
| `maxlength` | حد نرم + شمارنده |
| `strict` | جلوی تایپ بیشتر از `maxlength` را می‌گیرد |
| `counter` | نمایش شمارنده (پیش‌فرض: وقتی `maxlength` هست) |
| `autosize` | رشد با محتوا (`field-sizing: content`) |
| `resize` | `vertical` / `none` |
| `fix-letters` | تبدیل ي/ك عربی |
| props مشترک | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

ارقام شمارنده با locale فارسی، فارسی نمایش داده می‌شوند.
