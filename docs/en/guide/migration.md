# Migrating from 0.3 to 1.0

1.0 is a rewrite without backward compatibility. `^0.3` ranges do not match 1.0, so nothing breaks until you bump the version yourself. The old code is on the `legacy/0.x` branch and the `v0.3.32` tag.

## What changed

| 0.3 | 1.0 |
|---|---|
| Tailwind classes inside templates | `--vi-*` CSS variables and `@layer vi`, no Tailwind needed |
| Luxon `DateTime` models | ISO strings (`"2026-11-10"`), no date library |
| Jalali with a 33-year rule (wrong in some years) | own engine with a leap-year table, verified for 1800 to 2300 |
| no install step | `app.use(viputy, { locale: "fa" })` and `import "@mnr73/viputy/style.css"` |

## Renames

| 0.3 | 1.0 |
|---|---|
| `ViCheckBox` / `ViCheckSlider` | `ViCheckbox` / `ViSwitch` |
| `ViSimpleSelect`, `ViSimpleDropdown`, `ViDropdown` | `ViSelect`, or build with `ViField` and `ViPopup` |
| `ViFrame`, `ViNoFrame`, `ViPart` | `ViField` (`bare` replaces `ViNoFrame`) |
| `title` | `label` |
| `noFrame` | `bare` |
| `status="true"` | `status="success"` |
| `inputDir` | `dir` |
| `datalist` | `suggestions` |
| `ViInput accept="number"` and `format` | `type="number"` and `grouped` (and `persian-digits`) |
| `ViSelect search` / `compareKey` | `searchable` / `by` |
| `fullPopup` | `mobile="fullscreen"` |
| `calender` (typo) | `calendar` or `calendars` |
| `signedDate` | `marked` |
| `persianFormat` / `gregorianFormat` | `displayFormat` |
| `change` event | `update:modelValue` (and `open` / `close`) |

## Value conversion

```ts
// before: Luxon DateTime      after: ISO string
dt.toISODate();                           // "2026-11-10"
dt.toFormat("yyyy-MM-dd'T'HH:mm");        // with time
PlainDateTime.fromISO(value)?.toJSDate(); // if old code needs a Date
```

Your server contract does not change: 0.3 already sent ISO.

## Per-file checklist

1. Fix imports with the table above and import `@mnr73/viputy/style.css` once.
2. `title` to `label`, `noFrame` to `bare`, `status="true"` to `status="success"`.
3. In date components change the model type from `DateTime | null` to `string | null` and drop Luxon imports that only fed viputy.
4. `ViSelect`: `compare-key` to `by`, `search` to `searchable`.
5. Keep layout Tailwind classes on the root with `class`.
6. Run `npm run typecheck`, then open each form once in RTL, near the bottom edge of the page, and at 390 px.

Not carried over: `class` on inner parts (use the `ui` prop), `actionKeys` on `ViDropdown`, Luxon types in props.

For agents: the [`skills/viputy`](/en/guide/ai-skill) skill carries this same table and can do the migration.
