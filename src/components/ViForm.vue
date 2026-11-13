<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  useAttrs
} from "vue";
import {
  provideForm,
  type FormEntry,
  type ValidateOn
} from "../composables/useForm";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /**
     * When fields check themselves. `"blur"` (default): after the user leaves a field.
     * `"submit"`: only when the form is submitted, then live. A field's own `validate-on` wins.
     */
    validateOn?: ValidateOn;
    /** Errors from your server, by field `name`: `{ email: "Already taken" }` or `{ email: ["…"] }` (Laravel). */
    errors?: Record<string, string | string[] | undefined> | null;
    /** Blocks `submit` and shows every field disabled while you send the request. */
    submitting?: boolean;
    disabled?: boolean;
    /** Move focus to the first invalid field after a failed submit (default). */
    focusFirst?: boolean;
    /** Keep the browser's own checks off (`novalidate`). Default true: viputy shows the errors. */
    novalidate?: boolean;
  }>(),
  { validateOn: "blur", focusFirst: true, novalidate: true, errors: null }
);

const emit = defineEmits<{
  /** All fields are valid. `values` are the `v-model`s of the named fields. */
  submit: [values: Record<string, unknown>, event: SubmitEvent];
  /** A field is not valid. */
  invalid: [names: Array<string | undefined>];
  reset: [];
}>();
defineSlots<{
  default?(p: {
    submitted: boolean;
    valid: boolean;
    validating: boolean;
    submit: () => Promise<boolean>;
    reset: () => void;
    values: Record<string, unknown>;
  }): unknown;
}>();

const attrs = useAttrs();
// shallow: a deep ref would wrap each entry in a proxy, and `x !== e` would never match on unregister
const entries = shallowRef<FormEntry[]>([]);
const submitted = ref(false);
const validating = ref(false);
// bumped by register/unregister and by every field change, so `valid` and `values` recompute
const tick = ref(0);

const serverErrors = computed(() => props.errors ?? {});
provideForm({
  validateOn: () => props.validateOn,
  submitted: () => submitted.value,
  disabled: () => !!props.disabled || !!props.submitting,
  values: () => collect(),
  register(e) {
    entries.value = [...entries.value, e];
    return () => (entries.value = entries.value.filter((x) => x !== e));
  },
  serverError(name) {
    if (!name) return undefined;
    const v = serverErrors.value[name];
    return Array.isArray(v) ? v[0] : v;
  }
});

function collect() {
  void tick.value;
  const out: Record<string, unknown> = {};
  for (const e of entries.value) if (e.name) out[e.name] = e.value();
  return out;
}

async function validate(): Promise<boolean> {
  validating.value = true;
  submitted.value = true;
  try {
    // every field is checked (not just until the first bad one) so all errors show at once
    const results = await Promise.all(
      entries.value.map(async (e) => ({ e, ok: await e.validate() }))
    );
    const bad = results.filter((r) => !r.ok).map((r) => r.e);
    if (bad.length) {
      emit(
        "invalid",
        bad.map((e) => e.name)
      );
      if (props.focusFirst) await focusFirst(bad);
    }
    return bad.length === 0;
  } finally {
    validating.value = false;
  }
}

async function focusFirst(bad: FormEntry[]) {
  await nextTick();
  // document order, not registration order
  const withEl = bad
    .map((e) => ({ e, el: e.el() }))
    .filter((x): x is { e: FormEntry; el: HTMLElement } => !!x.el);
  withEl.sort((a, b) =>
    a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : 1
  );
  const first = withEl[0]?.e ?? bad[0];
  first?.focus();
  withEl[0]?.el.scrollIntoView?.({ block: "center", behavior: "smooth" });
}

async function onSubmit(e: SubmitEvent) {
  e.preventDefault();
  if (props.submitting || props.disabled) return;
  if (await validate()) emit("submit", collect(), e);
}
function reset() {
  submitted.value = false;
  for (const e of entries.value) e.reset();
  emit("reset");
}
function onReset(e: Event) {
  e.preventDefault();
  reset();
}

const valid = computed(() => {
  void tick.value;
  return !entries.value.some((e) => e.invalid());
});

onBeforeUnmount(() => (entries.value = []));
defineExpose({ validate, reset, submitted, values: collect, valid });
</script>

<template>
  <form
    v-bind="attrs"
    class="vi-form"
    :novalidate="props.novalidate || undefined"
    :aria-busy="props.submitting || undefined"
    :data-submitting="props.submitting || undefined"
    @submit="onSubmit"
    @reset="onReset"
    @input.capture="tick++"
    @change.capture="tick++"
  >
    <fieldset
      class="vi-form__set"
      :disabled="props.disabled || props.submitting"
    >
      <slot
        :submitted="submitted"
        :valid="valid"
        :validating="validating"
        :submit="validate"
        :reset="reset"
        :values="collect()"
      />
    </fieldset>
  </form>
</template>
