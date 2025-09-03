<script setup lang="ts">
import { computed, ref } from 'vue';
import ViDropdown from './ViDropdown.vue';

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'search', value: string | null): void;
  (e: 'change'): void;
  (e: 'empty'): void;
}>();

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | object | null | Array<any>;
    options?: (string | number | object)[];
    title?: string | null;
    placeholder?: string | null;
    status?: 'error' | 'warning' | 'true' | null;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    noFrame?: boolean;
    fullPopup?: boolean;
    compareKey?: string;
    filter?: boolean | string[];
    search?: boolean;
    multiple?: boolean;
  }>(),
  {
    title: null,
    placeholder: null,
    status: null,
    disabled: false,
    readonly: false,
    required: false,
    noFrame: false,
    fullPopup: false,
    compareKey: 'id',
    filter: false,
    search: false,
    multiple: false
  }
);

const element = ref<typeof ViDropdown>();
const searchInput = ref<HTMLInputElement>();

const stageOptionIndex = ref<number>(-1);
const filterText = ref<string | null>(null);

const selectedOption = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
  }
});

const optionsFiltered = computed(() => {
  stageOptionIndex.value = 0;
  if (!props.options) return [];
  if (!filterText.value) return props.options;

  if (props.filter !== false) {
    return props.options.filter((item) => {
      stageOptionIndex.value = 0;

      if (typeof item === 'object' && item !== null) {
        if (props.filter === true) {
          return Object.values(item)
            .join(' ')
            .toLowerCase()
            .includes(filterText.value!.toLowerCase());
        } else if (Array.isArray(props.filter)) {
          return props.filter
            .map((key) =>
              key
                .split('.')
                .reduce(
                  (acc: Record<string, any>, k: string) =>
                    acc && acc[k] !== undefined ? acc[k] : '',
                  item as Record<string, any>
                )
            )
            .join(' ')
            .toLowerCase()
            .includes(filterText.value!.toLowerCase());
        }
        return false;
      } else {
        return String(item)
          .toLowerCase()
          .includes(filterText.value!.toLowerCase());
      }
    });
  }
  return props.options;
});

function checkSelected(val: any): boolean {
  const selected = selectedOption.value;

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
    ? val?.[props.compareKey] == (selected as any)?.[props.compareKey]
    : val == selected;
}

function onOptionClick(option: any) {
  filterText.value = null;

  if (props.multiple) {
    let selected = Array.isArray(selectedOption.value)
      ? [...selectedOption.value]
      : [];

    const exists =
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
    element.value?.closeList();
  }

  element.value?.focusInput();
  emit('change');
}

function handleKey(e: KeyboardEvent) {
  if (element.value?.isOpen()) {
    e.stopPropagation();
  }

  if (optionsFiltered.value?.length) {
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      element.value?.openList();
      stageOptionIndex.value = Math.min(
        stageOptionIndex.value + 1,
        optionsFiltered.value.length - 1
      );
      if (element.value) {
        element.value.$el
          ?.querySelector(`[option-index="${stageOptionIndex.value}"]`)
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
      }
    }

    if (e.code === 'ArrowUp') {
      e.preventDefault();
      element.value?.openList();
      stageOptionIndex.value = Math.max(stageOptionIndex.value - 1, 0);
    }

    if (e.key === 'Enter' && stageOptionIndex.value >= 0) {
      e.preventDefault();
      onOptionClick(optionsFiltered.value[stageOptionIndex.value]);
    }

    if (e.code == 'Escape') {
      element.value?.closeList();
      e.preventDefault();
    }

    if (e.code == 'Space' && !element.value?.isOpen()) {
      element.value?.openList();
      e.preventDefault();
    }

    if (e.code === 'Delete') {
      clearInput();
    }

    if (
      (e.code === 'Tab' || (e.code === 'KeyF' && e.ctrlKey)) &&
      (props.filter !== false || props.search)
    ) {
      e.preventDefault();
      element.value?.openList();
      setTimeout(() => searchInput.value?.focus(), 10);
    }
  }
}

function closePopup() {
  setTimeout(() => {
    stageOptionIndex.value = -1;
  }, 100);
}

function openPopup() {
  if (props.filter !== false || props.search) {
    setTimeout(() => searchInput.value?.focus(), 10);
  }
}

function clearInput() {
  selectedOption.value = props.multiple ? [] : null;
  emit('change');
  emit('empty');
}

function focusInput() {
  element.value?.focusInput();
  element.value?.openList();
  openPopup();
}

function search() {
  if (stageOptionIndex.value < 0) {
    stageOptionIndex.value = 0;
  }
  emit('search', filterText.value);
}

defineExpose({ focusInput });
</script>

<template>
  <ViDropdown
    :title="props.title"
    :status="props.status"
    :disabled="props.disabled"
    :required="props.required"
    :noFrame="props.noFrame"
    :fullPopup="props.fullPopup"
    @keydown="handleKey"
    ref="element"
    @closePopup="closePopup"
    @openPopup="openPopup"
    :actionKeys="false"
  >
    <template #after>
      <span
        class="w-5 aspect-square p-[1px] rounded-full bg-slate-500 hover:bg-red-500 cursor-pointer text-white flex items-center justify-center"
        @click="clearInput"
        v-show="
          (selectedOption && !props.multiple) ||
          (Array.isArray(selectedOption) &&
            props.multiple &&
            selectedOption.length)
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-full"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="m18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6"
            color="currentColor"
          />
        </svg>
      </span>
    </template>
    <template #label>
      <div class="whitespace-nowrap overflow-hidden text-ellipsis w-full">
        <slot name="label" :selected="selectedOption">
          select your option
        </slot>
      </div>
    </template>

    <template #popup>
      <div v-if="props.filter !== false || props.search === true">
        <input
          ref="searchInput"
          v-model="filterText"
          type="text"
          class="bg-slate-50 w-full rounded-md p-1 outline-0 mb-1 border border-slate-100"
          placeholder="search"
          @input="search"
        />
      </div>
      <div
        class="max-h-[300px] overflow-y-auto grid gap-1"
        style="scrollbar-width: thin"
      >
        <div
          v-for="(option, index) in optionsFiltered"
          :key="index"
          class="flex items-center bg-white hover:bg-slate-100 hover:border-e-slate-200 hover:border-e-4 p-2 cursor-pointer rounded-sm relative dark:hover:bg-zinc-600 dark:bg-zinc-700"
          :class="{
            '!bg-slate-100 border-s-4 border-s-sky-400 dark:!bg-zinc-800':
              checkSelected(option),
            '!bg-slate-100 border-e-slate-200 border-e-4 dark:!bg-zinc-700':
              stageOptionIndex == index
          }"
          :option-index="index"
          @click="onOptionClick(option)"
        >
          <span
            v-show="stageOptionIndex == index"
            class="block size-2 bg-sky-500 rounded-full me-2"
          ></span>
          <span><slot :option="option" name="option" /></span>
        </div>
      </div>
    </template>
  </ViDropdown>
</template>
