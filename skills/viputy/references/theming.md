# Theming viputy

Source of truth: `src/styles/tokens.css`. Every colour, size and corner is a CSS custom property; no component hard-codes a radius or colour any more (circles are `50%` on purpose). All rules are in `@layer vi`, so ordinary unlayered CSS always wins without `!important`.

## Where to set tokens

```css
:root { --vi-accent: #7c3aed; }            /* whole app */
.checkout-form { --vi-radius: 4px; }        /* one form (popups follow, see below) */
```

Popups render in `<body>`. ViPopup reads the resolved `--vi-*` values from the trigger (`readTokens`, list in `THEME_TOKENS`) and applies them on the panel, so a token set on ANY ancestor of the input also reaches its popup. Dark mode is carried over the same way (`vi-theme-dark` on the panel).

## Dark mode

Add `dark`, `vi-theme-dark` or `data-theme="dark"` to any ancestor (typically `<html>`). Dark values are defined once in `tokens.css`; to retheme dark, override the same tokens inside `.dark { ... }` in unlayered CSS:

```css
.dark { --vi-accent: #a78bfa; --vi-surface: #0f0f14; }
```

## Corners (the "how round" question)

Five radius tokens, from tight to round. Change them together or the UI looks uneven.

| Token | Default | Used by |
|---|---|---|
| `--vi-radius-xs` | 6px | checkbox box, kbd chips, operator symbol box |
| `--vi-radius-sm` | 10px | options, day cells, time items, buttons inside panels, presets |
| `--vi-radius` | 12px | the field frame (`.vi-field__control`) |
| `--vi-radius-lg` | 14px | popup panel, card radios, primary buttons, search row |
| `--vi-radius-xl` | 24px | mobile bottom-sheet top corners |
| `--vi-radius-pill` | 999px | chips, badges, switch track and thumb, segmented controls, close buttons, preset pills |

Ready presets (paste on `:root` or a wrapper):

```css
/* Sharp / square */
--vi-radius: 0; --vi-radius-sm: 0; --vi-radius-lg: 0; --vi-radius-xs: 0; --vi-radius-xl: 0; --vi-radius-pill: 0;

/* Slightly rounded (calm, enterprise) */
--vi-radius: 6px; --vi-radius-sm: 4px; --vi-radius-lg: 8px; --vi-radius-xs: 3px; --vi-radius-xl: 12px; --vi-radius-pill: 6px;

/* Very round (friendly) */
--vi-radius: 22px; --vi-radius-sm: 16px; --vi-radius-lg: 26px; --vi-radius-xs: 9px; --vi-radius-xl: 32px; --vi-radius-pill: 999px;
```

Rules: a radio box and loading spinners stay circular whatever the tokens say. To square only chips, change `--vi-radius-pill` alone. To make only the field frame rounder, change `--vi-radius` alone. `--vi-radius-pill: 999px` is fully round; any smaller value makes chips and the switch rectangular-ish.

## Size and type

| Token | Default | Effect |
|---|---|---|
| `--vi-height` | 46px | field height. Inner list rows, day cells and chips have their own fixed sizes |
| `--vi-font` | Vazirmatn, system-ui... | all text. viputy does NOT ship the font: load Vazirmatn yourself |
| `--vi-mono` | ui-monospace, JetBrains Mono | operator symbols in the query builder |
| `--vi-z` | 1000 | z-index of popups and the sheet scrim |

Popup list height is a prop (`list-max-height` on ViSelect), month width is `--vi-month-w` (default 300px) set on `.vi-cal__months`.

## Colours

| Token | Meaning |
|---|---|
| `--vi-bg` `--vi-surface` | page and card/panel background (`--vi-surface` is the panel and focused-field fill) |
| `--vi-field` `--vi-field-hover` `--vi-field-active` | resting, hover and pressed fill of a field / secondary button / chip |
| `--vi-hover` | highlighted option row, calendar day hover |
| `--vi-border` `--vi-border-strong` | hairlines; control outlines, switch track, scrollbar thumb |
| `--vi-fg` `--vi-muted` | text; secondary text, labels, placeholders, icons |
| `--vi-accent` `--vi-accent-fg` | brand fill and the text/icon on it |
| `--vi-accent-soft` `--vi-accent-soft-fg` | soft chip, range band, selected preset |
| `--vi-ring` | focus glow (a translucent accent, keep alpha ~0.18-0.28) |
| `--vi-danger` `--vi-warning` `--vi-success` + `-soft` | status border/text and status field fill |
| `--vi-shadow` `--vi-scrim` | popup shadow; sheet backdrop |

Change the brand colour in four tokens: `--vi-accent`, `--vi-accent-fg`, `--vi-accent-soft`, `--vi-accent-soft-fg` (+ `--vi-ring`). Dark theme needs its own set; derive them with the same light/dark contrast as the defaults.

## Disabled look

Disabled fields are unfilled, dashed and dimmed so they differ from normal filled ones:

```css
--vi-disabled-bg: transparent;      /* fill */
--vi-disabled-border: #b5bfce;      /* dashed outline colour (dark default #46546a) */
--vi-disabled-opacity: 0.55;        /* applied to the control content and label */
```
Checkbox/radio/switch disabled use opacity .5 and `cursor: not-allowed`.

## A "filled" vs "outlined" look

Default is filled (`--vi-field` background, transparent border). For outlined inputs:

```css
.vi-field__control { border-color: var(--vi-border-strong); background: var(--vi-surface); }
.vi-field__control:hover { border-color: var(--vi-fg); background: var(--vi-surface); }
```
Put this in unlayered CSS (it beats `@layer vi`). Focus and error styles already override border/background, so they keep working.

## Class hooks and `data-*` states

Stable classes (BEM-ish, `vi-` prefix): `vi-field`, `vi-field__label`, `vi-field__control`, `vi-field__main`, `vi-field__msg`, `vi-native` (the real input), `vi-panel`, `vi-option`, `vi-chip`, `vi-qchip` (query badge), `vi-day`, `vi-cal`, `vi-btn`, `vi-btn--primary`.

State attributes (style these, do not rely on class names for state): `data-status` (error|warning|success), `data-disabled`, `data-bare`, `data-active` (open or keyboard-highlighted), `data-selected`, `data-loading`, `data-draft`/`data-invalid`/`data-selected` on `.vi-qchip`, `data-today`, `data-weekend`, `data-outside`, `data-band`, `data-side` on the popup layer.

Per-instance classes: every `ViField`-based component takes `ui="{ root, head, label, control, main, message }"`, e.g. `<ViInput :ui="{ control: 'my-control' }" />`.

## Do / don't

- Do override tokens; don't copy `tokens.css` and edit it.
- Do keep light and dark values in sync when you change a colour.
- Don't target `.vi-panel` with `body`-relative selectors only; the panel is teleported, so scope by class (`.vi-panel .vi-option`).
- Don't set `border-radius` on `.vi-field__control` directly; change `--vi-radius` so the popup and focus ring stay consistent.
- Don't use `!important`. If a rule does not win, it is in a layer and yours is not: check that your CSS is not inside another `@layer` that is declared earlier.
