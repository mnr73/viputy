<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, watch } from "vue";
import { getCalendar, type CalendarId } from "../date/calendar";
import { digits, format, parseUserInput } from "../date/format";
import { PlainDateTime } from "../date/plain";
import { dayOutside, parseBound } from "../date/range";
import { formatTime, parseTime } from "../date/time";
import { useViputy } from "../i18n/config";
import { pickField, type FieldProps } from "./field-props";
import ViCalendar from "./ViCalendar.vue";
import ViDateFoot from "./ViDateFoot.vue";
import ViField from "./ViField.vue";
import { ViIcon } from "./ViIcon";
import ViPopup from "./ViPopup.vue";
import ViTimePanel from "./ViTimePanel.vue";
import { useValidation } from "../composables/useValidation";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    FieldProps & {
      /** ISO: `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm[:ss]` when `time` is on. */
      modelValue?: string | null;
      /** Calendars the user can switch between. A single value hides the switch. */
      calendars?: CalendarId[];
      /** Starting calendar. Default: first of `calendars`. */
      calendar?: CalendarId;
      /** Also pick a time: `"hm"` or `"hms"`. */
      time?: false | "hm" | "hms";
      hour12?: boolean;
      minuteStep?: number;
      /** ISO bounds. A date-only `max` includes that whole day. */
      min?: string;
      max?: string;
      isDisabled?: (iso: string) => boolean;
      /** Days to outline (ISO). */
      marked?: string[];
      /** Months side by side (1 or 2). */
      months?: number;
      placeholder?: string;
      clearable?: boolean;
      /** Output pattern for the closed field. Default depends on `time`. */
      displayFormat?: string;
      /** Narrow screens: bottom sheet, full screen, or keep the popover. */
      mobile?: "sheet" | "fullscreen" | false;
      /** Scroll the page a little when the panel fits neither above nor below (default). */
      autoScroll?: boolean;
      /** Adds a hidden input with the ISO value for native forms. */
      name?: string;
      weekStart?: number;
      weekend?: number[];
    }
  >(),
  {
    calendars: () => ["jalali", "gregorian"],
    time: false,
    minuteStep: 1,
    months: 1,
    mobile: "sheet",
    autoScroll: true,
    status: null
  }
);

const emit = defineEmits<{
  "update:modelValue": [iso: string | null];
  open: [];
  close: [];
}>();
defineSlots<{ label?(): unknown; meta?(): unknown; before?(): unknown }>();

const attrs = useAttrs();
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const { t, locale } = useViputy();

const field = ref<InstanceType<typeof ViField>>();
const popup = ref<InstanceType<typeof ViPopup>>();
const inputEl = ref<HTMLInputElement>();
const open = ref(false);
const draft = ref<string | null>(null);
const calendar = ref<CalendarId>(
  props.calendar ?? props.calendars[0] ?? "gregorian"
);
watch(
  () => props.calendar,
  (c) => c && (calendar.value = c)
);

const withTime = computed(() => props.time !== false);
const withSeconds = computed(() => props.time === "hms");
const min = computed(() => parseBound(props.min, "min"));
const max = computed(() => parseBound(props.max, "max"));
const value = computed(() => PlainDateTime.fromISO(props.modelValue));

const pattern = computed(() => {
  if (props.displayFormat) return props.displayFormat;
  return calendar.value === "jalali" || locale.value.startsWith("fa")
    ? "yyyy/MM/dd"
    : "yyyy-MM-dd";
});
const showDate = (dt: PlainDateTime) =>
  format(dt, pattern.value, { calendar: calendar.value, locale: locale.value });
const showTime = (dt: PlainDateTime) =>
  formatTime(dt.seconds, {
    seconds: withSeconds.value,
    hour12: props.hour12,
    locale: locale.value
  });
const showText = (dt: PlainDateTime | null) => {
  if (!dt) return "";
  return withTime.value ? `${showDate(dt)} ${showTime(dt)}` : showDate(dt);
};
const text = ref(showText(value.value));
watch(
  [value, calendar, pattern, () => props.hour12, () => props.time, locale],
  () => {
    if (draft.value === null) text.value = showText(value.value);
  }
);

