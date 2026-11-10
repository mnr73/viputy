import { describe, expect, it } from "vitest";
import { computePlacement } from "../src/utils/placement";

const rect = (left: number, top: number, width = 200, height = 46) => ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height
});
const vp = { width: 1000, height: 800 };

describe("computePlacement", () => {
    it("opens below by default", () => {
        const r = computePlacement({
            anchor: rect(100, 100),
            panel: { width: 240, height: 200 },
            viewport: vp
        });
        expect(r.side).toBe("bottom");
        expect(r.top).toBe(100 + 46 + 6);
        expect(r.left).toBe(100);
    });
    it("flips up when there is no room below", () => {
        const r = computePlacement({
            anchor: rect(100, 700),
            panel: { width: 240, height: 300 },
            viewport: vp
        });
        expect(r.side).toBe("top");
        expect(r.top).toBe(700 - 6 - 300);
    });
    it("stays below and caps height when both sides are too small", () => {
        const r = computePlacement({
            anchor: rect(100, 300),
            panel: { width: 240, height: 900 },
            viewport: vp
        });
        expect(r.side).toBe("bottom");
        expect(r.maxHeight).toBe(800 - 346 - 6 - 8);
    });
    it("clamps inside the right edge", () => {
        const r = computePlacement({
            anchor: rect(900, 100, 100),
            panel: { width: 300, height: 100 },
            viewport: vp
        });
        expect(r.left + 300).toBeLessThanOrEqual(1000 - 8);
    });
    it("clamps inside the left edge", () => {
        const r = computePlacement({
            anchor: rect(0, 100, 50),
            panel: { width: 300, height: 100 },
            viewport: vp,
            align: "end"
        });
        expect(r.left).toBe(8);
    });
    it("start aligns to the right edge in RTL", () => {
        const r = computePlacement({
            anchor: rect(500, 100),
            panel: { width: 100, height: 50 },
            viewport: vp,
            dir: "rtl"
        });
        expect(r.left).toBe(700 - 100);
    });
    it("matches anchor width", () => {
        const r = computePlacement({
            anchor: rect(100, 100, 321),
            panel: { width: 50, height: 50 },
            viewport: vp,
            matchWidth: true
        });
        expect(r.width).toBe(321);
    });
});

describe("computePlacement: tight rooms", () => {
    // 300px viewport, anchor in the middle: neither side holds a 400px panel
    const tight = { width: 1000, height: 300 };
    const anchor = rect(100, 127);
    it("reports how much the panel is taller than the room", () => {
        const r = computePlacement({
            anchor,
            panel: { width: 240, height: 400 },
            viewport: tight
        });
        expect(r.clipped).toBe(true);
        expect(r.deficit).toBeGreaterThan(0);
    });
    it("ignores a small overflow instead of adding an inner scrollbar", () => {
        const base = {
            anchor: rect(100, 100),
            viewport: { width: 1000, height: 800 }
        };
        // find the room below, then ask for a panel 20px taller than it
        const room = computePlacement({
            ...base,
            panel: { width: 240, height: 1 }
        });
        const height = room.maxHeight + 20;
        const strict = computePlacement({
            ...base,
            panel: { width: 240, height }
        });
        const lax = computePlacement({
            ...base,
            panel: { width: 240, height },
            overflowTolerance: 40
        });
        expect(strict.clipped).toBe(true);
        expect(lax.clipped).toBe(false);
        expect(lax.maxHeight).toBe(height);
    });
});
