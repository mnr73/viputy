<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId, watch } from "vue";
import type { FieldStatus } from "../composables/useField";
import { useValidation } from "../composables/useValidation";
import type { Rules } from "../utils/validate";
import type { ValidateOn } from "../composables/useForm";
import { ViIcon } from "./ViIcon";

const props = defineProps<{
  label?: string;
  description?: string;
  /** Value to add to an array model (omit for a boolean model). */
  value?: unknown;
  trueValue?: unknown;
  falseValue?: unknown;
  /** Show the "some selected" dash. Cleared by the user's click; keep it controlled. */
  indeterminate?: boolean;
  disabled?: boolean;
  /** Pending state: shows a spinner and blocks changes (e.g. while saving to a server). */
  loading?: boolean;
  status?: FieldStatus;
  name?: string;
  id?: string;
  /** `{ required: true }`: the box must be ticked. See ViInput `rules`. */
  rules?: Rules;
  messages?: Record<string, string>;
  validateOn?: ValidateOn;
  /** Your own error text (replaces the one made by `rules`). */
  message?: string;
}>();

// boolean | array | custom true/false values, exactly like a native v-model checkbox
const model = defineModel<any>();
defineSlots<{ default?(): unknown; description?(): unknown }>();

const autoId = useId();
// Vue's checkbox v-model treats a bound `undefined` true/false-value as a real value.
const valueAttrs = computed(() => ({
  ...(props.trueValue !== undefined && { "true-value": props.trueValue }),
  ...(props.falseValue !== undefined && { "false-value": props.falseValue })
}));
const el = ref<HTMLInputElement>();
const val = useValidation({
  value: () => model.value,
  rules: () => props.rules,
  messages: () => props.messages,
  label: () => props.label,
  name: () => (props as { name?: string }).name,
  validateOn: () => props.validateOn,
  focus: () => el.value?.focus(),
  el: () => el.value ?? null
});
const shownError = computed(() => props.message ?? val.error.value);
const shownStatus = computed(
  () => props.status ?? (shownError.value ? "error" : undefined)
);
watch(model, () => val.onChange(), { deep: true });
const applyIndeterminate = () => {
  if (el.value) el.value.indeterminate = !!props.indeterminate;
};
onMounted(applyIndeterminate);
watch(() => props.indeterminate, applyIndeterminate);
watch(model, () => nextTick(applyIndeterminate), { deep: true });
</script>

<template>
  <label
    class="vi-check"
    :for="props.id ?? autoId"
    :data-disabled="props.disabled || undefined"
    :data-loading="props.loading || undefined"
    :data-status="shownStatus || undefined"
  >
    <input
      :id="props.id ?? autoId"
      ref="el"
      v-model="model"
      class="vi-check__input"
      type="checkbox"
      :name="props.name"
      :value="props.value"
      v-bind="valueAttrs"
      :disabled="props.disabled || props.loading"
      :aria-busy="props.loading || undefined"
      :aria-invalid="shownStatus === 'error' || undefined"
      :aria-describedby="shownError ? `${props.id ?? autoId}-msg` : undefined"
      @blur="val.onBlur"
    />
    <span class="vi-check__box">
      <ViIcon name="check" :size="13" :width="3.5" />
      <ViIcon name="minus" :size="13" :width="3.5" />
    </span>
    <span
      v-if="
        props.label ||
        props.description ||
        $slots.default ||
        $slots.description ||
        shownError
      "
      class="vi-check__text"
    >
      <span class="vi-check__label"
        ><slot>{{ props.label }}</slot></span
      >
      <span
        v-if="props.description || $slots.description"
        class="vi-check__desc"
      >
        <slot name="description">{{ props.description }}</slot>
      </span>
      <span
        v-if="shownError"
        :id="`${props.id ?? autoId}-msg`"
        class="vi-check__msg"
        role="alert"
        >{{ shownError }}</span
      >
    </span>
  </label>
</template>
