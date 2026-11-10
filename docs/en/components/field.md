# ViField

The shared frame for every input: label, frame, status, message and slots. Custom inputs are built on it too.

<div class="demo">
  <ViField label="Username" hint="Letters and digits only" required>
    <template #default="{ id }"><input :id="id" class="vi-native" placeholder="Enter a username" /></template>
  </ViField>
  <ViField label="Email" message="Not a valid email" status="error">
    <template #default="{ id }"><input :id="id" class="vi-native" value="milad@" dir="ltr" /></template>
  </ViField>
  <ViField label="National ID" disabled>
    <template #default="{ id }"><input :id="id" class="vi-native" disabled value="0012345678" /></template>
  </ViField>
</div>

```vue
<ViField label="Username" hint="Letters and digits only" required>
  <template #default="{ id }">
    <input :id="id" class="vi-native" />
  </template>
</ViField>

<ViField label="Email" message="Not a valid email" status="error">…</ViField>
```

## Props

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | label text |
| `hint` | `string` | helper text below the field |
| `message` | `string` | validation text; replaces `hint` |
| `status` | `"error" \| "warning" \| "success"` | colour and `aria-invalid` |
| `required` / `disabled` / `readonly` | `boolean` | |
| `bare` | `boolean` | no frame |
| `active` | `boolean` | force the focused look (popup inputs) |
| `ui` | `{ root, head, label, control, main, message }` | extra class per part |

## Slots

`default` (gets `{ id }`), `label`, `meta` (beside the label, e.g. a counter), `before`, `after`.
