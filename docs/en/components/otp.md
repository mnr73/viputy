# ViOtp

One-time code (SMS, email, two-factor): one small box per character. Typing a digit moves to the next box, Backspace steps back, and a whole code can be pasted. Built on `ViField`, so `label`, `hint`, `status`, `rules` and `ViForm` work as everywhere.

<script setup>
import { ref } from "vue";
const a = ref("");
const b = ref("");
const c = ref("");
const d = ref("");
const done = ref("");
const sent = ref("");
const code = ref("");
const busy = ref(false);
const wrong = ref("");
async function verify(v) {
  busy.value = true; wrong.value = "";
  await new Promise((r) => setTimeout(r, 700));
  busy.value = false;
  if (v.code === "123456") sent.value = "Code accepted"; else { wrong.value = "Wrong code"; code.value = ""; }
}
</script>

<div class="demo">
  <ViOtp v-model="a" label="Verification code" hint="The 6-digit code we texted you" @complete="done = $event" />
  <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">v-model: "{{ a }}" · complete: {{ done || "-" }}</div>
  <ViOtp v-model="b" label="4 digits" :length="4" />
  <ViOtp v-model="c" label="Letters and digits, masked, grouped" :length="6" type="alphanumeric" mask :group="3" />
  <ViOtp v-model="d" label="Error" :length="4" status="error" message="Wrong code" />
  <ViOtp model-value="1234" label="Disabled" :length="4" disabled />
</div>

```vue
<ViOtp v-model="code" label="Verification code" :length="6" @complete="verify" />
```

## Auto-submit or manual

| | |
|---|---|
| `@complete` | fires when the last box is filled (gives the code). Works in every setup: send the request yourself |
| `auto-submit` | inside a `ViForm` (or `<form>`), submits the form the moment the last box is filled. The form's rules run before `@submit` |
| neither | the user presses your button (or Enter in the last box) |

`complete` fires once per full code. If the user clears a digit and types it again, it fires again.

<div class="demo">
  <ViForm :submitting="busy" @submit="verify">
    <ViOtp v-model="code" name="code" label="Type the code (123456 is right)" :message="wrong || undefined" :status="wrong ? 'error' : undefined" auto-submit :rules="['required', { length: 6 }]" />
    <div dir="ltr" style="font-size:12px;color:var(--vp-c-text-2)">{{ busy ? "Checking…" : sent }}</div>
  </ViForm>
</div>

```vue
<ViForm :submitting="busy" @submit="verify">
  <ViOtp v-model="code" name="code" label="Verification code" auto-submit :rules="['required', { length: 6 }]" />
</ViForm>
```

## Behaviour

- **Typing**: the digit lands in the box and focus moves on. A character the box cannot take (a letter in `type="number"`) is ignored. Persian and Arabic digits become ASCII, are shown in Persian digits in a Persian locale, and `v-model` is always ASCII.
- **Backspace**: empties a full box. On an empty box it steps back and clears the previous one. The rest shifts left so the code never has a hole.
- **Paste**: any text that contains the code (`123-456`, with spaces around) is cleaned and fills every box. SMS autofill works (`autocomplete="one-time-code"` on the first box).
- **Direction**: the boxes are always laid out left to right (a code reads like a number). The arrow keys follow the screen. `Home` and `End` go to the first box and the first empty box.
- **No holes**: if the user taps box 5 while box 4 is empty, focus goes to the first empty box.
- **Phones**: `inputmode="numeric"` opens the number pad.

## Props

| prop | default | |
|---|---|---|
| `modelValue` | `""` | the code as a string; shorter than `length` until every box is filled |
| `length` | `6` | number of boxes |
| `type` | `"number"` | `"number"` digits only, `"alphanumeric"` digits and Latin letters, `"text"` any character |
| `mask` | `false` | dots instead of characters |
| `group` | | a dash after every N boxes (`3` gives `123–456`) |
| `auto-submit` | `false` | submit the form when the code is complete |
| `autofocus` | `false` | focus the first box |
| `persian-digits` | Persian locale | show Persian digits (the value stays ASCII) |
| `name` | | a hidden `<input>` for a plain form, and the field name in `ViForm` |
| `label` `hint` `message` `status` `required` `disabled` `readonly` `ui` `rules` `messages` `validate-on` | | as on every input |

Events: `update:modelValue`, `complete(value)`. Exposed: `focus()`, `clear()`.

Size with `--vi-otp-size` (box width, default `46px`) and `--vi-otp-height`.
