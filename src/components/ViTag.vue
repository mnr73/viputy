<script setup lang="ts">
import { computed, ref, useAttrs, useId, watch } from "vue";
import { useListNav } from "../composables/useListNav";
import { useViputy } from "../i18n/config";
import {
  fixPersianLetters,
  highlight,
  localizeDigits,
  normalizeText
} from "../utils/text";
import { pickField, type FieldProps } from "./field-props";
import ViField from "./ViField.vue";
import { ViIcon } from "./ViIcon";
import ViPopup from "./ViPopup.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    FieldProps & {
      modelValue?: string[];
      placeholder?: string;
      /** Values offered while typing. */
      suggestions?: string[];
      /** Maximum number of tags; shows a counter. */
      max?: number;
      /** Allow values that are not in `suggestions`. */
      allowCustom?: boolean;
      allowDuplicates?: boolean;
      /** Typed characters that commit a tag (Enter always does). */
      separators?: string[];
      /** Hide the chips and show only a count. */
      hideTags?: boolean;
      dir?: "ltr" | "rtl" | "auto";
    }
  >(),
  {
    modelValue: () => [],
    suggestions: () => [],
    allowCustom: true,
    separators: () => [",", "،"],
    status: null
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  add: [tag: string];
  remove: [tag: string];
}>();
defineSlots<{
  label?(): unknown;
  meta?(): unknown;
  tag?(p: { tag: string; remove: () => void }): unknown;
}>();

const attrs = useAttrs();
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const inputAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs;
  return rest;
});

const { t, locale } = useViputy();
const uid = useId();
const field = ref<InstanceType<typeof ViField>>();
const input = ref<HTMLInputElement>();
const query = ref("");
const focused = ref(false);
const popupOpen = ref(false);
/** hide-tags: the count chip opens this list so items stay reviewable and removable. */
const listOpen = ref(false);

const items = computed(() => props.modelValue);
const full = computed(
  () => props.max != null && items.value.length >= props.max
);
const norm = (s: string) => normalizeText(s);
const has = (s: string) => items.value.some((x) => norm(x) === norm(s));

type Row = { kind: "suggestion" | "new"; value: string };
const rows = computed<Row[]>(() => {
  const q = norm(query.value);
  const out: Row[] = props.suggestions
    .filter((s) => (props.allowDuplicates || !has(s)) && norm(s).includes(q))
    .map((value) => ({ kind: "suggestion", value }));
  const typed = query.value.trim();
  const exists =
    props.suggestions.some((s) => norm(s) === norm(typed)) ||
    (!props.allowDuplicates && has(typed));
  if (props.allowCustom && typed && !exists)
    out.push({ kind: "new", value: typed });
  return out;
});

const nav = useListNav({
  count: () => rows.value.length,
  onSelect: (i) => pick(rows.value[i]!)
});
const want = computed(
  () => focused.value && !full.value && !props.readonly && rows.value.length > 0
);
watch(want, (v) => (popupOpen.value = v));
watch(query, () => nav.reset());
watch(
  () => items.value.length,
  (n) => {
    if (!n) listOpen.value = false;
  }
);

/** Adds as many of `raws` as allowed in ONE update (props lag behind emits). */
function addMany(raws: string[]): boolean {
  const list = [...items.value];
  const added: string[] = [];
  for (const raw of raws) {
    let v = fixPersianLetters(raw).trim();
    if (!v) continue;
    if (!props.allowCustom) {
      const known = props.suggestions.find((s) => norm(s) === norm(v));
      if (!known) continue;
      v = known;
    }
    if (props.max != null && list.length >= props.max) break;
    if (!props.allowDuplicates && list.some((x) => norm(x) === norm(v)))
      continue;
    list.push(v);
    added.push(v);
  }
  if (!added.length) return false;
  emit("update:modelValue", list);
  for (const v of added) emit("add", v);
  return true;
}
const addTag = (raw: string) => addMany([raw]);
function removeTag(i: number) {
  const tag = items.value[i]!;
  emit(
    "update:modelValue",
    items.value.filter((_, k) => k !== i)
  );
  emit("remove", tag);
}
function pick(r: Row) {
  if (addTag(r.value)) query.value = "";
  nav.reset();
}
function commit() {
  if (addTag(query.value)) query.value = "";
}

function onKeydown(e: KeyboardEvent) {
  if (e.isComposing) return;
  if (popupOpen.value && nav.onKeydown(e)) return;
  if (e.key === "ArrowDown" && want.value) {
    popupOpen.value = true;
    return;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    commit();
  } else if (props.separators.includes(e.key)) {
    if (query.value.trim()) {
      e.preventDefault();
      commit();
    }
  } else if (
    e.key === "Backspace" &&
    !query.value &&
    items.value.length &&
    !props.readonly
  ) {
    removeTag(items.value.length - 1);
  }
}

