import { describe, expect, it } from "vitest";
import {
    edgeIndex,
    moveIndex,
    useListNav
} from "../src/composables/useListNav";

describe("moveIndex", () => {
    it("moves and wraps", () => {
        expect(moveIndex(-1, 1, 3)).toBe(0);
        expect(moveIndex(2, 1, 3)).toBe(0);
        expect(moveIndex(0, -1, 3)).toBe(2);
    });
    it("skips disabled", () => {
        expect(moveIndex(0, 1, 4, (i) => i === 1)).toBe(2);
        expect(moveIndex(2, -1, 4, (i) => i === 1)).toBe(0);
    });
    it("stops at the ends without loop", () => {
        expect(moveIndex(2, 1, 3, () => false, false)).toBe(2);
    });
    it("handles empty and all-disabled lists", () => {
        expect(moveIndex(-1, 1, 0)).toBe(-1);
        expect(moveIndex(-1, 1, 3, () => true)).toBe(-1);
    });
    it("edgeIndex finds first/last enabled", () => {
        expect(edgeIndex(1, 4, (i) => i === 0)).toBe(1);
        expect(edgeIndex(-1, 4, (i) => i === 3)).toBe(2);
    });
});

describe("useListNav", () => {
    it("handles keys and selects", () => {
        let picked = -1;
        const nav = useListNav({ count: 3, onSelect: (i) => (picked = i) });
        const key = (k: string) => {
            let prevented = false;
            const handled = nav.onKeydown({
                key: k,
                preventDefault: () => (prevented = true)
            } as unknown as KeyboardEvent);
            return handled && prevented;
        };
        expect(key("Enter")).toBe(false);
        expect(key("ArrowDown")).toBe(true);
        expect(key("ArrowDown")).toBe(true);
        expect(nav.active.value).toBe(1);
        key("End");
        expect(nav.active.value).toBe(2);
        key("Home");
        expect(nav.active.value).toBe(0);
        key("Enter");
        expect(picked).toBe(0);
        expect(key("a")).toBe(false);
    });
});
