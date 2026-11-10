<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, useId, watch } from "vue";
import { useListNav } from "../composables/useListNav";
import { useOptions } from "../composables/useOptions";
import { useViputy } from "../i18n/config";
import {
  groupState,
  normalizeOption,
  rowDisabled,
  toggleGroupValues,
  type Accessor,
  type FilterFn,
  type Opt
} from "../utils/options";
import { localizeDigits } from "../utils/text";
import { pickField, type FieldProps } from "./field-props";
import ViField from "./ViField.vue";
import { ViIcon } from "./ViIcon";
import ViOptionList from "./ViOptionList.vue";
import ViPopup from "./ViPopup.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    FieldProps & {
      /** Single: one value. Multiple: an array. */
      modelValue?: any;
      /** Strings, objects, or groups: `{ label, options: [...] }`. */
      options?: any[];
      multiple?: boolean;
      placeholder?: string;
      /** Search box in the panel. Default: on when there are more than 7 options. */
      searchable?: boolean;
      searchPlaceholder?: string;
      /** `false` turns local filtering off (do server-side search with `@search`). */
      filter?: boolean | FilterFn;
      clearable?: boolean;
      /** Compare object values by this key (or function) instead of identity. */
      by?: string | ((value: any) => any);
      optionLabel?: Accessor;
      optionValue?: Accessor;
      optionDisabled?: Accessor;
      optionDescription?: Accessor;
      /** Key holding a group's options. Default `"options"`. */
      optionGroup?: string;
      /** multiple: show chips or just a count. */
      display?: "chips" | "count";
      /** multiple + chips: collapse the rest into "+n". */
      maxChips?: number;
      /** multiple: "select all / clear" row. */
      actions?: boolean;
      loading?: boolean;
      /** Adds hidden inputs so a native <form> submits the value. */
      name?: string;
      /** Narrow screens: bottom sheet, full screen, or keep the popover. */
      mobile?: "sheet" | "fullscreen" | false;
      /** Scroll the page a little when the panel fits neither above nor below (default). */
      autoScroll?: boolean;
      /** Close after picking (default: single only). */
      closeOnSelect?: boolean;
    }
  >(),
  {
    options: () => [],
    display: "chips",
    actions: true,
    mobile: "sheet",
    autoScroll: true,
    searchable: undefined,
    // boolean | function: without this Vue casts an absent prop to `false`
    filter: undefined,
    closeOnSelect: undefined,
    clearable: false,
    status: null
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: any];
  search: [query: string];
  open: [];
  close: [];
}>();

defineSlots<{
  label?(): unknown;
  meta?(): unknown;
  before?(): unknown;
  /** Custom text of the closed field (single) or each chip (multiple). */
  value?(p: { option: Opt }): unknown;
  option?(p: {
    option: Opt;
    selected: boolean;
    active: boolean;
    query: string;
  }): unknown;
  empty?(p: { query: string }): unknown;
}>();

const attrs = useAttrs();
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));

const { t, locale } = useViputy();
const listId = useId();
const field = ref<InstanceType<typeof ViField>>();
const popup = ref<InstanceType<typeof ViPopup>>();
const trigger = ref<HTMLElement>();
const searchEl = ref<HTMLInputElement>();
const listWrap = ref<HTMLElement>();
const open = ref(false);
const query = ref("");

const accessors = computed(() => ({
  label: props.optionLabel,
  value: props.optionValue,
  disabled: props.optionDisabled,
  description: props.optionDescription,
  group: props.optionGroup
}));
const { all, visible, rows, visibleOptions } = useOptions({
  options: () => props.options,
  accessors,
  query,
  filter: () => props.filter
});

const isSearchable = computed(() => props.searchable ?? all.value.length > 7);
const closes = computed(() => props.closeOnSelect ?? !props.multiple);

// ---- selection
const keyOf = (v: any) =>
  typeof props.by === "function"
    ? props.by(v)
    : props.by && typeof v === "object" && v !== null
      ? v[props.by]
      : v;
const same = (a: unknown, b: unknown) => a === b || keyOf(a) === keyOf(b);

const selectedValues = computed<any[]>(() => {
  const m = props.modelValue;
  if (props.multiple) return Array.isArray(m) ? m : [];
  return m == null ? [] : [m];
});
const isSelected = (o: Opt) =>
  selectedValues.value.some((v) => same(v, o.value));
const stateOf = (g: Parameters<typeof groupState>[0]) =>
  groupState(g, isSelected);

const selectedOptions = computed<Opt[]>(() =>
  selectedValues.value.map(
    (v) =>
      all.value.find((o) => same(o.value, v)) ??
      normalizeOption(v, accessors.value)
  )
);
const hasValue = computed(() => selectedValues.value.length > 0);

