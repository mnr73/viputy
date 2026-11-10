<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { digits } from "../date/format";
import { useViputy } from "../i18n/config";

const props = withDefaults(
  defineProps<{
    /** Seconds since midnight, or null. */
    modelValue?: number | null;
    seconds?: boolean;
    hour12?: boolean;
    /** Minute step (1, 5, 10, 15, 30). */
    minuteStep?: number;
    /** Allowed range, in seconds since midnight. */
    min?: number | null;
    max?: number | null;
    /** Show the column titles. */
    titles?: boolean;
  }>(),
  { minuteStep: 1, titles: true }
);

const emit = defineEmits<{ "update:modelValue": [seconds: number] }>();

const { t, locale } = useViputy();
const root = ref<HTMLElement>();

const value = computed(() => props.modelValue ?? null);
const h24 = computed(() =>
  value.value === null ? null : Math.floor(value.value / 3600)
);
const mi = computed(() =>
  value.value === null ? null : Math.floor((value.value % 3600) / 60)
);
const se = computed(() => (value.value === null ? null : value.value % 60));
const pm = computed(() => (h24.value ?? 0) >= 12);

const allowed = (from: number, to: number) =>
  (props.min == null || to >= props.min) &&
  (props.max == null || from <= props.max);

const hours = computed(() => {
  const list = props.hour12
    ? Array.from({ length: 12 }, (_, i) => i + 1)
    : Array.from({ length: 24 }, (_, i) => i);
  return list.map((label) => {
    const h = props.hour12 ? (label % 12) + (pm.value ? 12 : 0) : label;
    return {
      label,
      h,
      on: props.hour12
        ? h24.value !== null && h24.value % 12 === label % 12
        : h24.value === h,
      off: !allowed(h * 3600, h * 3600 + 3599)
    };
  });
});
const baseH = computed(() => h24.value ?? 0);
const minutes = computed(() =>
  Array.from(
    { length: Math.ceil(60 / props.minuteStep) },
    (_, i) => i * props.minuteStep
  ).map((m) => ({
    label: m,
    on: mi.value === m,
    off: !allowed(baseH.value * 3600 + m * 60, baseH.value * 3600 + m * 60 + 59)
  }))
);
const secs = computed(() =>
  Array.from({ length: 60 }, (_, i) => i).map((s) => {
    const at = baseH.value * 3600 + (mi.value ?? 0) * 60 + s;
    return { label: s, on: se.value === s, off: !allowed(at, at) };
  })
);

const two = (n: number) => digits(String(n).padStart(2, "0"), locale.value);

function set(h: number | null, m: number | null, s: number | null) {
  emit(
    "update:modelValue",
    (h ?? baseH.value) * 3600 + (m ?? mi.value ?? 0) * 60 + (s ?? se.value ?? 0)
  );
}
function setPeriod(toPm: boolean) {
  set(((h24.value ?? 0) % 12) + (toPm ? 12 : 0), null, null);
}

const columns = computed(() => [
  {
    key: "h",
    title: t("hour"),
    items: hours.value,
    pick: (i: { h: number }) => set(i.h, null, null)
  },
  {
    key: "m",
    title: t("minute"),
    items: minutes.value,
    pick: (i: { label: number }) => set(null, i.label, null)
  },
  ...(props.seconds
    ? [
        {
          key: "s",
          title: t("second"),
          items: secs.value,
          pick: (i: { label: number }) => set(null, null, i.label)
        }
      ]
    : [])
]);

function onKey(e: KeyboardEvent) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  const list = [
    ...(e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>(
      "button:not([disabled])"
    )
  ];
  const i = list.indexOf(document.activeElement as HTMLButtonElement);
  const next =
    list[
      e.key === "ArrowDown"
        ? Math.min(list.length - 1, i + 1)
        : Math.max(0, i - 1)
    ];
  if (next) {
    e.preventDefault();
    next.focus();
  }
}

function reveal() {
  root.value?.querySelectorAll<HTMLElement>("[data-on]").forEach((el) => {
    const col = el.parentElement!;
    col.scrollTop = el.offsetTop - col.clientHeight / 2 + el.clientHeight / 2;
  });
}
onMounted(() => nextTick(reveal));
watch(
  () => props.hour12,
  () => nextTick(reveal)
);
defineExpose({ reveal });
</script>

<template>
  <div ref="root" class="vi-time" dir="ltr">
    <div v-if="props.titles" class="vi-time__titles">
      <span v-for="c in columns" :key="c.key">{{ c.title }}</span>
      <span v-if="props.hour12">{{ t("period") }}</span>
    </div>
    <div class="vi-time__cols">
      <div
        v-for="c in columns"
        :key="c.key"
        class="vi-time__col"
        role="listbox"
        :aria-label="c.title"
        @keydown="onKey"
      >
        <button
          v-for="i in c.items"
          :key="i.label"
          type="button"
          class="vi-time__item"
          role="option"
          :aria-selected="i.on"
          :data-on="i.on || undefined"
          :disabled="i.off"
          :tabindex="
            i.on ||
            (!c.items.some((x) => x.on) && i.label === c.items[0]!.label)
              ? 0
              : -1
          "
          @click="c.pick(i as never)"
        >
          {{ two(i.label) }}
        </button>
      </div>
      <div
        v-if="props.hour12"
        class="vi-time__col vi-time__col--period"
        role="listbox"
        :aria-label="t('period')"
      >
        <button
          v-for="p in [false, true]"
          :key="String(p)"
          type="button"
          class="vi-time__item"
          role="option"
          :aria-selected="value !== null && pm === p"
          :data-on="(value !== null && pm === p) || undefined"
          @click="setPeriod(p)"
        >
          {{ locale.startsWith("fa") ? (p ? "ب.ظ" : "ق.ظ") : p ? "PM" : "AM" }}
        </button>
      </div>
    </div>
  </div>
</template>
