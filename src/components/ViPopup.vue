<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch
} from "vue";
import { useViputy } from "../i18n/config";
import { usePopup } from "../composables/usePopup";
import type { Align, Side } from "../utils/placement";

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    /** Element to position against. Defaults to the trigger slot wrapper. */
    anchor?: HTMLElement | null;
    side?: Side;
    align?: Align;
    offset?: number;
    /** Make the panel as wide as the anchor. */
    matchWidth?: boolean;
    /** Narrow screens: bottom sheet, full screen, or keep the popover. */
    mobile?: "sheet" | "fullscreen" | false;
    /** Max viewport width (px) that counts as narrow. */
    breakpoint?: number;
    /** Title shown in the sheet header. */
    title?: string;
    closeOnOutside?: boolean;
    /**
     * When the panel fits neither above nor below, scroll the page a little so it fits
     * (default). `false` never moves the page; the panel then scrolls inside itself.
     */
    autoScroll?: boolean;
    /**
     * Return focus to the element that had it when the panel closes (default). Turn off for
     * combobox-style inputs whose own focus state opens the panel, or closing re-opens it.
     */
    restoreFocus?: boolean;
    /** Render the panel in <body> (default) so it is never clipped. */
    teleport?: boolean;
    role?: string;
  }>(),
  {
    modelValue: false,
    side: "bottom",
    align: "start",
    offset: 6,
    mobile: "sheet",
    breakpoint: 640,
    closeOnOutside: true,
    autoScroll: true,
    restoreFocus: true,
    teleport: true,
    role: "dialog"
  }
);

const emit = defineEmits<{
  "update:modelValue": [open: boolean];
  open: [];
  close: [];
}>();

defineSlots<{
  trigger?(p: {
    open: boolean;
    toggle: () => void;
    attrs: Record<string, unknown>;
  }): unknown;
  default?(p: { close: () => void; sheet: boolean }): unknown;
  footer?(p: { close: () => void }): unknown;
}>();

const { t } = useViputy();
const panelId = useId();
const root = ref<HTMLElement>();
const panel = ref<HTMLElement>();
const open = ref(props.modelValue);
const narrow = ref(false);
const dir = ref<"ltr" | "rtl">("ltr");
const themeClass = ref("");

const isSheet = computed(() => props.mobile !== false && narrow.value);
const anchorEl = computed(() => props.anchor ?? root.value);

function setOpen(v: boolean) {
  if (open.value === v) return;
  open.value = v;
  emit("update:modelValue", v);
  if (v) emit("open");
  else emit("close");
}
const close = () => setOpen(false);
const toggle = () => setOpen(!open.value);

watch(
  () => props.modelValue,
  (v) => {
    if (open.value !== v) {
      open.value = v;
      if (v) emit("open");
      else emit("close");
    }
  }
);

const { style, side, placed } = usePopup({
  open,
  enabled: computed(() => !isSheet.value),
  anchor: anchorEl,
  panel,
  side: computed(() => props.side),
  align: computed(() => props.align),
  offset: computed(() => props.offset),
  matchWidth: computed(() => props.matchWidth),
  dir,
  autoScroll: computed(() => props.autoScroll)
});

// The panel is teleported to <body>, so copy what it would otherwise inherit.
function readContext() {
  const el = anchorEl.value;
  if (!el) return;
  dir.value = getComputedStyle(el).direction === "rtl" ? "rtl" : "ltr";
  themeClass.value = el.closest('.dark,.vi-theme-dark,[data-theme="dark"]')
    ? "vi-theme-dark"
    : "";
}

let lastFocus: HTMLElement | null = null;
let restoreScroll: (() => void) | null = null;

function lockScroll() {
  const el = document.documentElement;
  const prev = el.style.overflow;
  el.style.overflow = "hidden";
  restoreScroll = () => (el.style.overflow = prev);
}
function unlockScroll() {
  restoreScroll?.();
  restoreScroll = null;
}

