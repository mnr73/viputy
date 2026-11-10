import { onScopeDispose, ref, watch, type CSSProperties, type Ref } from "vue";
import { computePlacement, type Align, type Side } from "../utils/placement";

export interface PopupOptions {
    open: Ref<boolean>;
    /** Set false (e.g. mobile sheet) to skip positioning. */
    enabled: Ref<boolean>;
    anchor: Ref<HTMLElement | null | undefined>;
    panel: Ref<HTMLElement | null | undefined>;
    side: Ref<Side>;
    align: Ref<Align>;
    offset: Ref<number>;
    matchWidth: Ref<boolean>;
    dir: Ref<"ltr" | "rtl">;
    /** When neither side fits the panel, scroll the page by the missing amount (once per open). */
    autoScroll?: Ref<boolean>;
}

/**
 * Positions a `position: fixed` panel next to an anchor. Re-measures on
 * resize, scroll (any ancestor) and panel size changes. SSR-safe: touches the
 * DOM only after the panel opens.
 */
export function usePopup(o: PopupOptions) {
    const style = ref<CSSProperties>({});
    const side = ref<Side>("bottom");
    const placed = ref(false);
    let scrolled = false;

    function scrollParentOf(el: HTMLElement): HTMLElement | Window {
        for (
            let n = el.parentElement;
            n && n !== document.body;
            n = n.parentElement
        ) {
            const oy = getComputedStyle(n).overflowY;
            if (
                (oy === "auto" || oy === "scroll") &&
                n.scrollHeight > n.clientHeight
            )
                return n;
        }
        return window;
    }

    function update() {
        const anchor = o.anchor.value;
        const panel = o.panel.value;
        if (!anchor || !panel) return;
        const a = anchor.getBoundingClientRect();
        // Measure the natural size: clear our own caps AND park the panel at 0,0, because a
        // fixed box shrinks to fit the space right of its `left` (that made wide panels narrow).
        panel.style.maxHeight = "";
        panel.style.width = "";
        panel.style.left = "0px";
        panel.style.top = "0px";
        const p = panel.getBoundingClientRect();
        const input = {
            anchor: a,
            panel: {
                width: p.width,
                height: panel.scrollHeight + (p.height - panel.clientHeight)
            },
            viewport: {
                width: document.documentElement.clientWidth,
                height: window.innerHeight
            },
            side: o.side.value,
            align: o.align.value,
            dir: o.dir.value,
            offset: o.offset.value,
            matchWidth: o.matchWidth.value,
            overflowTolerance: 24
        };
        let r = computePlacement(input);

        // Neither side fits: scroll the PAGE so the whole panel is visible instead of giving it an
        // inner scrollbar. A top panel needs the anchor to sink by the deficit, a bottom panel needs it
        // to rise. Seeing the panel matters more than seeing the field, so the field may slide mostly
        // out of view; a sliver (`keep`) always stays. A panel taller than the viewport gets the most
        // room possible and scrolls inside itself for the rest.
        if (
            r.deficit > input.overflowTolerance &&
            o.autoScroll?.value &&
            !scrolled
        ) {
            scrolled = true;
            const margin = 8;
            const keep = 12;
            const need = r.deficit + margin;
            const limit =
                r.side === "bottom"
                    ? Math.max(0, a.bottom - keep)
                    : Math.max(0, input.viewport.height - a.top - keep);
            const by = Math.min(need, limit);
            if (by > 0) {
                const sp = scrollParentOf(anchor);
                const read = () =>
                    sp === window
                        ? window.scrollY
                        : (sp as HTMLElement).scrollTop;
                const prev = read();
                sp.scrollBy({
                    top: r.side === "bottom" ? by : -by,
                    behavior: "instant" as ScrollBehavior
                });
                if (read() !== prev)
                    r = computePlacement({
                        ...input,
                        anchor: anchor.getBoundingClientRect()
                    });
            }
        }

        side.value = r.side;
        style.value = {
            left: `${r.left}px`,
            top: `${r.top}px`,
            maxHeight: `${r.maxHeight}px`,
            ...(o.matchWidth.value ? { width: `${r.width}px` } : {})
        };
        placed.value = true;
    }

    watch(
        () => [o.open.value, o.enabled.value] as const,
        ([open, enabled], _, onCleanup) => {
            placed.value = false;
            scrolled = false;
            if (!open || !enabled) return;
            update();
            let raf = 0;
            const schedule = () => {
                cancelAnimationFrame(raf);
                raf = requestAnimationFrame(update);
            };
            window.addEventListener("resize", schedule);
            window.addEventListener("scroll", schedule, true);
            const ro =
                typeof ResizeObserver === "undefined"
                    ? null
                    : new ResizeObserver(schedule);
            if (o.panel.value) ro?.observe(o.panel.value);
            onCleanup(() => {
                cancelAnimationFrame(raf);
                window.removeEventListener("resize", schedule);
                window.removeEventListener("scroll", schedule, true);
                ro?.disconnect();
            });
        },
        { flush: "post" }
    );
    onScopeDispose(() => {
        placed.value = false;
    });

    return { style, side, placed, update };
}
