<script setup lang="ts">
import { computed, ref, useAttrs, watch } from "vue";
import { type CalendarId } from "../date/calendar";
import { digits, format, parseUserInput } from "../date/format";
import { PlainDateTime } from "../date/plain";
import { dayOutside, parseBound } from "../date/range";
import {
  ALL_PRESETS,
  presetRange,
  spanDays,
  type PresetKey,
  type RangeValue
} from "../date/presets";
import { useViputy } from "../i18n/config";
import type { MessageKey } from "../i18n/messages";
import { pickField, type FieldProps } from "./field-props";
import ViCalendar from "./ViCalendar.vue";
import ViField from "./ViField.vue";
import { ViIcon } from "./ViIcon";
import ViPopup from "./ViPopup.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    FieldProps & {
      /** `{ start, end }` as ISO dates (`YYYY-MM-DD`). Either may be null. */
      modelValue?: RangeValue | null;
      calendars?: CalendarId[];
      calendar?: CalendarId;
      min?: string;
      max?: string;
      isDisabled?: (iso: string) => boolean;
      marked?: string[];
      /** Months side by side (default 2 on wide screens). */
      months?: number;
      /** Quick ranges shown beside the calendar: `true` for all, or a list. `false` hides them. */
      presets?: boolean | PresetKey[];
      /** Longest range allowed, in days. */
      maxDays?: number;
      /** Allow start and end to be the same day. Default true. */
      allowSameDay?: boolean;
      /** Show the number of days in the footer. */
      showCount?: boolean;
      placeholder?: string;
      clearable?: boolean;
      mobile?: "sheet" | "fullscreen" | false;
      /** Scroll the page a little when the panel fits neither above nor below (default). */
      autoScroll?: boolean;
      /** Hidden inputs `name[start]` / `name[end]` for native forms. */
      name?: string;
      weekStart?: number;
      weekend?: number[];
    }
  >(),
  {
    calendars: () => ["jalali", "gregorian"],
    months: 2,
    presets: true,
    allowSameDay: true,
    showCount: true,
    mobile: "sheet",
    autoScroll: true,
    status: null
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: RangeValue];
  open: [];
  close: [];
}>();
defineSlots<{ label?(): unknown; meta?(): unknown }>();

const attrs = useAttrs();
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const { t, locale } = useViputy();
const n = (v: number | string) => digits(v, locale.value);

const field = ref<InstanceType<typeof ViField>>();
const startEl = ref<HTMLInputElement>();
const endEl = ref<HTMLInputElement>();
const open = ref(false);
const calendar = ref<CalendarId>(
  props.calendar ?? props.calendars[0] ?? "gregorian"
);
watch(
  () => props.calendar,
  (c) => c && (calendar.value = c)
);

const min = computed(() => parseBound(props.min, "min"));
const max = computed(() => parseBound(props.max, "max"));
const start = computed(() => PlainDateTime.fromISO(props.modelValue?.start));
const end = computed(() => PlainDateTime.fromISO(props.modelValue?.end));

/** Which end the next calendar click sets. */
const picking = ref<"start" | "end">("start");
const pending = ref<PlainDateTime | null>(null); // start chosen, waiting for end
watch(open, (o) => {
  if (o) {
    emit("open");
    picking.value = "start";
    pending.value = null;
  } else {
    emit("close");
    pending.value = null;
  }
});

// ---- text fields
const pattern = computed(() =>
  calendar.value === "jalali" || locale.value.startsWith("fa")
    ? "yyyy/MM/dd"
    : "yyyy-MM-dd"
);
const show = (d: PlainDateTime | null) =>
  d
    ? format(d, pattern.value, {
        calendar: calendar.value,
        locale: locale.value
      })
    : "";
const texts = ref({ start: show(start.value), end: show(end.value) });
const drafts = ref<{ start: string | null; end: string | null }>({
  start: null,
  end: null
});
watch([start, end, calendar, pattern, locale], () => {
  if (drafts.value.start === null) texts.value.start = show(start.value);
  if (drafts.value.end === null) texts.value.end = show(end.value);
});

