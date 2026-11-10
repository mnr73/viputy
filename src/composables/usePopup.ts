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

    function update() {
        const anchor = o.anchor.value;
        const panel = o.panel.value;
        if (!anchor || !panel) return;
        const a = anchor.getBoundingClientRect();
        // Measure the natural size: drop our own width/height caps first.
        panel.style.maxHeight = "";
        panel.style.width = "";
        const p = panel.getBoundingClientRect();
        const r = computePlacement({
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
            matchWidth: o.matchWidth.value
        });
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
