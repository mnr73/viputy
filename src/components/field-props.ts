import type { ValidateOn } from "../composables/useForm";
import type { FieldStatus } from "../composables/useField";
import type { Params, Rules } from "../utils/validate";

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
    /**
     * Validation: `["required", { minLength: 3 }, myFn]` or `{ required: true, minLength: 3 }`.
     * Shows the error under the input in red. Your own `status` / `message` always win.
     */
    rules?: Rules;
    /** Replaces the default message of a rule: `{ required: "Fill in {label}" }`. `{min}`, `{max}`, `{label}`, `{value}` are filled in. */
    messages?: Record<string, string>;
    /** When to check. Default `"blur"`, or the form's setting inside a `ViForm`. */
    validateOn?: ValidateOn;
}

export type { Params };

/**
 * What an input hands to its ViField. `error` is the message made by `rules`: it only applies when the
 * caller gave no `status` / `message` of their own (explicit values always win).
 */
export function pickField(
    p: FieldProps,
    extra: Partial<Record<Part, string>> = {},
    error?: string
) {
    // the caller's own status / message always win: then the error made by `rules` is not used at all
    const own = p.status != null || p.message !== undefined;
    const shown = own ? undefined : error;
    const ui: Partial<Record<Part, string>> = { ...p.ui };
    for (const k of Object.keys(extra) as Part[]) {
        ui[k] = [ui[k], extra[k]].filter(Boolean).join(" ");
    }
    return {
        label: p.label,
        hint: p.hint,
        message: p.message ?? shown,
        status: shown ? ("error" as const) : p.status,
        required: p.required,
        disabled: p.disabled,
        readonly: p.readonly,
        bare: p.bare,
        id: p.id,
        ui
    };
}