const outside = (d: PlainDateTime) =>
  dayOutside(d.days, min.value, max.value) ||
  !!props.isDisabled?.(d.toISODate());
function parseText(s: string): PlainDateTime | null | undefined {
  if (!s.trim()) return undefined;
  const p = parseUserInput(s);
  return p ? PlainDateTime.fromObject(p.date, p.calendar) : null;
}

/** Check a candidate range; returns an error text or null. */
function validate(
  a: PlainDateTime | null,
  b: PlainDateTime | null
): string | null {
  if (a && outside(a)) return t("outOfRange");
  if (b && outside(b)) return t("outOfRange");
  if (a && b) {
    if (b.days < a.days) return t("endBeforeStart");
    if (!props.allowSameDay && a.days === b.days) return t("endBeforeStart");
    if (props.maxDays && spanDays(a, b) > props.maxDays) return t("outOfRange");
  }
  return null;
}

const typedError = computed(() => {
  const d = drafts.value;
  if (d.start === null && d.end === null) return null;
  const sp = d.start !== null ? parseText(d.start) : start.value;
  const ep = d.end !== null ? parseText(d.end) : end.value;
  if (sp === null || ep === null) return t("invalidDate");
  return validate(sp ?? null, ep ?? null);
});

function emitRange(a: PlainDateTime | null, b: PlainDateTime | null) {
  emit("update:modelValue", {
    start: a?.toISODate() ?? null,
    end: b?.toISODate() ?? null
  });
}
function onInput(which: "start" | "end", e: Event) {
  const v = (e.target as HTMLInputElement).value;
  drafts.value[which] = v;
  texts.value[which] = v;
}
function commit(which: "start" | "end") {
  const draft = drafts.value[which];
  if (draft === null) return;
  drafts.value[which] = null;
  const parsed = parseText(draft);
  const next = parsed === undefined ? null : parsed;
  const a = which === "start" ? next : start.value;
  const b = which === "end" ? next : end.value;
  if (parsed === null || validate(a, b)) {
    texts.value[which] = show(which === "start" ? start.value : end.value);
    return;
  }
  emitRange(a, b);
  texts.value[which] = show(next);
}

// ---- calendar interplay
function onDay(iso: string) {
  const d = PlainDateTime.fromISO(iso)!;
  if (picking.value === "start" || !pending.value) {
    pending.value = d;
    picking.value = "end";
    emitRange(d, null);
    return;
  }
  let a = pending.value;
  let b = d;
  if (b.days < a.days) [a, b] = [b, a];
  if (!props.allowSameDay && a.days === b.days) return;
  if (props.maxDays && spanDays(a, b) > props.maxDays) {
    b = a.plus({ days: props.maxDays - 1 });
    if (outside(b)) return;
  }
  pending.value = null;
  picking.value = "start";
  emitRange(a, b);
  open.value = false;
}
const hover = ref<string | null>(null);
const calStart = computed(() => start.value?.toISODate() ?? null);
const calEnd = computed(() =>
  picking.value === "end" ? null : (end.value?.toISODate() ?? null)
);

