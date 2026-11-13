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
    | "clock"
    | "filter"
    | "upload"
    | "download"
    | "trash"
    | "grip"
    | "retry"
    | "file"
    | "alert";

const paths: Record<IconName, string[]> = {
    close: ["M6 6l12 12M18 6L6 18"],
    check: ["M5 12l5 5L20 7"],
    minus: ["M6 12h12"],
    chevron: ["M6 9l6 6 6-6"],
    calendar: ["M4 6h16v14H4z", "M4 10h16M8 3v4M16 3v4"],
    clock: ["M12 3a9 9 0 100 18 9 9 0 000-18z", "M12 7v5l3 2"],
    search: ["M11 4a7 7 0 100 14 7 7 0 000-14z", "M20 20l-4-4"],
    filter: ["M4 5h16l-6 8v5l-4 2v-7z"],
    upload: [
        "M12 16V4M7 9l5-5 5 5",
        "M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"
    ],
    download: [
        "M12 4v12M7 11l5 5 5-5",
        "M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"
    ],
    trash: ["M4 7h16M9 7V4h6v3", "M6 7l1 13h10l1-13M10 11v6M14 11v6"],
    grip: ["M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"],
    retry: ["M21 12a9 9 0 11-3-6.7L21 8", "M21 3v5h-5"],
    file: ["M6 3h8l4 4v14H6z", "M14 3v4h4"],
    alert: ["M12 3a9 9 0 100 18 9 9 0 000-18z", "M12 8v5M12 16h.01"],
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
