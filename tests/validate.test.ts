import { afterEach, describe, expect, it } from "vitest";
import { createConfig } from "../src/i18n/config";
import {
    clearRules,
    compileRules,
    defineRule,
    fillMessage,
    isCardNumber,
    isEmpty,
    isIranMobile,
    isNationalId,
    runRules,
    type RuleContext,
    type Rules
} from "../src/utils/validate";

const ctx = (over: Partial<RuleContext> = {}): RuleContext => ({
    label: "Name",
    values: () => ({}),
    submitted: false,
    ...over
});
const check = async (
    value: unknown,
    rules: Rules,
    o: {
        locale?: string;
        messages?: Record<string, string>;
        label?: string;
        values?: Record<string, unknown>;
        all?: boolean;
    } = {}
) => {
    const cfg = createConfig({ locale: o.locale ?? "en" });
    return runRules(value, compileRules(rules), {
        messageFor: cfg.rule,
        messages: o.messages,
        all: o.all,
        ctx: ctx({ label: o.label ?? "Name", values: () => o.values ?? {} })
    });
};
const msg = async (...a: Parameters<typeof check>) =>
    (await check(...a))[0]?.message ?? null;

afterEach(() => clearRules());

describe("isEmpty", () => {
    it("what counts as empty", () => {
        for (const v of [
            null,
            undefined,
            "",
            "   ",
            [],
            { start: null, end: null }
        ])
            expect(isEmpty(v)).toBe(true);
        for (const v of [
            0,
            false,
            "a",
            [0],
            { start: "2026-01-01", end: null }
        ])
            expect(isEmpty(v)).toBe(false);
    });
});

describe("required", () => {
    it("fails on empty values, false and an empty selection; 0 is a value", async () => {
        for (const v of [null, undefined, "", "  ", [], false])
            expect(await msg(v, ["required"])).toBe("This field is required");
        expect(await msg(0, ["required"])).toBeNull();
        expect(await msg("x", ["required"])).toBeNull();
        expect(await msg(true, ["required"])).toBeNull();
    });
    it("Persian default", async () => {
        expect(await msg("", ["required"], { locale: "fa" })).toBe(
            "این فیلد الزامی است"
        );
    });
});

describe("empty values skip every rule except required", () => {
    it("an optional empty field is valid even with minLength / email / pattern", async () => {
        expect(
            await check("", { minLength: 5, email: true, pattern: /x/ })
        ).toEqual([]);
        expect(await check(null, { min: 5 })).toEqual([]);
    });
    it("but a value that is there is checked", async () => {
        expect((await check("ab", { minLength: 5 }))[0]!.rule).toBe(
            "minLength"
        );
    });
});

describe("length", () => {
    it("minLength / maxLength / length / lengthBetween with their parameters in the message", async () => {
        expect(await msg("ab", { minLength: 3 })).toBe(
            "Enter at least 3 characters"
        );
        expect(await msg("abcd", { maxLength: 3 })).toBe(
            "Enter at most 3 characters"
        );
        expect(await msg("abc", { length: 4 })).toBe(
            "Enter exactly 4 characters"
        );
        expect(await msg("abcdefg", { lengthBetween: [2, 5] })).toBe(
            "Enter between 2 and 5 characters"
        );
        expect(await msg("abc", { minLength: 3, maxLength: 3 })).toBeNull();
    });
    it("counts characters, not UTF-16 units (an emoji is one)", async () => {
        expect(await msg("😀😀", { maxLength: 2 })).toBeNull();
        expect(await msg("😀😀😀", { maxLength: 2 })).not.toBeNull();
    });
    it("Persian digits and letters count as one each; fa message uses the number", async () => {
        expect(await msg("سلام", { minLength: 5 }, { locale: "fa" })).toBe(
            "حداقل 5 نویسه وارد کنید"
        );
    });
    it("arrays: counts items (tags, files)", async () => {
        expect(await msg(["a"], { minLength: 2 })).not.toBeNull();
        expect(await msg(["a", "b"], { minLength: 2 })).toBeNull();
        expect(await msg(["a", "b", "c"], { maxItems: 2 })).toBe(
            "Choose at most 2"
        );
        expect(await msg(["a"], { minItems: 2 })).toBe("Choose at least 2");
    });
});

