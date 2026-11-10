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

        // Neither side fits: scroll the page so the panel fits on its side, instead of squeezing it
        // into an inner scrollbar. Scrolling down by N moves the anchor up by N (and the panel, which
        // sits below it, up with it), so a bottom panel needs +deficit and a top panel needs -deficit.
        // The anchor itself must stay fully visible, which caps how far we may move.
        if (
            r.deficit > input.overflowTolerance &&
            o.autoScroll?.value &&
            !scrolled
        ) {
            scrolled = true;
            const gap = input.offset + 8;
            const need = r.deficit + 8; // + the viewport margin
            let by = 0;
            if (r.side === "bottom") {
                by = Math.min(need, Math.max(0, a.top - gap)); // anchor may rise until it nears the top
            } else {
                by = -Math.min(
                    need,
                    Math.max(0, window.innerHeight - a.bottom - gap)
                ); // or sink to the bottom
            }
            if (by) {
                const sp = scrollParentOf(anchor);
                const prev =
                    sp === window
                        ? window.scrollY
                        : (sp as HTMLElement).scrollTop;
                sp.scrollBy({ top: by, behavior: "auto" });
                const now =
                    sp === window
                        ? window.scrollY
                        : (sp as HTMLElement).scrollTop;
                if (now !== prev)
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
