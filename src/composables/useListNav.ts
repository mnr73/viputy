import { ref, toValue, type MaybeRefOrGetter } from "vue";

/**
 * Next enabled index moving by `step` from `current` (-1 = nothing active).
 * Wraps when `loop`; otherwise stays put at the ends. -1 if nothing is enabled.
 */
export function moveIndex(
    current: number,
    step: 1 | -1,
    count: number,
    isDisabled: (i: number) => boolean = () => false,
    loop = true
): number {
    if (count <= 0) return -1;
    let i = current;
    for (let n = 0; n < count; n++) {
        i += step;
        if (i < 0 || i >= count) {
            if (!loop) return current;
            i = (i + count) % count;
        }
        if (!isDisabled(i)) return i;
    }
    return current;
}

/** First (step 1) or last (step -1) enabled index, -1 if none. */
export function edgeIndex(
    step: 1 | -1,
    count: number,
    isDisabled: (i: number) => boolean = () => false
): number {
    return moveIndex(step === 1 ? -1 : count, step, count, isDisabled, false);
}

export interface ListNavOptions {
    count: MaybeRefOrGetter<number>;
    isDisabled?: (i: number) => boolean;
    loop?: boolean;
    onSelect?: (index: number) => void;
}

// ponytail: no type-ahead. Add when a list needs jump-by-letter.
/** Keyboard navigation state for listbox-like popups. */
export function useListNav(opts: ListNavOptions) {
    const active = ref(-1);
    const count = () => toValue(opts.count);

    function move(step: 1 | -1) {
        active.value = moveIndex(
            active.value,
            step,
            count(),
            opts.isDisabled,
            opts.loop ?? true
        );
    }
    function first() {
        active.value = edgeIndex(1, count(), opts.isDisabled);
    }
    function last() {
        active.value = edgeIndex(-1, count(), opts.isDisabled);
    }
    function reset() {
        active.value = -1;
    }

    /** Returns true when the key was handled (and default prevented). */
    function onKeydown(e: KeyboardEvent): boolean {
        switch (e.key) {
            case "ArrowDown":
                move(1);
                break;
            case "ArrowUp":
                move(-1);
                break;
            case "Home":
                first();
                break;
            case "End":
                last();
                break;
            case "Enter":
                if (active.value < 0) return false;
                opts.onSelect?.(active.value);
                break;
            default:
                return false;
        }
        e.preventDefault();
        return true;
    }

    return { active, move, first, last, reset, onKeydown };
}
