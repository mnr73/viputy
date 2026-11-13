<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, watch } from "vue";
import { useValidation } from "../composables/useValidation";
import { useViputy } from "../i18n/config";
import {
  DEFAULT_SWATCHES,
  cleanHexInput,
  hexToRgb,
  normalizeHex,
  readableOn
} from "../utils/color";
import { localizeDigits } from "../utils/text";
import { pickField, type FieldProps } from "./field-props";
import ViField from "./ViField.vue";
import { ViIcon } from "./ViIcon";
import ViPopup from "./ViPopup.vue";

defineOptions({ inheritAttrs: false });

const popup = ref<InstanceType<typeof ViPopup>>();
const props = withDefaults(
  defineProps<
    FieldProps & {
      /** `#rrggbb` (or `#rrggbbaa` with `alpha`), lower case. */
      modelValue?: string | null;
      /** The swatches in the panel. Default: 40 common colours. */
      swatches?: string[];
      /** Allow an opacity (adds a slider; the value may end in two hex digits). */
      alpha?: boolean;
      /** Show a native colour picker button for any colour that is not a swatch (default on). */
      custom?: boolean;
      /** Show only the swatches and the hex box, no field text input. */
      placeholder?: string;
      clearable?: boolean;
      mobile?: "sheet" | "fullscreen" | false;
      autoScroll?: boolean;
      name?: string;
    }
  >(),
  { custom: true, mobile: "sheet", autoScroll: true, status: null }
);

const emit = defineEmits<{ "update:modelValue": [value: string | null] }>();
defineSlots<{ label?(): unknown; meta?(): unknown }>();

const attrs = useAttrs();
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const { t, locale } = useViputy();

const field = ref<InstanceType<typeof ViField>>();
const inputEl = ref<HTMLInputElement>();
const hexEl = ref<HTMLInputElement>();
const nativeEl = ref<HTMLInputElement>();
const grid = ref<HTMLElement>();
const open = ref(false);
const draft = ref<string | null>(null);

const list = computed(() =>
  (props.swatches ?? DEFAULT_SWATCHES)
    .map((c) => normalizeHex(c, true))
    .filter((c): c is string => !!c)
);
const COLS = 8;
const current = computed(() => normalizeHex(props.modelValue, props.alpha));
const alpha = computed(() => hexToRgb(current.value ?? "")?.a ?? 1);
const upper = (h: string | null) => (h ? h.toUpperCase() : "");
const text = ref(upper(current.value));
watch(current, (c) => {
  if (draft.value === null) text.value = upper(c);
});

const typedError = computed(() => {
  const d = draft.value;
  if (d === null || !d.replace("#", "").trim()) return null;
  return normalizeHex(d, props.alpha) ? null : t("invalidColor");
});

function set(hex: string | null) {
  const v = hex ? normalizeHex(hex, props.alpha) : null;
  if (v === current.value && v !== null) return;
  emit("update:modelValue", v);
  val.onChange();
}
function pick(hex: string) {
  draft.value = null;
  // opacity stays when a swatch is picked
  set(props.alpha && alpha.value < 1 ? withAlpha(hex, alpha.value) : hex);
}
function withAlpha(hex: string, a: number) {
  const base = normalizeHex(hex, true)!.slice(0, 7);
  return a >= 1
    ? base
    : base +
        Math.round(a * 255)
          .toString(16)
          .padStart(2, "0");
}
function setAlpha(a: number) {
  if (current.value) set(withAlpha(current.value, a));
}

// the box in the field: type a colour, Enter / blur applies it
function commit() {
  if (draft.value === null) return;
  const d = draft.value;
  draft.value = null;
  if (!d.replace("#", "").trim()) {
    if (props.modelValue) set(null);
    text.value = "";
    return;
  }
  const hex = normalizeHex(d, props.alpha);
  if (hex) set(hex);
  text.value = upper(normalizeHex(props.modelValue, props.alpha) ?? hex);
}
function onInput(e: Event) {
  const v = cleanHexInput((e.target as HTMLInputElement).value, props.alpha);
  (e.target as HTMLInputElement).value = v;
  draft.value = v;
  text.value = v;
  const hex = normalizeHex(v, props.alpha);
  if (hex && (v.length === 7 || v.length === 9)) set(hex); // live once complete
}
function clear() {
  draft.value = null;
  text.value = "";
  set(null);
}

