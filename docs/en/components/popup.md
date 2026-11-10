# ViPopup

A floating panel (or a bottom sheet on phones) tied to a trigger. The base of select, calendar and QueryBuilder.

<script setup>
import { ref } from "vue";
const open = ref(false);
</script>

<div class="demo">
  <ViPopup v-model="open" title="Title">
    <template #trigger="{ toggle, attrs }">
      <button class="demo-btn" v-bind="attrs" @click="toggle">Open</button>
    </template>
    <div style="padding: 8px">Any content. Shrink the window to see the mobile mode.</div>
  </ViPopup>
</div>

```vue
<ViPopup v-model="open" title="Title" mobile="sheet">
  <template #trigger="{ toggle, attrs }">
    <button v-bind="attrs" @click="toggle">Open</button>
  </template>
  Content
</ViPopup>
```

## Behaviour

- **Vertical flip:** opens upward when there is no room below and more above. If neither fits, height is capped and it scrolls.
- **Horizontal clamp:** never leaves the viewport. `align="start"` hugs the trigger's right edge in RTL.
- **Mobile** (width ≤ `breakpoint`, default 640): `mobile="sheet"` bottom sheet, `"fullscreen"`, or `false` to keep the popover. Page scroll is locked and focus is trapped.
- `Esc` and outside click close it; focus returns to the previous element.
- The anchor defaults to the trigger. For inputs pass the `ViField` element as `anchor` and add `match-width` so the panel matches the field.
- The panel renders in `<body>` so no `overflow` can clip it.

## Props

| Prop | Default | Notes |
|---|---|---|
| `modelValue` | `false` | open state (`v-model`) |
| `anchor` | trigger | element to position against |
| `side` | `"bottom"` | `"bottom" \| "top"` |
| `align` | `"start"` | `"start" \| "center" \| "end"` |
| `offset` | `6` | gap from the anchor (px) |
| `matchWidth` | `false` | same width as the anchor |
| `mobile` | `"sheet"` | `"sheet" \| "fullscreen" \| false` |
| `breakpoint` | `640` | |
| `title` | | sheet header and `aria-label` |
| `closeOnOutside` | `true` | |
| `teleport` | `true` | |

Slots: `trigger` (`open`, `toggle`, `attrs`), `default` (`close`, `sheet`), `footer` (sheet only). Events: `open`, `close`.
