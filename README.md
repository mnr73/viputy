# viputy

Vue 3 form inputs with first-class **Persian / RTL** support and a **Jalali calendar**. Plain CSS variables (no Tailwind), no runtime dependencies, SSR-safe.

[![npm](https://img.shields.io/npm/v/@mnr73/viputy)](https://www.npmjs.com/package/@mnr73/viputy)

|                         |                                                         |
| ----------------------- | ------------------------------------------------------- |
| Documentation (Persian) | https://mnr73.github.io/viputy/                         |
| Documentation (English) | https://mnr73.github.io/viputy/en/                      |
| npm                     | https://www.npmjs.com/package/@mnr73/viputy             |
| Source                  | https://github.com/mnr73/viputy                         |
| AI agent skill          | https://github.com/mnr73/viputy/tree/main/skills/viputy |

Every component has a live demo and copy-paste code in the docs.

## Install

```bash
npm i @mnr73/viputy
```

Needs Vue `^3.5`. No other runtime dependency.

```ts
// main.ts
import { createApp } from "vue";
import { viputy } from "@mnr73/viputy";
import "@mnr73/viputy/style.css";

createApp(App).use(viputy, { locale: "fa" }).mount("#app"); // "fa" = RTL, Jalali, Persian digits
```

Components are named exports (not global):

```vue
<script setup>
import { ref } from "vue";
import { ViInput, ViDate, ViSelect } from "@mnr73/viputy";

const price = ref(2450000); // a real number
const born = ref("2026-11-10"); // ISO in, ISO out; shown as 1405/08/19
const city = ref(null);
</script>

<template>
  <ViInput v-model="price" type="number" grouped label="Price" />
  <ViDate v-model="born" label="Date" />
  <ViSelect v-model="city" :options="['Tehran', 'Shiraz']" label="City" />
</template>
```

Using Tailwind 4? Import viputy's CSS **before** Tailwind so your utilities win (viputy lives in `@layer vi`):

```css
@import "@mnr73/viputy/style.css";
@import "tailwindcss";
```

## Components

| Component                                                                            | For                                                                                          |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `ViInput`                                                                            | text, email, password, number (Persian digits, thousands separators, real `number` model)    |
| `ViText`                                                                             | multi-line text with counter                                                                 |
| `ViSelect`                                                                           | single or multiple, option groups (click a group to select all), search, async search        |
| `ViTag`                                                                              | free tags with suggestions                                                                   |
| `ViCheckbox` `ViRadioGroup` `ViRadio` `ViSwitch`                                     | choices, with a `loading` state                                                              |
| `ViDate`                                                                             | one date, optional time, Jalali and Gregorian, two months side by side                       |
| `ViTime`                                                                             | time only                                                                                    |
| `ViDateRange`                                                                        | from-to dates with presets                                                                   |
| `ViSimpleDate`                                                                       | day / month / year selects                                                                   |
| `ViCalendar`                                                                         | the calendar on its own                                                                      |
| `ViQueryBuilder`                                                                     | a filter bar: type `@`, pick a field, operator and value, get badges and JSON / query string |
| `ViField` `ViPopup` `ViOptionList` + `useField` `usePopup` `useOptions` `useListNav` | parts for building your own input                                                            |

Full props, events and slots: [component docs](https://mnr73.github.io/viputy/en/components/).

### Values are plain

What goes into `v-model` is never localised: dates are Gregorian ISO strings (`2026-11-10`, `2026-11-10T14:30`), time is `14:30`, numbers are numbers. Jalali dates and Persian digits are only what the user sees, so you can send the model to your server as is.

### Popups that behave

Panels open below or above, stay inside the screen (and scroll the page a little when neither side fits; switch that off with `:auto-scroll="false"`), and turn into a bottom sheet on phones (`mobile="sheet" | "fullscreen" | false`).

## Theming

Everything is a CSS custom property. Override on `:root`, or on any wrapper for a single form (popups follow):

```css
:root {
  --vi-accent: #7c3aed; /* brand colour */
  --vi-radius: 8px; /* field corners */
  --vi-radius-pill: 6px; /* chips, switch: 999px = fully round */
  --vi-height: 40px; /* field height */
}
```

Dark mode: add `dark`, `vi-theme-dark` or `data-theme="dark"` to any ancestor. Corner roundness has six tokens (`--vi-radius-xs`, `-sm`, plain `--vi-radius`, `-lg`, `-xl`, `-pill`) and the disabled look has three (`--vi-disabled-bg`, `--vi-disabled-border`, `--vi-disabled-opacity`). Ready-made sharp, soft and round presets are in the [theming guide](https://mnr73.github.io/viputy/en/guide/theming) and in `skills/viputy/references/theming.md`.

## Use it with an AI agent

`skills/viputy/` is an agent skill. Point your agent at it and it learns the whole library: which component to use, the value rules above, theming (corner roundness, colours, dark mode, disabled look), ViQueryBuilder and migration from 0.x.

**Link to give an agent** (any agent that can read a URL or a Markdown file):

```text
https://github.com/mnr73/viputy/tree/main/skills/viputy
```

Direct file URLs, if the agent wants raw Markdown:

```text
https://raw.githubusercontent.com/mnr73/viputy/main/skills/viputy/SKILL.md
https://raw.githubusercontent.com/mnr73/viputy/main/skills/viputy/references/components.md
https://raw.githubusercontent.com/mnr73/viputy/main/skills/viputy/references/theming.md
https://raw.githubusercontent.com/mnr73/viputy/main/skills/viputy/references/query-builder.md
https://raw.githubusercontent.com/mnr73/viputy/main/skills/viputy/references/custom-inputs.md
https://raw.githubusercontent.com/mnr73/viputy/main/skills/viputy/references/migration-0.x.md
```

Or just tell the agent: _"Read https://raw.githubusercontent.com/mnr73/viputy/main/skills/viputy/SKILL.md and follow its references, then build my form with viputy."_

**Install it as a skill** (the folder also ships inside the npm package):

```bash
# Claude Code (project)
mkdir -p .claude/skills && cp -r node_modules/@mnr73/viputy/skills/viputy .claude/skills/

# Hermes
cp -r node_modules/@mnr73/viputy/skills/viputy ~/.hermes/skills/viputy

# or straight from the repo
git clone --depth 1 https://github.com/mnr73/viputy /tmp/viputy && cp -r /tmp/viputy/skills/viputy .claude/skills/
```

More: [AI agent skill page](https://mnr73.github.io/viputy/en/guide/ai-skill).

| Skill file                    | Contents                                                             |
| ----------------------------- | -------------------------------------------------------------------- |
| `SKILL.md`                    | component picker, rules, theming and query-builder summary, pitfalls |
| `references/components.md`    | every prop, event and slot (generated from the source)               |
| `references/theming.md`       | every token, corner presets, dark mode, disabled look                |
| `references/query-builder.md` | data model, operators, keys, validation, query string                |
| `references/custom-inputs.md` | building an input from `ViField` and `ViPopup`                       |
| `references/migration-0.x.md` | renames and value conversions from 0.3                               |

## Upgrading from 0.x

1.0 is a rewrite without backward compatibility. `^0.3` ranges do not pick it up, so nothing breaks until you bump. Rename table and per-file checklist: [migration guide](https://mnr73.github.io/viputy/en/guide/migration). The old code is on the [`legacy/0.x`](https://github.com/mnr73/viputy/tree/legacy/0.x) branch and the `v0.3.32` tag.

## Develop

```bash
npm i
npm run docs:dev      # docs with live demos
npm test              # vitest
npm run typecheck
npm run build         # dist/ + types
```

Releasing: see [RELEASING.md](./RELEASING.md).

## License

ISC
