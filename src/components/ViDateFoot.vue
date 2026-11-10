<script setup lang="ts">
import type { CalendarId } from "../date/calendar";
import { useViputy } from "../i18n/config";

defineProps<{
  calendars: CalendarId[];
  calendar: CalendarId;
  summary: string;
  withTime: boolean;
}>();
defineEmits<{
  "update:calendar": [value: CalendarId];
  now: [];
  confirm: [];
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
    <span class="vi-date__summary">{{ summary }}</span>
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
