---
name: viputy
description: Use when building or theming forms with @mnr73/viputy (Vue 3).
version: 1.0.0
license: ISC
---

# viputy

Vue 3 form inputs with first-class Persian/RTL and a Jalali calendar. Plain CSS tokens (`--vi-*`), no Tailwind, no Luxon, no runtime dependencies, SSR-safe. Package `@mnr73/viputy` 1.x. The old 0.x line (Tailwind + Luxon, `ViFrame`, `ViCheckBox`, `ViSimpleSelect`) is a different API: see `references/migration-0.x.md`.

## When to use

- Writing a form, a filter bar or a date/time/range picker in a Vue 3 app that has viputy installed.
- Changing how viputy looks: radius, colours, height, dark mode, disabled look, fonts.
- Building a custom input from the primitives (`ViField`, `ViPopup`, `ViOptionList`).
- Migrating a 0.x call site.

Do not use for: React/Svelte, Vuetify/PrimeVue/Element, or the `legacy/0.x` branch (it has none of the names below).

## Setup (once per app)

```ts
import { createApp } from "vue";
import { viputy } from "@mnr73/viputy";
import "@mnr73/viputy/style.css";
createApp(App).use(viputy, { locale: "fa" }).mount("#app"); // fa => RTL + Jalali + Persian digits
```

Components are named exports, not global: `import { ViInput, ViSelect } from "@mnr73/viputy"`. With Tailwind 4 import `style.css` BEFORE `@import "tailwindcss"`: every viputy rule lives in `@layer vi`, so any unlayered CSS or utility class wins.

## Which component

| Need | Use | `v-model` is |
|---|---|---|
| text, email, password, number | `ViInput` (`type`) | string, or a real `number` for `type="number"` |
| multi-line | `ViText` | string |
| yes/no, list of values | `ViCheckbox` (array model with `:value`) | boolean / array |
| one of N | `ViRadioGroup` + `ViRadio` | the option value |
| on/off | `ViSwitch` | boolean |
| one/many from a list, groups, search | `ViSelect` (`multiple`) | value / array |
| free-form tags | `ViTag` | `string[]` |
| one date (+ time) | `ViDate` (`time="hm"`) | ISO string, Gregorian |
| time only | `ViTime` | `"HH:mm"` 24 h ASCII |
| time zone | `ViTimeZone` | IANA id `"Asia/Tehran"` (never an offset) |
| from-to dates | `ViDateRange` | `{ start, end }` ISO days |
| birthday-style day/month/year selects | `ViSimpleDate` | ISO `YYYY-MM-DD` or null |
| filter bar (`@field op value` badges) | `ViQueryBuilder` | `QueryItem[]` |
| a calendar without an input | `ViCalendar` | ISO day |
| something else | build from `ViField` + `ViPopup` | `references/custom-inputs.md` |

Full props, events and slots per component: `references/components.md`. Query builder in depth: `references/query-builder.md`. Theming and every token: `references/theming.md`.

## Rules that prevent most mistakes

1. **Values are never Jalali and never Persian digits.** Dates are Gregorian ISO strings (`2026-11-10`, `2026-11-10T14:30`), time is `14:30`, numbers are real numbers. Jalali and Persian digits exist only in what the user sees. Never convert on the way to the server.
2. **Shared field props** work on every `ViField`-based input (`ViInput ViText ViSelect ViTag ViDate ViTime ViDateRange ViSimpleDate ViQueryBuilder`): `label hint message status required disabled readonly bare id ui`. `status` is `"error" | "warning" | "success"`. `message` replaces `hint` and takes the status colour. There is no `title`, `noFrame` or `status="true"` (0.x names).
3. **Do not wrap a viputy input in your own frame/label.** `label` already renders and wires `for`/`id`. Extra markup goes in slots (`before`, `after`, `meta`, `label`), not around the component.
4. **`class` and `style` go on the root; any other attribute (`name`, `autocomplete`, `inputmode`) goes on the native `<input>`.** For hidden form inputs use the `name` prop on `ViSelect ViDate ViTime ViDateRange ViSimpleDate`.
5. **Popup inputs** (`ViSelect ViDate ViTime ViDateRange ViSimpleDate ViQueryBuilder`) flip above/below, stay inside the viewport and turn into a bottom sheet under 640 px. Control with `mobile="sheet" | "fullscreen" | false` and `auto-scroll` (default true: scroll the page a little when neither side fits; `false` never moves the page). Never add your own positioning or `z-index`; `--vi-z` is the only knob.
6. **Never open a popup on `@focus`.** ViPopup returns focus to the trigger when it closes, so a focus-opened popup reopens forever. Open on click/ArrowDown. A combobox whose focus state drives the panel (like `ViTag`) must pass `:restore-focus="false"`.
7. **Do not set `--vi-*` only on `:root` and expect a form-scoped override to be lost.** Popups are teleported to `<body>` but ViPopup copies the resolved tokens from the trigger, so a token set on any ancestor of the input reaches its panel. Dark mode: put `dark`, `vi-theme-dark` or `data-theme="dark"` on any ancestor.
8. **Locale** comes from `app.use(viputy, { locale })` (string, ref or getter). Built in: `fa`, `en`; unknown falls back to `en`. Override text with `messages: { fa: { clear: "..." } }`. Direction is derived (`fa ar he ur ps ckb` = RTL) or forced with `dir`.
9. **SSR:** nothing touches `window`/`document` at setup. If you write a custom input, keep it that way (measure in `onMounted` or after the popup opens).

