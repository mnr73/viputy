# ViTag

Multi-value input. `Enter` or `,` / `،` adds a tag, `Backspace` removes the last, and pasting `a, b، c` adds them all at once. Duplicates are rejected (Persian-normalized, so ي/ی match).

<script setup>
import { ref } from "vue";
const tags = ref(["design", "Vue"]);
const skills = ref(["TypeScript", "Vue", "CSS", "Testing", "UI"]);
const to = ref(["a@x.com", "b@x.com", "c@x.com"]);
const only = ref([]);
</script>

<div class="demo">
  <ViTag v-model="tags" label="Tags" :max="5" :suggestions="['forms', 'frontend', 'Vue', 'a11y']" placeholder="Type and press Enter" hint="Enter or comma to add" />
  <ViTag v-model="skills" label="Skills" :max="5" />
  <ViTag v-model="to" label="Recipients" hide-tags placeholder="Recipient email…" />
  <ViTag v-model="only" label="From the list only" :allow-custom="false" :suggestions="['Vue', 'React', 'Svelte']" />
</div>

```vue
<ViTag v-model="tags" :max="5" :suggestions="['forms', 'Vue']" />
<ViTag v-model="skills" hide-tags />
<ViTag v-model="only" :allow-custom="false" :suggestions="['Vue', 'React']" />
```

| Prop | Notes |
|---|---|
| `modelValue` | `string[]` |
| `suggestions` | offered while typing; ↑↓ and Enter |
| `max` | max count + counter |
| `allow-custom` | accept values outside `suggestions` (default `true`) |
| `allow-duplicates` | |
| `separators` | characters that commit a tag (default `,` and `،`) |
| `hide-tags` | show only a count; clicking it opens the list so items can be reviewed and removed |
| shared props | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

Slot `tag` (`tag`, `remove`) customises the chip. Events: `add`, `remove`.
