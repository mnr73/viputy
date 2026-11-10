# ViText

Textarea with a character counter. `maxlength` is a **soft** limit: the user can go past it, but the counter and field turn red with an "n characters over the limit" message. Add `strict` to make it a hard limit.

<script setup>
import { ref } from "vue";
const a = ref("The sign-up form should be quick and simple; ask optional fields in the next step.");
const b = ref("Hi, my order with tracking number 14050819 has not shipped yet and the panel still says preparing.");
</script>

<div class="demo">
  <ViText v-model="a" label="Description" :rows="4" :maxlength="200" />
  <ViText v-model="b" label="Message to support" :rows="3" :maxlength="60" />
  <ViText label="Auto-grow" autosize :rows="2" placeholder="Type to grow…" />
</div>

```vue
<ViText v-model="text" label="Description" :rows="4" :maxlength="200" />
<ViText v-model="text" autosize />
```

| Prop | Notes |
|---|---|
| `modelValue` | `string` |
| `rows` | default 3 |
| `maxlength` | soft limit + counter |
| `strict` | also blocks typing past `maxlength` |
| `counter` | show the counter (default: when `maxlength` is set) |
| `autosize` | grow with content (`field-sizing: content`) |
| `resize` | `vertical` / `none` |
| `fix-letters` | convert Arabic ي/ك |
| shared props | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

Counter digits are Persian under the `fa` locale.
