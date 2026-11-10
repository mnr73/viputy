<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import { useViputy } from "../i18n/config";
import { fixPersianLetters, localizeDigits } from "../utils/text";
import { pickField, type FieldProps } from "./field-props";
import ViField from "./ViField.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    FieldProps & {
      modelValue?: string | null;
      placeholder?: string;
      rows?: number;
      /** Soft limit: shows a counter and turns red past it. */
      maxlength?: number;
      /** Also block typing past `maxlength` natively. */
      strict?: boolean;
      /** Counter visibility; defaults to on when `maxlength` is set. */
      counter?: boolean;
      /** Grow with the content (modern browsers; others keep `rows`). */
      autosize?: boolean;
      resize?: "none" | "vertical";
      fixLetters?: boolean;
      dir?: "ltr" | "rtl" | "auto";
    }
  >(),
  {
    rows: 3,
    resize: "vertical",
    fixLetters: true,
    counter: undefined,
    status: null
  }
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
defineSlots<{ label?(): unknown; meta?(): unknown }>();

const attrs = useAttrs();
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const areaAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs;
  return rest;
});

const { t, locale } = useViputy();
const area = ref<HTMLTextAreaElement>();

const length = computed(() => (props.modelValue ?? "").length);
const over = computed(() =>
  props.maxlength != null ? Math.max(0, length.value - props.maxlength) : 0
);
const showCounter = computed(() => props.counter ?? props.maxlength != null);
const counterText = computed(() =>
  localizeDigits(
    props.maxlength != null
      ? `${length.value} / ${props.maxlength}`
      : length.value,
    locale.value
  )
);
const counterState = computed(() => {
  if (over.value) return "error";
  if (props.maxlength != null && length.value >= props.maxlength * 0.9)
    return "warning";
  return undefined;
});

const fieldProps = computed(() => {
  const f = pickField(props, { control: "vi-area__control", main: "vi-area" });
  if (over.value) {
    f.status = "error";
    f.message ??= t("overLimit", {
      n: localizeDigits(over.value, locale.value)
    });
  }
  return f;
});

function onInput(e: Event) {
  const el = e.target as HTMLTextAreaElement;
  if (props.fixLetters) {
    const caret = el.selectionStart;
    const fixed = fixPersianLetters(el.value);
    if (fixed !== el.value) {
      el.value = fixed;
      el.setSelectionRange(caret, caret);
    }
  }
  emit("update:modelValue", el.value);
}

defineExpose({ focus: () => area.value?.focus(), el: area });
</script>

<template>
  <ViField v-bind="{ ...fieldProps, ...rootAttrs }">
    <template v-if="$slots.label" #label><slot name="label" /></template>
    <template v-if="$slots.meta" #meta><slot name="meta" /></template>
    <template #default="{ id }">
      <textarea
        v-bind="areaAttrs"
        :id="id"
        ref="area"
        class="vi-native vi-native--area"
        :class="{ 'vi-native--auto': props.autosize }"
        :style="{ resize: props.resize }"
        :value="props.modelValue ?? ''"
        :rows="props.rows"
        :dir="props.dir"
        :placeholder="props.placeholder"
        :maxlength="props.strict ? props.maxlength : undefined"
        :disabled="props.disabled || undefined"
        :readonly="props.readonly || undefined"
        :required="props.required || undefined"
        :aria-invalid="fieldProps.status === 'error' || undefined"
        @input="onInput"
      />
      <span
        v-if="showCounter"
        class="vi-counter"
        :data-state="counterState"
        aria-live="polite"
      >
        {{ counterText }}
      </span>
    </template>
  </ViField>
</template>
