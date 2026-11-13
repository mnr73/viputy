import { toLatinDigits } from "./text";

export type Params = Record<string, string | number>;

/** What a rule function may return. `true` / nothing / `null` = valid. A string = the error text. */
export type RuleResult =
    | boolean
    | string
    | null
    | undefined
    | void
    | { message?: string; key?: string; params?: Params };

export interface RuleContext {
    /** Label of the input, for `{label}` in messages. */
    label?: string;
    /** The values of the other fields of a `ViForm`, by `name`. */
    values: () => Record<string, unknown>;
    /** `true` when the form was submitted (or `validate()` was called), `false` while typing. */
    submitted: boolean;
}

export type RuleFn = (
    value: any,
    ctx: RuleContext
) => RuleResult | Promise<RuleResult>;

/** A rule with options: `{ minLength: 3, message: "…{min}…" }`, or your own `{ validate, message, params }`. */
export interface RuleObject {
    validate?: RuleFn;
    /** Replaces the default message of this rule. `{min}`, `{max}`, `{label}`, `{value}` and your `params` are filled in. */
    message?: string;
    params?: Params;
    /** Name of a rule defined with `defineRule` (an alternative to `validate`). */
    rule?: string;
    /** Skip this rule when the value is empty (default: true for everything except `required`). */
    skipEmpty?: boolean;
    [option: string]: unknown;
}

export type Rule = string | RuleFn | RuleObject;
/** Array (ordered) or object (short): `["required", { minLength: 3 }]` or `{ required: true, minLength: 3 }`. */
export type Rules = Rule[] | Record<string, unknown>;

export interface Failure {
    /** Which rule failed: `"required"`, `"minLength"`, `"custom"`... */
    rule: string;
    message: string;
}

/** Looks up the default message of a rule (already in the right language). */
export type MessageFor = (rule: string) => string | undefined;

// ---- emptiness

export function isEmpty(v: unknown): boolean {
    if (v === null || v === undefined) return true;
    if (typeof v === "string") return v.trim() === "";
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === "object") {
        const o = v as Record<string, unknown>;
        // a ViDateRange value: neither end is set
        if ("start" in o || "end" in o) return !o.start && !o.end;
    }
    return false;
}

/** How many "things" a value has, for length rules: characters, tags, files or chosen options. */
function sizeOf(v: unknown): number {
    if (typeof v === "string") return [...v].length; // code points, not UTF-16 units
    if (Array.isArray(v)) return v.length;
    if (typeof v === "number") return String(v).length;
    return 0;
}

// ---- value helpers

const num = (v: unknown): number | null => {
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (typeof v === "string" && v.trim() !== "") {
        const n = Number(toLatinDigits(v).replace(/[,٬]/g, ""));
        return Number.isFinite(n) ? n : null;
    }
    return null;
};
const ISO_RE = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?)?$/;
const TIME_RE = /^\d{2}:\d{2}(?::\d{2})?$/;
/** Numbers compare as numbers; ISO dates, date-times and `HH:mm` compare as text (they sort correctly). */
function comparable(v: unknown): number | string | null {
    if (typeof v === "string" && (ISO_RE.test(v) || TIME_RE.test(v))) return v;
    return num(v);
}
const cmp = (a: number | string, b: number | string) =>
    a < b ? -1 : a > b ? 1 : 0;

// ---- Iranian formats

