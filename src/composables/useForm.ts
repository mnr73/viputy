import { inject, provide, type InjectionKey } from "vue";

export type ValidateOn = "blur" | "change" | "input" | "submit";

/** What a field gives its form so the form can validate it, focus it and read its value. */
export interface FormEntry {
    name: string | undefined;
    validate(): Promise<boolean>;
    reset(): void;
    /** Marks the field as submitted so it shows errors from now on. */
    touch(): void;
    focus(): void;
    el(): HTMLElement | null;
    value(): unknown;
    invalid(): boolean;
}

export interface FormContext {
    /** Default of every field in the form (a field's own `validate-on` wins). */
    validateOn: () => ValidateOn;
    submitted: () => boolean;
    disabled: () => boolean;
    values: () => Record<string, unknown>;
    register(e: FormEntry): () => void;
    /** Server errors for a field name (`{ email: "Taken" }`). */
    serverError(name: string | undefined): string | undefined;
}

export const formKey: InjectionKey<FormContext> = Symbol("vi-form");
export const provideForm = (c: FormContext) => provide(formKey, c);
export const useFormContext = () => inject(formKey, null);
