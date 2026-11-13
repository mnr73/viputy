<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useAttrs, useId, watch } from "vue";
import { useListNav } from "../composables/useListNav";
import { useOptions } from "../composables/useOptions";
import type { CalendarId } from "../date/calendar";
import { format, parseUserInput } from "../date/format";
import { PlainDateTime } from "../date/plain";
import { useViputy } from "../i18n/config";
import type { MessageKey } from "../i18n/messages";
import { cleanNumber, toNumber } from "../utils/number";
import {
  groupState,
  rowDisabled,
  toggleGroupValues,
  type Grp,
  type Opt
} from "../utils/options";
import {
  allowedOps,
  checkValue,
  opArity,
  opSymbol,
  optionLabel,
  queryAccessors,
  sameValue,
  sortPair,
  validateItem,
  type Operator,
  type QueryError,
  type QueryField,
  type QueryItem
} from "../utils/query";
import {
  fixPersianLetters,
  highlight,
  localizeDigits,
  normalizeText
} from "../utils/text";
import { pickField, type FieldProps } from "./field-props";
import ViCalendar from "./ViCalendar.vue";
import ViField from "./ViField.vue";
import { ViIcon } from "./ViIcon";
import ViOptionList from "./ViOptionList.vue";
import ViPopup from "./ViPopup.vue";
import { useValidation } from "../composables/useValidation";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    FieldProps & {
      /** The filters, in order. Each is `{ key, op, value?, variant? }`. */
      modelValue?: QueryItem[];
      /** What can be filtered. */
      fields: QueryField[];
      placeholder?: string;
      /** Optional prefix typed to start a filter. Any typed text filters the field list too. */
      trigger?: string;
      /** Show a "clear all" button. */
      clearable?: boolean;
      /** Calendar for date values. Default: Jalali for fa, otherwise Gregorian. */
      calendar?: CalendarId;
      /** Scroll the page a little when the panel fits neither above nor below (default). */
      autoScroll?: boolean;
    }
  >(),
  { modelValue: () => [], trigger: "@", status: null, autoScroll: true }
);

const emit = defineEmits<{ "update:modelValue": [items: QueryItem[]] }>();

type Step = "variant" | "op" | "value";
interface Draft {
  field: QueryField;
  variant?: string;
  op?: Operator;
  values: unknown[];
  /** Labels for `values` (needed for `search` fields, whose options are not known later). */
  labels: string[];
  step: Step;
  /** Position of the item being edited, `null` for a new one. */
  index: number | null;
}

const attrs = useAttrs();
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const inputAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs;
  return rest;
});

const { t, locale } = useViputy();
/** < <= > >= point the wrong way when the row reads right-to-left, so the glyph is mirrored there. */
const flips = (op?: Operator) => !!op && ["<", "<=", ">", ">="].includes(op);
const uid = useId();
const field = ref<InstanceType<typeof ViField>>();
const input = ref<HTMLInputElement>();
const cal = ref<InstanceType<typeof ViCalendar>>();
const query = ref("");
const draft = ref<Draft | null>(null);
/** Show the field list even though nothing is typed (click or arrow down). */
const browse = ref(false);
const open = ref(false);
const selected = ref<number | null>(null);
const error = ref("");
const results = ref<unknown[]>([]);
const loading = ref(false);

const items = computed(() => props.modelValue);
const readOnly = computed(() => props.disabled || props.readonly);
const calId = computed<CalendarId>(
  () =>
    props.calendar ?? (locale.value.startsWith("fa") ? "jalali" : "gregorian")
);
const anchor = computed(
  () => (field.value?.control as HTMLElement | undefined) ?? null
);