watch(
  [open, isSheet],
  async ([o, sheet]) => {
    unlockScroll();
    if (!o) {
      if (props.restoreFocus)
        lastFocus?.isConnected && lastFocus.focus?.({ preventScroll: true });
      lastFocus = null;
      return;
    }
    readContext();
    lastFocus ??= document.activeElement as HTMLElement | null;
    if (sheet) {
      lockScroll();
      await nextTick();
      panel.value?.focus({ preventScroll: true });
    }
  },
  { flush: "post" }
);

function onDocPointer(e: PointerEvent) {
  if (!open.value || !props.closeOnOutside || isSheet.value) return;
  const target = e.target as Node;
  if (panel.value?.contains(target)) return;
  if (root.value?.contains(target) || props.anchor?.contains(target)) return;
  close();
}
function onDocKey(e: KeyboardEvent) {
  if (!open.value) return;
  if (e.key === "Escape") {
    e.stopPropagation();
    close();
  } else if (e.key === "Tab" && isSheet.value) {
    trapTab(e);
  }
}
function trapTab(e: KeyboardEvent) {
  const nodes = panel.value?.querySelectorAll<HTMLElement>(
    'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'
  );
  if (!nodes?.length) return;
  const first = nodes[0]!;
  const last = nodes[nodes.length - 1]!;
  const cur = document.activeElement;
  if (e.shiftKey && (cur === first || cur === panel.value)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && cur === last) {
    e.preventDefault();
    first.focus();
  }
}

let mq: MediaQueryList | null = null;
const onMq = () => (narrow.value = !!mq?.matches);
onMounted(() => {
  document.addEventListener("pointerdown", onDocPointer, true);
  document.addEventListener("keydown", onDocKey, true);
  mq = window.matchMedia(`(max-width: ${props.breakpoint}px)`);
  onMq();
  mq.addEventListener("change", onMq);
});
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocPointer, true);
  document.removeEventListener("keydown", onDocKey, true);
  mq?.removeEventListener("change", onMq);
  unlockScroll();
});

const triggerAttrs = computed(() => ({
  "aria-haspopup": props.role,
  "aria-expanded": open.value,
  "aria-controls": open.value ? panelId : undefined
}));

defineExpose({ open, close, toggle, panel, isSheet });
</script>

<template>
  <div ref="root" class="vi-popup">
    <slot name="trigger" :open="open" :toggle="toggle" :attrs="triggerAttrs" />
  </div>
  <Teleport to="body" :disabled="!props.teleport">
    <div
      v-if="open"
      class="vi-layer"
      :class="themeClass"
      :dir="dir"
      :data-side="side"
    >
      <Transition name="vi-fade" appear>
        <div v-if="isSheet" class="vi-scrim" @click="close" />
      </Transition>
      <Transition :name="isSheet ? 'vi-sheet' : 'vi-pop'" appear>
        <div
          :id="panelId"
          ref="panel"
          class="vi-panel"
          :class="{
            'vi-panel--sheet': isSheet,
            'vi-panel--full': isSheet && props.mobile === 'fullscreen'
          }"
          :style="
            isSheet
              ? undefined
              : { ...style, visibility: placed ? undefined : 'hidden' }
          "
          :role="props.role"
          :aria-modal="isSheet ? true : undefined"
          :aria-label="props.title"
          tabindex="-1"
        >
          <template v-if="isSheet">
            <span class="vi-sheet__grab" />
            <div class="vi-sheet__head">
              <span class="vi-sheet__title">{{ props.title }}</span>
              <button
                type="button"
                class="vi-sheet__close"
                :aria-label="t('close')"
                @click="close"
              >
                ×
              </button>
            </div>
            <div class="vi-sheet__body">
              <slot :close="close" :sheet="true" />
            </div>
            <div v-if="$slots.footer" class="vi-sheet__foot">
              <slot name="footer" :close="close" />
            </div>
          </template>
          <slot v-else :close="close" :sheet="false" />
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
