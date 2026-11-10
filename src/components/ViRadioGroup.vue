<script setup lang="ts">
import { computed, provide, useId } from "vue";
import type { FieldStatus } from "../composables/useField";
import { radioGroupKey } from "./radio-context";
import ViRadio from "./ViRadio.vue";

export interface RadioOption {
  value: unknown;
  label: string;
  description?: string;
  disabled?: boolean;
}

const props = defineProps<{
  options?: RadioOption[];
  /** Group title (rendered as the fieldset legend). */
  label?: string;
  hint?: string;
  message?: string;
  status?: FieldStatus;
  /** Boxed options in a responsive grid. */
  card?: boolean;
  /** Lay options out in a wrapping row. */
  inline?: boolean;
  disabled?: boolean;
  /** Pending state for every option (spinner on the selected one, changes blocked). */
  loading?: boolean;
  name?: string;
}>();

const model = defineModel<unknown>();
defineSlots<{ default?(): unknown }>();

const autoName = useId();
provide(radioGroupKey, {
  model,
  name: props.name ?? autoName,
  card: computed(() => !!props.card),
  disabled: computed(() => !!props.disabled),
  loading: computed(() => !!props.loading),
  status: computed(() => props.status)
});
const text = computed(() => props.message ?? props.hint);
</script>

<template>
  <fieldset
    class="vi-fieldset"
    :data-status="props.status || undefined"
    :aria-busy="props.loading || undefined"
  >
    <legend v-if="props.label" class="vi-field__label">
      {{ props.label }}
    </legend>
    <div
      class="vi-group"
      role="radiogroup"
      :data-card="props.card || undefined"
      :data-inline="props.inline || undefined"
    >
      <slot>
        <ViRadio
          v-for="(o, i) in props.options"
          :key="i"
          :value="o.value"
          :label="o.label"
          :description="o.description"
          :disabled="o.disabled"
        />
      </slot>
    </div>
    <div
      v-if="text"
      class="vi-field__msg"
      :role="props.status === 'error' ? 'alert' : undefined"
    >
      {{ text }}
    </div>
  </fieldset>
</template>
