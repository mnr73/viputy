# ViTime

انتخاب ساعت: ۲۴ ساعته یا ۱۲ ساعته (ق.ظ/ب.ظ)، با ثانیه، گام دقیقه و حد `min`/`max`.

<script setup>
import { ref } from "vue";
const a = ref("09:45:30");
const b = ref("14:30");
const c = ref(null);
</script>

<div class="demo">
  <ViTime v-model="a" label="ساعت شروع (با ثانیه)" seconds />
  <ViTime v-model="b" label="یادآوری (۱۲ ساعته، گام ۵ دقیقه)" hour12 :minute-step="5" clearable />
  <ViTime v-model="c" label="ساعت کاری" min="08:00" max="18:00" hint="حداقل ۰۸:۰۰ · حداکثر ۱۸:۰۰" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ a }} · {{ b }} · {{ c }}</div>
</div>

```vue
<ViTime v-model="start" seconds />
<ViTime v-model="remind" hour12 :minute-step="5" />
<ViTime v-model="work" min="08:00" max="18:00" />
```

## مقدار

رشته‌ی `HH:mm` یا (با `seconds`) `HH:mm:ss`، همیشه **۲۴ ساعته و با ارقام لاتین** (مثل `"14:30"`)، حتی وقتی نمایش `۰۲:۳۰ ب.ظ` است. تایپ آزاد است: `۱۴:۳۰`، `2:30 pm`، `۰۲:۳۰ ب.ظ`، `14.30`. زمان ناموجود (`۲۵:۰۰`) یا خارج از بازه خطا نشان می‌دهد.

## Props

| Prop | توضیح |
|---|---|
| `modelValue` | `HH:mm[:ss]` یا `null` |
| `seconds` | ستون ثانیه |
| `hour12` | نمایش ۱۲ ساعته |
| `minute-step` | گام دقیقه (۱، ۵، ۱۰، ۱۵، ۳۰) |
| `min` / `max` | `HH:mm[:ss]`؛ ساعت‌های بیرون بازه غیرفعال می‌شوند |
| `clearable` / `mobile` / `name` | مثل ViDate |
| props مشترک | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

`ViTimePanel` همان ستون‌های ساعت و دقیقه است که می‌توانی در اینپوت کاستوم خودت بگذاری.
