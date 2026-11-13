<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, watch } from "vue";
import { useValidation } from "../composables/useValidation";
import { localizeDigits } from "../utils/text";
import { useViputy } from "../i18n/config";
import {
  backspaceAt,
  cleanOtp,
  deleteAt,
  otpCells,
  otpPattern,
  setCell,
  type OtpType
} from "../utils/otp";
import { pickField, type FieldProps } from "./field-props";
import ViField from "./ViField.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    FieldProps & {
      /** The code so far: a string, shorter than `length` until the user is done. */
      modelValue?: string | null;
      /** Number of boxes. */
      length?: number;
      /** `number` (default): digits only. `alphanumeric`: digits and Latin letters. `text`: any character. */
      type?: OtpType;
      /** Show dots instead of the characters. */
      mask?: boolean;
      /** Put a dash after every N boxes (`3` makes `123-456`). */
      group?: number;
      /** Emit `complete` the moment the last box is filled. Without it, call your own submit. */
      autoSubmit?: boolean;
      /** Focus the first box on mount. */
      autofocus?: boolean;
      /** Show Persian digits when the locale is Persian. The value stays ASCII. */
      persianDigits?: boolean;
      name?: string;
    }
  >(),
  {
    length: 6,
    type: "number",
    modelValue: "",
    status: null,
    persianDigits: undefined,
    autoSubmit: false,
    mask: false
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  /** The last box was filled (always emitted; `auto-submit` also submits an enclosing `ViForm`). */
  complete: [value: string];
}>();
defineSlots<{ label?(): unknown; meta?(): unknown }>();

const attrs = useAttrs();
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const { t, locale } = useViputy();

const boxes = ref<HTMLInputElement[]>([]);
const cells = computed(() => otpCells(props.modelValue, props.length));
const filled = computed(() => cells.value.filter(Boolean).length);
const fa = computed(
  () => props.persianDigits ?? locale.value.split("-")[0] === "fa"
);
const shown = (c: string) =>
  !c
    ? ""
    : props.mask
      ? "•"
      : props.type === "number" && fa.value
        ? localizeDigits(c, "fa")
        : c;

const dead = computed(() => !!props.disabled || !!props.readonly);

const val = useValidation({
  value: () => props.modelValue,
  rules: () => props.rules,
  messages: () => props.messages,
  label: () => props.label,
  name: () => String(attrs.name ?? props.name ?? "") || undefined,
  validateOn: () => props.validateOn,
  focus: () => focusBox(firstFree()),
  el: () => boxes.value[0] ?? null
});
const fieldProps = computed(() => ({
  ...pickField(props, {}, val.error.value),
  bare: true
}));

function firstFree() {
  const i = cells.value.findIndex((c) => !c);
  return i === -1 ? props.length - 1 : i;
}
function focusBox(i: number, select = true) {
  const el = boxes.value[Math.max(0, Math.min(props.length - 1, i))];
  if (!el) return;
  el.focus({ preventScroll: true });
  if (select) el.select();
}

let lastComplete = "";
function commit(next: string, focusAt?: number) {
  if (next === props.modelValue) return;
  emit("update:modelValue", next);
  val.onChange();
  if (focusAt !== undefined) nextTick(() => focusBox(focusAt, false));
  if (next.length === props.length && next !== lastComplete) {
    lastComplete = next;
    emit("complete", next);
    // submit only when the last box was filled, and only inside a form
    if (props.autoSubmit) nextTick(() => submitForm());
  } else if (next.length < props.length) lastComplete = "";
}
function submitForm() {
  const f = boxes.value[0]?.closest("form");
  if (f && !props.disabled) f.requestSubmit();
}