// ---- validation
const outside = (dt: PlainDateTime) => {
  if (
    dayOutside(dt.days, min.value, max.value) ||
    props.isDisabled?.(dt.toISODate())
  )
    return true;
  if (!withTime.value) return false;
  return (
    (!!min.value && PlainDateTime.compare(dt, min.value) < 0) ||
    (!!max.value && PlainDateTime.compare(dt, max.value) > 0)
  );
};

function parseText(s: string): PlainDateTime | null | undefined {
  if (!s.trim()) return undefined;
  const p = parseUserInput(s);
  if (!p) return null;
  const { hour = 0, minute = 0, second = 0 } = p.time ?? {};
  return PlainDateTime.fromObject(
    { ...p.date, hour, minute, second },
    p.calendar
  );
}

const typedError = computed(() => {
  if (draft.value === null || !draft.value.trim()) return null;
  const dt = parseText(draft.value);
  if (!dt) return t("invalidDate");
  return outside(dt) ? t("outOfRange") : null;
});

function emitValue(dt: PlainDateTime | null) {
  queueMicrotask(val.onChange);
  if (dt === null) return emit("update:modelValue", null);
  emit(
    "update:modelValue",
    withTime.value
      ? withSeconds.value
        ? dt.toISO()
        : dt.toISO().slice(0, 16)
      : dt.toISODate()
  );
}

function onInput(e: Event) {
  draft.value = (e.target as HTMLInputElement).value;
  text.value = draft.value;
}
function commit() {
  if (draft.value === null) return;
  const dt = parseText(draft.value);
  draft.value = null;
  if (dt === undefined) {
    if (props.modelValue) emitValue(null);
    text.value = "";
  } else if (dt && !outside(dt)) {
    const keepTime = withTime.value && !/\d:\d/.test(text.value) && value.value;
    emitValue(
      keepTime ? PlainDateTime.fromDays(dt.days, value.value!.seconds) : dt
    );
    text.value = showText(dt);
  } else {
    text.value = showText(value.value);
  }
}

// ---- calendar + time interplay
const dayIso = computed(() => value.value?.toISODate() ?? null);
const seconds = computed(() => value.value?.seconds ?? null);

function onDay(iso: string) {
  const d = PlainDateTime.fromISO(iso)!;
  let at = withTime.value ? (value.value?.seconds ?? 0) : 0;
  let dt = PlainDateTime.fromDays(d.days, at);
  if (withTime.value) {
    // keep the chosen time inside min/max on the boundary days
    if (min.value && PlainDateTime.compare(dt, min.value) < 0) dt = min.value;
    if (max.value && PlainDateTime.compare(dt, max.value) > 0) dt = max.value;
  }
  emitValue(dt);
  draft.value = null;
  if (!withTime.value) close();
  else if (tabbed.value) goTab("time"); // phone: day picked, now the time
}
function onTime(sec: number) {
  const base = value.value ?? PlainDateTime.now().startOf("day");
  emitValue(PlainDateTime.fromDays(base.days, sec));
  draft.value = null;
}
function setNow() {
  const now = PlainDateTime.now();
  emitValue(withTime.value ? now : now.startOf("day"));
  if (!withTime.value) close();
}
function clear() {
  draft.value = null;
  emitValue(null);
  text.value = "";
}

const timeBounds = computed(() => {
  if (!withTime.value || !value.value) return { min: null, max: null };
  const d = value.value.days;
  return {
    min: min.value && min.value.days === d ? min.value.seconds : null,
    max: max.value && max.value.days === d ? max.value.seconds : null
  };
});

function close() {
  open.value = false;
}
// Phone sheet with a time: two tabs (date, time) instead of one tall scrolling page.
const tab = ref<"date" | "time">("date");
const tabbed = computed(() => withTime.value && !!popup.value?.isSheet);
function goTab(next: "date" | "time") {
  tab.value = next;
  if (next === "time")
    nextTick(() =>
      popup.value?.panel
        ?.querySelector<HTMLElement>(".vi-time__item[data-on], .vi-time__item")
        ?.focus({ preventScroll: true })
    );
}
watch(open, (o) => {
  if (o) tab.value = "date";
  if (o) emit("open");
  else {
    emit("close");
    commit();
    val.onBlur();
  }
});

