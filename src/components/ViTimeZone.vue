<script setup lang="ts">
import { computed } from "vue";
import { useViputy } from "../i18n/config";
import { timeZoneOptions } from "../utils/timezone";
import ViSelect from "./ViSelect.vue";

/**
 * Picks an IANA time zone (`Asia/Tehran`). The value is the id, not an offset: ids survive daylight
 * saving and law changes. Every other prop (label, clearable, mobile, ...) goes to the ViSelect inside.
 */
const props = defineProps<{
  modelValue?: string | null;
  /** The moment whose offsets are shown (offsets change with daylight saving). Default: now. */
  at?: string | Date;
  /** Limit the list to these ids. Default: every zone the browser knows. */
  zones?: string[];
}>();

defineEmits<{ "update:modelValue": [value: string | null] }>();

const { t, locale } = useViputy();
const options = computed(() => {
  const at = props.at ? new Date(props.at) : new Date();
  // Browsers differ on legacy ids (Asia/Calcutta vs Asia/Kolkata): the current value must always be listed.
  const extra = props.modelValue ? [props.modelValue] : [];
  const zones = props.zones
    ? [...new Set([...props.zones, ...extra])]
    : undefined;
  return timeZoneOptions(
    locale.value,
    Number.isNaN(at.getTime()) ? new Date() : at,
    zones,
    extra
  );
});
</script>

<template>
  <ViSelect
    :model-value="props.modelValue"
    :options="options"
    :placeholder="t('timeZone')"
    searchable
    :search-placeholder="t('searchTimeZone')"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
