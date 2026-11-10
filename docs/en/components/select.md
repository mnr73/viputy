# ViSelect

Single and multiple select with search, groups, full keyboard support and a bottom sheet on phones.

<script setup>
import { ref } from "vue";
const one = ref("vue");
const lang = ref(null);
const cities = ref([1, 4]);
const city2 = ref([]);
const user = ref({ id: 1, name: "Milad Nazari", mail: "milad@shiva.dev" });
const frameworks = [
  { value: "vue", label: "Vue", description: "Progressive" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid", disabled: true }
];
const langs = ["Persian", "English", "Arabic", "Turkish", "Kurdish", "German", "French", "Spanish", "Italian"];
const groups = [
  { label: "Tehran province", options: [{ label: "Tehran", value: 1 }, { label: "Rey", value: 2 }, { label: "Shemiran", value: 3, disabled: true }] },
  { label: "Fars province", options: [{ label: "Shiraz", value: 4 }, { label: "Marvdasht", value: 5 }] },
  { label: "Gilan province", options: [{ label: "Rasht", value: 6 }] }
];
const users = [
  { id: 1, name: "Milad Nazari", mail: "milad@shiva.dev" },
  { id: 2, name: "Sara Ahmadi", mail: "sara@shiva.dev" },
  { id: 3, name: "Reza Karimi", mail: "reza@shiva.dev" }
];
</script>

<div class="demo">
  <ViSelect v-model="one" label="Framework" :options="frameworks" clearable />
  <ViSelect v-model="lang" label="Language (searchable)" :options="langs" placeholder="Select…" />
  <ViSelect v-model="cities" label="Cities (grouped)" :options="groups" multiple />
  <ViSelect v-model="city2" label="Cities (count only)" :options="groups" multiple display="count" placeholder="Select…" />
  <ViSelect v-model="user" label="Assignee (custom slots)" :options="users" option-label="name" by="id">
    <template #value="{ option }">
      <span style="display:flex;align-items:center;gap:8px"><b style="display:inline-grid;place-items:center;width:26px;height:26px;border-radius:99px;background:var(--vi-accent);color:var(--vi-accent-fg);font-size:11px">{{ option.label[0] }}</b>{{ option.label }}</span>
    </template>
    <template #option="{ option }">
      <b style="display:inline-grid;place-items:center;width:30px;height:30px;border-radius:99px;background:var(--vi-accent-soft);color:var(--vi-accent-soft-fg);font-size:12px">{{ option.label[0] }}</b>
      <span style="display:flex;flex-direction:column;line-height:1.3"><span>{{ option.label }}</span><small dir="ltr" style="color:var(--vi-muted)">{{ option.raw.mail }}</small></span>
    </template>
  </ViSelect>
  <ViSelect label="Disabled" :options="langs" disabled model-value="Persian" />
</div>

```vue
<ViSelect v-model="one" label="Framework" :options="frameworks" clearable />

<!-- multiple with groups: clicking a group header selects the whole group -->
<ViSelect v-model="cities" :options="groups" multiple />

<!-- objects as values -->
<ViSelect v-model="user" :options="users" option-label="name" by="id" />
```

## Options

`options` is an array of strings, objects or **groups**:

```ts
["Persian", "English"]
[{ value: "vue", label: "Vue", description: "…", disabled: true }]
[{ label: "Tehran province", options: [{ label: "Tehran", value: 1 }] }]
```

Key names are configurable: `option-label`, `option-value`, `option-disabled`, `option-description`, `option-group` (a key or a function). An object option without a `value` is its own value. With `by="id"` objects are compared by key, not by reference.

## Groups

In `multiple` mode every group header is a checkbox: click = select every enabled option of the group, click again = clear them. A partial selection shows the indeterminate state (`−`). Disabled options are never selected. In single mode the header is just a label. Search also matches the group name: when it matches, all of the group's options stay.

## Search

On by default with more than 7 options (`searchable` to force). Search treats Arabic/Persian letters, digits and ZWNJ as equal. For server-side search set `:filter="false"`, listen to `@search` and replace `options` (`loading` shows a loading message).

## Keyboard

`↑ ↓ Home End` move, `Enter` or `Space` selects, `Esc` closes, `Backspace` removes the last chip (multiple). `Tab` closes the panel.

## Mobile

On narrow screens (default ≤ 640px) the panel opens as a bottom sheet (`mobile="sheet"`) with "Clear" and "Confirm (n)" buttons. `mobile="fullscreen"` is full screen and `:mobile="false"` keeps the popover.

## Props

| Prop | Notes |
|---|---|
| `modelValue` | single: one value or `null`. multiple: an array |
| `options` | strings, objects or groups |
| `multiple` | |
| `placeholder` | |
| `searchable` / `search-placeholder` | |
| `filter` | `false` or a function `(option, query) => boolean` |
| `clearable` | |
| `by` | key or function to compare objects |
| `option-label` `option-value` `option-disabled` `option-description` `option-group` | |
| `display` | `chips` or `count` (multiple) |
| `max-chips` | the rest collapse into `+n` |
| `actions` | "Select all / Clear" row |
| `loading` | |
| `name` | hidden inputs for a native `<form>` (`name[]` when multiple) |
| `mobile` | `sheet` / `fullscreen` / `false` |
| `close-on-select` | default: single only |
| shared props | `label`, `hint`, `message`, `status`, `required`, `disabled`, `readonly`, `bare`, `id`, `ui` |

Slots: `value` (field text or each chip), `option`, `empty`, `before`, `label`, `meta`. Events: `search`, `open`, `close`. Expose: `focus()`, `open()`, `close()`.