describe("min / max / between", () => {
    it("numbers, numeric strings and Persian digits", async () => {
        expect(await msg(17, { min: 18 })).toBe("Must be at least 18");
        expect(await msg("17", { min: 18 })).toBe("Must be at least 18");
        expect(await msg("۱۷", { min: 18 })).toBe("Must be at least 18");
        expect(await msg("1,200", { max: 1000 })).toBe("Must be at most 1000");
        expect(await msg(18, { min: 18, max: 18 })).toBeNull();
        expect(await msg(5, { between: [1, 3] })).toBe(
            "Must be between 1 and 3"
        );
    });
    it("ISO dates and times compare as text", async () => {
        expect(await msg("2026-01-01", { min: "2026-06-01" })).toBe(
            "Must be at least 2026-06-01"
        );
        expect(
            await msg("2026-12-31T10:00", { max: "2026-12-31T09:00" })
        ).not.toBeNull();
        expect(await msg("08:30", { min: "09:00" })).not.toBeNull();
        expect(await msg("09:30", { min: "09:00", max: "17:00" })).toBeNull();
    });
    it("a value it cannot compare is not its job (use pattern / integer)", async () => {
        expect(await msg("abc", { min: 5 })).toBeNull();
    });
    it("integer", async () => {
        expect(await msg(1.5, ["integer"])).toBe("Enter a whole number");
        expect(await msg("2", ["integer"])).toBeNull();
    });
});

describe("pattern, email, url, digits, oneOf", () => {
    it("pattern, also with a global /g regexp (no alternating results)", async () => {
        const re = /^[a-z]+$/g;
        for (let i = 0; i < 4; i++)
            expect(await msg("abc", { pattern: re })).toBeNull();
        expect(await msg("ab1", { pattern: /^[a-z]+$/ })).toBe(
            "The format is not valid"
        );
    });
    it("email", async () => {
        expect(await msg("a@b.co", ["email"])).toBeNull();
        for (const bad of ["a@b", "a b@c.com", "@x.com", "a@.com"])
            expect(await msg(bad, ["email"])).not.toBeNull();
    });
    it("url needs http(s) and a dotted host", async () => {
        expect(await msg("https://shiva.dev/x?y=1", ["url"])).toBeNull();
        for (const bad of [
            "shiva.dev",
            "ftp://a.com",
            "https://localhost",
            "javascript:alert(1)"
        ])
            expect(await msg(bad, ["url"])).not.toBeNull();
    });
    it("digits accepts Persian digits", async () => {
        expect(await msg("۱۲۳", ["digits"])).toBeNull();
        expect(await msg("12a", ["digits"])).toBe("Use digits only");
    });
    it("oneOf / notOneOf", async () => {
        expect(await msg("c", { oneOf: ["a", "b"] })).toBe(
            "Choose one of: a, b"
        );
        expect(await msg("a", { notOneOf: ["a"] })).toBe(
            "This value is not allowed"
        );
    });
});