function setValues(next: any[]) {
  emit("update:modelValue", props.multiple ? next : (next[0] ?? null));
}
function pick(o: Opt) {
  if (o.disabled || props.disabled || props.readonly) return;
  if (props.multiple) {
    setValues(
      isSelected(o)
        ? selectedValues.value.filter((v) => !same(v, o.value))
        : [...selectedValues.value, o.value]
    );
  } else {
    setValues([o.value]);
  }
  if (closes.value) open.value = false;
}
function pickGroup(g: Parameters<typeof groupState>[0]) {
  if (props.disabled || props.readonly) return;
  setValues(
    toggleGroupValues(selectedValues.value, g, isSelected, (o) => o.value, same)
  );
}
function removeAt(i: number) {
  if (props.disabled || props.readonly) return;
  setValues(selectedValues.value.filter((_, k) => k !== i));
}
function clear() {
  setValues([]);
}
function selectAllVisible() {
  const add = visibleOptions.value
    .filter((o) => !o.disabled && !isSelected(o))
    .map((o) => o.value);
  if (add.length) setValues([...selectedValues.value, ...add]);
}

// ---- keyboard / highlight
const nav = useListNav({
  count: () => rows.value.length,
  isDisabled: (i) => rowDisabled(rows.value[i]!, !!props.multiple, isSelected),
  onSelect: (i) => {
    const r = rows.value[i];
    if (!r) return;
    if (r.kind === "option") pick(r.option);
    else pickGroup(r.group);
  }
});

function onKey(e: KeyboardEvent) {
  if (e.isComposing || props.disabled) return;
  if (!open.value) {
    if (
      ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key) &&
      !props.readonly
    ) {
      e.preventDefault();
      open.value = true;
    } else if (
      e.key === "Backspace" &&
      props.multiple &&
      selectedValues.value.length &&
      !query.value
    ) {
      removeAt(selectedValues.value.length - 1);
    }
    return;
  }
  if (nav.onKeydown(e)) return;
  if (e.key === "Enter") e.preventDefault();
  else if (
    e.key === " " &&
    e.target !== searchEl.value &&
    nav.active.value >= 0
  ) {
    e.preventDefault();
    nav.onKeydown(
      new KeyboardEvent("keydown", { key: "Enter", cancelable: true })
    );
  } else if (e.key === "Tab") open.value = false;
}

watch(nav.active, (i) => {
  if (i < 0) return;
  nextTick(() =>
    document
      .getElementById(`${listId}-${i}`)
      ?.scrollIntoView({ block: "nearest" })
  );
});
watch(query, (q) => {
  nav.reset();
  emit("search", q);
});
watch(open, async (o) => {
  if (o) emit("open");
  else emit("close");
  if (!o) {
    query.value = "";
    nav.reset();
    return;
  }
  query.value = "";
  const first = rows.value.findIndex(
    (r) => r.kind === "option" && isSelected(r.option)
  );
  nav.active.value = first;
  await nextTick();
  if (searchEl.value) searchEl.value.focus({ preventScroll: true });
  else if (popup.value?.isSheet) listWrap.value?.focus({ preventScroll: true });
  if (first >= 0)
    document
      .getElementById(`${listId}-${first}`)
      ?.scrollIntoView({ block: "nearest" });
});

function toggle() {
  if (props.disabled || props.readonly) return;
  trigger.value?.focus({ preventScroll: true });
  open.value = !open.value;
}

// ---- display
const anchor = computed(
  () => (field.value?.control as HTMLElement | undefined) ?? null
);
const n = (v: number) => localizeDigits(v, locale.value);
const shownChips = computed(() =>
  props.maxChips != null
    ? selectedOptions.value.slice(0, props.maxChips)
    : selectedOptions.value
);
const hiddenCount = computed(
  () => selectedOptions.value.length - shownChips.value.length
);
const fieldProps = computed(() =>
  pickField(props, { main: "vi-select__main" })
);
const sheetTitle = computed(() => props.label ?? props.placeholder);

defineExpose({
  focus: () => trigger.value?.focus(),
  open: () => (open.value = true),
  close: () => (open.value = false)
});
</script>

