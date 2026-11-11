/**
 * Every theme token (`--vi-*`). A popup is rendered in <body>, so it cannot inherit tokens set on the
 * form around its trigger; ViPopup copies these from the trigger instead.
 */
export const THEME_TOKENS = [
    "--vi-accent",
    "--vi-accent-fg",
    "--vi-accent-soft",
    "--vi-accent-soft-fg",
    "--vi-bg",
    "--vi-border",
    "--vi-border-strong",
    "--vi-danger",
    "--vi-danger-soft",
    "--vi-disabled-bg",
    "--vi-disabled-border",
    "--vi-disabled-opacity",
    "--vi-fg",
    "--vi-field",
    "--vi-field-active",
    "--vi-field-hover",
    "--vi-font",
    "--vi-height",
    "--vi-hover",
    "--vi-mono",
    "--vi-muted",
    "--vi-radius",
    "--vi-radius-lg",
    "--vi-radius-pill",
    "--vi-radius-sm",
    "--vi-radius-xl",
    "--vi-radius-xs",
    "--vi-ring",
    "--vi-scrim",
    "--vi-shadow",
    "--vi-success",
    "--vi-success-soft",
    "--vi-surface",
    "--vi-warning",
    "--vi-warning-soft",
    "--vi-z"
] as const;

/** Resolved values of the tokens as seen by `el` (empty ones are skipped). */
export function readTokens(el: Element): Record<string, string> {
    const cs = getComputedStyle(el);
    const out: Record<string, string> = {};
    for (const name of THEME_TOKENS) {
        const v = cs.getPropertyValue(name).trim();
        if (v) out[name] = v;
    }
    return out;
}
