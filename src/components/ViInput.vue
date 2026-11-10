<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, useId, watch } from "vue";
import { useViputy } from "../i18n/config";
import {
  caretAfterFormat,
  cleanNumber,
  formatNumber,
  toNumber
} from "../utils/number";
import { fixPersianLetters } from "../utils/text";
import { pickField, type FieldProps } from "./field-props";
import ViField from "./ViField.vue";
import { ViIcon } from "./ViIcon";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    FieldProps & {
      modelValue?: string | number | null;
      type?:
        "text" | "password" | "email" | "tel" | "url" | "search" | "number";
      placeholder?: string;
      /** Show a clear button on hover/focus. */
      clearable?: boolean;
      /** Static text before/after the value (e.g. a currency). */
      prefix?: string;
      suffix?: string;
      /** number: max fraction digits (0 = integers only). */
      decimals?: number;
      min?: number;
      max?: number;
      /** number: thousands separators. */
      grouped?: boolean;
      /** number: show Persian digits and separators. */
      persianDigits?: boolean;
      /** text: convert Arabic ي/ك to Persian ی/ک while typing. */
      fixLetters?: boolean;
      /** Value suggestions via the native datalist. */
      suggestions?: Array<string | number>;
      /** Text direction of the input; email/url/tel/password/number default to ltr. */
      dir?: "ltr" | "rtl" | "auto";
    }
  >(),
  { type: "text", fixLetters: true, status: null }
);

const emit = defineEmits<{
  "update:modelValue": [value: string | number | null];
}>();

defineSlots<{
  before?(): unknown;
  after?(): unknown;
  label?(): unknown;
  meta?(): unknown;
}>();

const attrs = useAttrs();
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const inputAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs;
  return rest;
});

const { t } = useViputy();
const input = ref<HTMLInputElement>();
const listId = useId();
const reveal = ref(false);

const isNumber = computed(() => props.type === "number");
const allowNegative = computed(() => props.min == null || props.min < 0);
const fmt = computed(() => ({
  group: props.grouped,
  persian: props.persianDigits
}));

function display(v: string | number | null | undefined): string {
  if (v == null || v === "") return "";
  return isNumber.value ? formatNumber(String(v), fmt.value) : String(v);
}
const text = ref(display(props.modelValue));

watch(
  () => props.modelValue,
  (v) => {
    const current = isNumber.value
      ? toNumber(cleanNumber(text.value, props.decimals, allowNegative.value))
      : text.value;
    if ((v ?? (isNumber.value ? null : "")) !== current)
      text.value = display(v);
  }
);
watch([() => props.grouped, () => props.persianDigits], () => {
  text.value = display(props.modelValue);
});

function onInput(e: Event) {
  const el = e.target as HTMLInputElement;
  const caret = el.selectionStart ?? el.value.length;
  if (isNumber.value) {
    const clean = cleanNumber(el.value, props.decimals, allowNegative.value);
    const shown = formatNumber(clean, fmt.value);
    const pos = caretAfterFormat(el.value, caret, shown);
    text.value = shown;
    el.value = shown;
    el.setSelectionRange(pos, pos);
    emit("update:modelValue", toNumber(clean));
    return;
  }
  let v = el.value;
  if (props.fixLetters) {
    const fixed = fixPersianLetters(v);
    if (fixed !== v) {
      v = fixed;
      el.value = v;
      el.setSelectionRange(caret, caret);
    }
  }
  text.value = v;
  emit("update:modelValue", v);
}

function onBlur() {
  if (!isNumber.value) return;
  let n = toNumber(
    cleanNumber(text.value, props.decimals, allowNegative.value)
  );
  if (n != null) {
    if (props.min != null) n = Math.max(n, props.min);
    if (props.max != null) n = Math.min(n, props.max);
    emit("update:modelValue", n);
  }
  text.value = display(n);
}

function clear() {
  text.value = "";
  emit("update:modelValue", isNumber.value ? null : "");
  nextTick(() => input.value?.focus());
}

const hasValue = computed(() => text.value !== "");
const showClear = computed(
  () => props.clearable && hasValue.value && !props.disabled && !props.readonly
);
const nativeType = computed(() => {
  if (isNumber.value) return "text";
  if (props.type === "password" && reveal.value) return "text";
  return props.type;
});
const inputMode = computed(() => {
  if (isNumber.value) return props.decimals === 0 ? "numeric" : "decimal";
  return (
    { tel: "tel", email: "email", url: "url", search: "search" } as const
  )[props.type as "tel"];
});
const textDir = computed(() => {
  if (props.dir) return props.dir;
  return ["number", "email", "url", "tel", "password"].includes(props.type)
    ? "ltr"
    : undefined;
});
const fieldProps = computed(() => pickField(props));

defineExpose({
  focus: () => input.value?.focus(),
  blur: () => input.value?.blur(),
  el: input
});
</script>

<template>
  <ViField v-bind="{ ...fieldProps, ...rootAttrs }">
    <template v-if="$slots.label" #label><slot name="label" /></template>
    <template v-if="$slots.meta" #meta><slot name="meta" /></template>
    <template v-if="$slots.before || props.prefix" #before>
      <slot name="before" />
      <span v-if="props.prefix" class="vi-affix">{{ props.prefix }}</span>
    </template>
    <template #default="{ id }">
      <input
        v-bind="inputAttrs"
        :id="id"
        ref="input"
        class="vi-native"
        :type="nativeType"
        :value="text"
        :dir="textDir"
        :inputmode="inputMode"
        :placeholder="props.placeholder"
        :disabled="props.disabled || undefined"
        :readonly="props.readonly || undefined"
        :required="props.required || undefined"
        :aria-invalid="props.status === 'error' || undefined"
        :list="props.suggestions?.length ? listId : undefined"
        @input="onInput"
        @blur="onBlur"
      />
      <datalist v-if="props.suggestions?.length" :id="listId">
        <option v-for="s in props.suggestions" :key="s" :value="s" />
      </datalist>
    </template>
    <template
      v-if="
        showClear || $slots.after || props.suffix || props.type === 'password'
      "
      #after
    >
      <button
        v-if="showClear"
        type="button"
        class="vi-clear"
        tabindex="-1"
        :aria-label="t('clear')"
        @mousedown.prevent
        @click="clear"
      >
        <ViIcon name="close" :size="11" :width="3.5" />
      </button>
      <button
        v-if="props.type === 'password' && !props.disabled"
        type="button"
        class="vi-icon-btn"
        :aria-label="reveal ? t('hidePassword') : t('showPassword')"
        :aria-pressed="reveal"
        @mousedown.prevent
        @click="reveal = !reveal"
      >
        <ViIcon :name="reveal ? 'eyeOff' : 'eye'" :size="18" :width="2" />
      </button>
      <span v-if="props.suffix" class="vi-affix">{{ props.suffix }}</span>
      <slot name="after" />
    </template>
  </ViField>
</template>
