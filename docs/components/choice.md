# ViCheckbox · ViRadio · ViSwitch

<script setup>
import { ref } from "vue";
const perms = ref(["read"]);
const all = ref(false);
const ship = ref("post");
const plan = ref("pro");
const notify = ref(true);
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
