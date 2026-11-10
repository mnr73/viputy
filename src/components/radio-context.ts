import type { InjectionKey, Ref } from "vue";

export interface RadioGroupContext {
    model: Ref<unknown>;
    name: string;
    card: Ref<boolean>;
    disabled: Ref<boolean>;
    status: Ref<string | null | undefined>;
}

export const radioGroupKey: InjectionKey<RadioGroupContext> =
    Symbol("vi-radio-group");
