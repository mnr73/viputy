# ViSelect

انتخابگر تک‌ و چندگانه با جستجو، گروه‌بندی، کیبورد کامل و bottom-sheet در موبایل.

<script setup>
import { ref } from "vue";
const one = ref("vue");
const lang = ref(null);
const cities = ref([1, 4]);
const city2 = ref([]);
const user = ref({ id: 1, name: "میلاد نظری", mail: "milad@shiva.dev" });
const frameworks = [
  { value: "vue", label: "Vue", description: "رویکرد پیش‌رونده" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid", disabled: true }
];
const langs = ["فارسی", "انگلیسی", "عربی", "ترکی", "کردی", "آلمانی", "فرانسوی", "اسپانیایی", "ایتالیایی"];
const groups = [
  { label: "استان تهران", options: [{ label: "تهران", value: 1 }, { label: "ری", value: 2 }, { label: "شمیرانات", value: 3, disabled: true }] },
  { label: "استان فارس", options: [{ label: "شیراز", value: 4 }, { label: "مرودشت", value: 5 }] },
  { label: "استان گیلان", options: [{ label: "رشت", value: 6 }] }
];
const users = [
  { id: 1, name: "میلاد نظری", mail: "milad@shiva.dev" },
  { id: 2, name: "سارا احمدی", mail: "sara@shiva.dev" },
  { id: 3, name: "رضا کریمی", mail: "reza@shiva.dev" }
];
</script>

<div class="demo">
  <ViSelect v-model="one" label="فریمورک" :options="frameworks" clearable />
  <ViSelect v-model="lang" label="زبان (قابل جستجو)" :options="langs" placeholder="انتخاب کنید" />
  <ViSelect v-model="cities" label="شهرها (گروه‌بندی)" :options="groups" multiple />
  <ViSelect v-model="city2" label="شهرها (فقط شمارش)" :options="groups" multiple display="count" placeholder="انتخاب کنید" />
  <ViSelect v-model="user" label="مسئول (slot دلخواه)" :options="users" option-label="name" by="id">
    <template #value="{ option }">
      <span style="display:flex;align-items:center;gap:8px"><b style="display:inline-grid;place-items:center;width:26px;height:26px;border-radius:99px;background:var(--vi-accent);color:var(--vi-accent-fg);font-size:11px">{{ option.label[0] }}</b>{{ option.label }}</span>
    </template>
    <template #option="{ option }">
      <b style="display:inline-grid;place-items:center;width:30px;height:30px;border-radius:99px;background:var(--vi-accent-soft);color:var(--vi-accent-soft-fg);font-size:12px">{{ option.label[0] }}</b>
      <span style="display:flex;flex-direction:column;line-height:1.3"><span>{{ option.label }}</span><small dir="ltr" style="color:var(--vi-muted)">{{ option.raw.mail }}</small></span>
    </template>
  </ViSelect>
  <ViSelect label="غیرفعال" :options="langs" disabled model-value="فارسی" />
</div>

```vue
<ViSelect v-model="one" label="فریمورک" :options="frameworks" clearable />

<!-- چندتایی با گروه: کلیک روی عنوان گروه، همه‌ی آن را انتخاب می‌کند -->
<ViSelect v-model="cities" :options="groups" multiple />

<!-- شیء به‌عنوان مقدار -->
<ViSelect v-model="user" :options="users" option-label="name" by="id" />
```

## گزینه‌ها

`options` می‌تواند آرایه‌ای از رشته، شیء یا **گروه** باشد:

```ts
["فارسی", "انگلیسی"]
[{ value: "vue", label: "Vue", description: "…", disabled: true }]
[{ label: "استان تهران", options: [{ label: "تهران", value: 1 }] }]
```

نام کلیدها قابل تغییر است: `option-label`، `option-value`، `option-disabled`، `option-description`، `option-group` (کلید یا تابع). اگر گزینه شیء باشد و `value` نداشته باشد، خود شیء مقدار است. با `by="id"` شیءها بر اساس کلید مقایسه می‌شوند، نه ارجاع.

## گروه‌ها

در حالت `multiple` هر عنوان گروه یک چک‌باکس دارد: کلیک = انتخاب همه‌ی گزینه‌های فعال آن گروه، کلیک دوباره = برداشتن. اگر بخشی انتخاب شده باشد حالت نیمه‌انتخاب (`−`) نمایش داده می‌شود. گزینه‌های غیرفعال هیچ‌وقت انتخاب نمی‌شوند. در حالت تکی عنوان گروه فقط یک برچسب است. جستجو روی نام گروه هم کار می‌کند: اگر نام گروه مطابقت کند همه‌ی گزینه‌هایش می‌ماند.

## جستجو

وقتی بیش از ۷ گزینه باشد خودکار فعال است (`searchable` برای اجبار). جستجو ی/ک عربی، ارقام فارسی و نیم‌فاصله را یکسان می‌کند. برای جستجوی سمت سرور `:filter="false"` بگذار، رویداد `@search` را بگیر و `options` را عوض کن (با `loading` پیام «در حال بارگذاری» نمایش داده می‌شود).

## کیبورد

`↑ ↓ Home End` حرکت، `Enter` یا `Space` انتخاب، `Esc` بستن، `Backspace` حذف آخرین چیپ (چندتایی). `Tab` پنل را می‌بندد.

## موبایل

در عرض کم (پیش‌فرض ≤ ۶۴۰px) پنل پایین صفحه باز می‌شود (`mobile="sheet"`)، با دکمه‌های «پاک کردن» و «تایید (n)». `mobile="fullscreen"` تمام‌صفحه و `:mobile="false"` همان popover است.

## Props

| Prop | توضیح |
|---|---|
| `modelValue` | تکی: یک مقدار یا `null`. چندتایی: آرایه |
| `options` | رشته، شیء یا گروه |
| `multiple` | |
| `placeholder` | |
| `searchable` / `search-placeholder` | |
| `filter` | `false` یا تابع `(option, query) => boolean` |
| `clearable` | |
| `by` | کلید یا تابع برای مقایسه‌ی شیءها |
| `option-label` `option-value` `option-disabled` `option-description` `option-group` | |
| `display` | `chips` یا `count` (چندتایی) |
| `max-chips` | بیشتر از آن به `+n` تبدیل می‌شود |
| `actions` | ردیف «انتخاب همه / پاک کردن» |
| `list-max-height` | ارتفاع فهرست گزینه‌ها در popover (عدد px یا طول CSS). فهرست درون خودش اسکرول می‌خورد و جستجو و فوتر ثابت می‌مانند. پیش‌فرض `320`؛ `none` برای حذف سقف |
| `loading` | |
| `name` | ورودی hidden برای `<form>` (در چندتایی `name[]`) |
| `mobile` | `sheet` / `fullscreen` / `false` |
| `close-on-select` | پیش‌فرض: فقط تکی |
| props مشترک | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

Slotها: `value` (متن فیلد یا هر چیپ)، `option`، `empty`، `before`، `label`، `meta`. رویدادها: `search`، `open`، `close`. Expose: `focus()`، `open()`، `close()`.
