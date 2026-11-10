# ViCheckbox · ViRadio · ViSwitch

<script setup>
import { ref } from "vue";
const perms = ref(["read"]);
const all = ref(false);
const ship = ref("post");
const plan = ref("pro");
const notify = ref(true);
const busy = ref(false);
const saving = ref(false);
async function save(v) {
  saving.value = true;
  await new Promise((r) => setTimeout(r, 1200));
  busy.value = v;
  saving.value = false;
}
</script>

<div class="demo">
  <div class="vi-group" role="group" aria-label="دسترسی‌ها">
    <ViCheckbox v-model="perms" value="read" label="خواندن" description="مشاهده‌ی محتوا" />
    <ViCheckbox v-model="perms" value="write" label="نوشتن" />
    <ViCheckbox v-model="perms" value="admin" label="مدیریت" disabled />
  </div>
  <ViRadioGroup v-model="ship" label="نوع ارسال" :options="[
    { value: 'post', label: 'پست پیشتاز', description: '۳ تا ۵ روز کاری' },
    { value: 'express', label: 'پیک', description: 'همان روز' },
    { value: 'pickup', label: 'تحویل حضوری' }
  ]" />
  <ViRadioGroup v-model="plan" card :options="[
    { value: 'free', label: 'رایگان', description: 'برای شروع' },
    { value: 'pro', label: 'Pro', description: 'برای تیم‌های کوچک' },
    { value: 'team', label: 'Team', description: 'نامحدود' }
  ]" />
  <ViSwitch v-model="notify" label="اعلان‌ها" description="ارسال ایمیل برای هر رویداد" />
</div>

```vue
<div class="vi-group" role="group" aria-label="دسترسی‌ها">
  <ViCheckbox v-model="perms" value="read" label="خواندن" description="مشاهده‌ی محتوا" />
  <ViCheckbox v-model="perms" value="write" label="نوشتن" />
  <ViCheckbox v-model="perms" value="admin" label="مدیریت" disabled />
</div>

<!-- حالت «بعضی انتخاب شده» -->
<ViCheckbox v-model="all" label="همه" :indeterminate="some" />

<ViRadioGroup v-model="ship" label="نوع ارسال" :options="options" />
<ViRadioGroup v-model="plan" card :options="plans" />

<ViSwitch v-model="notify" label="اعلان‌ها" />
```

## ViCheckbox

برای چند چک‌باکس کنار هم، آن‌ها را در `<div class="vi-group" role="group" aria-label="…">` بگذار تا فاصله و دسترس‌پذیری درست باشد.

`v-model` مثل چک‌باکس native است: `boolean` یا (با `value`) آرایه، یا با `true-value` / `false-value` مقدار دلخواه. `indeterminate` حالت «بعضی انتخاب شده» را نشان می‌دهد و کنترلش با توست.

Props: `label`، `description`، `value`، `true-value`، `false-value`، `indeterminate`، `disabled`، `status`، `name`. Slotها: `default`، `description`.

## ViRadioGroup / ViRadio

گروه `v-model` و `name` را به رادیوها می‌دهد. با `options` یا با slot و `ViRadio` ساخته می‌شود. `card` ظاهر کارتی و شبکه‌ای می‌دهد و `inline` در یک ردیف می‌چیند. گروه یک `fieldset` با `legend` است و با کیبورد (↑↓) کار می‌کند.

Props گروه: `options` (`{ value, label, description?, disabled? }`)، `label`، `hint`، `message`، `status`، `card`، `inline`، `disabled`، `name`.

## ViSwitch

چک‌باکس با `role="switch"`. Props: `label`، `description`، `true-value`، `false-value`، `disabled`، `name`. در RTL و LTR جهت حرکت دستگیره درست است.

## حالت loading

`loading` روی `ViCheckbox`، `ViRadio` / `ViRadioGroup` و `ViSwitch` قرار می‌گیرد. در این حالت جای تیک یک اسپینر می‌آید و تا پایان کار تغییر ممکن نیست. برای ذخیره‌ی فوری روی سرور مناسب است.

<div class="demo">
  <ViCheckbox :model-value="busy" :loading="saving" label="ذخیره‌ی خودکار" @update:model-value="save" />
  <ViSwitch :model-value="busy" :loading="saving" label="اعلان‌ها" @update:model-value="save" />
  <ViRadioGroup v-model="ship" loading inline :options="[{ value: 'post', label: 'پست' }, { value: 'tipax', label: 'تیپاکس' }]" />
</div>

```vue
<ViCheckbox :model-value="busy" :loading="saving" label="ذخیره‌ی خودکار"
  @update:model-value="save" />
<ViSwitch :model-value="busy" :loading="saving" label="اعلان‌ها" @update:model-value="save" />
<!-- روی گروه: همه‌ی گزینه‌ها -->
<ViRadioGroup v-model="ship" loading :options="options" />
```