function onInput(i: number, e: Event) {
  const el = e.target as HTMLInputElement;
  let raw = el.value;
  const old = cells.value[i] ?? "";
  el.value = shown(old); // the DOM always follows the model
  if (dead.value) return;
  // typing into a box that already holds a character gives two: keep the new one
  const prev = props.mask ? old : shown(old);
  if (prev && raw.length === prev.length + 1) {
    const k = raw.indexOf(prev);
    raw = k >= 0 ? raw.slice(0, k) + raw.slice(k + prev.length) : raw.slice(-1);
  }
  const text = cleanOtp(raw, props.type, props.length);
  if (!text) return;
  if (text.length > 1) return fill(i, text); // several characters at once: autofill, IME
  const at = Math.min(i, firstFree());
  commit(
    setCell(props.modelValue ?? "", i, text, props.length),
    Math.min(at + 1, props.length - 1)
  );
}
/** Put `text` into the boxes starting at `from` (paste, SMS autofill). */
function fill(from: number, text: string) {
  const head = Array.from(props.modelValue ?? "").slice(
    0,
    Math.min(from, firstFree())
  );
  const next = (head.join("") + text).slice(0, props.length);
  commit(next, Math.min(next.length, props.length - 1));
}
function onPaste(e: ClipboardEvent) {
  e.preventDefault();
  if (dead.value) return;
  const text = cleanOtp(
    e.clipboardData?.getData("text") ?? "",
    props.type,
    props.length
  );
  if (text) fill(0, text);
}
function onKey(i: number, e: KeyboardEvent) {
  if (e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
  switch (e.key) {
    case "Backspace": {
      e.preventDefault();
      if (dead.value) return;
      const r = backspaceAt(props.modelValue ?? "", i, props.length);
      commit(r.value, r.focus);
      if (r.value === props.modelValue) focusBox(r.focus);
      break;
    }
    case "Delete":
      e.preventDefault();
      if (!dead.value)
        commit(deleteAt(props.modelValue ?? "", i, props.length));
      break;
    // boxes are always laid out left to right (a code reads like a number), so the arrows follow the screen
    case "ArrowLeft":
      e.preventDefault();
      focusBox(i - 1);
      break;
    case "ArrowRight":
      e.preventDefault();
      focusBox(i + 1);
      break;
    case "Home":
      e.preventDefault();
      focusBox(0);
      break;
    case "End":
      e.preventDefault();
      focusBox(firstFree());
      break;
    case "Enter":
      if (filled.value === props.length) submitForm();
      break;
    default:
      // a printable key that this box cannot take must not change anything (and no stray beep of text)
      if (
        e.key.length === 1 &&
        !otpPattern(props.type).test(e.key) &&
        !/[۰-۹٠-٩]/.test(e.key)
      ) {
        if (props.type === "number") e.preventDefault();
      }
  }
}
function onFocus(i: number, e: FocusEvent) {
  // never leave a gap: focus lands on the first empty box when the user taps further along
  const free = firstFree();
  if (i > free && !dead.value) return focusBox(free);
  (e.target as HTMLInputElement).select();
}
function onBlur(e: FocusEvent) {
  if (!boxes.value.includes(e.relatedTarget as HTMLInputElement)) val.onBlur();
}

watch(
  () => props.modelValue,
  (v) => {
    if (!v) lastComplete = "";
  }
);
defineExpose({
  focus: () => focusBox(firstFree()),
  clear: () => {
    commit("", 0);
  }
});

const inputMode = computed(() =>
  props.type === "number" ? "numeric" : "text"
);
const ariaLabel = (i: number) =>
  t("otpDigit", {
    n: localizeDigits(i + 1, locale.value),
    total: localizeDigits(props.length, locale.value)
  });
const sepAfter = (i: number) =>
  !!props.group && (i + 1) % props.group === 0 && i < props.length - 1;
</script>

<template>
  <ViField v-bind="{ ...fieldProps, ...rootAttrs }">
    <template #label
      ><slot name="label">{{ props.label }}</slot></template
    >
    <template v-if="$slots.meta" #meta><slot name="meta" /></template>
    <template #default="{ id }">
      <div
        class="vi-otp"
        dir="ltr"
        role="group"
        :aria-labelledby="props.label ? `${id}-label` : undefined"
        :data-disabled="props.disabled || undefined"
        :data-status="fieldProps.status || undefined"
      >
        <template v-for="(c, i) in cells" :key="i">
          <input
            :id="i === 0 ? id : undefined"
            :ref="(el) => (boxes[i] = el as HTMLInputElement)"
            class="vi-otp__box"
            :class="{ 'is-filled': !!c }"
            :type="props.mask ? 'password' : 'text'"
            :inputmode="inputMode"
            :autocomplete="i === 0 ? 'one-time-code' : 'off'"
            :autofocus="(props.autofocus && i === 0) || undefined"
            :value="props.mask ? c : shown(c)"
            :disabled="props.disabled || undefined"
            :readonly="props.readonly || undefined"
            :aria-label="ariaLabel(i)"
            :aria-invalid="fieldProps.status === 'error' || undefined"
            spellcheck="false"
            autocapitalize="off"
            @input="onInput(i, $event)"
            @keydown="onKey(i, $event)"
            @paste="onPaste($event)"
            @focus="onFocus(i, $event)"
            @blur="onBlur"
          />
          <span v-if="sepAfter(i)" class="vi-otp__sep" aria-hidden="true"
            >–</span
          >
        </template>
        <input
          v-if="props.name"
          type="hidden"
          :name="props.name"
          :value="props.modelValue ?? ''"
        />
      </div>
    </template>
  </ViField>
</template>
