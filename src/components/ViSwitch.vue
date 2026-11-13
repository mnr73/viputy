<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import { useValidation } from "../composables/useValidation";
import type { ValidateOn } from "../composables/useForm";
import type { Rules } from "../utils/validate";

const props = defineProps<{
  label?: string;
  description?: string;
  trueValue?: unknown;
  falseValue?: unknown;
  disabled?: boolean;
  /** Pending state: shows a spinner and blocks changes (e.g. while saving to a server). */
  loading?: boolean;
  name?: string;
  id?: string;
  /** `{ required: true }`: the switch must be on. See ViInput `rules`. */
  rules?: Rules;
  messages?: Record<string, string>;
  validateOn?: ValidateOn;
  /** Your own error text (replaces the one made by `rules`). */
  message?: string;
  status?: "error" | "warning" | "success" | null;
}>();

const model = defineModel<any>();
defineSlots<{ default?(): unknown; description?(): unknown }>();
const autoId = useId();
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
watch(model, () => val.onChange());
// Vue's checkbox v-model treats a bound `undefined` true/false-value as a real value.
const valueAttrs = computed(() => ({
  ...(props.trueValue !== undefined && { "true-value": props.trueValue }),
  ...(props.falseValue !== undefined && { "false-value": props.falseValue })
}));
</script>

<template>
  <label
    class="vi-switch"
    :for="props.id ?? autoId"
    :data-disabled="props.disabled || undefined"
    :data-loading="props.loading || undefined"
    :data-status="shownStatus || undefined"
  >
    <input
      :id="props.id ?? autoId"
      v-model="model"
      ref="el"
      class="vi-switch__input"
      type="checkbox"
      role="switch"
      :name="props.name"
      v-bind="valueAttrs"
      :disabled="props.disabled || props.loading"
      :aria-busy="props.loading || undefined"
      :aria-invalid="shownStatus === 'error' || undefined"
      :aria-describedby="shownError ? `${props.id ?? autoId}-msg` : undefined"
      @blur="val.onBlur"
    />
    <span
      v-if="
        props.label ||
        props.description ||
        $slots.default ||
        $slots.description ||
        shownError
      "
      class="vi-switch__text"
    >
      <span class="vi-switch__label"
        ><slot>{{ props.label }}</slot></span
      >
      <span
        v-if="props.description || $slots.description"
        class="vi-switch__desc"
      >
        <slot name="description">{{ props.description }}</slot>
      </span>
      <span
        v-if="shownError"
        :id="`${props.id ?? autoId}-msg`"
        class="vi-switch__msg"
        role="alert"
        >{{ shownError }}</span
      >
    </span>
    <span class="vi-switch__track"><span class="vi-switch__thumb" /></span>
  </label>
</template>