// ---- which panel is showing
const phase = computed<"field" | Step | null>(() => {
  if (draft.value) return draft.value.step;
  return browse.value || query.value.trim() ? "field" : null;
});
const d = computed(() => draft.value);
const kind = computed(() => d.value?.field.type ?? "text");
const arity = computed(() => (d.value?.op ? opArity(d.value.op) : "one"));
const isListValue = computed(
  () =>
    phase.value === "value" &&
    ["select", "entity", "boolean"].includes(kind.value)
);
const isDateValue = computed(
  () => phase.value === "value" && kind.value === "date"
);
const isTypedValue = computed(
  () => phase.value === "value" && !isListValue.value && !isDateValue.value
);
const listPhase = computed(() => phase.value !== null && !isDateValue.value);
watch(phase, (p) => (open.value = p !== null));

// ---- field / variant / operator lists
const filterText = computed(() => {
  const q = query.value;
  return (
    q.startsWith(props.trigger) ? q.slice(props.trigger.length) : q
  ).trim();
});
const fq = computed(() => normalizeText(filterText.value));
const usedKeys = computed(() => new Set(items.value.map((i) => i.key)));
const fieldRows = computed(() =>
  props.fields.filter(
    (f) =>
      (f.multiple || !usedKeys.value.has(f.key)) &&
      (!fq.value ||
        normalizeText(f.label).includes(fq.value) ||
        f.key.toLowerCase().includes(fq.value))
  )
);
const usedNote = computed(() => {
  const used = props.fields.filter(
    (f) => !f.multiple && usedKeys.value.has(f.key)
  );
  return used.length
    ? t("fieldUsed", {
        fields: used
          .map((f) => f.label)
          .join(locale.value.startsWith("fa") ? "، " : ", ")
      })
    : "";
});
const variantRows = computed(() =>
  (d.value?.field.variants ?? []).filter(
    (v) =>
      !query.value.trim() ||
      normalizeText(v.label).includes(normalizeText(query.value.trim()))
  )
);

const OP_LABEL: Record<Operator, MessageKey> = {
  "=": "opEq",
  "!=": "opNe",
  "<": "opLt",
  "<=": "opLte",
  ">": "opGt",
  ">=": "opGte",
  in: "opIn",
  nin: "opNin",
  between: "opBetween",
  empty: "opEmpty",
  nempty: "opNotEmpty",
  contains: "opContains",
  starts: "opStarts"
};
const DATE_OP_LABEL: Partial<Record<Operator, MessageKey>> = {
  ">": "opAfter",
  "<": "opBefore",
  ">=": "opOnOrAfter",
  "<=": "opOnOrBefore"
};
function opLabel(op: Operator, type = kind.value) {
  const key = (type === "date" && DATE_OP_LABEL[op]) || OP_LABEL[op];
  return t(key);
}
const ops = computed(() => (d.value ? allowedOps(d.value.field) : []));
const opRows = computed(() => {
  const q = normalizeText(query.value.trim());
  return ops.value.filter(
    (o) =>
      !q ||
      opSymbol(o) === q ||
      normalizeText(opLabel(o)).includes(q) ||
      o === q
  );
});

const TYPE_LABEL: Record<string, MessageKey> = {
  text: "typeText",
  number: "typeNumber",
  date: "typeDate",
  select: "typeSelect",
  entity: "typeEntity",
  boolean: "typeBoolean"
};
const glyph = (f: QueryField) =>
  f.type === "boolean" ? "◐" : ([...f.label][0] ?? "?");
const fieldMeta = (f: QueryField) =>
  f.variants?.length
    ? f.variants.map((v) => v.label).join(" / ")
    : t(TYPE_LABEL[f.type ?? "text"]!);

// ---- value options (select / entity / boolean)
const currentOptions = computed<unknown[]>(() => {
  const f = d.value?.field;
  if (!f) return [];
  if (f.type === "boolean")
    return [
      { value: true, label: t("yes") },
      { value: false, label: t("no") }
    ];
  return f.search ? results.value : (f.options ?? []);
});
const { rows: optRows } = useOptions({
  options: currentOptions,
  accessors: queryAccessors,
  query: () => (isListValue.value ? query.value : ""),
  filter: () => (d.value?.field.search ? false : undefined)
});
const isSelected = (o: Opt) =>
  !!d.value?.values.some((v) => sameValue(v, o.value));