// the HEX box inside the panel
const hexText = ref(upper(current.value));
watch([current, open], () => (hexText.value = upper(current.value)));
function onHex(e: Event) {
  const v = cleanHexInput((e.target as HTMLInputElement).value, props.alpha);
  (e.target as HTMLInputElement).value = v;
  hexText.value = v;
  const hex = normalizeHex(v, props.alpha);
  if (hex && (v.length === 7 || v.length === 9)) {
    draft.value = null;
    set(hex);
  }
}
const hexBad = computed(
  () =>
    !!hexText.value.replace("#", "") &&
    !normalizeHex(hexText.value, props.alpha)
);
function onHexKey(e: KeyboardEvent) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const hex = normalizeHex(hexText.value, props.alpha);
  if (hex) {
    set(hex);
    open.value = false;
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    commit();
    open.value = !open.value ? false : false;
  } else if (e.key === "ArrowDown" && !props.readonly && !props.disabled) {
    e.preventDefault();
    open.value = true;
  }
}

// swatch grid: arrows move by one / by a row, Home/End jump
function onGridKey(e: KeyboardEvent) {
  const btns = [...(grid.value?.querySelectorAll<HTMLElement>("button") ?? [])];
  const i = btns.indexOf(document.activeElement as HTMLElement);
  if (i < 0) return;
  const rtl = getComputedStyle(grid.value!).direction === "rtl";
  const step: Record<string, number> = {
    ArrowRight: rtl ? -1 : 1,
    ArrowLeft: rtl ? 1 : -1,
    ArrowDown: COLS,
    ArrowUp: -COLS
  };
  let to = i;
  if (e.key in step)
    to = Math.max(0, Math.min(btns.length - 1, i + step[e.key]!));
  else if (e.key === "Home") to = 0;
  else if (e.key === "End") to = btns.length - 1;
  else return;
  e.preventDefault();
  btns[to]?.focus();
}

// desktop: the selected swatch (or the first) takes focus so the arrows work at once. A phone sheet keeps its
// keyboard down. The popup shows the panel (`visibility: hidden`, so not focusable) until it is placed:
// try on the next frames until focus sticks.
function focusGrid() {
  const el = grid.value;
  if (!el || popup.value?.isSheet) return;
  const target =
    el.querySelector<HTMLElement>('[aria-pressed="true"]') ??
    el.querySelector<HTMLElement>("button");
  let tries = 0;
  const go = () => {
    target?.focus({ preventScroll: true });
    if (document.activeElement !== target && ++tries < 8)
      requestAnimationFrame(go);
  };
  go();
}
watch(grid, () => setTimeout(focusGrid, 0), { flush: "post" });
watch(open, (o) => {
  if (o) return;
  commit();
  val.onBlur();
});

const val = useValidation({
  value: () => props.modelValue,
  rules: () => props.rules,
  messages: () => props.messages,
  label: () => props.label,
  name: () => String(attrs.name ?? props.name ?? "") || undefined,
  validateOn: () => props.validateOn,
  focus: () => inputEl.value?.focus(),
  el: () => inputEl.value ?? null
});
const fieldProps = computed(() => {
  const f = pickField(props, {}, val.error.value);
  if (typedError.value) {
    f.status = "error";
    f.message = typedError.value;
  }
  return f;
});
const anchor = computed(
  () => (field.value?.control as HTMLElement | undefined) ?? null
);

