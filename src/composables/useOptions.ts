import { computed, toValue, type MaybeRefOrGetter } from "vue";
import {
    buildRows,
    defaultFilter,
    filterGroups,
    groupState,
    normalizeOptions,
    type FilterFn,
    type GroupState,
    type Grp,
    type Opt,
    type OptionAccessors,
    type Row
} from "../utils/options";

export interface UseOptionsInput {
    options: MaybeRefOrGetter<unknown[] | undefined>;
    accessors?: MaybeRefOrGetter<OptionAccessors>;
    query?: MaybeRefOrGetter<string>;
    /** `false` disables local filtering (server-side search). */
    filter?: MaybeRefOrGetter<boolean | FilterFn | undefined>;
}

/**
 * Turns raw options (strings, objects, `{ label, options }` groups) into the
 * groups and flat rows that `ViOptionList` renders. Use it to build your own
 * select-like inputs.
 */
export function useOptions(input: UseOptionsInput) {
    const groups = computed(() =>
        normalizeOptions(toValue(input.options), toValue(input.accessors) ?? {})
    );
    const all = computed<Opt[]>(() => groups.value.flatMap((g) => g.items));
    const visible = computed<Grp[]>(() => {
        const f = toValue(input.filter);
        if (f === false) return groups.value;
        return filterGroups(
            groups.value,
            toValue(input.query) ?? "",
            typeof f === "function" ? f : defaultFilter
        );
    });
    const rows = computed<Row[]>(() => buildRows(visible.value));
    const visibleOptions = computed<Opt[]>(() =>
        visible.value.flatMap((g) => g.items)
    );
    return {
        groups,
        all,
        visible,
        rows,
        visibleOptions,
        groupState: groupState as (g: Grp, s: (o: Opt) => boolean) => GroupState
    };
}
