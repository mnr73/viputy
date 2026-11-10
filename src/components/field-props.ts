import type { FieldStatus } from "../composables/useField";

type Part = "root" | "head" | "label" | "control" | "main" | "message";

/** Props every ViField-based input accepts and forwards to its ViField. */
export interface FieldProps {
    label?: string;
    hint?: string;
    /** Validation text; replaces `hint` and is coloured by `status`. */
    message?: string;
    status?: FieldStatus;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    /** Drop the frame. */
    bare?: boolean;
    id?: string;
    /** Extra class per part. */
    ui?: Partial<Record<Part, string>>;
}

export function pickField(
    p: FieldProps,
    extra: Partial<Record<Part, string>> = {}
) {
    const ui: Partial<Record<Part, string>> = { ...p.ui };
    for (const k of Object.keys(extra) as Part[]) {
        ui[k] = [ui[k], extra[k]].filter(Boolean).join(" ");
    }
    return {
        label: p.label,
        hint: p.hint,
        message: p.message,
        status: p.status,
        required: p.required,
        disabled: p.disabled,
        readonly: p.readonly,
        bare: p.bare,
        id: p.id,
        ui
    };
}
