# Validation and ViForm

Every input takes `rules`, `messages`, `validate-on`. A failed rule turns the input red and shows the message under it.
User-set `status` / `message` props always win over rule output.

```vue
<ViInput v-model="name" label="Name" :rules="['required', { minLength: 3 }]" />
<ViInput v-model="age" type="number" :rules="{ required: true, min: 18, max: 99 }" />
```

- `rules`: array (ordered, can hold functions) or object. Empty values skip every rule except `required` and `equals`.
- Built-in: `required minLength maxLength length lengthBetween minItems maxItems min max between integer pattern email url phone nationalId cardNumber digits oneOf notOneOf equals`.
- `validate-on`: `"blur"` (default), `"change"`, `"input"`, `"submit"`. After the first error the field re-checks on every change. A field's own value beats the form's.
- Messages: `{label} {min} {max} {n} {value} {list}`. Priority: rule's own `message`, `messages` prop, `app.use(viputy, { rules: { fa: {...} } })`, built-in.
- Custom: a function `(value, { label, values(), submitted }) => true | string | { message?, key?, params? }`, sync or async (stale answers are dropped). `defineRule("name", fn)` registers it app-wide.
- `ViCheckbox`, `ViSwitch`, `ViRadioGroup` show the message under their label. `ViTimeZone` passes the props to its `ViSelect`.

```vue
<ViForm validate-on="submit" :errors="serverErrors" :submitting="busy" @submit="(values) => send(values)">
  <ViInput v-model="f.email" name="email" :rules="['required', 'email']" />
  <ViInput v-model="f.pass2" name="pass2" :rules="{ equals: 'pass' }" />
  <button type="submit">Send</button>
</ViForm>
```

`ViForm`: submit checks all fields, shows every error, focuses the first invalid one, emits `submit(values)` only when valid (`values` = `v-model` of fields with a `name`). `errors` is `{ name: string | string[] }` (Laravel shape). `submitting` disables fields. Expose: `validate()`, `reset()`, `values()`, `valid`, `submitted`.
Own input: `useValidation({ value, rules, messages, label, name, validateOn, focus, el })` returns `error`, `onChange()`, `onBlur()`, `validate()`.