const stateOf = (g: Grp) => groupState(g, isSelected);

// ---- keyboard navigation over whichever list is showing
const navCount = computed(() => {
  switch (phase.value) {
    case "field":
      return fieldRows.value.length;
    case "variant":
      return variantRows.value.length;
    case "op":
      return opRows.value.length;
    case "value":
      return isListValue.value ? optRows.value.length : 0;
    default:
      return 0;
  }
});
const nav = useListNav({
  count: navCount,
  isDisabled: (i) =>
    isListValue.value && optRows.value[i]
      ? rowDisabled(optRows.value[i]!, arity.value !== "one", isSelected)
      : false,
  onSelect: (i) => {
    switch (phase.value) {
      case "field":
        return pickFieldRow(fieldRows.value[i]!);
      case "variant":
        return pickVariant(variantRows.value[i]!.key);
      case "op":
        return pickOp(opRows.value[i]!);
      case "value": {
        const r = optRows.value[i];
        if (r?.kind === "option") pickOption(r.option);
        else if (r) pickGroup(r.group);
      }
    }
  }
});
function resetActive() {
  const multi = isListValue.value && arity.value !== "one";
  nav.active.value =
    navCount.value === 0 ? -1 : multi && !query.value.trim() ? -1 : 0;
}
watch([phase, navCount, query, () => d.value?.step], resetActive);

// ---- formatting
const sep = computed(() => (locale.value.startsWith("fa") ? "، " : ", "));
function showDate(iso: string) {
  const dt = PlainDateTime.fromISO(iso);
  return dt
    ? format(dt, "yyyy/MM/dd", { calendar: calId.value, locale: locale.value })
    : iso;
}
function showValue(f: QueryField, v: unknown, label?: string) {
  switch (f.type ?? "text") {
    case "number":
      return localizeDigits(String(v), locale.value);
    case "date":
      return showDate(String(v));
    case "boolean":
      return t(v ? "yes" : "no");
    case "select":
    case "entity":
      return label ?? optionLabel(f, v) ?? String(v);
    default:
      return String(v);
  }
}
function valuesText(
  f: QueryField,
  op: Operator,
  values: unknown[],
  labels?: string[]
) {
  const ar = opArity(op);
  if (ar === "none") return "";
  const parts = values.map((v, i) => showValue(f, v, labels?.[i]));
  return parts.join(ar === "two" ? " – " : sep.value);
}
const errorText = (e: QueryError) => e.text ?? t(e.key!);

interface Chip {
  field: string;
  variant?: string;
  sym?: string;
  flip?: boolean;
  text: string;
  draft?: boolean;
  invalid?: string;
}
const chips = computed<Chip[]>(() =>
  items.value.map((it) => {
    const f = props.fields.find((x) => x.key === it.key);
    if (!f)
      return {
        field: it.key,
        sym: opSymbol(it.op),
        flip: flips(it.op),
        text: String(it.value ?? ""),
        invalid: t("invalidFilter")
      };
    const bad = validateItem(f, it);
    const values = Array.isArray(it.value)
      ? it.value
      : it.value === undefined
        ? []
        : [it.value];
    return {
      field: f.label,
      variant: f.variants?.find((v) => v.key === it.variant)?.label,
      sym: opSymbol(it.op),
      flip: flips(it.op),
      text: valuesText(f, it.op, values, it.display),
      invalid: bad ? errorText(bad) : undefined
    };
  })
);
const draftChip = computed<Chip | null>(() => {
  const x = d.value;
  if (!x) return null;
  const f = x.field;
  const text = x.op ? valuesText(f, x.op, x.values, x.labels) : "";
  return {
    field: f.label,
    variant: f.variants?.find((v) => v.key === x.variant)?.label,
    sym: x.op ? opSymbol(x.op) : undefined,
    flip: flips(x.op),
    text: (text ? text + " " : "") + "…",
    draft: true
  };
});

