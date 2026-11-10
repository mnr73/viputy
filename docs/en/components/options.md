# useOptions and ViOptionList

The two pieces `ViSelect` is made of. Use them to build a select, an autocomplete or any custom picker.

- `useOptions` normalizes strings, objects and groups and filters them by `query` (Persian-normalized).
- `ViOptionList` renders the rows: group headers, checkboxes, indeterminate state, match highlight and `aria-activedescendant`.
- `useListNav` gives the keyboard, `ViPopup` the panel.

Example: an email picker with live search.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ViField, ViOptionList, ViPopup, useListNav, useOptions } from "@mnr73/viputy";

const model = defineModel<string>();
const open = ref(false);
const query = ref("");
const { rows } = useOptions({
  options: ["ali@a.com", "sara@b.com", "reza@c.com"],
  query
});
const nav = useListNav({
  count: () => rows.value.length,
  onSelect: (i) => {
    const r = rows.value[i];
    if (r?.kind === "option") pick(r.option.value as string);
  }
});
function pick(v: string) {
  model.value = v;
  open.value = false;
}
</script>

<template>
  <ViField label="Email" :active="open">
    <input v-model="query" class="vi-native" @focus="open = true" @keydown="nav.onKeydown" />
    <ViPopup v-model="open" :close-on-outside="false">
      <ViOptionList
        id="mails"
        :rows="rows"
        :active="nav.active.value"
        :query="query"
        :is-selected="(o) => o.value === model"
        :group-state-of="() => 'none'"
        @pick="(o) => pick(o.value as string)"
      />
    </ViPopup>
  </ViField>
</template>
```

## useOptions(input)

| Input | Notes |
|---|---|
| `options` | array (ref or getter) |
| `accessors` | `{ label, value, disabled, description, group }` |
| `query` | search text |
| `filter` | `false` or a function `(option, query) => boolean` |

Returns: `groups`, `all`, `visible`, `rows`, `visibleOptions`, `groupState`.

## ViOptionList

Props: `rows`, `active`, `is-selected`, `group-state-of`, `multiple`, `query`, `id`, `label`. Events: `pick`, `pick-group`, `hover`. Slots: `option`, `group`.