/** Iranian national code: 10 digits with a check digit. Rejects `0000000000`-style repeats. */
export function isNationalId(v: string): boolean {
    const s = toLatinDigits(v).trim();
    if (!/^\d{10}$/.test(s) || /^(\d)\1{9}$/.test(s)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number(s[i]) * (10 - i);
    const r = sum % 11;
    const c = Number(s[9]);
    return r < 2 ? c === r : c === 11 - r;
}
/** Iranian mobile: `09123456789`, `+989123456789`, `00989123456789` or `9123456789`. */
export function isIranMobile(v: string): boolean {
    return /^(?:\+98|0098|98|0)?9\d{9}$/.test(
        toLatinDigits(v).replace(/[\s-]/g, "")
    );
}
/** Iranian bank card number: 16 digits and a valid Luhn sum. */
export function isCardNumber(v: string): boolean {
    const s = toLatinDigits(v).replace(/[\s-]/g, "");
    if (!/^\d{16}$/.test(s)) return false;
    let sum = 0;
    for (let i = 0; i < 16; i++) {
        let d = Number(s[i]);
        if (i % 2 === 0) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
    }
    return sum % 10 === 0;
}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function isUrl(v: string): boolean {
    try {
        const u = new URL(v.trim());
        return (
            (u.protocol === "http:" || u.protocol === "https:") &&
            !!u.hostname.includes(".")
        );
    } catch {
        return false;
    }
}

// ---- built-in rules

interface Outcome {
    ok: boolean;
    key?: string;
    params?: Params;
}
type Builtin = (value: any, opt: any, ctx: RuleContext) => Outcome;
const pass: Outcome = { ok: true };
const fail = (params?: Params, key?: string): Outcome => ({
    ok: false,
    params,
    key
});

const builtins: Record<string, Builtin> = {
    required: (v) => (isEmpty(v) || v === false ? fail() : pass),
    minLength: (v, n) => (sizeOf(v) < n ? fail({ min: n }) : pass),
    maxLength: (v, n) => (sizeOf(v) > n ? fail({ max: n }) : pass),
    length: (v, n) => (sizeOf(v) !== n ? fail({ n }) : pass),
    lengthBetween: (v, [a, b]: [number, number]) =>
        sizeOf(v) < a || sizeOf(v) > b ? fail({ min: a, max: b }) : pass,
    min: (v, n) => {
        const x = comparable(v);
        const y = comparable(n);
        return x === null ||
            y === null ||
            typeof x !== typeof y ||
            cmp(x, y) >= 0
            ? pass
            : fail({ min: String(n) });
    },
    max: (v, n) => {
        const x = comparable(v);
        const y = comparable(n);
        return x === null ||
            y === null ||
            typeof x !== typeof y ||
            cmp(x, y) <= 0
            ? pass
            : fail({ max: String(n) });
    },
    between: (v, [a, b]: [unknown, unknown]) => {
        const x = comparable(v);
        const lo = comparable(a);
        const hi = comparable(b);
        if (x === null || lo === null || hi === null || typeof x !== typeof lo)
            return pass;
        return cmp(x, lo) < 0 || cmp(x, hi) > 0
            ? fail({ min: String(a), max: String(b) })
            : pass;
    },
    integer: (v) => {
        const n = num(v);
        return n !== null && !Number.isInteger(n) ? fail() : pass;
    },
    pattern: (v, re: RegExp) => {
        re.lastIndex = 0; // /g and /y patterns keep state between calls
        return typeof v === "string" && !re.test(v) ? fail() : pass;
    },
    email: (v) =>
        typeof v === "string" && !EMAIL.test(v.trim()) ? fail() : pass,
    url: (v) => (typeof v === "string" && !isUrl(v) ? fail() : pass),
    phone: (v) => (typeof v === "string" && !isIranMobile(v) ? fail() : pass),
    nationalId: (v) =>
        typeof v === "string" && !isNationalId(v) ? fail() : pass,
    cardNumber: (v) =>
        typeof v === "string" && !isCardNumber(v) ? fail() : pass,
    digits: (v) =>
        typeof v === "string" && !/^\d+$/.test(toLatinDigits(v))
            ? fail()
            : pass,
    oneOf: (v, list: unknown[]) =>
        list.includes(v) ? pass : fail({ list: list.join(", ") }),
    notOneOf: (v, list: unknown[]) =>
        list.includes(v) ? fail({ list: list.join(", ") }) : pass,
    equals: (v, other: string, ctx) => {
        // `other` is the name of another field of the form, or a plain value
        const vals = ctx.values();
        const target = other in vals ? vals[other] : other;
        return v === target ? pass : fail({ other });
    },
    // select / tags / files
    minItems: (v, n) =>
        Array.isArray(v) && v.length < n ? fail({ min: n }, "minItems") : pass,
    maxItems: (v, n) =>
        Array.isArray(v) && v.length > n ? fail({ max: n }, "maxItems") : pass
};

/** The rules you can use by name. Messages: `rule.<name>` in the message catalog. */
export const BUILTIN_RULES = Object.keys(builtins);

/** Rules that must run even on an empty value. All others are skipped when the value is empty. */
const RUN_ON_EMPTY = new Set(["required", "equals"]);

const registry = new Map<string, RuleFn>();
/** Register your own rule once, use it everywhere by name: `defineRule("unique", async v => …)`. */
export function defineRule(name: string, fn: RuleFn): void {
    registry.set(name, fn);
}
export function clearRules(): void {
    registry.clear();
}

// ---- turning `rules` into a flat list

export interface Step {
    name: string;
    skipEmpty: boolean;
    message?: string;
    params?: Params;
    run: (value: unknown, ctx: RuleContext) => RuleResult | Promise<RuleResult>;
}

const RESERVED = new Set([
    "message",
    "params",
    "validate",
    "rule",
    "skipEmpty"
]);

function builtinStep(
    name: string,
    opt: unknown,
    extra: Partial<Step> = {}
): Step {
    const fn = builtins[name];
    if (!fn) throw new Error(`viputy: unknown rule "${name}"`);
    return {
        name,
        skipEmpty: !RUN_ON_EMPTY.has(name),
        ...extra,
        run: (v, ctx) => {
            const r = fn(v, opt, ctx);
            return r.ok ? true : { key: r.key ?? name, params: r.params };
        }
    };
}
function namedStep(name: string, extra: Partial<Step> = {}): Step {
    if (registry.has(name))
        return { name, skipEmpty: true, ...extra, run: registry.get(name)! };
    return builtinStep(name, undefined, extra);
}

/** Accepts every shape of `rules` and returns the ordered list of steps. */
export function compileRules(rules: Rules | null | undefined): Step[] {
    if (!rules) return [];
    const steps: Step[] = [];
    const fromObject = (o: Record<string, unknown>) => {
        const extra: Partial<Step> = {
            message: typeof o.message === "string" ? o.message : undefined,
            params: o.params as Params | undefined
        };
        if (typeof o.validate === "function") {
            steps.push({
                name: typeof o.rule === "string" ? o.rule : "custom",
                skipEmpty: o.skipEmpty === undefined ? true : !!o.skipEmpty,
                ...extra,
                run: o.validate as RuleFn
            });
            return;
        }
        if (typeof o.rule === "string") {
            steps.push(namedStep(o.rule, extra));
            return;
        }
        for (const [k, v] of Object.entries(o)) {
            if (RESERVED.has(k) || v === false || v === undefined || v === null)
                continue;
            if (registry.has(k))
                steps.push({
                    name: k,
                    skipEmpty: true,
                    ...extra,
                    run: registry.get(k)!
                });
            else steps.push(builtinStep(k, v === true ? undefined : v, extra));
        }
    };
    if (Array.isArray(rules)) {
        for (const r of rules) {
            if (typeof r === "string") steps.push(namedStep(r));
            else if (typeof r === "function")
                steps.push({ name: "custom", skipEmpty: true, run: r });
            else if (r && typeof r === "object") fromObject(r);
        }
    } else {
        for (const [k, v] of Object.entries(rules)) {
            if (v === false || v === undefined || v === null) continue;
            if (typeof v === "function")
                steps.push({ name: k, skipEmpty: true, run: v as RuleFn });
            else if (
                v &&
                typeof v === "object" &&
                !Array.isArray(v) &&
                !(v instanceof RegExp)
            ) {
                // `{ minLength: { value: 3, message: "…" } }`
                const o = v as Record<string, unknown>;
                steps.push(
                    registry.has(k)
                        ? {
                              name: k,
                              skipEmpty: true,
                              message: o.message as string,
                              params: o.params as Params,
                              run: registry.get(k)!
                          }
                        : builtinStep(k, "value" in o ? o.value : true, {
                              message: o.message as string | undefined,
                              params: o.params as Params | undefined
                          })
                );
            } else if (registry.has(k))
                steps.push({ name: k, skipEmpty: true, run: registry.get(k)! });
            else steps.push(builtinStep(k, v === true ? undefined : v));
        }
    }
    return steps;
}

// ---- running

/** `{min}` / `{label}` / `{value}`... in a message. Unknown placeholders stay as written. */
export function fillMessage(
    text: string,
    params: Record<string, unknown>
): string {
    return text.replace(/\{(\w+)\}/g, (m, k) =>
        params[k] == null ? m : String(params[k])
    );
}

export interface RunOptions {
    messageFor: MessageFor;
    /** Replaces default messages by rule name: `{ required: "…{label}…", minLength: "…" }`. */
    messages?: Record<string, string | undefined>;
    ctx: RuleContext;
    /** Stop at the first failure (default) or collect all. */
    all?: boolean;
    /** Used to cancel a stale async run. */
    isStale?: () => boolean;
}

/** Runs the steps in order. Returns the first failure (or all of them), or `[]` when valid. */
export async function runRules(
    value: unknown,
    steps: Step[],
    o: RunOptions
): Promise<Failure[]> {
    const out: Failure[] = [];
    const empty = isEmpty(value);
    for (const s of steps) {
        if (o.isStale?.()) return out;
        if (empty && s.skipEmpty) continue;
        let r: RuleResult;
        try {
            r = await s.run(value, o.ctx);
        } catch (e) {
            r = (e as Error)?.message || "Validation failed";
        }
        if (o.isStale?.()) return out;
        if (r === true || r === undefined || r === null) continue;
        const base: Record<string, unknown> = {
            label: o.ctx.label ?? "",
            value:
                typeof value === "string" || typeof value === "number"
                    ? value
                    : "",
            ...s.params
        };
        let message: string;
        let rule = s.name;
        const pick = (name: string, own?: string) =>
            own ??
            o.messages?.[name] ??
            o.messageFor(name) ??
            o.messageFor("custom") ??
            name;
        if (r === false) {
            message = fillMessage(pick(rule, s.message), base);
        } else if (typeof r === "string") {
            message = fillMessage(r, base);
        } else {
            rule = r.key ?? s.name;
            message = fillMessage(pick(rule, r.message ?? s.message), {
                ...base,
                ...r.params
            });
        }
        out.push({ rule, message });
        if (!o.all) break;
    }
    return out;
}

/**
 * A string that changes when the rules change in a way that matters. Functions count as "a function"
 * (an inline `(v) => …` is a new object on every render of the parent, so its identity says nothing).
 */
export function rulesSignature(rules: Rules | null | undefined): string {
    return JSON.stringify(rules ?? null, (_k, val) =>
        typeof val === "function"
            ? "fn"
            : val instanceof RegExp
              ? `re:${val.source}/${val.flags}`
              : val
    );
}