// ---- transitions
function resetDraft() {
  draft.value = null;
  query.value = "";
  browse.value = false;
  error.value = "";
  results.value = [];
  loading.value = false;
}
function cancel() {
  resetDraft();
  open.value = false;
}
function focusInput() {
  input.value?.focus();
}
function pickFieldRow(f: QueryField) {
  resetDraft();
  draft.value = { field: f, values: [], labels: [], step: "op", index: null };
  if (f.variants?.length) draft.value.step = "variant";
  else afterVariant();
}
function afterVariant() {
  const x = draft.value!;
  const list = allowedOps(x.field);
  if (list.length === 1) pickOp(list[0]!);
  else x.step = "op";
}
function pickVariant(key: string) {
  draft.value!.variant = key;
  query.value = "";
  afterVariant();
}
function pickOp(op: Operator) {
  const x = draft.value!;
  x.op = op;
  query.value = "";
  error.value = "";
  if (opArity(op) === "none") return commit();
  x.step = "value";
}
function changeOp(op: Operator) {
  const x = draft.value!;
  x.op = op;
  error.value = "";
  const ar = opArity(op);
  if (ar === "none") return commit();
  if (ar === "one")
    ((x.values.length = Math.min(x.values.length, 1)),
      (x.labels.length = x.values.length));
  if (ar === "two")
    ((x.values.length = Math.min(x.values.length, 2)),
      (x.labels.length = x.values.length));
  focusInput();
}
function back() {
  const x = draft.value;
  if (!x) return;
  error.value = "";
  if (x.step === "value" && x.values.length) {
    x.values.pop();
    x.labels.pop();
  } else if (x.index !== null) {
    cancel();
  } else if (x.step === "value" && ops.value.length > 1) {
    x.step = "op";
    x.op = undefined;
  } else if (x.step !== "variant" && x.field.variants?.length) {
    x.step = "variant";
    x.variant = undefined;
    x.op = undefined;
  } else {
    resetDraft();
    browse.value = true;
  }
}

function commit(): boolean {
  const x = draft.value;
  if (!x?.op) return false;
  const ar = opArity(x.op);
  const values = ar === "two" ? sortPair(x.values) : x.values;
  const item: QueryItem = { key: x.field.key, op: x.op };
  if (x.variant) item.variant = x.variant;
  if (ar !== "none") item.value = ar === "one" ? values[0] : values;
  if (x.field.search && x.labels.length) item.display = [...x.labels];
  const bad = validateItem(x.field, item);
  if (bad) {
    error.value = errorText(bad);
    return false;
  }
  const next = [...items.value];
  if (x.index !== null) next[x.index] = item;
  else next.push(item);
  emit("update:modelValue", next);
  queueMicrotask(val.onChange);
  resetDraft();
  open.value = false;
  focusInput();
  return true;
}

function pickOption(o: Opt) {
  const x = draft.value!;
  if (arity.value === "one") {
    x.values = [o.value];
    x.labels = [o.label];
    commit();
    return;
  }
  const i = x.values.findIndex((v) => sameValue(v, o.value));
  if (i >= 0) {
    x.values.splice(i, 1);
    x.labels.splice(i, 1);
  } else {
    x.values.push(o.value);
    x.labels.push(o.label);
  }
  error.value = "";
  query.value = "";
}
function pickGroup(g: Grp) {
  const x = draft.value!;
  if (arity.value === "one") return;
  x.values = toggleGroupValues(
    x.values,
    g,
    isSelected,
    (o) => o.value,
    sameValue
  );
  x.labels = [];
}

