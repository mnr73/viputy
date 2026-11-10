<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useCalendar } from "../composables/useCalendar";
import { type CalendarId } from "../date/calendar";
import { mod } from "../date/gregorian";
import { digits, format, monthNames, weekColumn } from "../date/format";
import { PlainDateTime } from "../date/plain";
import { dayOutside, parseBound } from "../date/range";
import { useViputy } from "../i18n/config";
import { ViIcon } from "./ViIcon";

const props = withDefaults(
  defineProps<{
    /** Selected day as ISO (`YYYY-MM-DD`; a time part is ignored). */
    modelValue?: string | null;
    /** Which calendar to draw. Default: Jalali for fa, otherwise Gregorian. */
    calendar?: CalendarId;
    min?: string;
    max?: string;
    /** Days to outline (e.g. a deadline). ISO dates. */
    marked?: string[];
    /** Return true to disable a day. Receives the ISO date. */
    isDisabled?: (iso: string) => boolean;
    /** Show the day number of the other calendar under each day. */
    altDays?: boolean;
    /** Months shown side by side. */
    months?: number;
    /** 0 = Saturday ... 6 = Friday. */
    weekStart?: number;
    /** Weekend days as 0 = Saturday ... 6 = Friday. */
    weekend?: number[];
    /** Month to show when there is no value (ISO). */
    initialView?: string;
  }>(),
  { months: 1, altDays: false }
);

const emit = defineEmits<{ "update:modelValue": [iso: string] }>();

const { t, locale } = useViputy();
const root = ref<HTMLElement>();
const calId = computed<CalendarId>(
  () =>
    props.calendar ?? (locale.value.startsWith("fa") ? "jalali" : "gregorian")
);
const selected = computed(() => PlainDateTime.fromISO(props.modelValue));
const min = computed(() => parseBound(props.min, "min"));
const max = computed(() => parseBound(props.max, "max"));
const markedDays = computed(
  () => new Set((props.marked ?? []).map((m) => PlainDateTime.fromISO(m)?.days))
);
const today = ref<PlainDateTime | null>(null);
onMounted(() => (today.value = PlainDateTime.now()));

function clampDays(d: number) {
  if (min.value && d < min.value.days) return min.value.days;
  if (max.value && d > max.value.days) return max.value.days;
  return d;
}

const cal = useCalendar({
  calendar: calId,
  locale,
  weekStart: () => props.weekStart,
  weekend: () => props.weekend,
  fill: () => props.months === 1,
  initial: () => {
    const d =
      selected.value ??
      PlainDateTime.fromISO(props.initialView) ??
      PlainDateTime.now();
    return PlainDateTime.fromDays(clampDays(d.days));
  }
});

watch(
  () => props.modelValue,
  () => selected.value && cal.goTo(selected.value)
);

const mode = ref<"days" | "months" | "years">("days");
const grids = computed(() =>
  Array.from({ length: props.months }, (_, i) => cal.grid(i))
);
const loc = locale;
const n = (v: number | string) => digits(v, loc.value);
const names = computed(() => monthNames(calId.value, loc.value));

const weeks = computed(() =>
  grids.value.map((g) => ({
    ...g,
    label: `${names.value[g.month - 1]} ${n(g.year)}`,
    alt: altTitle(g.year, g.month),
    rows: Array.from({ length: g.days.length / 7 }, (_, r) =>
      g.days.slice(r * 7, r * 7 + 7)
    )
  }))
);

function altTitle(year: number, month: number): string {
  if (!props.altDays) return "";
  const other: CalendarId = calId.value === "jalali" ? "gregorian" : "jalali";
  const c = cal.cal.value;
  const o = PlainDateTime.fromDays(c.toDays(year, month, 1));
  const e = PlainDateTime.fromDays(
    c.toDays(year, month, c.monthLength(year, month))
  );
  const a = o.get(other);
  const b = e.get(other);
  const nm = monthNames(other, "en");
  return a.month === b.month && a.year === b.year
    ? `${nm[a.month - 1]} ${a.year}`
    : `${nm[a.month - 1]} – ${nm[b.month - 1]} ${b.year}`;
}

// ---- range limits
const firstShown = computed(() =>
  cal.cal.value.toDays(cal.view.value.year, cal.view.value.month, 1)
);
const lastShown = computed(() => {
  const last = grids.value[grids.value.length - 1]!;
  return cal.cal.value.toDays(
    last.year,
    last.month,
    cal.cal.value.monthLength(last.year, last.month)
  );
});
const canPrev = computed(() => !min.value || firstShown.value > min.value.days);
const canNext = computed(() => !max.value || lastShown.value < max.value.days);

