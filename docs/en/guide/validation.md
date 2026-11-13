# Validation and ViForm

Every input takes `rules`. When a rule fails, the input turns red and the message shows under it. Nothing to import for the common rules.

<script setup>
import { ref } from "vue";
import { defineRule } from "../../../src";
const name = ref("");
const age = ref(null);
const mobile = ref("");
const nid = ref("");
const city = ref(null);
const tags = ref([]);
const agree = ref(false);
const username = ref("");
defineRule("noSpaces", (v) => (/\s/.test(v) ? "No spaces, please" : true));
const taken = async (v) => { await new Promise((r) => setTimeout(r, 600)); return ["admin", "root"].includes(v) ? `“${v}” is already taken` : true; };

const f = ref({ name: "", email: "", pass: "", pass2: "", terms: false });
const errors = ref({});
const submitting = ref(false);
const sent = ref("");
async function send(values) {
  submitting.value = true; errors.value = {};
  await new Promise((r) => setTimeout(r, 700));
  submitting.value = false;
  if (values.email === "taken@x.com") errors.value = { email: ["This email is already registered (from the server)"] };
  else sent.value = JSON.stringify(values);
}
</script>

<div class="demo">
  <ViInput v-model="name" label="Name" :rules="['required', { minLength: 3 }, { maxLength: 20 }]" />
  <ViInput v-model="age" label="Age" type="number" :rules="{ required: true, min: 18, max: 99 }" />
  <ViInput v-model="mobile" label="Mobile" type="tel" :rules="['required', 'phone']" />
  <ViInput v-model="nid" label="National code" :rules="['nationalId']" />
  <ViSelect v-model="city" label="City" :options="['Tehran', 'Shiraz', 'Tabriz']" :rules="['required']" />
  <ViTag v-model="tags" label="Skills (2 to 4)" :rules="['required', { minItems: 2 }, { maxItems: 4 }]" />
  <ViInput v-model="username" label="Username (try admin)" :rules="['required', 'noSpaces', taken]" hint="Checked on the server" />
  <ViCheckbox v-model="agree" label="I accept the terms" :rules="{ required: true }" />
</div>

```vue
<ViInput v-model="name" label="Name" :rules="['required', { minLength: 3 }, { maxLength: 20 }]" />
<ViInput v-model="age" type="number" :rules="{ required: true, min: 18, max: 99 }" />
<ViCheckbox v-model="agree" :rules="{ required: true }" label="I accept the terms" />
```

## Writing rules

Two shapes, mix them as you like:

```ts
["required", { minLength: 3 }, myFunction]        // an array keeps the order
{ required: true, minLength: 3, pattern: /^[a-z]+$/ } // an object is shorter
```

Rules are checked **in order** and the first failure shows. An **empty value skips every rule except `required`** (and `equals`), so an optional field with `email` is fine when left empty. Add `required` to make it mandatory.

| Rule | Checks |
|---|---|
| `required` | not empty: `""`, spaces, `null`, `[]`, an empty date range and an unchecked box all fail. `0` is a value |
| `minLength` `maxLength` `length` `lengthBetween: [a, b]` | characters of text (an emoji counts as one), or items of a list |
| `minItems` `maxItems` | tags, files, chosen options |
| `min` `max` `between: [a, b]` | numbers (Persian digits and `1,200` are fine), ISO dates, ISO date-times and `HH:mm` |
| `integer` | whole numbers |
| `pattern: /re/` | a regular expression |
| `email` `url` | `url` needs `http(s)://` and a dotted host |
| `phone` | Iranian mobile in every spelling: `0912…`, `+98912…`, `0098912…`, `912…` |
| `nationalId` | Iranian national code with its check digit |
| `cardNumber` | 16 digits with a valid check digit |
| `digits` | digits only (also Persian) |
| `oneOf: [..]` `notOneOf: [..]` | allowed or forbidden values |
| `equals: "password"` | equals the field called `password` in the same `ViForm` (or a plain value). Runs on an empty value too |

Works on `ViInput`, `ViText`, `ViSelect`, `ViTag`, `ViDate`, `ViTime`, `ViDateRange`, `ViSimpleDate`, `ViTimeZone`, `ViUpload`, `ViQueryBuilder`, `ViCheckbox`, `ViSwitch` and `ViRadioGroup`. For lists (`ViSelect multiple`, `ViTag`, `ViUpload`, `ViQueryBuilder`) the length rules count items.

## When it checks

`validate-on` on the input (or on the `ViForm`):

| | |
|---|---|
| `"blur"` (default) | when the user leaves the field. A popup field (select, date) checks when its panel closes |
| `"change"` / `"input"` | on every change / every keystroke |
| `"submit"` | only when the form is submitted |

Typing never nags before the first error. **After an error shows, the field checks again on every change**, so the error leaves the moment it is fixed.

## Messages

Every rule has a default message in English and Persian. The placeholders `{label}`, `{min}`, `{max}`, `{n}`, `{value}` and `{list}` are filled in.

