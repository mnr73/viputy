# ViTag

ورودی چندمقداری. با `Enter` یا `،` / `,` تگ اضافه می‌شود، `Backspace` آخرین را برمی‌دارد و چسباندن متنی مثل `a, b، c` همه را یکجا اضافه می‌کند. تگ تکراری (با یکسان‌سازی ی/ک) رد می‌شود.

<script setup>
import { ref } from "vue";
const tags = ref(["طراحی", "Vue"]);
const skills = ref(["TypeScript", "Vue", "CSS", "تست", "UI"]);
const to = ref(["a@x.com", "b@x.com", "c@x.com"]);
const only = ref([]);
</script>

<div class="demo">
  <ViTag v-model="tags" label="برچسب‌ها" :max="5" :suggestions="['فرم', 'فرانت‌اند', 'Vue', 'دسترس‌پذیری']" placeholder="تایپ کن و Enter بزن" hint="Enter یا «،» برای افزودن" />
  <ViTag v-model="skills" label="مهارت‌ها" :max="5" />
  <ViTag v-model="to" label="گیرندگان" hide-tags placeholder="ایمیل گیرنده…" />
  <ViTag v-model="only" label="فقط از لیست" :allow-custom="false" :suggestions="['Vue', 'React', 'Svelte']" />
</div>

```vue
<ViTag v-model="tags" :max="5" :suggestions="['فرم', 'Vue']" />
<ViTag v-model="skills" hide-tags />
<ViTag v-model="only" :allow-custom="false" :suggestions="['Vue', 'React']" />
```

| Prop | توضیح |
|---|---|
| `modelValue` | `string[]` |
| `suggestions` | پیشنهادها هنگام تایپ؛ ↑↓ و Enter |
| `max` | حداکثر تعداد + شمارنده |
| `allow-custom` | پذیرش مقدار خارج از `suggestions` (پیش‌فرض `true`) |
| `allow-duplicates` | |
| `separators` | کاراکترهای افزودن (پیش‌فرض `,` و `،`) |
| `hide-tags` | فقط شمارش نمایش داده شود؛ با کلیک روی شمارنده فهرست موارد باز می‌شود و می‌توان هر مورد را حذف کرد |
| props مشترک | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

Slot `tag` (`tag`, `remove`) برای ظاهر دلخواه تگ. رویدادها: `add`، `remove`.
