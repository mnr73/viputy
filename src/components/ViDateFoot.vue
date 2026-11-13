<script setup lang="ts">
import type { CalendarId } from "../date/calendar";
import { useViputy } from "../i18n/config";

defineProps<{
  calendars: CalendarId[];
  calendar: CalendarId;
  summary: string;
  withTime: boolean;
  /** Inside a phone sheet: the value gets its own row, like the date/time buttons. */
  sheet?: boolean;
  /** Phone sheet with tabs: the date and the time are shown as two buttons that switch the tab. */
  tabs?: { date: string; time: string; active: "date" | "time" } | null;
}>();
defineEmits<{
  "update:calendar": [value: CalendarId];
  now: [];
  confirm: [];
  tab: [value: "date" | "time"];
}>();

const { t } = useViputy();
</script>

<template>
  <div class="vi-date__foot">
    <div
      v-if="calendars.length > 1"
      class="vi-seg"
      role="group"
      :aria-label="t('calendarSwitch')"
    >
      <button
        v-for="c in calendars"
        :key="c"
        type="button"
        class="vi-seg__btn"
        :aria-pressed="calendar === c"
        @click="$emit('update:calendar', c)"
      >
        {{ t(c) }}
      </button>
    </div>
    <div v-if="tabs" class="vi-date__parts">
      <button
        v-for="k in ['date', 'time'] as const"
        :key="k"
        type="button"
        class="vi-date__part"
        :aria-pressed="tabs.active === k"
        :aria-label="t(k === 'date' ? 'dateTab' : 'timeTab')"
        @click="$emit('tab', k)"
      >
        <small>{{ t(k === "date" ? "dateTab" : "timeTab") }}</small>
        <span dir="ltr">{{ tabs[k] || "-" }}</span>
      </button>
    </div>
    <div v-else-if="sheet" class="vi-date__parts">
      <div class="vi-date__part" data-static>
        <small>{{ t("dateTab") }}</small>
        <span dir="ltr">{{ summary || "-" }}</span>
      </div>
    </div>
    <span v-else class="vi-date__summary">{{ summary }}</span>
    <button type="button" class="vi-btn vi-btn--sm" @click="$emit('now')">
      {{ t(withTime ? "now" : "today") }}
    </button>
    <button
      v-if="withTime"
      type="button"
      class="vi-btn vi-btn--sm vi-btn--primary"
      @click="$emit('confirm')"
    >
      {{ t("confirm") }}
    </button>
  </div>
</template>
