<script setup lang="ts">
import { computed, ref, useAttrs, watch } from "vue";
import {
  formatTime,
  fromTimeString,
  parseTime,
  toTimeString
} from "../date/time";
import { useViputy } from "../i18n/config";
import { pickField, type FieldProps } from "./field-props";
import ViField from "./ViField.vue";
import { ViIcon } from "./ViIcon";
import ViPopup from "./ViPopup.vue";
import ViTimePanel from "./ViTimePanel.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    FieldProps & {
      /** `HH:mm` or `HH:mm:ss` (24-hour, ASCII) - the same on the wire whatever is displayed. */
      modelValue?: string | null;
      seconds?: boolean;
      hour12?: boolean;
      minuteStep?: number;
      /** `HH:mm[:ss]` bounds. */
      min?: string;
      max?: string;
      placeholder?: string;
      clearable?: boolean;
      mobile?: "sheet" | "fullscreen" | false;
      /** Scroll the page a little when the panel fits neither above nor below (default). */
      autoScroll?: boolean;
      name?: string;
    }
  >(),
  { minuteStep: 1, mobile: "sheet", autoScroll: true, status: null }
);

const emit = defineEmits<{ "update:modelValue": [value: string | null] }>();
defineSlots<{ label?(): unknown; meta?(): unknown }>();

const attrs = useAttrs();
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const { t, locale } = useViputy();

const field = ref<InstanceType<typeof ViField>>();
const inputEl = ref<HTMLInputElement>();
const open = ref(false);
const draft = ref<string | null>(null);

const sec = computed(() => fromTimeString(props.modelValue));
const min = computed(() => fromTimeString(props.min));
const max = computed(() => fromTimeString(props.max));
const show = (s: number | null) =>
  s === null
    ? ""
    : formatTime(s, {
        seconds: props.seconds,
        hour12: props.hour12,
        locale: locale.value
      });
const text = ref(show(sec.value));
watch([sec, () => props.seconds, () => props.hour12, locale], () => {
  if (draft.value === null) text.value = show(sec.value);
});

const bad = (s: number) =>
  (min.value !== null && s < min.value) ||
  (max.value !== null && s > max.value);
const typedError = computed(() => {
  if (draft.value === null || !draft.value.trim()) return null;
  const s = parseTime(draft.value);
  if (s === null) return t("invalidTime");
  return bad(s) ? t("outOfRange") : null;
});

const out = (s: number) => toTimeString(s, props.seconds);

function commit() {
  if (draft.value === null) return;
  const s = draft.value.trim() ? parseTime(draft.value) : undefined;
  draft.value = null;
  if (s === undefined) {
    if (props.modelValue) emit("update:modelValue", null);
    text.value = "";
  } else if (s !== null && !bad(s)) {
    emit("update:modelValue", out(s));
    text.value = show(s);
  } else {
    text.value = show(sec.value);
  }
}
function onInput(e: Event) {
  draft.value = (e.target as HTMLInputElement).value;
  text.value = draft.value;
}
function onPick(s: number) {
  draft.value = null;
  emit("update:modelValue", out(s));
}
function clear() {
  draft.value = null;
  text.value = "";
  emit("update:modelValue", null);
}
watch(open, (o) => !o && commit());
function onKey(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    commit();
    open.value = false;
  } else if (e.key === "ArrowDown" && !props.readonly) {
    e.preventDefault();
    open.value = true;
  }
}

const anchor = computed(
  () => (field.value?.control as HTMLElement | undefined) ?? null
);
const fieldProps = computed(() => {
  const f = pickField(props);
  if (typedError.value) {
    f.status = "error";
    f.message = typedError.value;
  }
  return f;
});
const placeholder = computed(
  () =>
    props.placeholder ??
    formatTime(0, {
      seconds: props.seconds,
      hour12: props.hour12,
      locale: locale.value
    }).replace(/[0-9]/g, "0")
);
/** Click/tap opens the popup. Plain focus must not: closing the popup returns focus here. */
function onInputClick() {
  if (!props.readonly && !props.disabled) open.value = true;
}
/** Anywhere on the frame (padding, icon, empty space) focuses the input and opens the popup. */
function onFrameClick(e: MouseEvent) {
  if (props.readonly || props.disabled) return;
  if ((e.target as HTMLElement).closest(".vi-clear")) return;
  inputEl.value?.focus();
  open.value = true;
}
defineExpose({ focus: () => inputEl.value?.focus() });
</script>

<template>
  <ViField
    ref="field"
    v-bind="{ ...fieldProps, ...rootAttrs }"
    :active="open"
    @control-click="onFrameClick"
  >
    <template #label
      ><slot name="label">{{ props.label }}</slot></template
    >
    <template v-if="$slots.meta" #meta><slot name="meta" /></template>
    <template #before
      ><ViIcon class="vi-date__icon" name="clock" :size="18" :width="2"
    /></template>
    <template #default="{ id }">
      <input
        v-bind="{ ...attrs, class: undefined, style: undefined }"
        :id="id"
        ref="inputEl"
        class="vi-native vi-date__input"
        type="text"
        dir="ltr"
        inputmode="numeric"
        autocomplete="off"
        :value="text"
        :placeholder="placeholder"
        :disabled="props.disabled || undefined"
        :readonly="props.readonly || undefined"
        :required="props.required || undefined"
        :aria-invalid="!!typedError || props.status === 'error' || undefined"
        @input="onInput"
        @blur="commit"
        @keydown="onKey"
        @click="onInputClick"
      />
      <input
        v-if="props.name"
        type="hidden"
        :name="props.name"
        :value="props.modelValue ?? ''"
      />
    </template>
    <template #after>
      <button
        v-if="
          props.clearable && sec !== null && !props.disabled && !props.readonly
        "
        type="button"
        class="vi-clear"
        tabindex="-1"
        :aria-label="t('clear')"
        @mousedown.prevent
        @click.stop="clear"
      >
        <ViIcon name="close" :size="11" :width="3.5" />
      </button>
    </template>
  </ViField>
  <ViPopup
    :auto-scroll="props.autoScroll"
    v-model="open"
    :anchor="anchor"
    :mobile="props.mobile"
    :title="props.label ?? t('pickTime')"
  >
    <div class="vi-timepop">
      <ViTimePanel
        :model-value="sec"
        :seconds="props.seconds"
        :hour12="props.hour12"
        :minute-step="props.minuteStep"
        :min="min"
        :max="max"
        @update:model-value="onPick"
      />
      <div class="vi-timepop__foot">
        <span v-if="props.min || props.max" class="vi-counter"
          >{{ props.min ?? "" }} – {{ props.max ?? "" }}</span
        >
        <button
          type="button"
          class="vi-btn vi-btn--sm vi-btn--primary"
          @click="open = false"
        >
          {{ t("confirm") }}
        </button>
      </div>
    </div>
  </ViPopup>
</template>
