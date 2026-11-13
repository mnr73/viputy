<script setup lang="ts">
import { computed, provide, ref, useId, watch } from "vue";
import type { FieldStatus } from "../composables/useField";
import { useValidation } from "../composables/useValidation";
import type { ValidateOn } from "../composables/useForm";
import type { Rules } from "../utils/validate";
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
  /** `{ required: true }`: one option must be chosen. See ViInput `rules`. */
  rules?: Rules;
  messages?: Record<string, string>;
  validateOn?: ValidateOn;
}>();

const model = defineModel<unknown>();
const val = useValidation({
  value: () => model.value,
  rules: () => props.rules,
  messages: () => props.messages,
  label: () => props.label,
  name: () => (props as { name?: string }).name,
  validateOn: () => props.validateOn,
  focus: () =>
    root.value?.querySelector<HTMLElement>("input:checked, input")?.focus(),
  el: () => root.value ?? null
});
watch(model, () => val.onChange());
const shownMessage = computed(
  () => props.message ?? (props.status ? undefined : val.error.value)
);
const shownStatus = computed(
  () =>
    props.status ??
    (val.error.value && props.message === undefined ? "error" : undefined)
);
defineSlots<{ default?(): unknown }>();

const autoName = useId();
const root = ref<HTMLElement>();
provide(radioGroupKey, {
  model,
  name: props.name ?? autoName,
  card: computed(() => !!props.card),
  disabled: computed(() => !!props.disabled),
  loading: computed(() => !!props.loading),
  status: computed(() => shownStatus.value)
});
/** Focus left the whole group (not just moved to another option). */
function onFocusOut(e: FocusEvent) {
  if (!root.value?.contains(e.relatedTarget as Node | null)) val.onBlur();
}
const text = computed(() => shownMessage.value ?? props.hint);
</script>

<template>
  <fieldset
    ref="root"
    class="vi-fieldset"
    :data-status="shownStatus || undefined"
    @focusout="onFocusOut"
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
      :role="shownStatus === 'error' ? 'alert' : undefined"
    >
      {{ text }}
    </div>
  </fieldset>
</template>
