<script setup lang="ts">
import { computed, useId } from "vue";

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
}>();

const model = defineModel<any>();
defineSlots<{ default?(): unknown; description?(): unknown }>();
const autoId = useId();
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
  >
    <input
      :id="props.id ?? autoId"
      v-model="model"
      class="vi-switch__input"
      type="checkbox"
      role="switch"
      :name="props.name"
      v-bind="valueAttrs"
      :disabled="props.disabled || props.loading"
      :aria-busy="props.loading || undefined"
    />
    <span
      v-if="
        props.label || props.description || $slots.default || $slots.description
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
    </span>
    <span class="vi-switch__track"><span class="vi-switch__thumb" /></span>
  </label>
</template>