describe("Iranian formats", () => {
    it("national code: valid ones, a wrong check digit, repeats, length, Persian digits", () => {
        expect(isNationalId("0499370899")).toBe(true);
        expect(isNationalId("۰۴۹۹۳۷۰۸۹۹")).toBe(true);
        expect(isNationalId("0499370898")).toBe(false);
        expect(isNationalId("1111111111")).toBe(false);
        expect(isNationalId("049937089")).toBe(false);
        expect(isNationalId("04993708999")).toBe(false);
    });
    it("mobile: the usual spellings", () => {
        for (const ok of [
            "09123456789",
            "+989123456789",
            "00989123456789",
            "9123456789",
            "0912 345 6789",
            "۰۹۱۲۳۴۵۶۷۸۹"
        ])
            expect(isIranMobile(ok)).toBe(true);
        for (const bad of [
            "0812345678",
            "0912345678",
            "09123456789a",
            "02112345678"
        ])
            expect(isIranMobile(bad)).toBe(false);
    });
    it("card number: Luhn check digit (cross-checked against a public test number)", () => {
        expect(isCardNumber("4111111111111111")).toBe(true); // public Luhn test number
        expect(isCardNumber("4111111111111112")).toBe(false);
        expect(isCardNumber("6104337860001237")).toBe(true);
        expect(isCardNumber("6104-3378-6000-1237")).toBe(true);
        expect(isCardNumber("6104337860001238")).toBe(false);
    });
    it("as rules, with Persian messages", async () => {
        expect(await msg("1234567890", ["nationalId"], { locale: "fa" })).toBe(
            "کد ملی معتبر وارد کنید"
        );
        expect(await msg("0912", ["phone"], { locale: "fa" })).toBe(
            "یک شماره‌ی موبایل معتبر وارد کنید"
        );
    });
});

describe("equals", () => {
    it("compares with another field by name, or with a literal", async () => {
        expect(
            await msg(
                "abc",
                { equals: "password" },
                { values: { password: "abc" } }
            )
        ).toBeNull();
        expect(
            await msg(
                "abd",
                { equals: "password" },
                { values: { password: "abc" } }
            )
        ).toBe("Does not match");
        expect(await msg("x", { equals: "x" })).toBeNull();
    });
    it("runs on an empty value too (an empty confirm must not match a filled password)", async () => {
        expect(
            await msg(
                "",
                { equals: "password" },
                { values: { password: "abc" } }
            )
        ).toBe("Does not match");
    });
});

describe("custom messages and parameters", () => {
    it("a message on the rule, with {min}, {label} and {value}", async () => {
        const r: Rules = [
            {
                minLength: 3,
                message: "{label} must have {min}+ letters, you typed {value}"
            }
        ];
        expect(await msg("ab", r, { label: "Name" })).toBe(
            "Name must have 3+ letters, you typed ab"
        );
    });
    it("object form with a value and a message per rule", async () => {
        const r: Rules = {
            minLength: { value: 3, message: "short" },
            maxLength: { value: 5, message: "long" }
        };
        expect(await msg("ab", r)).toBe("short");
        expect(await msg("abcdef", r)).toBe("long");
    });
    it("a catalog of overrides by rule name (what the `messages` prop passes)", async () => {
        expect(
            await msg("", ["required"], {
                messages: { required: "Fill in {label}" },
                label: "City"
            })
        ).toBe("Fill in City");
        // the rule's own message beats the catalog
        expect(
            await msg("", [{ rule: "required", message: "own" }], {
                messages: { required: "catalog" }
            })
        ).toBe("own");
    });
    it("app-wide replacement through the config (`rules` option)", async () => {
        const cfg = createConfig({
            locale: "fa",
            rules: { fa: { required: "پر کردن «{label}» الزامی است" } }
        });
        const f = await runRules("", compileRules(["required"]), {
            messageFor: cfg.rule,
            ctx: ctx({ label: "نام" })
        });
        expect(f[0]!.message).toBe("پر کردن «نام» الزامی است");
        // untouched rules keep the built-in text
        const g = await runRules("a", compileRules([{ minLength: 3 }]), {
            messageFor: cfg.rule,
            ctx: ctx()
        });
        expect(g[0]!.message).toBe("حداقل 3 نویسه وارد کنید");
    });
    it("unknown placeholders stay visible instead of vanishing", () => {
        expect(fillMessage("a {x} b {y}", { x: 1 })).toBe("a 1 b {y}");
    });
});

