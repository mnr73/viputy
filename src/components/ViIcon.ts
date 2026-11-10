import { h, type FunctionalComponent } from "vue";

type IconName =
    | "close"
    | "check"
    | "minus"
    | "eye"
    | "eyeOff"
    | "chevron"
    | "search"
    | "calendar"
    | "clock";

const paths: Record<IconName, string[]> = {
    close: ["M6 6l12 12M18 6L6 18"],
    check: ["M5 12l5 5L20 7"],
    minus: ["M6 12h12"],
    chevron: ["M6 9l6 6 6-6"],
    calendar: ["M4 6h16v14H4z", "M4 10h16M8 3v4M16 3v4"],
    clock: ["M12 3a9 9 0 100 18 9 9 0 000-18z", "M12 7v5l3 2"],
    search: ["M11 4a7 7 0 100 14 7 7 0 000-14z", "M20 20l-4-4"],
    eye: [
        "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z",
        "M12 9a3 3 0 100 6 3 3 0 000-6z"
    ],
    eyeOff: [
        "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z",
        "M12 9a3 3 0 100 6 3 3 0 000-6z",
        "M4 4l16 16"
    ]
};

/** Tiny inline icon set used by the built-in components. */
export const ViIcon: FunctionalComponent<{
    name: IconName;
    size?: number;
    width?: number;
}> = (p) =>
    h(
        "svg",
        {
            class: ["vi-icon", `vi-icon--${p.name}`],
            width: p.size ?? 16,
            height: p.size ?? 16,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": p.width ?? 2.5,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "aria-hidden": "true"
        },
        paths[p.name].map((d) => h("path", { d }))
    );
ViIcon.props = ["name", "size", "width"];
