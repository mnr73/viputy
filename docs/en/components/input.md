# ViInput

Single-line input for text, email, password and **numbers**. Numbers accept Persian digits, show thousands separators, and the `v-model` is always a real `number`.

<script setup>
import { ref } from "vue";
const name = ref("");
const price = ref(2450000);
const pass = ref("");
const email = ref("milad@");
</script>

<div class="demo">
  <ViInput v-model="name" label="Full name" placeholder="Enter your name" clearable hint="The clear button shows on hover and focus" />
  <ViInput v-model="price" type="number" grouped label="Price" suffix="USD" :min="0" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ price }} ({{ typeof price }})</div>
  <ViInput v-model="pass" type="password" label="Password" />
  <ViInput v-model="email" type="email" label="Email" status="error" message="Not a valid email" />
  <ViInput label="National ID" disabled model-value="0012345678" />
</div>

```vue
<ViInput v-model="name" label="Name" clearable />
<ViInput v-model="price" type="number" grouped suffix="USD" :min="0" />
<ViInput v-model="pass" type="password" label="Password" />
```

## Behaviour

- Typed Arabic «ي»/«ك» become Persian «ی»/«ک» (`fix-letters`, on by default).
- `type="number"`: Persian/Arabic digits and `٬` `،` `٫` are accepted; letters are rejected. `min`/`max` apply on blur. With `min >= 0` a minus sign is not allowed. Empty gives `null`. The caret keeps its place when a separator is inserted.
- Email, URL, phone, password and number inputs are `ltr` by default.
- Any other attribute (`name`, `autocomplete` ...) goes to the `<input>`; `class` and `style` go to the root.

## Props

| Prop | Notes |
|---|---|
| `modelValue` | `string \| number \| null` |
| `type` | `text`, `password`, `email`, `tel`, `url`, `search`, `number` |
| `placeholder` | |
| `clearable` | clear button |
| `prefix` / `suffix` | static text before/after the value |
| `decimals` | max fraction digits (`0` = integers) |
| `min` / `max` | `number` only |
| `grouped` | thousands separators |
| `persian-digits` | show Persian digits |
| `fix-letters` | convert Arabic ي/ك (default `true`) |
| `suggestions` | value suggestions (datalist) |
| `dir` | `ltr` / `rtl` / `auto` |
| shared props | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

Slots: `before`, `after`, `label`, `meta`. Expose: `focus()`, `blur()`, `el`.
