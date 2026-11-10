export interface Rect {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

export type Side = "bottom" | "top";
export type Align = "start" | "center" | "end";

export interface PlacementInput {
    anchor: Rect;
    panel: { width: number; height: number };
    viewport: { width: number; height: number };
    side?: Side;
    align?: Align;
    dir?: "ltr" | "rtl";
    offset?: number;
    margin?: number;
    matchWidth?: boolean;
    /**
     * A panel that is at most this many px taller than the room is NOT capped
     * (no inner scroll); the overflow is simply ignored. Default 0.
     */
    overflowTolerance?: number;
}

export interface Placement {
    side: Side;
    left: number;
    top: number;
    width: number;
    maxHeight: number;
    /** True when the panel is taller than the room on the side it uses (so it would need to scroll). */
    clipped: boolean;
    /** Px the panel is taller than the room on its side (0 when it fits). */
    deficit: number;
}

/**
 * Pure positioning math for popups. Prefers `side`, flips when the other side
 * has more room, clamps horizontally inside the viewport, and caps the height
 * when neither side fits. `start`/`end` follow the inline direction (RTL aware).
 */
export function computePlacement(i: PlacementInput): Placement {
    const { anchor, viewport } = i;
    const side = i.side ?? "bottom";
    const align = i.align ?? "start";
    const dir = i.dir ?? "ltr";
    const offset = i.offset ?? 6;
    const margin = i.margin ?? 8;

    const width = i.matchWidth ? anchor.width : i.panel.width;
    const room = {
        bottom: viewport.height - anchor.bottom - offset - margin,
        top: anchor.top - offset - margin
    };
    const other: Side = side === "bottom" ? "top" : "bottom";
    let used = side;
    if (i.panel.height > room[side] && room[other] > room[side]) used = other;

    const roomUsed = Math.max(0, room[used]);
    const deficit = Math.max(0, i.panel.height - roomUsed);
    const tolerance = i.overflowTolerance ?? 0;
    // Small overflow: keep the natural height instead of adding an inner scrollbar.
    const maxHeight =
        deficit > 0 && deficit <= tolerance ? i.panel.height : roomUsed;
    const height = Math.min(i.panel.height, maxHeight);

    const startsLeft = (align === "start") === (dir === "ltr");
    let left =
        align === "center"
            ? anchor.left + (anchor.width - width) / 2
            : startsLeft
              ? anchor.left
              : anchor.right - width;
    left = Math.min(left, viewport.width - width - margin);
    left = Math.max(left, margin);

    const top =
        used === "bottom"
            ? anchor.bottom + offset
            : anchor.top - offset - height;

    return {
        side: used,
        left,
        top,
        width,
        maxHeight,
        clipped: i.panel.height > maxHeight,
        deficit
    };
}
