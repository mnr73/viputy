# Skill for AI agents

`skills/viputy/` in the repository is an agent skill (`SKILL.md` plus references) that tells agents such as Claude Code, Hermes and Codex how viputy works: which component for which job, the rules that matter (ISO values, `status`, popups, RTL), how to change the look (corner roundness, colours, disabled look, dark mode), ViQueryBuilder, and migrating from 0.3.

| File | Contents |
|---|---|
| `SKILL.md` | component picker, rules, theming and query-builder summary, common pitfalls |
| `references/components.md` | every prop, event and slot (extracted from the source) |
| `references/theming.md` | every token, sharp/soft/round presets, dark mode, disabled look |
| `references/query-builder.md` | data model, operators, key bindings, validation, query string |
| `references/custom-inputs.md` | building an input from `ViField` and `ViPopup` |
| `references/migration-0.x.md` | rename table and value conversions from 0.3 to 1.0 |

## Installing it for an agent

Into your project, as an agent skill folder:

```bash
# Claude Code
mkdir -p .claude/skills && cp -r node_modules/@mnr73/viputy/skills/viputy .claude/skills/

# Hermes
cp -r node_modules/@mnr73/viputy/skills/viputy ~/.hermes/skills/viputy
```

The `skills` folder ships in the npm package, so it is available after `npm i @mnr73/viputy`. Any agent that reads Markdown can read `SKILL.md` directly.

## Keeping it current

When a prop is added or removed, update `references/components.md` from the component source. `tests/skill-samples.test.ts` builds the skill's code samples and checks that the token list matches `tokens.css`.