function pickDay(iso: string) {
  const x = draft.value!;
  error.value = "";
  if (arity.value === "one") {
    x.values = [iso];
    commit();
  } else if (arity.value === "two") {
    if (x.values.length === 1) {
      x.values = [x.values[0], iso];
      commit();
    } else x.values = [iso];
  } else if (!x.values.includes(iso)) x.values.push(iso);
}

function parseTyped(f: QueryField, raw: string): unknown {
  switch (f.type ?? "text") {
    case "number":
      return toNumber(cleanNumber(raw)) ?? undefined;
    case "date": {
      const p = parseUserInput(raw);
      return p
        ? PlainDateTime.fromObject(p.date, p.calendar)?.toISODate()
        : undefined;
    }
    default:
      return fixPersianLetters(raw).trim();
  }
}
function addTyped() {
  const x = draft.value!;
  const raw = query.value.trim();
  if (!raw) {
    if (arity.value === "list" && x.values.length) commit();
    return;
  }
  const v = parseTyped(x.field, raw);
  const bad =
    v === undefined
      ? {
          key: (x.field.type === "date"
            ? "invalidDate"
            : "invalidNumber") as MessageKey
        }
      : checkValue(x.field, v);
  if (bad) {
    error.value = errorText(bad);
    return;
  }
  error.value = "";
  if (arity.value === "one") {
    x.values = [v];
    commit();
    return;
  }
  x.values.push(v);
  query.value = "";
  if (arity.value === "two" && x.values.length === 2) commit();
}

function edit(i: number) {
  if (readOnly.value) return;
  const it = items.value[i]!;
  const f = props.fields.find((x) => x.key === it.key);
  if (!f) return;
  resetDraft();
  selected.value = null;
  draft.value = {
    field: f,
    variant: it.variant,
    op: it.op,
    values: Array.isArray(it.value)
      ? [...it.value]
      : it.value === undefined
        ? []
        : [it.value],
    labels: it.display ? [...it.display] : [],
    step: opArity(it.op) === "none" ? "op" : "value",
    index: i
  };
  focusInput();
}
function remove(i: number) {
  if (readOnly.value) return;
  emit(
    "update:modelValue",
    items.value.filter((_, k) => k !== i)
  );
  selected.value = null;
  focusInput();
}
function clearAll() {
  emit("update:modelValue", []);
  cancel();
  focusInput();
}

// ---- async entity search
let timer: ReturnType<typeof setTimeout> | undefined;
let seq = 0;
function scheduleSearch() {
  const x = draft.value;
  if (!x || x.step !== "value" || !x.field.search) return;
  clearTimeout(timer);
  loading.value = true;
  const mine = ++seq;
  const q = query.value.trim();
  timer = setTimeout(
    async () => {
      try {
        const r = await x.field.search!(q);
        if (mine === seq) results.value = r ?? [];
      } catch {
        if (mine === seq) results.value = [];
      } finally {
        if (mine === seq) loading.value = false;
      }
    },
    q ? 250 : 0
  );
}
watch([() => d.value?.step, query], scheduleSearch);
onBeforeUnmount(() => clearTimeout(timer));

