# ViQueryBuilder

A filter bar: type `@`, pick a field, then an operator and a value, and a badge is created. The result is a plain array you can turn into JSON or a query string.

<script setup>
import { ref } from "vue";
import { fromQueryString, toQueryString } from "../../../src";

const fields = [
  {
    key: "user", label: "User", type: "entity", multiple: false,
    search: async (q) => {
      await new Promise((r) => setTimeout(r, 300));
      return [
        { key: 42, label: "Milad Nazari", description: "Sales manager" },
        { key: 7, label: "Milad Kazemi", description: "Support" },
        { key: 9, label: "Jamila Moradi", description: "Finance" }
      ].filter((u) => u.label.includes(q.trim()));
    }
  },
  { key: "age", label: "Age", type: "number", operators: ">,=,<,<=,>=,between", multiple: true, min: 0 },
  {
    key: "type", label: "Type", type: "select",
    operators: ["in", "nin"],
    options: [{ key: 1, label: "Buy" }, { key: 2, label: "Sell" }, { key: 3, label: "Return" }]
  },
  {
    key: "date", label: "Date", type: "date", operators: [">", "<", "between"],
    variants: [{ key: "create", label: "Created" }, { key: "update", label: "Updated" }]
  },
  { key: "note", label: "Notes", type: "text" },
  { key: "paid", label: "Approved", type: "boolean" }
];
const filters = ref([
  { key: "type", op: "in", value: [1, 2] },
  { key: "age", op: "<", value: 30 }
]);
</script>

<div class="demo">
  <ViQueryBuilder v-model="filters" :fields="fields" label="Filters" clearable />
  <pre dir="ltr" style="margin: 12px 0 0; font-size: 12px">{{ JSON.stringify(filters, null, 1) }}</pre>
  <pre dir="ltr" style="margin: 0; font-size: 12px; white-space: pre-wrap; word-break: break-all">?{{ toQueryString(filters) }}</pre>
</div>

```vue
<script setup>
import { ref } from "vue";
import { ViQueryBuilder, toQueryString } from "@mnr73/viputy";

const fields = [
  { key: "user", label: "User", type: "entity", search: (q) => api.users(q) },
  { key: "age", label: "Age", type: "number", operators: ">,=,<,<=,>=", multiple: true },
  { key: "type", label: "Type", type: "select", options: [{ key: 1, label: "Buy" }, { key: 2, label: "Sell" }] },
  { key: "date", label: "Date", type: "date", variants: [{ key: "create", label: "Created" }, { key: "update", label: "Updated" }] }
];
const filters = ref([]);
</script>

<template>
  <ViQueryBuilder v-model="filters" :fields="fields" />
</template>
```

## Steps

1. `@` or a click opens the field list. Typing filters it. A field that is already used is hidden unless it is `multiple`.
2. If the field has `variants` you get "Which one?" (e.g. date created / updated).
3. Operator. Skipped when the field allows only one.
4. Value, by `type`: numbers and text are typed, `select` and `entity` show a list, `date` opens a calendar, and `between` takes two values.

Click a badge to edit it. `Backspace` in the empty input selects the last badge and a second press removes it. `Esc` cancels an unfinished badge. In a multi-value list, `Enter` toggles the highlighted row and `Ctrl/Cmd+Enter` adds the filter.

## Field definition

| Key | Description |
|---|---|
| `key` · `label` | Identifier and title |
| `type` | `text` (default) · `number` · `date` · `select` · `entity` · `boolean` |
| `operators` | An array or a string such as `">,=,<"`. Any of `= != < <= > >= in nin between empty nempty contains starts` |
| `operator` | The operator highlighted first (default: the first allowed one) |
| `options` | For `select` and `entity`: strings, `{ key, label }`, or groups `{ label, options }` |
| `search` | For `entity`: `(q) => Promise<options>`, debounced. The chosen label is kept on the badge (`display`) and is not part of the output |
| `variants` | Flavours of one field: `[{ key, label }]`. Output gets `variant`; the query string uses `date_create` |
| `multiple` | Allow adding the same field again (age < 30 and age > 20) |
| `min` · `max` | For numbers and dates |
| `validate` | `(value, op) => "error message"` |

Default operators: text `contains = != starts empty`, number `= < <= > >= between`, date `> = < between empty`, select `in`, entity and boolean `=`.

## Output

```ts
type QueryItem = {
  key: string;
  op: Operator;
  value?: unknown;    // a scalar, or an array for in / nin / between; absent for empty
  variant?: string;
};
```

Dates are always Gregorian ISO (`2026-11-01`); only the display is Jalali.

```ts
import { toQueryString, fromQueryString } from "@mnr73/viputy";

toQueryString(filters);
// filter[user]=42&filter[age][lt]=30&filter[date_create][gt]=2026-11-01&filter[type][in]=1,2

filters.value = fromQueryString(location.search, fields); // restore from the URL
```

Query-string operator names: `ne lt lte gt gte in nin between empty nempty contains starts`, and `=` has no suffix. The same field with the same operator twice (`age >= 20` and `age >= 25`) overwrites itself in a query string; send JSON for those.

## Props

| Prop | Description |
|---|---|
| `v-model` | An array of `QueryItem` |
| `fields` | The field definitions |
| `placeholder` | Hint text |
| `trigger` | Prefix that starts a filter, default `@`. Typing any text also filters the list |
| `clearable` | A "clear all" button |
| `calendar` | `jalali` / `gregorian` for date values |
| `auto-scroll` | Same as ViPopup |
| `label` `hint` `status` `disabled` `readonly` … | Same as `ViField` |
