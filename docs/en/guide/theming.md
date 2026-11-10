# Theming

All visuals come from `--vi-*` variables. Override on `:root` or any ancestor:

```css
:root {
  --vi-accent: #7c3aed;
  --vi-radius: 8px;
  --vi-height: 40px;
}
```

Dark theme turns on with a `dark` class (or `vi-theme-dark`, or `data-theme="dark"`) on any ancestor. Popups render in `<body>` but inherit the theme from the trigger's ancestors.

Every part has a stable class (`vi-field__control`, ...) and the `ui` prop adds your own classes per part.

| Variable | Use |
|---|---|
| `--vi-font` | font |
| `--vi-radius` / `-sm` / `-lg` | corners |
| `--vi-height` | field height |
| `--vi-field`, `--vi-field-hover`, `--vi-surface` | backgrounds |
| `--vi-accent`, `--vi-accent-fg`, `--vi-accent-soft(-fg)`, `--vi-ring` | brand colour |
| `--vi-danger`, `--vi-warning`, `--vi-success` (+ `-soft`) | statuses |
| `--vi-border`, `--vi-border-strong`, `--vi-muted`, `--vi-fg` | borders and text |
| `--vi-shadow`, `--vi-scrim`, `--vi-z` | popups |
