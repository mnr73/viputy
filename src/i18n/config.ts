import {
    computed,
    inject,
    toValue,
    type App,
    type ComputedRef,
    type InjectionKey,
    type MaybeRefOrGetter
} from "vue";
import { builtinMessages, type MessageKey, type Messages } from "./messages";
import { ruleMessages } from "./rules";

const RTL = ["fa", "ar", "he", "ur", "ps", "ckb"];

export interface ViputyOptions {
    /** Active locale, e.g. "fa" or "en". May be a ref/getter. Default "en". */
    locale?: MaybeRefOrGetter<string>;
    /** Override `rtl`/`ltr`. Default derived from the locale. */
    dir?: MaybeRefOrGetter<"rtl" | "ltr" | undefined>;
    /** Extra or overriding messages per locale. */
    messages?: Record<string, Partial<Messages>>;
    /** Replace the default validation messages, per locale: `{ fa: { required: "پر کردن «{label}» الزامی است" } }`. */
    rules?: Record<string, Record<string, string>>;
}

export interface ViputyConfig {
    locale: ComputedRef<string>;
    dir: ComputedRef<"rtl" | "ltr">;
    t: (key: MessageKey, params?: Record<string, string | number>) => string;
    /** The default message of a validation rule, or `undefined` for an unknown rule. */
    rule: (name: string) => string | undefined;
}

export const configKey: InjectionKey<ViputyConfig> = Symbol("viputy");

export function createConfig(options: ViputyOptions = {}): ViputyConfig {
    const locale = computed(() => toValue(options.locale) ?? "en");
    const dir = computed(
        () =>
            toValue(options.dir) ??
            (RTL.includes(locale.value.split("-")[0]!) ? "rtl" : "ltr")
    );
    function t(key: MessageKey, params?: Record<string, string | number>) {
        const lang = locale.value.split("-")[0]!;
        const text =
            options.messages?.[locale.value]?.[key] ??
            options.messages?.[lang]?.[key] ??
            builtinMessages[locale.value]?.[key] ??
            builtinMessages[lang]?.[key] ??
            builtinMessages.en![key];
        return params
            ? text.replace(/\{(\w+)\}/g, (m, k) => String(params[k] ?? m))
            : text;
    }
    function rule(name: string) {
        const lang = locale.value.split("-")[0]!;
        return (
            options.rules?.[locale.value]?.[name] ??
            options.rules?.[lang]?.[name] ??
            ruleMessages[locale.value]?.[name] ??
            ruleMessages[lang]?.[name] ??
            ruleMessages.en![name]
        );
    }
    return { locale, dir, t, rule };
}

/** App-wide setup: `app.use(viputy, { locale: "fa" })`. */
export const viputy = {
    install(app: App, options: ViputyOptions = {}) {
        app.provide(configKey, createConfig(options));
    }
};

/** Inside a component, read the injected config (defaults to English). */
export function useViputy(): ViputyConfig {
    return inject(configKey, null) ?? createConfig();
}