const anchor = computed(
  () => (field.value?.control as HTMLElement | undefined) ?? null
);
const val = useValidation({
  value: () => props.modelValue,
  rules: () => props.rules,
  messages: () => props.messages,
  label: () => props.label,
  name: () => (props as { name?: string }).name,
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
const placeholder = computed(
  () =>
    props.placeholder ??
    digits(
      calendar.value === "jalali" || locale.value.startsWith("fa")
        ? "1405/01/01"
        : "2026-01-01",
      locale.value
    ).replace(/[0-9۰-۹]/g, (c) => (/[۰-۹]/.test(c) ? "۰" : "0"))
);
const todayIso = ref<string | null>(null);
function toggle() {
  if (props.disabled || props.readonly) return;
  open.value = !open.value;
}
function onKey(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    commit();
    close();
  } else if (e.key === "ArrowDown" && !props.readonly) {
    e.preventDefault();
    open.value = true;
    nextTick(() =>
      document.querySelector<HTMLElement>(".vi-cal [tabindex='0']")?.focus()
    );
  }
}
const summary = computed(() => (value.value ? showText(value.value) : ""));
const summaryDate = computed(() => (value.value ? showDate(value.value) : ""));
const summaryTime = computed(() => (value.value ? showTime(value.value) : ""));
void todayIso;
const sheetTitle = computed(
  () => props.label ?? t(withTime.value ? "pickDate" : "pickDate")
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
defineExpose({
  focus: () => inputEl.value?.focus(),
  open: () => (open.value = true),
  close
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
    <template #before>
      <slot name="before"
        ><ViIcon
          class="vi-date__icon"
          :name="withTime ? 'clock' : 'calendar'"
          :size="18"
          :width="2"
      /></slot>
    </template>
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
        v-if="props.clearable && value && !props.disabled && !props.readonly"
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
    ref="popup"
    :auto-scroll="props.autoScroll"
    v-model="open"
    :anchor="anchor"
    :mobile="props.mobile"
    :title="sheetTitle"
    :close-on-outside="true"
  >
    <template #default="{ sheet }">
      <div
        class="vi-date"
        :data-time="withTime || undefined"
        :data-tabbed="(sheet && tabbed) || undefined"
        :data-months="props.months"
      >
        <div class="vi-date__body">
          <ViCalendar
            v-show="!(sheet && tabbed) || tab === 'date'"
            :model-value="dayIso"
            :calendar="calendar"
            :min="props.min"
            :max="props.max"
            :marked="props.marked"
            :is-disabled="props.isDisabled"
            :alt-days="false"
            :months="props.months"
            :week-start="props.weekStart"
            :weekend="props.weekend"
            @update:model-value="onDay"
          />
          <div
            v-if="withTime && !(sheet && tabbed && tab !== 'time')"
            class="vi-date__time"
          >
            <ViTimePanel
              :model-value="seconds"
              :seconds="withSeconds"
              :hour12="props.hour12"
              :minute-step="props.minuteStep"
              :min="timeBounds.min"
              :max="timeBounds.max"
              @update:model-value="onTime"
            />
          </div>
        </div>
        <ViDateFoot
          v-if="!sheet"
          v-model:calendar="calendar"
          :calendars="props.calendars"
          :summary="summary"
          :with-time="withTime"
          @now="setNow"
          @confirm="close"
        />
      </div>
    </template>
    <template #footer>
      <ViDateFoot
        sheet
        v-model:calendar="calendar"
        :calendars="props.calendars"
        :summary="summary"
        :with-time="withTime"
        :tabs="
          tabbed ? { date: summaryDate, time: summaryTime, active: tab } : null
        "
        @tab="goTab"
        @now="setNow"
        @confirm="close"
      />
    </template>
  </ViPopup>
</template>
