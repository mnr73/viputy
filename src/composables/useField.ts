import {
    computed,
    inject,
    provide,
    useId,
    type ComputedRef,
    type InjectionKey
} from "vue";

export type FieldStatus = "error" | "warning" | "success" | null | undefined;

export interface FieldContext {
    id: string;
    status: ComputedRef<FieldStatus>;
    disabled: ComputedRef<boolean>;
    readonly: ComputedRef<boolean>;
    required: ComputedRef<boolean>;
    describedby: ComputedRef<string | undefined>;
}

const fieldKey: InjectionKey<FieldContext> = Symbol("vi-field");

export function provideField(ctx: FieldContext) {
    provide(fieldKey, ctx);
}

/**
 * For custom inputs: reads the surrounding ViField (id, status, disabled...)
 * and returns ready-made attributes for the native control.
 * Works without a ViField too.
 */
export function useField() {
    const ctx = inject(fieldKey, null);
    const id = ctx?.id ?? useId();
    const attrs = computed(() => ({
        id,
        disabled: ctx?.disabled.value || undefined,
        readonly: ctx?.readonly.value || undefined,
        required: ctx?.required.value || undefined,
        "aria-invalid": ctx?.status.value === "error" ? true : undefined,
        "aria-describedby": ctx?.describedby.value
    }));
    return {
        id,
        attrs,
        status: ctx?.status ?? computed<FieldStatus>(() => null),
        disabled: ctx?.disabled ?? computed(() => false)
    };
}