describe("custom rules", () => {
    it("a function: a string is the error, true / undefined / null pass", async () => {
        expect(await msg("x", [() => "No x"])).toBe("No x");
        expect(await msg("x", [() => true])).toBeNull();
        expect(await msg("x", [() => undefined])).toBeNull();
        expect(await msg("x", [() => null])).toBeNull();
    });
    it("false falls back to the generic message; a string may use {value}", async () => {
        expect(await msg("x", [() => false])).toBe("This value is not valid");
        expect(await msg("bad", [(v: string) => `“${v}” is taken`])).toBe(
            "“bad” is taken"
        );
    });
    it("object with validate, message and params", async () => {
        const r: Rules = [
            {
                validate: (v: string) => v.startsWith("09"),
                message: "Must start with {prefix}",
                params: { prefix: "09" }
            }
        ];
        expect(await msg("12", r)).toBe("Must start with 09");
        expect(await msg("0912", r)).toBeNull();
    });
    it("a function may return { message, params } or { key } to reuse a built-in message", async () => {
        expect(
            await msg("x", [
                () => ({ message: "Need {n} more", params: { n: 2 } })
            ])
        ).toBe("Need 2 more");
        expect(await msg("x", [() => ({ key: "required" })])).toBe(
            "This field is required"
        );
    });
    it("receives the value and a context with the form values", async () => {
        let seen: any;
        await check(
            "v",
            [
                (value: unknown, c: RuleContext) => (
                    (seen = { value, label: c.label, vals: c.values() }),
                    true
                )
            ],
            { values: { a: 1 } }
        );
        expect(seen).toEqual({ value: "v", label: "Name", vals: { a: 1 } });
    });
    it("a custom rule is skipped on an empty value unless skipEmpty is false", async () => {
        expect(await check("", [() => "never"])).toEqual([]);
        expect(
            (await check("", [{ validate: () => "ran", skipEmpty: false }]))[0]!
                .message
        ).toBe("ran");
    });
    it("async rules work and are awaited in order", async () => {
        const order: string[] = [];
        const slow = async () => (
            await new Promise((r) => setTimeout(r, 15)),
            order.push("slow"),
            "taken"
        );
        const fast = () => (order.push("fast"), true);
        const f = await check("x", [fast, slow]);
        expect(f[0]!.message).toBe("taken");
        expect(order).toEqual(["fast", "slow"]);
    });
    it("a rule that throws becomes an error message instead of crashing", async () => {
        expect(
            await msg("x", [
                () => {
                    throw new Error("boom");
                }
            ])
        ).toBe("boom");
        expect(
            await msg("x", [
                async () => {
                    throw new Error("async boom");
                }
            ])
        ).toBe("async boom");
    });
    it("defineRule: register once, use by name (array and object forms)", async () => {
        defineRule("even", (v) =>
            Number(v) % 2 === 0 ? true : "Must be even"
        );
        expect(await msg(3, ["even"])).toBe("Must be even");
        expect(await msg(3, { even: true })).toBe("Must be even");
        expect(await msg(4, ["even"])).toBeNull();
        expect(
            await msg(
                3,
                [{ rule: "even", message: "odd!" }].map((r) => ({
                    ...r,
                    message: undefined
                }))
            )
        ).toBe("Must be even");
    });
    it("an unknown rule name is a loud error, not a silent pass", () => {
        expect(() => compileRules(["nope"])).toThrow(/unknown rule "nope"/);
        expect(() => compileRules({ nope: true })).toThrow();
    });
});

describe("order and collecting", () => {
    it("stops at the first failure by default and keeps array order", async () => {
        const f = await check("", ["required", { minLength: 3 }]);
        expect(f.map((x) => x.rule)).toEqual(["required"]);
    });
    it("all: true collects every failure", async () => {
        const f = await check("a", [{ minLength: 3 }, "email"], { all: true });
        expect(f.map((x) => x.rule)).toEqual(["minLength", "email"]);
    });
    it("a stale run stops early (used when the user types while an async rule runs)", async () => {
        let stale = false;
        const cfg = createConfig();
        const p = runRules(
            "x",
            compileRules([
                async () => (
                    await new Promise((r) => setTimeout(r, 10)),
                    "late"
                )
            ]),
            { messageFor: cfg.rule, ctx: ctx(), isStale: () => stale }
        );
        stale = true;
        expect(await p).toEqual([]);
    });
});