// ---- input events
function onInput() {
  selected.value = null;
  error.value = "";
}
function onKeydown(e: KeyboardEvent) {
  if (e.isComposing || readOnly.value) return;
  const p = phase.value;
  if (e.key === "Escape") {
    if (p || draft.value) {
      e.preventDefault();
      e.stopPropagation();
      cancel();
    }
    selected.value = null;
    return;
  }
  if (e.key === "Backspace" || e.key === "Delete") {
    if (e.key === "Backspace" && !query.value && draft.value) {
      e.preventDefault();
      back();
      return;
    }
    if (!query.value && !draft.value && items.value.length) {
      e.preventDefault();
      const last = items.value.length - 1;
      if (selected.value !== null) remove(selected.value);
      else selected.value = last;
      return;
    }
  }
  if (selected.value !== null && e.key !== "Shift") selected.value = null;
  // Enter toggles the highlighted row, so a multi-select commits with Ctrl/Cmd+Enter.
  if (
    e.key === "Enter" &&
    (e.ctrlKey || e.metaKey) &&
    isListValue.value &&
    arity.value !== "one"
  ) {
    e.preventDefault();
    if (draft.value!.values.length) commit();
    return;
  }
  if (p && navCount.value > 0 && nav.onKeydown(e)) return;
  if (e.key === "ArrowDown" && !p) {
    e.preventDefault();
    browse.value = true;
    return;
  }
  if (e.key === "ArrowDown" && isDateValue.value) {
    e.preventDefault();
    cal.value?.focus();
    return;
  }
  if (e.key !== "Enter") return;
  e.preventDefault();
  if (!p) browse.value = true;
  else if (isTypedValue.value || isDateValue.value) addTyped();
  else if (
    isListValue.value &&
    arity.value !== "one" &&
    draft.value!.values.length
  )
    commit();
}
function onFrameClick(e: MouseEvent) {
  const el = e.target as HTMLElement;
  if (el.closest("button, a")) return;
  focusInput();
  if (!readOnly.value && !draft.value) browse.value = true;
}
function onBlur() {
  selected.value = null;
  val.onBlur();
  // Tabbing away abandons a half-built filter. Switching windows (no document focus) keeps it.
  if (document.hasFocus()) cancel();
}

const rid = (i: number) => `${uid}-r-${i}`;
const activeId = computed(() => {
  const i = nav.active.value;
  if (!phase.value || i < 0) return undefined;
  return isListValue.value ? `${uid}-opt-${i}` : rid(i);
});

const val = useValidation({
  value: () => props.modelValue,
  rules: () => props.rules,
  messages: () => props.messages,
  label: () => props.label,
  name: () =>
    String(attrs.name ?? (props as { name?: string }).name ?? "") || undefined,
  validateOn: () => props.validateOn,
  focus: focusInput,
  el: () => input.value ?? null
});
const fieldProps = computed(() =>
  pickField(props, { control: "vi-qb__control" }, val.error.value)
);
defineExpose({ focus: focusInput, cancel, el: input });
</script>

