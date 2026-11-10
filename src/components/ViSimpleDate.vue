<script setup lang="ts">
import { computed, ref, useAttrs, watch } from "vue";
import { getCalendar, type CalendarId } from "../date/calendar";
import { digits, monthNames } from "../date/format";
import { PlainDateTime } from "../date/plain";
import { dayOutside, parseBound } from "../date/range";
import { useViputy } from "../i18n/config";
import { pickField, type FieldProps } from "./field-props";
import ViField from "./ViField.vue";
import ViSelect from "./ViSelect.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    FieldProps & {
      /** ISO `YYYY-MM-DD`. Empty until the user has picked year, month and day. */
      modelValue?: string | null;
      calendar?: CalendarId;
      min?: string;
      max?: string;
      /** First selectable year when there is no `min`. Default: current year - 100. */
      fromYear?: number;
      /** Last selectable year when there is no `max`. Default: current year + 20. */
      toYear?: number;
      /** Show "first of month" / "last of month" shortcuts. */
      shortcuts?: boolean;
      /** Show the year first (year / month / day). Default: day / month / year. */
      yearFirst?: boolean;
      /** Hidden input with the ISO value for native forms. */
      name?: string;
      mobile?: "sheet" | "fullscreen" | false;
    }
  >(),
  { shortcuts: false, mobile: "sheet", status: null }
);

const emit = defineEmits<{ "update:modelValue": [iso: string | null] }>();
defineSlots<{ label?(): unknown; meta?(): unknown }>();

const attrs = useAttrs();
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const { t, locale } = useViputy();
const cal = computed<CalendarId>(
  () =>
    props.calendar ?? (locale.value.startsWith("fa") ? "jalali" : "gregorian")
);
const c = computed(() => getCalendar(cal.value));
const n = (v: number | string) => digits(v, locale.value);

const min = computed(() => parseBound(props.min, "min"));
const max = computed(() => parseBound(props.max, "max"));
const value = computed(() => PlainDateTime.fromISO(props.modelValue));

// The three parts are kept locally so a half-filled date is not lost.
const parts = ref<{
  year: number | null;
  month: number | null;
  day: number | null;
}>({ year: null, month: null, day: null });
function sync() {
  const v = value.value;
  if (!v) return;
  const p = v.get(cal.value);
  parts.value = { year: p.year, month: p.month, day: p.day };
}
sync();
watch([value, cal], sync);

const yearRange = computed<[number, number]>(() => {
  const todayYear = PlainDateTime.now().get(cal.value).year;
  const lo = min.value
    ? min.value.get(cal.value).year
    : (props.fromYear ?? todayYear - 100);
  const hi = max.value
    ? max.value.get(cal.value).year
    : (props.toYear ?? todayYear + 20);
  return [lo, hi];
});
const years = computed(() => {
  const [lo, hi] = yearRange.value;
  return Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => hi - i).map(
    (y) => ({ value: y, label: n(y) })
  );
});
const months = computed(() =>
  monthNames(cal.value, locale.value).map((label, i) => ({
    value: i + 1,
    label
  }))
);

const monthLen = computed(() => {
  const { year, month } = parts.value;
  if (!year || !month) return 31;
  try {
    return c.value.monthLength(year, month);
  } catch {
    return 31;
  }
});
const days = computed(() =>
  Array.from({ length: monthLen.value }, (_, i) => ({
    value: i + 1,
    label: n(i + 1)
  }))
);

const dayOff = (d: number) => {
  const { year, month } = parts.value;
  if (!year || !month) return false;
  const when = c.value.toDays(year, month, d);
  return dayOutside(when, min.value, max.value);
};

function tryEmit() {
  const { year, month, day } = parts.value;
  if (!year || !month || !day) return;
  const dt = PlainDateTime.fromObject({ year, month, day }, cal.value);
  if (!dt || dayOutside(dt.days, min.value, max.value)) return;
  emit("update:modelValue", dt.toISODate());
}
function setPart(key: "year" | "month" | "day", v: number | null) {
  parts.value = { ...parts.value, [key]: v };
  // clamp the day when the month got shorter (30 Esfand -> 29 in a plain year)
  const { year, month, day } = parts.value;
  if (year && month && day) {
    const len = c.value.monthLength(year, month);
    if (day > len) parts.value.day = len;
  }
  if (v === null) emit("update:modelValue", null);
  else tryEmit();
}

function setFirst() {
  const { year, month } = parts.value;
  if (!year || !month) return;
  setPart("day", 1);
}
function setLast() {
  const { year, month } = parts.value;
  if (!year || !month) return;
  setPart("day", c.value.monthLength(year, month));
}
const leapNote = computed(() => {
  const { year, month } = parts.value;
  if (!props.shortcuts || !year || month !== 12 || cal.value !== "jalali")
    return "";
  return t("lastDayNote", {
    month: monthNames(cal.value, locale.value)[11]!,
    year: n(year),
    n: n(c.value.monthLength(year, 12))
  });
});

const fieldProps = computed(() =>
  pickField(props, { control: "vi-sd__control", main: "vi-sd" })
);

const order = computed(
  () =>
    (props.yearFirst
      ? ["year", "month", "day"]
      : ["day", "month", "year"]) as Array<"year" | "month" | "day">
);
const meta = computed(() => ({
  year: { options: years.value, ph: t("year"), search: true },
  month: { options: months.value, ph: t("month"), search: false },
  day: { options: days.value, ph: t("day"), search: false }
}));
</script>

<template>
  <ViField v-bind="{ ...fieldProps, ...rootAttrs }">
    <template #label
      ><slot name="label">{{ props.label }}</slot></template
    >
    <template v-if="$slots.meta" #meta><slot name="meta" /></template>
    <template #default>
      <div class="vi-sd__parts" role="group" :aria-label="props.label">
        <ViSelect
          v-for="k in order"
          :key="k"
          class="vi-sd__part"
          :class="`vi-sd__part--${k}`"
          bare
          :model-value="parts[k]"
          :options="meta[k].options"
          :placeholder="meta[k].ph"
          :searchable="meta[k].search"
          :disabled="props.disabled"
          :readonly="props.readonly"
          :mobile="props.mobile"
          :aria-label="meta[k].ph"
          :option-disabled="
            k === 'day' ? (o: any) => dayOff(o.value) : undefined
          "
          @update:model-value="setPart(k, $event)"
        />
      </div>
      <input
        v-if="props.name"
        type="hidden"
        :name="props.name"
        :value="props.modelValue ?? ''"
      />
    </template>
  </ViField>
  <div v-if="props.shortcuts" class="vi-sd__shortcuts">
    <button
      type="button"
      class="vi-seg__btn vi-sd__btn"
      :disabled="
        props.disabled || props.readonly || !parts.year || !parts.month
      "
      @click="setFirst"
    >
      {{ t("firstOfMonth") }}
    </button>
    <button
      type="button"
      class="vi-seg__btn vi-sd__btn"
      :disabled="
        props.disabled || props.readonly || !parts.year || !parts.month
      "
      @click="setLast"
    >
      {{ t("lastOfMonth") }}
    </button>
    <span v-if="leapNote" class="vi-counter">{{ leapNote }}</span>
  </div>
</template>