```vue
<!-- 1. on one input, by rule name -->
<ViInput label="Name" :rules="['required', { minLength: 3 }]"
  :messages="{ required: 'Fill in {label}', minLength: '{label} needs {min}+ letters' }" />

<!-- 2. on one rule -->
<ViInput :rules="[{ minLength: 3, message: 'Too short' }]" />

<!-- 3. for the whole app -->
app.use(viputy, { locale: "fa", rules: { fa: { required: "پر کردن «{label}» الزامی است" } } })
```

The order of priority: the rule's own `message`, then the input's `messages`, then the app's `rules`, then the built-in text. Your own `status` or `message` props **always win**: an input with `message="..."` never shows the rule's text.

## Your own rules

A rule is a function. Return a **string** for the error, or `true` / nothing for fine. It may be async (check a username on the server): while it runs the field shows nothing, and an answer that arrives after the user typed more is dropped.

```ts
const unique = async (v) => (await api.exists(v)) ? "This name is taken" : true;

// with parameters in the message
{ validate: (v) => v.startsWith("09"), message: "Must start with {prefix}", params: { prefix: "09" } }

// reuse a built-in message, or return your own text and parameters
(v) => ({ key: "min", params: { min: 18 } })
(v) => ({ message: "Need {n} more", params: { n: 2 } })

// register once, use by name everywhere
import { defineRule } from "@mnr73/viputy";
defineRule("noSpaces", (v) => (/\s/.test(v) ? "No spaces" : true));
// <ViInput :rules="['required', 'noSpaces']" />
```

The function gets `(value, { label, values(), submitted })`. `values()` gives the other fields of the `ViForm` by `name`. A rule that throws shows its error instead of breaking the page. Set `skipEmpty: false` on a `{ validate }` rule if it must run on empty values.

## ViForm

```vue
<ViForm validate-on="submit" :errors="errors" :submitting="busy" @submit="send">
  <ViInput v-model="f.name" name="name" label="Name" :rules="['required']" />
  <ViInput v-model="f.email" name="email" label="Email" :rules="['required', 'email']" />
  <ViInput v-model="f.pass" name="pass" label="Password" type="password" :rules="['required', { minLength: 8 }]" />
  <ViInput v-model="f.pass2" name="pass2" label="Repeat" type="password" :rules="{ equals: 'pass' }" />
  <ViCheckbox v-model="f.terms" name="terms" label="I accept" :rules="{ required: true }" />
  <button type="submit">Register</button>
</ViForm>
```

<div class="demo">
  <ViForm validate-on="submit" :errors="errors" :submitting="submitting" @submit="send" v-slot="s">
    <ViInput v-model="f.name" name="name" label="Name" :rules="['required']" />
    <ViInput v-model="f.email" name="email" label="Email (try taken@x.com)" :rules="['required', 'email']" />
    <ViInput v-model="f.pass" name="pass" label="Password" type="password" :rules="['required', { minLength: 8 }]" />
    <ViInput v-model="f.pass2" name="pass2" label="Repeat password" type="password" :rules="{ equals: 'pass' }" />
    <ViCheckbox v-model="f.terms" name="terms" label="I accept the terms" :rules="{ required: true }" />
    <button type="submit" class="vi-btn vi-btn--primary" style="max-width: 180px" :disabled="submitting">{{ submitting ? "Sending…" : "Register" }}</button>
    <div dir="ltr" style="font-size: 12px; color: var(--vp-c-text-2)">{{ sent }}</div>
  </ViForm>
</div>

- **`validate-on`**: the form's default for its fields (`"blur"` or `"submit"`). With `"submit"`, nothing shows until the user submits, then the fields check live. A field's own `validate-on` wins.
- **Submit** checks every field at once (async rules too), shows all errors, **focuses the first invalid field** (`focus-first`, on by default) and does not emit `submit`. When everything is valid, `@submit` gives `values`: the `v-model` of every field that has a `name`.
- **`errors`**: errors from your server by field `name`, a string or a Laravel array (`{ email: ["..."] }`). They show on the field like any error, and go away when you clear them. A server error never blocks the user's own `status` / `message`.
- **`submitting`**: disables every field and ignores a second submit while the request runs.
- **`@invalid`** gives the names of the invalid fields. `novalidate` is on, so the browser's own bubbles never appear.
- Slot props: `submitted`, `valid`, `validating`, `submit()`, `reset()`, `values`. Expose: `validate()`, `reset()`, `values()`, `valid`, `submitted`.
- A field removed from the page (`v-if`) is no longer validated.

## Props

| | |
|---|---|
| `rules` | array or object, see above |
| `messages` | `{ ruleName: "text with {placeholders}" }` |
| `validate-on` | `"blur"` (default) `"change"` `"input"` `"submit"` |

On `ViForm`: `validate-on`, `errors`, `submitting`, `disabled`, `focus-first`, `novalidate`.

Exports: `defineRule`, `isNationalId`, `isIranMobile`, `isCardNumber`, `isUrl`, `isEmpty`, `compileRules`, `runRules`, `useValidation` (to make your own input validate), `ruleMessages`.

Validate on the server too: client rules are for the user's comfort, not for security.
