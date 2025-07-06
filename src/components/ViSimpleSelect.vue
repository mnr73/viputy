<script setup lang="ts">
import { computed, ref } from 'vue';
import ViSimpleDropdown from './ViSimpleDropdown.vue';

type Option = Record<string, any> | string | number | null;

const emit = defineEmits<{
  (e: 'update:modelValue', value: Option | Option[]): void;
  (e: 'search', value: string | null): void;
  (e: 'change'): void;
}>();

const props = withDefaults(
  defineProps<{
    modelValue?: Option | Option[];
    options?: Option[];
    disabled?: boolean;
    compareKey?: string;
    multiple?: boolean;
  }>(),
  {
    modelValue: null,
    disabled: false,
    compareKey: 'id',
    multiple: false
  }
);

const element = ref<typeof ViSimpleDropdown>();
const stageOptionIndex = ref(-1);

const selectedOption = computed<Option>({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

function checkSelected(val: Option): boolean {
  const selected = selectedOption.value;

  if (props.multiple && Array.isArray(selected)) {
    if (val && typeof val === 'object') {
      return selected.some(
        (item) =>
          item &&
          typeof item === 'object' &&
          item[props.compareKey] === val[props.compareKey]
      );
    } else {
      return selected.includes(val);
    }
  }

  if (
    val &&
    typeof val === 'object' &&
    selected &&
    typeof selected === 'object'
  ) {
    return (
      val[props.compareKey] !== undefined &&
      val[props.compareKey] ===
        (selected as Record<string, any>)[props.compareKey]
    );
  }

  return val === selected;
}

function onOptionClick(option: Option) {
  if (props.multiple) {
    let selected = Array.isArray(selectedOption.value)
      ? [...selectedOption.value]
      : [];
    let exists = false;

    if (option && typeof option === 'object' && props.compareKey) {
      exists = selected.some(
        (item) =>
          item &&
          typeof item === 'object' &&
          item[props.compareKey] === option[props.compareKey]
      );
    } else {
      exists = selected.includes(option);
    }

    if (!exists) {
      selected.push(option);
    } else {
      selected = selected.filter((item) => {
        if (option && typeof option === 'object' && props.compareKey) {
          return !(
            item &&
            typeof item === 'object' &&
            item[props.compareKey] === option[props.compareKey]
          );
        }
        return item !== option;
      });
    }

    selectedOption.value = selected;
  } else {
    selectedOption.value = option;
    element.value?.closeList();
  }
  emit('change');
}

function handleKey(e: KeyboardEvent) {
  if (!props.options?.length) return;

  switch (e.code) {
    case 'ArrowDown':
      e.preventDefault();
      element.value?.openList();
      stageOptionIndex.value++;
      if (stageOptionIndex.value >= props.options.length) {
        stageOptionIndex.value = props.options.length - 1;
      }
      break;

    case 'ArrowUp':
      e.preventDefault();
      element.value?.openList();
      stageOptionIndex.value--;
      if (stageOptionIndex.value < 0) {
        stageOptionIndex.value = 0;
      }
      break;

    case 'Enter':
      if (stageOptionIndex.value >= 0) {
        onOptionClick(props.options[stageOptionIndex.value]);
      }
      break;

    case 'Space':
      e.preventDefault();
      element.value?.toggleList();
      break;

    case 'Delete':
      element.value?.closeList();
      break;
  }
}

function closePopup() {
  setTimeout(() => {
    stageOptionIndex.value = -1;
  }, 100);
}
</script>

<template>
  <ViSimpleDropdown
    :disabled="props.disabled"
    @keydown="handleKey"
    ref="element"
    @closePopup="closePopup"
  >
    <template #icon="{ open }">
      <slot name="icon" :open="open"></slot>
    </template>

    <template #text="{ open }">
      <slot name="text" :open="open" :selected="selectedOption">
        <span>select your option</span>
      </slot>
    </template>

    <template #content>
      <div class="grid gap-1 p-2">
        <div
          v-for="(option, index) in props.options"
          :key="index"
          class="block bg-white hover:bg-slate-50 hover:border-e-slate-200 hover:border-e-4 p-2 cursor-pointer rounded-sm relative"
          :class="{
            '!bg-slate-50 border-s-4 border-s-sky-400': checkSelected(option),
            '!bg-slate-50 border-e-slate-200 border-e-4':
              stageOptionIndex === index
          }"
          @click="onOptionClick(option)"
        >
          <slot :option="option" name="option" />
        </div>
      </div>
    </template>
  </ViSimpleDropdown>
</template>
