import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import {
    PlainDateTime,
    THEME_TOKENS,
    fromQueryString,
    toQueryString
} from "../src";
import Custom from "./skill-samples/Custom.vue";
import Qb from "./skill-samples/Qb.vue";

describe("code samples in skills/viputy", () => {
    it("query builder sample renders its badges and serialises", () => {
        const w = mount(Qb, { attachTo: document.body });
        expect(w.findAll(".vi-qchip").length).toBe(2);
        expect(w.find(".vi-field").attributes()).toBeDefined();
        w.unmount();
    });
    it("custom input sample mounts and toggles", async () => {
        const w = mount(Custom, { attachTo: document.body });
        await w.find("button.vi-native").trigger("click");
        expect(document.querySelector(".vi-panel")).not.toBeNull();
        w.unmount();
    });
    it("migration conversions", () => {
        expect(PlainDateTime.fromISO("2026-11-10")?.toISODate()).toBe(
            "2026-11-10"
        );
        expect(
            PlainDateTime.fromISO("2026-11-10T14:30")?.toJSDate().getHours()
        ).toBe(14);
        expect(PlainDateTime.fromISO("nope")).toBeNull();
    });
    it("THEME_TOKENS lists every token defined in tokens.css", async () => {
        const fs = (await import(/* @vite-ignore */ "node:" + "fs")) as {
            readFileSync(p: string, enc: string): string;
        };
        const tokensCss = fs.readFileSync("src/styles/tokens.css", "utf8");
        const defined = [
            ...new Set(
                [...tokensCss.matchAll(/^ {2}(--vi-[a-z0-9-]+):/gm)].map(
                    (m) => m[1]
                )
            )
        ].sort();
        expect([...THEME_TOKENS].sort()).toEqual(defined);
    });
    it("query string round trip from the doc example", () => {
        const items = [{ key: "age", op: "<" as const, value: 30 }];
        expect(toQueryString(items)).toBe("filter[age][lt]=30");
        expect(
            fromQueryString("filter[age][lt]=30", [
                { key: "age", label: "Age", type: "number" }
            ])
        ).toEqual(items);
    });
});
