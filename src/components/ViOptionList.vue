<script setup lang="ts">
import { useViputy } from "../i18n/config";
import { highlight, localizeDigits } from "../utils/text";
import type { GroupState, Grp, Opt, Row } from "../utils/options";
import { ViIcon } from "./ViIcon";

const props = defineProps<{
  rows: Row[];
  /** Index (into `rows`) of the keyboard/hover highlight, -1 for none. */
  active: number;
  isSelected: (option: Opt) => boolean;
  groupStateOf: (group: Grp) => GroupState;
  multiple?: boolean;
  /** Current search text, used to mark matches. */
  query?: string;
  /** Element id; row `i` gets `${id}-${i}` (for aria-activedescendant). */
  id: string;
  label?: string;
}>();

const emit = defineEmits<{
  pick: [option: Opt];
  pickGroup: [group: Grp];
  hover: [index: number];
}>();

defineSlots<{
  option?(p: {
    option: Opt;
    selected: boolean;
    active: boolean;
    query: string;
  }): unknown;
  group?(p: { group: Grp; state: GroupState }): unknown;
}>();

const { locale } = useViputy();

const onHover = (i: number) => {
  if (props.active !== i) emit("hover", i);
};
</script>

<template>
  <div
    :id="props.id"
    class="vi-options"
    role="listbox"
    :aria-multiselectable="props.multiple || undefined"
    :aria-label="props.label"
  >
    <template v-for="(row, i) in props.rows" :key="row.key">
      <div
        v-if="row.kind === 'group'"
        :id="`${props.id}-${i}`"
        class="vi-option vi-option--group"
        :role="props.multiple ? 'option' : 'presentation'"
        :aria-selected="
          props.multiple ? props.groupStateOf(row.group) === 'all' : undefined
        "
        :data-active="props.active === i || undefined"
        :data-static="!props.multiple || undefined"
        :data-disabled="
          row.group.disabled ||
          !row.group.items.some((o) => !o.disabled) ||
          undefined
        "
        @mousedown.prevent
        @mousemove="props.multiple && onHover(i)"
        @click="props.multiple && emit('pickGroup', row.group)"
      >
        <span
          v-if="props.multiple"
          class="vi-mark"
          :data-state="props.groupStateOf(row.group)"
        >
          <ViIcon name="check" :size="12" :width="3.5" />
          <ViIcon name="minus" :size="12" :width="3.5" />
        </span>
        <slot
          name="group"
          :group="row.group"
          :state="props.groupStateOf(row.group)"
        >
          <span class="vi-option__label">{{ row.group.label }}</span>
        </slot>
        <span v-if="props.multiple" class="vi-option__hint">{{
          localizeDigits(row.group.items.length, locale)
        }}</span>
      </div>
      <div
        v-else
        :id="`${props.id}-${i}`"
        class="vi-option"
        role="option"
        :data-active="props.active === i || undefined"
        :data-selected="props.isSelected(row.option) || undefined"
        :data-disabled="row.option.disabled || row.group.disabled || undefined"
        :data-grouped="row.group.label !== null || undefined"
        :aria-selected="props.isSelected(row.option)"
        :aria-disabled="row.option.disabled || row.group.disabled || undefined"
        @mousedown.prevent
        @mousemove="onHover(i)"
        @click="emit('pick', row.option)"
      >
        <span
          v-if="props.multiple"
          class="vi-mark"
          :data-state="props.isSelected(row.option) ? 'all' : 'none'"
        >
          <ViIcon name="check" :size="12" :width="3.5" />
        </span>
        <slot
          name="option"
          :option="row.option"
          :selected="props.isSelected(row.option)"
          :active="props.active === i"
          :query="props.query ?? ''"
        >
          <span class="vi-option__text">
            <span class="vi-option__label">
              <template
                v-for="[a, m, b] in [
                  highlight(row.option.label, props.query ?? '')
                ]"
                :key="0"
                >{{ a }}<span v-if="m" class="vi-hl">{{ m }}</span
                >{{ b }}</template
              >
            </span>
            <span v-if="row.option.description" class="vi-option__desc">{{
              row.option.description
            }}</span>
          </span>
        </slot>
        <ViIcon
          v-if="!props.multiple && props.isSelected(row.option)"
          class="vi-option__check"
          name="check"
          :size="16"
        />
      </div>
    </template>
  </div>
</template>
