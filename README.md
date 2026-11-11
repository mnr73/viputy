# viputy

Vue 3 form inputs with first-class **Persian / RTL** support and a **Jalali calendar**. Plain CSS variables (no Tailwind), no runtime dependencies, SSR-safe.

**Docs and live demos:** https://mnr73.github.io/viputy/ (Persian) · https://mnr73.github.io/viputy/en/ (English)

```bash
npm i @mnr73/viputy
```
```ts
import { createApp } from "vue";
import { viputy } from "@mnr73/viputy";
import "@mnr73/viputy/style.css";

createApp(App).use(viputy, { locale: "fa" }).mount("#app");
```
```vue
<script setup>
import { ref } from "vue";
import { ViInput, ViSelect, ViDate, ViQueryBuilder } from "@mnr73/viputy";
const price = ref(2450000);
const born = ref("2026-11-10");          // ISO in, ISO out; shown as 1405/08/19
</script>
<template>
  <ViInput v-model="price" type="number" grouped label="Price" />
  <ViDate v-model="born" label="Date" />
</template>
```

## What is in it

`ViInput` `ViText` `ViSelect` (multi, groups, search) `ViTag` `ViCheckbox` `ViRadioGroup` `ViSwitch` `ViDate` (with time, two calendars) `ViTime` `ViDateRange` `ViSimpleDate` `ViCalendar` `ViQueryBuilder`, plus the parts to build your own: `ViField`, `ViPopup`, `ViOptionList`, `useField`, `usePopup`, `useOptions`, `useListNav`.

- Values on the wire are plain: ISO dates, `HH:mm`, real numbers. Jalali and Persian digits are display only.
- Popups flip, stay inside the screen, and become a bottom sheet on phones.
- Theme with `--vi-*` custom properties (corner radius, colours, height, dark mode, disabled look).

## For AI agents

`skills/viputy/` is an agent skill (Claude Code, Hermes, Codex...) that explains the whole library, theming and the query builder. See the docs page "AI agent skill".

## Upgrading from 0.x

1.0 is a rewrite without backward compatibility. See the migration guide in the docs. The old code is on the `legacy/0.x` branch and the `v0.3.32` tag.

## Develop

```bash
npm i
npm run docs:dev      # docs with live demos
npm test              # vitest
npm run typecheck
npm run build         # dist/ + types
```

ISC license.