<template>
  <ViField
    ref="field"
    v-bind="{ ...fieldProps, ...rootAttrs }"
    :active="open || undefined"
    @control-click="onFrameClick"
  >
    <template #label
      ><slot name="label">{{ props.label }}</slot></template
    >
    <template v-if="$slots.meta" #meta><slot name="meta" /></template>
    <template #before>
      <ViIcon class="vi-qb__icon" name="filter" :size="18" :width="2" />
    </template>
    <template #default="{ id }">
      <div class="vi-qb" role="list" :aria-label="props.label">
        <template v-for="(c, i) in chips" :key="i">
          <span
            v-if="d && d.index === i && draftChip"
            class="vi-chip vi-qchip"
            data-draft
          >
            <span class="vi-qchip__field">{{ draftChip.field }}</span>
            <span v-if="draftChip.variant" class="vi-qchip__field">{{
              draftChip.variant
            }}</span>
            <b v-if="draftChip.sym" dir="ltr" class="vi-qchip__op"
              ><span :class="{ 'vi-flip': draftChip.flip }">{{
                draftChip.sym
              }}</span></b
            >
            <b class="vi-qchip__val">{{ draftChip.text }}</b>
          </span>
          <span
            v-else
            class="vi-chip vi-qchip"
            role="listitem"
            :data-selected="selected === i || undefined"
            :data-invalid="c.invalid ? '' : undefined"
            :title="c.invalid"
            :tabindex="readOnly ? undefined : -1"
            @click.stop="edit(i)"
          >
            <span class="vi-qchip__field">{{ c.field }}</span>
            <span v-if="c.variant" class="vi-qchip__field">{{
              c.variant
            }}</span>
            <b dir="ltr" class="vi-qchip__op"
              ><span :class="{ 'vi-flip': c.flip }">{{ c.sym }}</span></b
            >
            <b v-if="c.text" class="vi-qchip__val">{{ c.text }}</b>
            <button
              v-if="!readOnly"
              type="button"
              class="vi-chip__x"
              tabindex="-1"
              :aria-label="`${t('removeFilter')}: ${c.field}`"
              @mousedown.prevent
              @click.stop="remove(i)"
            >
              <ViIcon name="close" :size="11" :width="3.5" />
            </button>
          </span>
        </template>
        <span
          v-if="d && d.index === null && draftChip"
          class="vi-chip vi-qchip"
          data-draft
        >
          <span class="vi-qchip__field">{{ draftChip.field }}</span>
          <span v-if="draftChip.variant" class="vi-qchip__field">{{
            draftChip.variant
          }}</span>
          <b v-if="draftChip.sym" dir="ltr" class="vi-qchip__op"
            ><span :class="{ 'vi-flip': draftChip.flip }">{{
              draftChip.sym
            }}</span></b
          >
          <b class="vi-qchip__val">{{ draftChip.text }}</b>
        </span>
        <input
          v-bind="inputAttrs"
          :id="id"
          ref="input"
          v-model="query"
          class="vi-native vi-qb__input"
          type="text"
          role="combobox"
          autocomplete="off"
          :placeholder="
            items.length || d
              ? undefined
              : (props.placeholder ?? t('queryPlaceholder'))
          "
          :disabled="props.disabled"
          :readonly="props.readonly || undefined"
          :aria-expanded="open"
          :aria-activedescendant="activeId"
          aria-autocomplete="list"
          @keydown="onKeydown"
          @input="onInput"
          @blur="onBlur"
        />
      </div>
      <ViPopup
        v-model="open"
        :anchor="anchor"
        :match-width="listPhase"
        :mobile="false"
        :auto-scroll="props.autoScroll"
        :close-on-escape="false"
        :restore-focus="false"
        @close="cancel"
      >
        <div
          class="vi-qb__panel"
          @mousedown.prevent
          @keydown.esc.stop="(cancel(), focusInput())"
        >
          <div
            v-if="phase === 'value' && ops.length > 1 && d"
            class="vi-qb__ops"
            dir="ltr"
            role="group"
            :aria-label="d.field.label"
          >
            <button
              v-for="o in ops"
              :key="o"
              type="button"
              class="vi-qb__opbtn"
              :aria-pressed="d.op === o"
              :title="opLabel(o)"
              :aria-label="opLabel(o)"
              @click="changeOp(o)"
            >
              <span :class="{ 'vi-flip': flips(o) }">{{ opSymbol(o) }}</span>
            </button>
          </div>

          <template v-if="phase === 'field'">
            <div class="vi-options" role="listbox" :aria-label="props.label">
              <div
                v-for="(f, i) in fieldRows"
                :id="rid(i)"
                :key="f.key"
                class="vi-option"
                role="option"
                :data-active="nav.active.value === i || undefined"
                :aria-selected="nav.active.value === i"
                @mousemove="nav.active.value = i"
                @click="pickFieldRow(f)"
              >
                <span class="vi-qb__glyph">{{ glyph(f) }}</span>
                <span class="vi-option__label">
                  <template
                    v-for="[a, m, b] in [highlight(f.label, filterText)]"
                    :key="0"
                    >{{ a }}<span v-if="m" class="vi-hl">{{ m }}</span
                    >{{ b }}</template
                  >
                </span>
                <span class="vi-option__hint">{{ fieldMeta(f) }}</span>
              </div>
            </div>
            <div
              v-if="!fieldRows.length"
              class="vi-select__empty"
              role="status"
            >
              <strong>{{ t("noFields") }}</strong>
            </div>
            <div v-if="usedNote" class="vi-qb__note">{{ usedNote }}</div>
          </template>

          <template v-else-if="phase === 'variant' && d">
            <div class="vi-qb__title">{{ t("whichVariant") }}</div>
            <div class="vi-options" role="listbox">
              <div
                v-for="(v, i) in variantRows"
                :id="rid(i)"
                :key="v.key"
                class="vi-option"
                role="option"
                :data-active="nav.active.value === i || undefined"
                :aria-selected="nav.active.value === i"
                @mousemove="nav.active.value = i"
                @click="pickVariant(v.key)"
              >
                <span class="vi-option__label">{{ v.label }}</span>
                <span dir="ltr" class="vi-option__hint">{{ v.key }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="phase === 'op' && d">
            <div class="vi-options" role="listbox">
              <div
                v-for="(o, i) in opRows"
                :id="rid(i)"
                :key="o"
                class="vi-option"
                role="option"
                :data-active="nav.active.value === i || undefined"
                :aria-selected="nav.active.value === i"
                @mousemove="nav.active.value = i"
                @click="pickOp(o)"
              >
                <span dir="ltr" class="vi-qb__sym"
                  ><span :class="{ 'vi-flip': flips(o) }">{{
                    opSymbol(o)
                  }}</span></span
                >
                <span class="vi-option__label">{{ opLabel(o) }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="phase === 'value' && d">
            <template v-if="isListValue">
              <div v-if="loading" class="vi-qb__loading" role="status">
                <span class="vi-qb__spin" />{{ t("loading") }}
              </div>
              <ViOptionList
                v-if="optRows.length"
                :id="`${uid}-opt`"
                :rows="optRows"
                :active="nav.active.value"
                :is-selected="isSelected"
                :group-state-of="stateOf"
                :multiple="arity !== 'one'"
                :query="query"
                :label="props.label"
                @pick="pickOption"
                @pick-group="pickGroup"
                @hover="nav.active.value = $event"
              />
              <div v-else-if="!loading" class="vi-select__empty" role="status">
                <strong>{{ t(query ? "noResults" : "noOptions") }}</strong>
              </div>
              <div v-if="arity !== 'one'" class="vi-qb__foot">
                <button
                  type="button"
                  class="vi-btn vi-btn--primary vi-btn--sm"
                  :disabled="!d.values.length"
                  @click="commit()"
                >
                  {{ t("addFilter") }}
                  <template v-if="d.values.length">
                    ({{ localizeDigits(d.values.length, locale) }})</template
                  >
                  <kbd dir="ltr" class="vi-qb__kbd">{{ t("hintMulti") }}</kbd>
                </button>
              </div>
            </template>
            <template v-else-if="isDateValue">
              <ViCalendar
                ref="cal"
                :model-value="
                  arity === 'one' ? ((d.values[0] as string) ?? null) : null
                "
                :range-start="
                  arity === 'two'
                    ? ((d.values[0] as string) ?? null)
                    : undefined
                "
                :range-end="
                  arity === 'two'
                    ? ((d.values[1] as string) ?? null)
                    : undefined
                "
                :calendar="calId"
                :min="d.field.min as string | undefined"
                :max="d.field.max as string | undefined"
                @update:model-value="pickDay"
              />
              <div
                v-if="arity === 'two' && d.values.length === 1"
                class="vi-qb__hint"
              >
                {{ t("pickEnd") }}
              </div>
            </template>
            <div v-else class="vi-qb__hint">
              {{ t("typeValue") }}
              <kbd dir="ltr">Enter ↵</kbd>
            </div>
            <div v-if="error" class="vi-qb__err" role="alert">{{ error }}</div>
          </template>
        </div>
      </ViPopup>
    </template>
    <template v-if="props.clearable && items.length && !readOnly" #after>
      <button
        type="button"
        class="vi-clear"
        :aria-label="t('clear')"
        @mousedown.prevent
        @click="clearAll"
      >
        <ViIcon name="close" :size="14" :width="2.5" />
      </button>
    </template>
  </ViField>
</template>
