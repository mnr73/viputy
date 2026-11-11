# ViQueryBuilder

A filter bar. The user types `@`, picks a field, then (when there is a choice) a variant and an operator, then a value; a badge is created. `v-model` is a plain array that serialises to JSON or a query string.

```vue
<ViQueryBuilder v-model="filters" :fields="fields" label="Filters" clearable />
```

## The model

```ts
type QueryItem = {
  key: string;            // field key
  op: Operator;
  value?: unknown;        // scalar, or an array for in / nin / between; ABSENT for empty / nempty
  variant?: string;       // a QueryField.variants[].key
  display?: string[];     // labels for async `entity` values (UI only; strip before sending)
};
```
Dates are Gregorian ISO (`2026-11-01`). Numbers are real numbers. Booleans are `true`/`false`. Select/entity values keep their original type (the `key` of the chosen option). Display is Jalali/Persian digits for `fa`; the model is never.

## Field definition

```ts
interface QueryField {
  key: string; label: string;
  type?: "text" | "number" | "date" | "select" | "entity" | "boolean";   // default "text"
  operators?: Operator[] | string;     // array or ">,=,<" ; unknown names are dropped
  operator?: Operator;                 // first highlighted operator
  options?: unknown[];                 // select / entity: "a" | { key, label } | { label, options: [...] } (groups)
  search?: (q: string) => Promise<unknown[]> | unknown[];   // entity: async list, debounced 250 ms
  variants?: { key: string; label: string }[];              // was `addon`
  multiple?: boolean;                  // allow the same field again
  min?: number | string; max?: number | string;             // number or ISO date
  validate?: (value, op) => string | null | void;           // return an error message to reject
}
```

Options use **`key`** (or `value`) + `label`. `{ key: 1, label: "Buy" }` stores `1`.

### Defaults per type (when `operators` is omitted)

| type | operators (first = default) | value UI |
|---|---|---|
| text | `contains = != starts empty` | typed |
| number | `= < <= > >= between` | typed (Persian digits accepted) |
| date | `> = < between empty` | calendar; `between` = pick two days |
| select | `in` | multi-select list (`nin` also allowed) |
| entity | `=` | searchable list, one value |
| boolean | `=` | Yes / No |

All operators: `= != < <= > >= in nin between empty nempty contains starts`. Arity: `empty nempty` take no value; `between` exactly two; `in nin` a list; the rest one. A field with a single allowed operator skips the operator step.

Date operator labels are "after / before / on or after / on or before" instead of "greater / less".

## Flow and keys

1. `@` (or click, or ArrowDown) lists fields; typing filters; a used field is hidden unless `multiple` (a note says which are hidden).
2. variant step if the field has `variants` ("Which one?").
3. operator step, if more than one operator.
4. value step.

| Key | Does |
|---|---|
| `Enter` | pick the highlighted row; in a typed value, add it |
| `Ctrl/Cmd+Enter` | multi-select (`in`/`nin`): add the filter with the ticked values |
| `Esc` | cancel the unfinished badge (a second `Esc` has nothing left to do) |
| `Backspace` on empty input | in a draft: step back; with no draft: select the last badge, second press removes it |
| click a badge | edit it in place (position kept) |
| click the x on a badge | remove |
| `Tab` / click outside | abandons a half-built badge |

Multi-select rows: `Enter`/click toggles; a group header toggles the whole group; the footer button (also `Ctrl+Enter`) commits.

Badge states: normal (soft accent), draft (dashed outline, ends with `...`), selected (filled accent, after one `Backspace`), invalid (danger outline + a `!` mark; the model still holds it).

## Validation

A value is rejected (error shown, draft kept) when: a number is not finite or outside `min/max`, a date is not a real date or outside `min/max`, text is empty, `between` has the end before the start (they are sorted for you, so this only shows for pre-built models), or `validate` returns text. `validateItem(field, item)` is exported to re-check a model you got from a URL.

## Serialising

```ts
import { toQueryString, fromQueryString, validateItem } from "@mnr73/viputy";

toQueryString(filters.value);
// filter[user]=42&filter[age][lt]=30&filter[age][between]=10,40&filter[date_create][gt]=2026-11-01&filter[type][in]=1,2
filters.value = fromQueryString(location.search, fields);       // unknown keys/operators are skipped
toQueryString(filters.value, { param: "f" });                   // f[age][lt]=30
```

| Operator | suffix | Operator | suffix |
|---|---|---|---|
| `=` | none | `in` | `[in]` |
| `!=` | `[ne]` | `nin` | `[nin]` |
| `<` `<=` | `[lt]` `[lte]` | `between` | `[between]` (two values, comma) |
| `>` `>=` | `[gt]` `[gte]` | `empty` `nempty` | `[empty]` `[nempty]` (value `1`) |
| `contains` `starts` | `[contains]` `[starts]` | variant | key becomes `date_create` |

Limits: the same field with the same operator twice (`age >= 20` and `age >= 25`) overwrites itself in a query string, send JSON for those. `fromQueryString` turns digit strings of select/entity values into numbers when no option list can confirm the type.

Laravel-side idea (not shipped): read `filter[...]` into a whitelist and map `lt gt lte gte in nin between ne contains starts empty` to `where` clauses.

## Props / slots / expose

`modelValue fields placeholder trigger(@) clearable calendar autoScroll` + shared field props (`label hint message status required disabled readonly bare id ui`). No slots. Expose: `focus()`, `cancel()`, `el`. Emits: `update:modelValue`.

## Recipes

Async user picker that keeps labels on the badge:
```ts
{ key: "user", label: "User", type: "entity",
  search: async (q) => (await api.get("/users", { params: { q } })).data   // [{ key: 42, label: "Milad", description: "Sales" }]
}
```
The chosen label is stored on the item as `display` so the badge can render after a reload only if you keep it; when restoring from a URL the badge shows the raw id. Re-fill `display` yourself or give the field static `options`.

Preset filters: just set the model, e.g. `filters.value = [{ key: "type", op: "in", value: [1] }]`.

Required filter: validate on submit (`filters.some(i => i.key === "date")`), the component does not enforce presence.

Disable one field's operators to a single one to remove the step: `operators: ["="]`.

## Do / don't

- Do render the result with `toQueryString` or JSON; do not parse the badge text.
- Do give every field a stable `key` (it is the wire name); labels can be translated freely.
- Don't use `type: "id"` or `addon`/`accept_operator` (0.x/early names): use `entity`, `variants`, `operators`.
- Don't put Persian digits or Jalali dates into `min`/`max`/values: ISO only.
- Don't mutate `modelValue` items in place; replace the array (the component emits a new array).
