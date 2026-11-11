# Migrating from 0.x

0.x (`0.3.x`, branch `legacy/0.x`, tag `v0.3.32`) was Tailwind-styled and Luxon-based. 1.0 is a rewrite with no backward compatibility. `^0.3` ranges do not match 1.0, so nothing breaks until you bump.

## What changed in kind

| 0.x | 1.0 |
|---|---|
| Tailwind classes inside templates | plain CSS tokens `--vi-*`, `@layer vi`, no Tailwind needed |
| `luxon` `DateTime` models | ISO strings (`"2026-11-10"`, `"2026-11-10T14:30"`), no date library |
| Jalali via `persianDate.ts` (33-year rule, wrong in some years) | own engine, leap-year table, verified 1800-2300 |
| no install step | `app.use(viputy, { locale: "fa" })` + `import "@mnr73/viputy/style.css"` |
| popup logic per component | one `ViPopup` (flip, clamp, sheet, auto-scroll) |

## Renames

| 0.x | 1.0 |
|---|---|
| `ViCheckBox`, `ViCheckSlider` | `ViCheckbox`, `ViSwitch` |
| `ViSimpleSelect`, `ViSimpleDropdown`, `ViDropdown` | `ViSelect` (single), or build with `ViField` + `ViPopup` |
| `ViSimpleDate` (Luxon, three parts) | `ViSimpleDate` (ISO) |
| `ViFrame`, `ViNoFrame`, `ViPart`, `ViDivider`, `ViTagComponent` | `ViField` (`bare` replaces `ViNoFrame`) |
| prop `title` | `label` |
| prop `noFrame` | `bare` |
| prop `status="true"` | `status="success"` |
| `status="error" \| "warning"` | unchanged |
| `inputDir` | `dir` |
| `datalist` | `suggestions` |
| `ViInput accept="number"` + `format` | `type="number"` + `grouped` (+ `persian-digits`) |
| `ViInput minlength/maxlength` | `ViText maxlength` (soft, + `strict`); inputs forward native attrs |
| `ViSelect search` | `searchable` |
| `ViSelect compareKey` | `by` |
| `ViSelect filter: string[]` | `filter: false \| (option, query) => boolean` |
| `ViSelect noFrame` | `bare` |
| `fullPopup` | `mobile="fullscreen"` |
| `ViDate calender` (typo) | `calendar` / `calendars=["jalali","gregorian"]` |
| `ViDate activeCalender` | `calendar` (starting one) |
| `ViDate scrollDate` | no equivalent on `ViDate` (it opens at the value, else today); `initial-view` exists on the bare `ViCalendar` |
| `ViDate signedDate` | `marked=[iso]` |
| `ViDate persianFormat / gregorianFormat` | `displayFormat` (tokens `yyyy MM dd MMMM EEEE HH mm ss`) |
| `ViDate persianIntl/gregorianIntl/translate` | `locale` + `messages` on the plugin |
| `@change` events | `@update:modelValue` (and `@open` `@close` on popup inputs) |
| `@on` / `@off` (checkbox, radio) | none: watch the `v-model` |

## Value conversions

```ts
// 0.x: Luxon DateTime  ->  1.0: ISO string
date.value = DateTime.now();             // before
date.value = new Date().toISOString().slice(0, 10);   // after (or PlainDateTime.now().toISODate(), client only)
// to a JS Date for old code:
PlainDateTime.fromISO(date.value)?.toJSDate();
// from a Luxon DateTime you still have:
dt.toISODate();            // "2026-11-10"
dt.toFormat("yyyy-MM-dd'T'HH:mm");   // with time
```
Server contracts do not change: 0.x already sent ISO, 1.0 just stops wrapping it in `DateTime`.

## Codemod checklist (per file)

1. Imports: `from "@mnr73/viputy"` names per the rename table; add `import "@mnr73/viputy/style.css"` once.
2. Replace `title=` with `label=`, `noFrame` with `bare`, `status="true"` with `status="success"`.
3. For every date component: change the model type from `DateTime | null` to `string | null`; delete `luxon` imports that only fed viputy.
4. `ViSelect`: `compare-key` to `by`, `search` to `searchable`, `filter` array to a function (or drop it).
5. Remove Tailwind classes you passed to viputy for layout; keep wrappers. Use `class` on the root for width/margins.
6. Run `npm run typecheck`, then open each form once in RTL and check popups near the bottom edge and at 390 px.

## Not carried over

`ViFrame` slots and the Tailwind `class` pass-through on inner parts (use the `ui` prop), `ViDropdown`'s `actionKeys`, `ViCheckSlider` as a separate name, the `calender` typo, Luxon types in public props.

(Prop lists above are from the 0.3.32 sources; if a 0.x prop is not in the table, check `git show legacy/0.x:src/components/<Name>.vue`.)