<template>
  <ViField
    ref="field"
    v-bind="{ ...fieldProps, ...rootAttrs }"
    :active="open"
    @control-click="toggle"
  >
    <template #label
      ><slot name="label">{{ props.label }}</slot></template
    >
    <template v-if="$slots.meta" #meta><slot name="meta" /></template>
    <template v-if="$slots.before" #before><slot name="before" /></template>
    <template #default="{ id }">
      <div
        v-bind="{ ...attrs, class: undefined, style: undefined }"
        :id="id"
        ref="trigger"
        class="vi-select__trigger"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-labelledby="props.label ? `${id}-label` : undefined"
        :aria-activedescendant="
          open && nav.active.value >= 0
            ? `${listId}-${nav.active.value}`
            : undefined
        "
        :aria-disabled="props.disabled || undefined"
        :aria-invalid="props.status === 'error' || undefined"
        :aria-required="props.required || undefined"
        :tabindex="props.disabled ? -1 : 0"
        @keydown="onKey"
      >
        <template v-if="!hasValue">
          <span class="vi-select__placeholder">{{ props.placeholder }}</span>
        </template>
        <template v-else-if="!props.multiple">
          <slot name="value" :option="selectedOptions[0]!">
            <span class="vi-select__text">{{ selectedOptions[0]!.label }}</span>
          </slot>
        </template>
        <template v-else-if="props.display === 'count'">
          <span class="vi-select__text">{{
            t("selectedCount", { n: n(selectedOptions.length) })
          }}</span>
        </template>
        <div v-else class="vi-select__chips">
          <span v-for="(o, i) in shownChips" :key="i" class="vi-chip">
            <slot name="value" :option="o">{{ o.label }}</slot>
            <button
              v-if="!props.disabled && !props.readonly"
              type="button"
              class="vi-chip__x"
              tabindex="-1"
              :aria-label="t('removeTag', { tag: o.label })"
              @click.stop="removeAt(i)"
            >
              <ViIcon name="close" :size="11" :width="3.5" />
            </button>
          </span>
          <span v-if="hiddenCount > 0" class="vi-chip vi-chip--count">{{
            t("moreCount", { n: n(hiddenCount) })
          }}</span>
        </div>
      </div>
      <template v-if="props.name">
        <input
          v-for="(v, i) in selectedValues"
          :key="i"
          type="hidden"
          :name="props.multiple ? `${props.name}[]` : props.name"
          :value="typeof v === 'object' ? keyOf(v) : v"
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
    :auto-scroll="props.autoScroll"
    ref="popup"
    v-model="open"
    :anchor="anchor"
    match-width
    :mobile="props.mobile"
    :title="sheetTitle"
  >
    <template #default="{ sheet }">
      <div
        ref="listWrap"
        class="vi-select__panel"
        tabindex="-1"
        @keydown="onKey"
      >
        <div v-if="isSearchable" class="vi-select__search">
          <ViIcon name="search" :size="16" :width="2" />
          <input
            ref="searchEl"
            v-model="query"
            class="vi-native"
            type="text"
            autocomplete="off"
            role="searchbox"
            :placeholder="props.searchPlaceholder ?? t('search')"
            :aria-controls="listId"
            :aria-activedescendant="
              nav.active.value >= 0
                ? `${listId}-${nav.active.value}`
                : undefined
            "
          />
        </div>
        <ViOptionList
          v-if="rows.length"
          :id="listId"
          :rows="rows"
          :active="nav.active.value"
          :is-selected="isSelected"
          :group-state-of="stateOf"
          :multiple="props.multiple"
          :query="query"
          :label="props.label"
          @pick="pick"
          @pick-group="pickGroup"
          @hover="nav.active.value = $event"
        >
          <template v-if="$slots.option" #option="p"
            ><slot name="option" v-bind="p"
          /></template>
        </ViOptionList>
        <div v-else :id="listId" class="vi-select__empty" role="status">
          <slot name="empty" :query="query">
            <template v-if="props.loading">{{ t("loading") }}</template>
            <template v-else-if="query">
              <strong>{{ t("noResults") }}</strong>
              <span>{{ t("tryAnother") }}</span>
            </template>
            <template v-else>{{ t("noOptions") }}</template>
          </slot>
        </div>
        <div
          v-if="props.multiple && props.actions && !sheet && rows.length"
          class="vi-select__foot"
        >
          <button
            type="button"
            class="vi-link"
            @mousedown.prevent
            @click="selectAllVisible"
          >
            {{ t("selectAll") }}
          </button>
          <span class="vi-counter">{{
            t("countOf", { n: n(selectedOptions.length), total: n(all.length) })
          }}</span>
          <button
            type="button"
            class="vi-link vi-link--muted"
            @mousedown.prevent
            @click="clear"
          >
            {{ t("clear") }}
          </button>
        </div>
      </div>
    </template>
    <template v-if="props.multiple" #footer="{ close }">
      <div class="vi-sheet__actions">
        <button type="button" class="vi-btn" @click="clear">
          {{ t("clear") }}
        </button>
        <button type="button" class="vi-btn vi-btn--primary" @click="close">
          {{ t("confirm") }} ({{ n(selectedOptions.length) }})
        </button>
      </div>
    </template>
  </ViPopup>
</template>