const splitRe = computed(
  () =>
    new RegExp(
      "[" +
        [...props.separators, "\n"]
          .map((s) => s.replace(/[\]\\^-]/g, "\\$&"))
          .join("") +
        "]"
    )
);
function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData("text") ?? "";
  if (!splitRe.value.test(text)) return;
  e.preventDefault();
  addMany(text.split(splitRe.value));
}
function onInput() {
  popupOpen.value = want.value;
}

const anchor = computed(
  () => (field.value?.control as HTMLElement | undefined) ?? null
);
const counter = computed(() =>
  props.max != null
    ? localizeDigits(`${items.value.length} / ${props.max}`, locale.value)
    : ""
);
const fieldProps = computed(() => {
  const f = pickField(props, { control: "vi-tags__control" });
  if (full.value && props.max != null) {
    f.status ??= "warning";
    f.message ??= t("tagsMax", {
      max: localizeDigits(props.max, locale.value)
    });
  }
  return f;
});
const optId = (i: number) => `${uid}-o-${i}`;

defineExpose({ focus: () => input.value?.focus(), el: input });
</script>

<template>
  <ViField ref="field" v-bind="{ ...fieldProps, ...rootAttrs }">
    <template #label
      ><slot name="label">{{ props.label }}</slot></template
    >
    <template v-if="counter || $slots.meta" #meta>
      <slot name="meta" />
      <span
        v-if="counter"
        class="vi-counter"
        :data-state="full ? 'warning' : undefined"
        aria-live="polite"
        >{{ counter }}</span
      >
    </template>
    <template #default="{ id }">
      <div class="vi-tags" @click="input?.focus()">
        <template v-if="!props.hideTags">
          <span v-for="(tag, i) in items" :key="tag + i" class="vi-chip">
            <slot name="tag" :tag="tag" :remove="() => removeTag(i)">
              {{ tag }}
              <button
                v-if="!props.disabled && !props.readonly"
                type="button"
                class="vi-chip__x"
                tabindex="-1"
                :aria-label="t('removeTag', { tag })"
                @click.stop="removeTag(i)"
              >
                <ViIcon name="close" :size="11" :width="3.5" />
              </button>
            </slot>
          </span>
        </template>
        <input
          v-bind="inputAttrs"
          :id="id"
          ref="input"
          v-model="query"
          class="vi-native vi-tags__input"
          type="text"
          role="combobox"
          autocomplete="off"
          :dir="props.dir"
          :placeholder="full ? t('maxReached') : props.placeholder"
          :disabled="props.disabled || full || undefined"
          :readonly="props.readonly || undefined"
          :aria-expanded="popupOpen"
          :aria-activedescendant="
            popupOpen && nav.active.value >= 0
              ? optId(nav.active.value)
              : undefined
          "
          aria-autocomplete="list"
          @focus="focused = true"
          @blur="focused = false"
          @keydown="onKeydown"
          @input="onInput"
          @paste="onPaste"
        />
      </div>
      <ViPopup
        v-model="popupOpen"
        :anchor="anchor"
        match-width
        :mobile="false"
        role="listbox"
        :close-on-outside="true"
        :restore-focus="false"
      >
        <div class="vi-options">
          <div
            v-for="(r, i) in rows"
            :id="optId(i)"
            :key="r.kind + r.value"
            class="vi-option"
            role="option"
            :data-kind="r.kind"
            :data-active="nav.active.value === i || undefined"
            :aria-selected="nav.active.value === i"
            @mousedown.prevent
            @mouseenter="nav.active.value = i"
            @click="pick(r)"
          >
            <template v-if="r.kind === 'new'">{{
              t("addTag", { tag: r.value })
            }}</template>
            <template v-else>
              <span>
                <template
                  v-for="[a, m, b] in [highlight(r.value, query)]"
                  :key="0"
                  >{{ a }}<span v-if="m" class="vi-hl">{{ m }}</span
                  >{{ b }}</template
                >
              </span>
              <span v-if="nav.active.value === i" class="vi-option__hint"
                >Enter</span
              >
            </template>
          </div>
        </div>
      </ViPopup>
    </template>
    <template v-if="props.hideTags && items.length" #after>
      <button
        type="button"
        class="vi-chip vi-chip--count vi-chip--button"
        :aria-expanded="listOpen"
        :aria-label="t('selectedItems')"
        @mousedown.prevent
        @click.stop="listOpen = !listOpen"
      >
        {{ t("itemsCount", { n: localizeDigits(items.length, locale) }) }}
      </button>
      <ViPopup
        v-model="listOpen"
        :anchor="anchor"
        match-width
        :mobile="false"
        :title="t('selectedItems')"
      >
        <div class="vi-options vi-taglist">
          <div v-for="(tag, i) in items" :key="tag + i" class="vi-option">
            <span class="vi-taglist__name">{{ tag }}</span>
            <button
              v-if="!props.disabled && !props.readonly"
              type="button"
              class="vi-chip__x"
              :aria-label="t('removeTag', { tag })"
              @click.stop="removeTag(i)"
            >
              <ViIcon name="close" :size="11" :width="3.5" />
            </button>
          </div>
        </div>
      </ViPopup>
    </template>
  </ViField>
</template>