const presetList = computed<PresetKey[]>(() =>
  props.presets === false
    ? []
    : props.presets === true
      ? ALL_PRESETS
      : props.presets
);
const presetLabel: Record<PresetKey, MessageKey> = {
  today: "today",
  yesterday: "yesterday",
  last7: "last7",
  last30: "last30",
  thisMonth: "thisMonth",
  lastMonth: "lastMonth"
};
const activePreset = computed<PresetKey | "custom">(() => {
  if (!start.value || !end.value) return "custom";
  const now = PlainDateTime.now();
  for (const k of presetList.value) {
    const [a, b] = presetRange(k, now, calendar.value);
    if (a.equals(start.value) && b.startOf("day").equals(end.value)) return k;
  }
  return "custom";
});
const now = ref<PlainDateTime | null>(null);
watch(open, (o) => o && (now.value = PlainDateTime.now()));
function applyPreset(k: PresetKey) {
  const [a, b] = presetRange(
    k,
    now.value ?? PlainDateTime.now(),
    calendar.value
  );
  if (validate(a, b)) return;
  emitRange(a, b);
  pending.value = null;
  picking.value = "start";
  open.value = false;
}
const isPresetOff = (k: PresetKey) => {
  const [a, b] = presetRange(
    k,
    now.value ?? PlainDateTime.now(),
    calendar.value
  );
  return !!validate(a, b);
};

function clear() {
  drafts.value = { start: null, end: null };
  texts.value = { start: "", end: "" };
  pending.value = null;
  picking.value = "start";
  emit("update:modelValue", { start: null, end: null });
}

