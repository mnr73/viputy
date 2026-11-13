import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
    toValue,
    watch,
    type MaybeRefOrGetter
} from "vue";
import { useViputy } from "../i18n/config";
import {
    compileRules,
    isEmpty,
    rulesSignature,
    runRules,
    type Failure,
    type Rules
} from "../utils/validate";
import { useFormContext, type FormEntry, type ValidateOn } from "./useForm";

export interface UseValidationInput {
    /** The current value of the input (what `rules` check). */
    value: MaybeRefOrGetter<unknown>;
    rules: MaybeRefOrGetter<Rules | null | undefined>;
    /** Per-rule message overrides: `{ required: "…{label}…" }`. */
    messages?: MaybeRefOrGetter<Record<string, string | undefined> | undefined>;
    label?: MaybeRefOrGetter<string | undefined>;
    name?: MaybeRefOrGetter<string | undefined>;
    validateOn?: MaybeRefOrGetter<ValidateOn | undefined>;
    /** Element to focus when the form finds this field invalid. */
    focus?: () => void;
    el?: () => HTMLElement | null;
}

/**
 * Turns `rules` into `status` + `message` for a ViField.
 *
 * - Runs on blur by default, or on change / input / (only) on submit. Inside a `ViForm` the form's
 *   `validate-on` is the default (a field's own `validate-on` wins).
 * - After the first error the field re-checks on every change, so the error leaves as soon as it is fixed.
 * - Async rules are supported; a result that arrives after a newer check is dropped.
 * - The caller's own `status` / `message` always win over the ones made here.
 */
export function useValidation(input: UseValidationInput) {
    const { rule: messageFor } = useViputy();
    const form = useFormContext();

    const steps = computed(() => compileRules(toValue(input.rules)));
    const active = computed(() => steps.value.length > 0);
    const mode = computed<ValidateOn>(
        () => toValue(input.validateOn) ?? form?.validateOn() ?? "blur"
    );

    const failures = ref<Failure[]>([]);
    const validating = ref(false);
    /** The field has been left, changed or submitted: errors may show. */
    const touched = ref(false);
    const dirtyAfterError = ref(false);
    let run = 0;
    let mounted = false;

    const ctx = (submitted: boolean) => ({
        label: toValue(input.label),
        values: () => form?.values() ?? {},
        submitted
    });

    /** The newest check. A check that was replaced while it ran reports THIS result, never its own half-done state. */
    let latest: Promise<boolean> = Promise.resolve(true);

    function validate(submitted = false): Promise<boolean> {
        if (!active.value) {
            run++;
            failures.value = [];
            latest = Promise.resolve(true);
            return latest;
        }
        const id = ++run;
        const p = (async () => {
            const v = toValue(input.value);
            // an async rule shows "checking" only when it takes a moment, so a fast check does not flicker
            const timer = setTimeout(
                () => id === run && (validating.value = true),
                150
            );
            try {
                const out = await runRules(v, steps.value, {
                    messageFor,
                    messages: toValue(input.messages),
                    ctx: ctx(submitted),
                    isStale: () => id !== run
                });
                if (id !== run) return latest;
                failures.value = out;
                return out.length === 0;
            } finally {
                clearTimeout(timer);
                if (id === run) validating.value = false;
            }
        })();
        latest = p;
        return p;
    }

    /** Call from the input when the user leaves it. */
    function onBlur() {
        if (!mounted) return;
        touched.value = true;
        if (
            mode.value === "blur" ||
            mode.value === "change" ||
            mode.value === "input"
        )
            void validate();
    }
    /** Call from the input after the value changed because of the user. */
    function onChange() {
        if (!mounted) return;
        if (mode.value === "change" || mode.value === "input")
            touched.value = true;
        const again = failures.value.length > 0 || (form?.submitted() ?? false);
        if (again || mode.value === "change" || mode.value === "input")
            void validate();
    }

    // value changes that did not come through onChange (v-model set from outside) still re-check an
    // existing error, so a corrected value clears it
    watch(
        () => toValue(input.value),
        () => {
            if (!mounted || !active.value) return;
            if (
                failures.value.length ||
                (touched.value && mode.value !== "submit")
            )
                void validate();
        },
        { deep: true }
    );
    // by content: an inline `:rules="[...]"` is a new array on every render of the parent
    const signature = computed(() => rulesSignature(toValue(input.rules)));
    watch(signature, () => {
        if (touched.value && mounted) void validate();
        else if (!active.value) failures.value = [];
    });

    function reset() {
        run++;
        latest = Promise.resolve(true);
        failures.value = [];
        validating.value = false;
        touched.value = false;
        dirtyAfterError.value = false;
    }

    const showErrors = computed(
        () =>
            failures.value.length > 0 &&
            (touched.value || (form?.submitted() ?? false))
    );
    const serverMessage = computed(() =>
        form?.serverError(toValue(input.name))
    );

    /** What the input should merge into its ViField props. User-given status/message are applied by the caller on top. */
    const error = computed<string | undefined>(
        () =>
            (showErrors.value ? failures.value[0]?.message : undefined) ??
            serverMessage.value
    );

    let unregister: (() => void) | null = null;
    onMounted(() => {
        mounted = true;
        const entry: FormEntry = {
            name: toValue(input.name),
            validate: () => {
                touched.value = true;
                return validate(true);
            },
            reset,
            touch: () => (touched.value = true),
            focus: () => input.focus?.(),
            el: () => input.el?.() ?? null,
            value: () => toValue(input.value),
            invalid: () => !!error.value
        };
        unregister = form?.register(entry) ?? null;
    });
    onBeforeUnmount(() => {
        run++;
        latest = Promise.resolve(true);
        unregister?.();
    });

    return {
        /** Error text to show (empty when valid, untouched, or `rules` is not set). */
        error,
        failures,
        validating,
        touched,
        /** `"error"` while an error shows, else `undefined`. */
        status: computed(() => (error.value ? ("error" as const) : undefined)),
        validate,
        reset,
        onBlur,
        onChange,
        isEmpty: () => isEmpty(toValue(input.value))
    };
}