## Changing the look (short version)

Everything is a CSS custom property. Override on `:root` for the whole app, or on any wrapper for one form.

```css
:root {
  --vi-accent: #7c3aed;     /* brand colour */
  --vi-radius: 8px;         /* field frame */
  --vi-radius-sm: 6px;      /* options, day cells, buttons */
  --vi-radius-lg: 10px;     /* popup panel, cards */
  --vi-radius-pill: 6px;    /* chips, switch, scroll thumbs (999px = fully round) */
  --vi-height: 40px;        /* field height */
}
```

"Make corners rounder/squarer" = change the five `--vi-radius*` tokens together (see the table and presets in `references/theming.md`). A radio box and spinners stay circular on purpose. For one-off per-part classes use the `ui` prop (`ui="{ control: 'my-class' }"`), never `!important` or deep selectors.

## Query builder in one screen

```vue
<ViQueryBuilder v-model="filters" :fields="fields" clearable />
```
```ts
const fields: QueryField[] = [
  { key: "user", label: "User", type: "entity", search: (q) => api.users(q) },       // async list, one value
  { key: "age", label: "Age", type: "number", operators: ">,=,<,between", multiple: true, min: 0 },
  { key: "type", label: "Type", type: "select", options: [{ key: 1, label: "Buy" }] }, // in / nin
  { key: "date", label: "Date", type: "date", variants: [{ key: "create", label: "Created" }] },
];
// filters: [{ key: "age", op: "<", value: 30 }, { key: "type", op: "in", value: [1, 2] }]
toQueryString(filters.value); // filter[age][lt]=30&filter[type][in]=1,2
```
Options use `{ key, label }` (not `value`). `addon` is now `variants`, `accept_operator` is now `operators`, the old `id` type is `entity`. Details, operator table, key bindings and the query-string format: `references/query-builder.md`.

## Pitfalls

- `ViSelect :filter="false"` + `@search` is how you do server-side search; leaving `filter` unset filters locally.
- `ViSelect` object values need `by="id"` (or a function) or selection compares by identity.
- `ViDate` `min`/`max` that are date-only include the whole day.
- `ViDateRange` and `ViQueryBuilder` `between` sort the two ends for you; do not pre-sort.
- `ViCheckbox` `indeterminate` is controlled: clear it yourself on change.
- `loading` on `ViCheckbox ViRadio(Group) ViSwitch` blocks changes and shows a spinner; use it while saving, not `disabled`.
- Same field + same operator twice in a query string overwrites itself; send JSON for those.
- **Touch screens (`(hover: none)`)** show every clear button (`clearable`) all the time, with a 38 x 44 px hit area; mouse devices still reveal it on hover or focus. Do not hide it yourself.
- **Time zones.** `ViDate`/`ViTime` values are wall-clock and carry no zone, and viputy does not convert to UTC. For a multi-country form send `{ at: "2026-10-24T00:00", zone: "Asia/Tehran" }` (`ViDate` + `ViTimeZone`) and build the instant on the server (`Carbon::parse($at, $zone)->utc()`). An offset alone (`+03:30`) breaks when a law changes (Iran was +04:30 in summer until 2022), so store the zone for future events. Never read `getTimezoneOffset()` to guess it silently.
- The dates engine (`PlainDateTime`, `format`, `jalaliToDays`) has no time zones. `PlainDateTime.now()` reads the machine clock, so call it only on the client.
- Docs live in `docs/` (VitePress, `/` Persian, `/en/` English). Run `npm run docs:dev` to see live demos.

## Verification

After a change in a consumer app: `v-model` values are ISO/number/array (log one), the form works in RTL and LTR, a popup opens near the viewport bottom and on a 390 px screen, dark mode shows the right colours inside the popup, and `npm run typecheck` is clean.
