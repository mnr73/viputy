# Building a custom input

Three layers. Use the lowest one that does the job.

1. **Native control inside `ViField`** (text-like): `ViField` + `useField()` + class `vi-native`.
2. **Popup input** (picker, list, colour...): `ViField` + `ViPopup` (+ `ViOptionList`/`useOptions` for lists).
3. **Only the panel**: `ViPopup` with `#trigger`.

Never copy the CSS of a built-in input; reuse the classes (`vi-field__control`, `vi-native`, `vi-option`, `vi-chip`, `vi-btn`) and tokens so theming and dark mode keep working.

## 1) Native control

```vue
<script setup lang="ts">
import { ViField, useField } from "@mnr73/viputy";
const model = defineModel<string>();
const { attrs } = useField();   // NOTE: call it INSIDE the ViField's slot content component (see below)
</script>
```
`useField` reads the surrounding `ViField`, so it must run in a component rendered inside it. Simplest: a wrapper component.

```vue
<!-- MyMoney.vue -->
<script setup lang="ts">
import { ViField } from "@mnr73/viputy";
import MoneyNative from "./MoneyNative.vue";
const model = defineModel<number | null>();
</script>
<template><ViField label="Amount"><MoneyNative v-model="model" /></ViField></template>

<!-- MoneyNative.vue -->
<script setup lang="ts">
import { useField } from "@mnr73/viputy";
const model = defineModel<number | null>();
const { attrs } = useField();            // id, disabled, readonly, required, aria-invalid, aria-describedby
</script>
<template><input v-bind="attrs" v-model.number="model" class="vi-native" inputmode="decimal" /></template>
```
`ViField` slots: `before`, default (`{ id }`), `after`, `label`, `meta`. `:active="open"` forces the focused look for popup inputs. Frame clicks are exposed as `@control-click`: focus your control there so the whole frame is clickable.

## 2) Popup input (colour picker example)

```vue
<script setup lang="ts">
import { computed, ref } from "vue";
import { ViField, ViPopup } from "@mnr73/viputy";
const color = defineModel<string>();
const open = ref(false);
const field = ref();
const anchor = computed(() => field.value?.control ?? null);   // position against the frame, not the button
const colors = ["#2563eb", "#15803d", "#c62828"];
</script>

<template>
  <ViField ref="field" label="Colour" :active="open" @control-click="open = !open">
    <button type="button" class="vi-native" @click.stop="open = !open">
      <span class="swatch" :style="{ background: color }" />
    </button>
  </ViField>
  <ViPopup v-model="open" :anchor="anchor" mobile="sheet" title="Colour">
    <div class="vi-options">
      <button v-for="c in colors" :key="c" class="vi-option" type="button" @click="color = c; open = false">{{ c }}</button>
    </div>
  </ViPopup>
</template>
```
Rules: open on click (never on focus, see SKILL rule 6); `ViPopup` positions against `:anchor`; it closes on outside click and Escape; pass `:match-width` for list-like panels; use the `#footer` slot for sheet actions so they stay pinned on mobile; `mobile="fullscreen"` for big editors.

## 3) A select-like list

```ts
import { useOptions, useListNav, ViOptionList } from "@mnr73/viputy";
const query = ref("");
const { rows, groupState } = useOptions({ options, accessors: { label: "name", value: "id" }, query });
const nav = useListNav({ count: () => rows.value.length, onSelect: (i) => pick(rows.value[i]) });
```
`<ViOptionList :rows="rows" :active="nav.active.value" :is-selected="..." :group-state-of="..." :id="listId" @pick="..." @hover="nav.active.value = $event" />`. Bind `nav.onKeydown(e)` on the input's `keydown` (returns true when handled). `useOptions` also gives search that normalises Arabic/Persian letters.

## Checklist for a new input

- Uses `ViField` (label, hint, `message`, `status`, `disabled` come free) and accepts the shared props by forwarding `FieldProps` (`pickField(props)` helper pattern).
- `v-model` carries wire values only (ISO/number/array), never localised text.
- Keyboard: Enter/Space/ArrowDown open, Escape closes, ArrowUp/Down move, Enter picks.
- SSR-safe: no `window`/`document` at setup; measure after mount or on open.
- Works RTL and dark: only tokens and logical properties (`padding-inline-start`, `inset-inline-end`).
- Tested in a real browser with real clicks/keys (focus and caret bugs do not show in unit tests).