const disabledDay = (d: { date: PlainDateTime; iso: string }) =>
  dayOutside(d.date.days, min.value, max.value) || !!props.isDisabled?.(d.iso);

// ---- keyboard focus (roving tabindex)
const focusDays = ref<number | null>(null);
const visible = (d: number) =>
  grids.value.some((g) =>
    g.days.some((x) => x && x.inMonth && x.date.days === d)
  );
const tabDays = computed(() => {
  const first = grids.value[0]!.days.find((x) => x && x.inMonth)!.date.days;
  for (const c of [focusDays.value, selected.value?.days, today.value?.days]) {
    if (c != null && visible(c)) return c;
  }
  return first;
});

function focusCell(days: number) {
  nextTick(() =>
    root.value?.querySelector<HTMLElement>(`[data-days="${days}"]`)?.focus()
  );
}
function onGridKey(e: KeyboardEvent) {
  const cur = tabDays.value;
  const rtl = root.value
    ? getComputedStyle(root.value).direction === "rtl"
    : false;
  const col = weekColumn(cur, cal.weekStart.value);
  const step = (months: number) =>
    PlainDateTime.fromDays(cur).plus({ months }, calId.value).days;
  const moves: Record<string, number> = {
    ArrowLeft: cur + (rtl ? 1 : -1),
    ArrowRight: cur + (rtl ? -1 : 1),
    ArrowUp: cur - 7,
    ArrowDown: cur + 7,
    Home: cur - col,
    End: cur + (6 - col),
    PageUp: step(e.shiftKey ? -12 : -1),
    PageDown: step(e.shiftKey ? 12 : 1)
  };
  if (!(e.key in moves)) return;
  e.preventDefault();
  const next = clampDays(moves[e.key]!);
  focusDays.value = next;
  if (!visible(next)) cal.goTo(PlainDateTime.fromDays(next));
  focusCell(next);
}

function pick(d: { date: PlainDateTime; iso: string; inMonth: boolean }) {
  if (disabledDay(d)) return;
  focusDays.value = d.date.days;
  if (!d.inMonth) cal.goTo(d.date);
  emit("update:modelValue", d.iso);
}

// ---- month / year pickers
const yearPage = ref(0);
const years = computed(() =>
  Array.from({ length: 12 }, (_, i) => yearPage.value + i)
);
function openMonths() {
  mode.value = "months";
}
function openYears() {
  yearPage.value = cal.view.value.year - mod(cal.view.value.year, 12);
  mode.value = "years";
}
const monthRange = (y: number, m: number) =>
  [
    cal.cal.value.toDays(y, m, 1),
    cal.cal.value.toDays(y, m, cal.cal.value.monthLength(y, m))
  ] as const;
const overlaps = (a: number, b: number) =>
  (!min.value || b >= min.value.days) && (!max.value || a <= max.value.days);
const monthOff = (m: number) => {
  if (!cal.supports(cal.view.value.year, m)) return true;
  const [a, b] = monthRange(cal.view.value.year, m);
  return !overlaps(a, b);
};
const yearOff = (y: number) =>
  !cal.supports(y, 1) || !overlaps(monthRange(y, 1)[0], monthRange(y, 12)[1]);
function chooseMonth(m: number) {
  cal.setMonth(m);
  mode.value = "days";
  focusDays.value = null;
}
function chooseYear(y: number) {
  cal.setYear(y);
  if (monthOff(cal.view.value.month)) {
    const ok = Array.from({ length: 12 }, (_, i) => i + 1).find(
      (m) => !monthOff(m)
    );
    if (ok) cal.setMonth(ok);
  }
  mode.value = "months";
}
function prevNext(dir: 1 | -1) {
  if (mode.value === "days") cal.move(dir);
  else if (mode.value === "months") cal.setYear(cal.view.value.year + dir);
  else yearPage.value += dir * 12;
}
const navOff = (dir: 1 | -1) => {
  if (mode.value === "days") return dir < 0 ? !canPrev.value : !canNext.value;
  if (mode.value === "months")
    return !cal.supports(cal.view.value.year + dir, 1);
  return !cal.supports(yearPage.value + (dir > 0 ? 12 : -1), 1);
};
const navLabel = (dir: 1 | -1) =>
  mode.value === "days"
    ? t(dir < 0 ? "prevMonth" : "nextMonth")
    : mode.value === "months"
      ? t(dir < 0 ? "prevYear" : "nextYear")
      : t(dir < 0 ? "prevYears" : "nextYears");

