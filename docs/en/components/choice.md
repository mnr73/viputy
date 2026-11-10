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
  <div class="vi-group" role="group" aria-label="Permissions">
    <ViCheckbox v-model="perms" value="read" label="Read" description="View content" />
    <ViCheckbox v-model="perms" value="write" label="Write" />
    <ViCheckbox v-model="perms" value="admin" label="Admin" disabled />
  </div>
  <ViRadioGroup v-model="ship" label="Shipping" :options="[
    { value: 'post', label: 'Standard post', description: '3 to 5 business days' },
    { value: 'express', label: 'Courier', description: 'Same day' },
    { value: 'pickup', label: 'Pick up' }
  ]" />
  <ViRadioGroup v-model="plan" card :options="[
    { value: 'free', label: 'Free', description: 'To get started' },
    { value: 'pro', label: 'Pro', description: 'For small teams' },
    { value: 'team', label: 'Team', description: 'Unlimited' }
  ]" />
  <ViSwitch v-model="notify" label="Notifications" description="Send an email for every event" />
</div>

```vue
<div class="vi-group" role="group" aria-label="Permissions">
  <ViCheckbox v-model="perms" value="read" label="Read" description="View content" />
  <ViCheckbox v-model="perms" value="write" label="Write" />
  <ViCheckbox v-model="perms" value="admin" label="Admin" disabled />
</div>

<!-- "some selected" state -->
<ViCheckbox v-model="all" label="All" :indeterminate="some" />

<ViRadioGroup v-model="ship" label="Shipping" :options="options" />
<ViRadioGroup v-model="plan" card :options="plans" />

<ViSwitch v-model="notify" label="Notifications" />
```

## ViCheckbox

Wrap several checkboxes in `<div class="vi-group" role="group" aria-label="…">` for correct spacing and a11y.

`v-model` works like a native checkbox: a `boolean`, an array (with `value`), or custom values via `true-value` / `false-value`. `indeterminate` shows the "some selected" state and is controlled by you.

Props: `label`, `description`, `value`, `true-value`, `false-value`, `indeterminate`, `disabled`, `status`, `name`. Slots: `default`, `description`.

## ViRadioGroup / ViRadio

The group hands `v-model` and `name` to its radios. Build it from `options` or from a slot of `ViRadio`. `card` gives boxed grid options and `inline` lays them in a row. It is a `fieldset` with a `legend` and arrow keys work natively.

Group props: `options` (`{ value, label, description?, disabled? }`), `label`, `hint`, `message`, `status`, `card`, `inline`, `disabled`, `name`.

## ViSwitch

A checkbox with `role="switch"`. Props: `label`, `description`, `true-value`, `false-value`, `disabled`, `name`. The thumb moves the right way in both RTL and LTR.

## Loading state

`loading` works on `ViCheckbox`, `ViRadio` / `ViRadioGroup` and `ViSwitch`. A spinner replaces the mark and changes are blocked until it clears. Use it for instant server-side saves.

<div class="demo">
  <ViCheckbox :model-value="busy" :loading="saving" label="Auto-save" @update:model-value="save" />
  <ViSwitch :model-value="busy" :loading="saving" label="Notifications" @update:model-value="save" />
  <ViRadioGroup v-model="ship" loading inline :options="[{ value: 'post', label: 'Post' }, { value: 'tipax', label: 'Courier' }]" />
</div>

```vue
<ViCheckbox :model-value="busy" :loading="saving" label="Auto-save"
  @update:model-value="save" />
<ViSwitch :model-value="busy" :loading="saving" label="Notifications" @update:model-value="save" />
<!-- on the group: every option -->
<ViRadioGroup v-model="ship" loading :options="options" />
```
