<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { provideField, type FieldStatus } from "../composables/useField";

type Part = "root" | "head" | "label" | "control" | "main" | "message";

const props = withDefaults(
  defineProps<{
    label?: string;
    hint?: string;
    /** Validation text; shown instead of `hint` and coloured by `status`. */
    message?: string;
    status?: FieldStatus;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    /** Drop the frame (border, background, padding). */
    bare?: boolean;
    /** Force the open/focused look (for popup-based inputs). */
    active?: boolean;
    id?: string;
    /** Extra class per part. */
    ui?: Partial<Record<Part, string>>;
  }>(),
  { status: null }
);

const autoId = useId();
const id = computed(() => props.id ?? autoId);
const msgId = computed(() => `${id.value}-msg`);
const text = computed(() => props.message ?? props.hint);

provideField({
  id: id.value,
  status: computed(() => props.status),
  disabled: computed(() => !!props.disabled),
  readonly: computed(() => !!props.readonly),
  required: computed(() => !!props.required),
  describedby: computed(() => (text.value ? msgId.value : undefined))
});

const control = ref<HTMLElement>();
defineExpose({ control });
</script>

<template>
  <div
    class="vi-field"
    :class="props.ui?.root"
    :data-status="props.status || undefined"
    :data-disabled="props.disabled || undefined"
    :data-bare="props.bare || undefined"
  >
    <div
      v-if="props.label || $slots.label || $slots.meta"
      class="vi-field__head"
      :class="props.ui?.head"
    >
      <label class="vi-field__label" :class="props.ui?.label" :for="id">
        <slot name="label">{{ props.label }}</slot>
        <span v-if="props.required" class="vi-field__req" aria-hidden="true"
          >*</span
        >
      </label>
      <slot name="meta" />
    </div>
    <div
      ref="control"
      class="vi-field__control"
      :class="props.ui?.control"
      :data-active="props.active || undefined"
    >
      <slot name="before" />
      <div class="vi-field__main" :class="props.ui?.main">
        <slot :id="id" />
      </div>
      <slot name="after" />
    </div>
    <div
      v-if="text"
      :id="msgId"
      class="vi-field__msg"
      :class="props.ui?.message"
      :role="props.status === 'error' ? 'alert' : undefined"
    >
      {{ text }}
    </div>
  </div>
</template>
