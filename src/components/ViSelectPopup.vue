<script setup>
import { computed, ref, useTemplateRef } from 'vue';
import ViPopup from './ViPopup.vue';

const emit = defineEmits(['update:modelValue', 'search', 'change']);
const props = defineProps({
  modelValue: {
    type: [String, Number, Object, Array]
  },
  options: {
    type: Array
  },
  disabled: {
    type: Boolean,
    default: false
  },
  compareKey: {
    type: String,
    default: 'id'
  },
  multiple: {
    type: Boolean,
    default: false
  }
});

const element = useTemplateRef('element');
const stageOptionIndex = ref(-1);

const selectedOption = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

function checkSelected(val) {
  let selected = selectedOption.value;

  if (props.multiple && Array.isArray(selected)) {
    if (typeof val === 'object' && val !== null) {
      return selected.some(
        (item) => item && item[props.compareKey] === val[props.compareKey]
      );
    } else {
      return selected.includes(val);
    }
  }
  return props.compareKey && val?.[props.compareKey] != undefined
    ? val?.[props.compareKey] == selected?.[props.compareKey]
    : val == selected;
}

function onOptionClick(option) {
  if (props.multiple) {
    let selected = Array.isArray(selectedOption.value)
      ? [...selectedOption.value]
      : [];
    let exists =
      props.compareKey && typeof option === 'object'
        ? selected.some(
            (item) =>
              item && item[props.compareKey] === option[props.compareKey]
          )
        : selected.includes(option);

    if (!exists) {
      selected.push(option);
    } else {
      selected = selected.filter((item) =>
        props.compareKey && typeof option === 'object'
          ? item && item[props.compareKey] !== option[props.compareKey]
          : item !== option
      );
    }
    selectedOption.value = selected;
  } else {
    selectedOption.value = option;
    element.value.closeList();
  }
  emit('change');
}

function handleKey(e) {
  if (props.options?.length) {
    if (e.code == 'ArrowDown') {
      e.preventDefault();
      element.value.openList();
      stageOptionIndex.value++;
      if (stageOptionIndex.value >= props.options?.length) {
        stageOptionIndex.value = props.options?.length - 1;
      }
    }
    if (e.code == 'ArrowUp') {
      e.preventDefault();
      element.value.openList();
      stageOptionIndex.value--;
      if (stageOptionIndex.value < 0) {
        stageOptionIndex.value = 0;
      }
    }
    if (e.code == 'Enter' && stageOptionIndex.value >= 0) {
      onOptionClick(props.options[stageOptionIndex.value]);
    }
    if (e.code == 'Space') {
      e.preventDefault();
      element.value.toggleList();
    }
    if (e.code === 'Delete') {
      element.value.closeList();
    }
  }
}

function closePopup() {
  setTimeout(() => {
    stageOptionIndex.value = -1;
  }, 100);
}
</script>

<template>
  <ViPopup
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
    <template #popupContent>
      <div class="grid gap-1 p-2">
        <div
          v-for="(option, index) in props.options"
          :key="index"
          class="block bg-white hover:bg-slate-50 hover:border-e-slate-200 hover:border-e-4 p-2 cursor-pointer rounded-sm relative"
          :class="{
            '!bg-slate-50 border-s-4 border-s-sky-400': checkSelected(option),
            '!bg-slate-50 border-e-slate-200 border-e-4':
              stageOptionIndex == index
          }"
          @click="onOptionClick(option)"
        >
          <slot :option="option" name="option" />
        </div>
      </div>
    </template>
  </ViPopup>
</template>
