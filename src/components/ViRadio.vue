<script setup lang="ts">
import { computed, inject, useId } from "vue";
import { radioGroupKey } from "./radio-context";

const props = withDefaults(
  defineProps<{
    value: unknown;
    label?: string;
    description?: string;
    disabled?: boolean;
    /** Pending state: shows a spinner and blocks changes. A group's `loading` applies to all options. */
    loading?: boolean;
    /** Boxed look (set automatically inside a `card` ViRadioGroup). */
    card?: boolean;
    name?: string;
  }>(),
  { card: undefined }
);

const own = defineModel<unknown>();
defineSlots<{ default?(): unknown; description?(): unknown }>();

const group = inject(radioGroupKey, null);
const id = useId();
const model = computed({
  get: () => (group ? group.model.value : own.value),
  set: (v) => {
    if (group) group.model.value = v;
    else own.value = v;
  }
});
const isCard = computed(() => props.card ?? group?.card.value ?? false);
const isLoading = computed(
  () => props.loading || group?.loading.value || false
);
const isDisabled = computed(
  () => props.disabled || group?.disabled.value || false
);
</script>

<template>
  <label
    class="vi-radio"
    :class="{ 'vi-radio--card': isCard }"
    :for="id"
    :data-disabled="isDisabled || undefined"
    :data-loading="isLoading || undefined"
    :data-status="group?.status.value || undefined"
  >
    <input
      :id="id"
      v-model="model"
      class="vi-radio__input"
      type="radio"
      :name="props.name ?? group?.name"
      :value="props.value"
      :disabled="isDisabled || isLoading"
      :aria-busy="isLoading || undefined"
    />
    <span class="vi-radio__box" />
    <span class="vi-radio__text">
      <span class="vi-radio__label"
        ><slot>{{ props.label }}</slot></span
      >
      <span
        v-if="props.description || $slots.description"
        class="vi-radio__desc"
      >
        <slot name="description">{{ props.description }}</slot>
      </span>
    </span>
  </label>
</template>