const hasValue = computed(() => !!start.value || !!end.value);
const count = computed(() => {
  const a = start.value;
  const b =
    picking.value === "end" && hover.value
      ? PlainDateTime.fromISO(hover.value)
      : end.value;
  return a && b ? spanDays(a, b) : null;
});
const summary = computed(() => {
  if (picking.value === "end") return t("pickEnd");
  if (start.value && end.value)
    return `${show(start.value)} ${t("rangeTo")} ${show(end.value)}`;
  return t("pickRange");
});

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
const ph = computed(() =>
  digits(
    pattern.value.startsWith("yyyy/") ? "1405/01/01" : "2026-01-01",
    locale.value
  )
);
function onClick() {
  if (!props.readonly && !props.disabled) open.value = true;
}
function onKey(which: "start" | "end", e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    commit(which);
    if (which === "start") endEl.value?.focus();
    else open.value = false;
  } else if (e.key === "ArrowDown" && !props.readonly) {
    e.preventDefault();
    open.value = true;
  }
}
const sheetTitle = computed(() => t("pickRange"));
/** Anywhere on the frame focuses the first field (or the second when the click is on its side) and opens. */
function onFrameClick(e: MouseEvent) {
  if (props.readonly || props.disabled) return;
  const target = e.target as HTMLElement;
  if (target.closest(".vi-clear") || target.closest(".vi-range__input")) return;
  (picking.value === "end" ? endEl.value : startEl.value)?.focus();
  open.value = true;
}
defineExpose({
  focus: () => startEl.value?.focus(),
  open: () => (open.value = true),
  close: () => (open.value = false)
});
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
      ><ViIcon class="vi-date__icon" name="calendar" :size="18" :width="2"
    /></template>
    <template #default="{ id }">
      <div class="vi-range">
        <input
          :id="id"
          ref="startEl"
          class="vi-native vi-range__input"
          dir="ltr"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          :aria-label="t('from')"
          :value="texts.start"
          :placeholder="ph"
          :disabled="props.disabled || undefined"
          :readonly="props.readonly || undefined"
          :aria-invalid="!!typedError || props.status === 'error' || undefined"
          :data-picking="(open && picking === 'start') || undefined"
          @input="onInput('start', $event)"
          @blur="commit('start')"
          @keydown="onKey('start', $event)"
          @click="onClick"
        />
        <span class="vi-range__arrow" aria-hidden="true"></span>
        <input
          ref="endEl"
          class="vi-native vi-range__input"
          dir="ltr"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          :aria-label="t('to')"
          :value="texts.end"
          :placeholder="ph"
          :disabled="props.disabled || undefined"
          :readonly="props.readonly || undefined"
          :aria-invalid="!!typedError || props.status === 'error' || undefined"
          :data-picking="(open && picking === 'end') || undefined"
          @input="onInput('end', $event)"
          @blur="commit('end')"
          @keydown="onKey('end', $event)"
          @click="onClick"
        />
      </div>
      <template v-if="props.name">
        <input
          type="hidden"
          :name="`${props.name}[start]`"
          :value="props.modelValue?.start ?? ''"
        />
        <input
          type="hidden"
          :name="`${props.name}[end]`"
          :value="props.modelValue?.end ?? ''"
        />
      </template>
    </template>
    <template #after>
      <button
        v-if="props.clearable && hasValue && !props.disabled && !props.readonly"
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
    :title="sheetTitle"
  >
    <template #default="{ sheet }">
      <div class="vi-date vi-daterange" :data-sheet="sheet || undefined">
        <div class="vi-daterange__body">
          <div
            v-if="presetList.length && !sheet"
            class="vi-presets"
            role="group"
            :aria-label="t('pickRange')"
          >
            <button
              v-for="k in presetList"
              :key="k"
              type="button"
              class="vi-preset"
              :aria-pressed="activePreset === k"
              :disabled="isPresetOff(k)"
              @click="applyPreset(k)"
            >
              {{ t(presetLabel[k]) }}
            </button>
            <button
              type="button"
              class="vi-preset"
              :aria-pressed="activePreset === 'custom'"
              tabindex="-1"
            >
              {{ t("custom") }}
            </button>
          </div>
          <div class="vi-daterange__main">
            <div
              v-if="presetList.length && sheet"
              class="vi-presets vi-presets--row"
              role="group"
              :aria-label="t('pickRange')"
            >
              <button
                v-for="k in presetList"
                :key="k"
                type="button"
                class="vi-preset"
                :aria-pressed="activePreset === k"
                :disabled="isPresetOff(k)"
                @click="applyPreset(k)"
              >
                {{ t(presetLabel[k]) }}
              </button>
            </div>
            <ViCalendar
              :model-value="null"
              :range-start="calStart"
              :range-end="calEnd"
              :calendar="calendar"
              :min="props.min"
              :max="props.max"
              :marked="props.marked"
              :is-disabled="props.isDisabled"
              :months="sheet ? 1 : props.months"
              :week-start="props.weekStart"
              :weekend="props.weekend"
              @update:model-value="onDay"
              @hover="hover = $event"
            />
          </div>
        </div>
        <div v-if="!sheet" class="vi-date__foot">
          <div
            v-if="props.calendars.length > 1"
            class="vi-seg"
            role="group"
            :aria-label="t('calendarSwitch')"
          >
            <button
              v-for="c in props.calendars"
              :key="c"
              type="button"
              class="vi-seg__btn"
              :aria-pressed="calendar === c"
              @click="calendar = c"
            >
              {{ t(c) }}
            </button>
          </div>
          <span class="vi-date__summary">{{ summary }}</span>
          <span v-if="props.showCount && count" class="vi-counter">{{
            t("daysCount", { n: n(count) })
          }}</span>
        </div>
      </div>
    </template>
    <template #footer="{ close }">
      <div class="vi-date__foot">
        <div class="vi-date__parts">
          <div class="vi-date__part" data-static>
            <span>{{ summary }}</span>
            <small v-if="props.showCount && count">{{
              t("daysCount", { n: n(count) })
            }}</small>
          </div>
        </div>
        <div
          v-if="props.calendars.length > 1"
          class="vi-seg"
          role="group"
          :aria-label="t('calendarSwitch')"
        >
          <button
            v-for="c in props.calendars"
            :key="c"
            type="button"
            class="vi-seg__btn"
            :aria-pressed="calendar === c"
            @click="calendar = c"
          >
            {{ t(c) }}
          </button>
        </div>
        <button type="button" class="vi-btn vi-btn--sm" @click="clear">
          {{ t("clear") }}
        </button>
        <button
          type="button"
          class="vi-btn vi-btn--sm vi-btn--primary"
          :disabled="picking === 'end'"
          @click="close"
        >
          {{ t("apply") }}
        </button>
      </div>
    </template>
  </ViPopup>
</template>