function onInputClick() {
  if (!props.readonly && !props.disabled) open.value = true;
}
function onFrameClick(e: MouseEvent) {
  if (props.readonly || props.disabled) return;
  if ((e.target as HTMLElement).closest(".vi-clear")) return;
  // a click on the input itself already opened it: focusing the input again would steal the grid's focus
  if (e.target !== inputEl.value) inputEl.value?.focus();
  open.value = true;
}
const nativeValue = computed(() => (current.value ?? "#000000").slice(0, 7));
function onNative(e: Event) {
  const v = (e.target as HTMLInputElement).value;
  pick(v);
}
const pct = computed(() =>
  localizeDigits(Math.round(alpha.value * 100), locale.value)
);
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
    <template #before>
      <span
        class="vi-color__swatch"
        :data-empty="!current || undefined"
        :style="current ? { '--vi-swatch': current } : undefined"
        aria-hidden="true"
      />
    </template>
    <template #default="{ id }">
      <input
        v-bind="{ ...attrs, class: undefined, style: undefined }"
        :id="id"
        ref="inputEl"
        class="vi-native vi-color__input"
        type="text"
        dir="ltr"
        :inputmode="popup?.isSheet ? 'none' : 'text'"
        autocomplete="off"
        spellcheck="false"
        :value="text"
        :placeholder="
          props.placeholder ?? (props.alpha ? '#RRGGBBAA' : '#RRGGBB')
        "
        :disabled="props.disabled || undefined"
        :readonly="props.readonly || undefined"
        :required="props.required || undefined"
        :aria-invalid="!!typedError || props.status === 'error' || undefined"
        aria-haspopup="dialog"
        :aria-expanded="open"
        @input="onInput"
        @blur="
          commit();
          if (!open) val.onBlur();
        "
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
        v-if="props.clearable && current && !props.disabled && !props.readonly"
        type="button"
        class="vi-clear"
        tabindex="-1"
        :aria-label="t('clear')"
        @mousedown.prevent
        @click.stop="clear"
      >
        <ViIcon name="close" :size="11" :width="3.5" />
      </button>
      <ViIcon
        class="vi-select__chevron"
        :class="{ 'is-open': open }"
        name="chevron"
        :size="18"
        :width="2"
      />
    </template>
  </ViField>
  <ViPopup
    ref="popup"
    v-model="open"
    :auto-scroll="props.autoScroll"
    :anchor="anchor"
    :mobile="props.mobile"
    :title="props.label ?? t('pickColor')"
  >
    <template #default="{ sheet }">
      <div class="vi-color">
        <div
          ref="grid"
          class="vi-color__grid"
          role="group"
          :aria-label="props.label ?? t('pickColor')"
          :style="{ '--vi-color-cols': COLS }"
          @keydown="onGridKey"
        >
          <button
            v-for="c in list"
            :key="c"
            type="button"
            class="vi-color__sw"
            :class="{ 'is-on': c === current }"
            :style="{
              '--vi-swatch': c,
              '--vi-on-swatch': readableOn(c.slice(0, 7))
            }"
            :aria-pressed="c === current"
            :aria-label="t('swatchOf', { hex: c.toUpperCase() })"
            :title="c.toUpperCase()"
            @click="pick(c)"
          >
            <ViIcon v-if="c === current" name="check" :size="14" :width="3" />
          </button>
        </div>
        <div v-if="props.alpha" class="vi-color__alpha">
          <span class="vi-color__label">{{ t("colorAlpha") }}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="alpha"
            :disabled="!current"
            :aria-label="t('colorAlpha')"
            @input="setAlpha(+($event.target as HTMLInputElement).value)"
          />
          <span class="vi-color__pct">{{ pct }}%</span>
        </div>
        <div class="vi-color__row">
          <span class="vi-color__label">HEX</span>
          <input
            ref="hexEl"
            class="vi-color__hex"
            :class="{ 'is-bad': hexBad }"
            type="text"
            dir="ltr"
            autocomplete="off"
            spellcheck="false"
            :value="hexText"
            :placeholder="props.alpha ? '#RRGGBBAA' : '#RRGGBB'"
            :aria-label="t('colorHex')"
            :aria-invalid="hexBad || undefined"
            @input="onHex"
            @keydown="onHexKey"
          />
          <label
            v-if="props.custom"
            class="vi-color__native"
            :title="t('colorCustom')"
          >
            <input
              ref="nativeEl"
              type="color"
              :value="nativeValue"
              :aria-label="t('colorCustom')"
              @input="onNative"
            />
            <span class="vi-color__rainbow" aria-hidden="true" />
          </label>
          <button
            v-if="!sheet"
            type="button"
            class="vi-btn vi-btn--sm vi-btn--primary"
            @click="open = false"
          >
            {{ t("confirm") }}
          </button>
        </div>
      </div>
    </template>
    <template #footer="{ close }">
      <div class="vi-sheet__actions">
        <button
          type="button"
          class="vi-btn"
          :disabled="!current"
          @click="clear"
        >
          {{ t("clear") }}
        </button>
        <button type="button" class="vi-btn vi-btn--primary" @click="close">
          {{ t("confirm") }}
        </button>
      </div>
    </template>
  </ViPopup>
</template>
