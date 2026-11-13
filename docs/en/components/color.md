# ViColor

A colour picker: a swatch and the HEX code in the field, and in the panel a grid of ready colours, a HEX box and a custom-colour button. Built on `ViField` and `ViPopup` (the "Brand colour" board of the custom-input design), so `label`, `status`, `rules`, `ViForm` and the phone sheet work as everywhere.

<script setup>
import { ref } from "vue";
const a = ref("#2563eb");
const b = ref(null);
const c = ref("#ef444480");
const d = ref("#16a34a");
const brand = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#7c3aed", "#0f172a"];
</script>

<div class="demo">
  <ViColor v-model="a" label="Brand colour" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: {{ a }}</div>
  <ViColor v-model="b" label="Empty, clearable, required" clearable :rules="['required']" />
  <ViColor v-model="c" label="With opacity" alpha />
  <ViColor v-model="d" label="Brand colours only" :swatches="brand" :custom="false" />
</div>

```vue
<ViColor v-model="color" label="Brand colour" />
<ViColor v-model="color" alpha clearable />
<ViColor v-model="color" :swatches="['#2563eb', '#16a34a', '#dc2626']" :custom="false" />
```

## Value

`v-model` is a lower-case HEX string: `#2563eb`. With `alpha` it may carry two opacity digits (`#2563eb80`); a fully opaque colour stays 6 digits. Empty is `null`. Any spelling is accepted: `#FFF`, `2563EB`, Persian digits (`#۲۵۶۳eb`); it is normalised once applied.

## Using the panel

- **Grid**: arrows move by one and by a row, `Home` and `End` jump to the first and last. The chosen colour has a check (black on a light colour, white on a dark one). On desktop focus lands on the current colour when the panel opens.
- **HEX**: applies live once 6 (or 8) digits are complete. An incomplete one turns red and the old value stays. Enter applies and closes.
- **Custom colour**: the rainbow button opens the browser's own picker (`custom` set to `false` removes it).
- **Typing in the field itself** works too; Enter or leaving the field applies it. `#f00` becomes `#ff0000`.
- **Opacity** (`alpha`): a slider. Picking a ready colour keeps the current opacity.
- **Phones**: a bottom sheet with Clear and Confirm (confirm on the right). The keyboard does not open by itself; tap the HEX box.

## Props

| prop | default | |
|---|---|---|
| `modelValue` | | `#rrggbb`, `#rrggbbaa` or `null` |
| `swatches` | 40 common colours | the colours of the grid (any HEX spelling) |
| `alpha` | `false` | opacity slider and 8-digit values |
| `custom` | `true` | the browser colour-picker button |
| `clearable` | `false` | clear button |
| `placeholder` | `#RRGGBB` | |
| `mobile` | `"sheet"` | `"sheet"`, `"fullscreen"` or `false` |
| `auto-scroll` | `true` | as on ViSelect |
| `name` | | a hidden `<input>` for a plain form |
| `label` `hint` `message` `status` `required` `disabled` `readonly` `ui` `rules` `messages` `validate-on` | | as on every input |

Helpers: `normalizeHex(input, alpha?)`, `hexToRgb`, `rgbToHex`, `readableOn(hex)` (black or white for text on a colour), `DEFAULT_SWATCHES`.