const ariaDay = (d: { date: PlainDateTime }) =>
  format(d.date, "EEEE d MMMM yyyy", {
    calendar: calId.value,
    locale: loc.value
  });

defineExpose({ goTo: cal.goTo, focus: () => focusCell(tabDays.value) });
</script>

<template>
  <div ref="root" class="vi-cal" role="group" :aria-label="t('pickDate')">
    <div class="vi-cal__head">
      <button
        type="button"
        class="vi-cal__nav vi-cal__prev"
        :aria-label="navLabel(-1)"
        :disabled="navOff(-1)"
        @click="prevNext(-1)"
      >
        <ViIcon name="chevron" :size="16" :width="2.5" />
      </button>
      <div class="vi-cal__titles" :data-count="props.months">
        <template v-if="mode === 'days'">
          <button
            v-for="(w, i) in weeks"
            :key="i"
            type="button"
            class="vi-cal__title"
            :aria-label="t('chooseMonthYear')"
            @click="openMonths"
          >
            <span class="vi-cal__month">{{ w.label }}</span>
            <span v-if="w.alt" class="vi-cal__alt" dir="ltr">{{ w.alt }}</span>
          </button>
        </template>
        <button
          v-else-if="mode === 'months'"
          type="button"
          class="vi-cal__title"
          :aria-label="t('chooseYear')"
          @click="openYears"
        >
          <span class="vi-cal__month">{{ n(cal.view.value.year) }}</span>
        </button>
        <span v-else class="vi-cal__title vi-cal__title--static">
          <span class="vi-cal__month"
            >{{ n(years[0]!) }} – {{ n(years[11]!) }}</span
          >
        </span>
      </div>
      <button
        type="button"
        class="vi-cal__nav vi-cal__next"
        :aria-label="navLabel(1)"
        :disabled="navOff(1)"
        @click="prevNext(1)"
      >
        <ViIcon name="chevron" :size="16" :width="2.5" />
      </button>
    </div>

    <div
      v-if="mode === 'days'"
      class="vi-cal__months"
      :data-count="props.months"
    >
      <div
        v-for="(w, i) in weeks"
        :key="i"
        class="vi-cal__grid"
        role="grid"
        :aria-label="w.label"
        @keydown="onGridKey"
      >
        <div class="vi-cal__row vi-cal__row--head" role="row">
          <span
            v-for="(d, k) in cal.weekdayCells.value"
            :key="k"
            class="vi-cal__wd"
            role="columnheader"
            :data-weekend="d.weekend || undefined"
            >{{ d.label }}</span
          >
        </div>
        <div v-for="(row, r) in w.rows" :key="r" class="vi-cal__row" role="row">
          <span
            v-for="(d, c) in row"
            :key="c"
            class="vi-cal__cellbox"
            role="gridcell"
          >
            <button
              v-if="d"
              type="button"
              class="vi-day"
              :data-days="d.date.days"
              :data-selected="selected?.days === d.date.days || undefined"
              :data-today="today?.days === d.date.days || undefined"
              :data-marked="markedDays.has(d.date.days) || undefined"
              :data-weekend="d.weekend || undefined"
              :data-outside="!d.inMonth || undefined"
              :disabled="disabledDay(d)"
              :tabindex="d.inMonth && d.date.days === tabDays ? 0 : -1"
              :aria-label="ariaDay(d)"
              :aria-pressed="selected?.days === d.date.days"
              :aria-current="today?.days === d.date.days ? 'date' : undefined"
              @click="pick(d)"
            >
              <span class="vi-day__n">{{ n(d.day) }}</span>
              <span v-if="props.altDays" class="vi-day__alt" dir="ltr">{{
                d.alt
              }}</span>
            </button>
          </span>
        </div>
      </div>
    </div>

    <div
      v-else-if="mode === 'months'"
      class="vi-cal__picker"
      role="group"
      :aria-label="t('chooseMonthYear')"
    >
      <button
        v-for="(name, i) in names"
        :key="i"
        type="button"
        class="vi-cal__cell"
        :data-selected="cal.view.value.month === i + 1 || undefined"
        :disabled="monthOff(i + 1)"
        @click="chooseMonth(i + 1)"
      >
        {{ name }}
      </button>
    </div>
    <div
      v-else
      class="vi-cal__picker"
      role="group"
      :aria-label="t('chooseYear')"
    >
      <button
        v-for="y in years"
        :key="y"
        type="button"
        class="vi-cal__cell"
        :data-selected="cal.view.value.year === y || undefined"
        :disabled="yearOff(y)"
        @click="chooseYear(y)"
      >
        {{ n(y) }}
      </button>
    </div>
  </div>
</template>
