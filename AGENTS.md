# Working in this repo (people and assistants)

This repo holds puzzles (skills, rules, conventions, agents) for AI coding assistants. Every puzzle is one folder;
the Trinity Community lists a folder at a git tag. Read this before you add or change a puzzle.

## A puzzle folder

```
<kind>/<name>/
  SKILL.md | RULES.md | CONVENTION.md | AGENT.md   the puzzle itself (English)
  trinity-share.json                              kind, name, description, tags, licence, runsWith, for, category
  SOURCE.md                                       original, repository and commit, author, licence, our changes
  LICENSE (and NOTICE)                            the licence text of the original, unchanged
  media/cover.webp                                1600 × 900, drawn by tools/covers (never by hand)
```

## Rules

- **English** in every puzzle file. Names in kebab-case, no spaces, no umlauts, no vendor brand in the name.
- **Works with any assistant.** No tool names, commands, paths or features only one vendor has. Say what to do
  ("run the tests"), not which tool to call. Paths start at the project root, never absolute.
- **A skill** has a description with its triggers, the sections Goal and Steps, and at most 500 lines.
- **Taken from elsewhere:** only from the original repository, never from a list or a copy. Check the licence at the
  commit you take; no licence, NC, ND or Commons Clause means no. SOURCE.md names the original file at that commit,
  the author, the licence and every change; LICENSE (and NOTICE for Apache-2.0) go along unchanged. CC BY-SA stays
  CC BY-SA. Never suggest the original author or vendor stands behind this repo.
- **Draft until a person says yes.** A new or changed puzzle has `status: draft` in its front matter. Only a
  maintainer removes it, after reading the puzzle.
- **Covers:** every puzzle gets its own cover, never only the one of its category: a picture of what the puzzle is
  about, in its own two colours. Add the puzzle to `tools/covers/covers.json` (title, one-line tagline and `colors`,
  two of `accent`, `lead`, `wire-1` … `wire-5`, chosen so it does not look like its neighbours), draw its motif in
  `tools/covers/cover.html` under `own` (key: the puzzle's name, a 600 × 600 box), then
  `node tools/covers/build.js <name>`. Without an own motif the build falls back to the motif of the category, which
  is only a placeholder. Needs Google Chrome or Chromium and ImageMagick; the fonts come from the Trinity Community
  checkout next to this repo (`COVER_FONTS` points elsewhere).
- **Commits:** one line in English, then text if needed. One topic per commit.
- **Versions:** the community lists a folder at a tag. The first release of all puzzles is the tag `v1`; a later
  version of one puzzle gets its own tag (`<name>-v2`, …). Tags are never moved or deleted.
