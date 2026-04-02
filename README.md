# Archway

Visual architecture mapping on an infinite canvas, with live GitHub code snippet embedding.

Paste a GitHub permalink on the canvas and get a syntax-highlighted code card that links back to the source. Double-click to open a scrollable file viewer. Connect blocks with labeled arrows. Export/import as JSON. Coding agents can generate diagrams via a declarative YAML format.

Built on [tldraw](https://github.com/tldraw/tldraw) + [Shiki](https://github.com/shikijs/shiki) + [ELK](https://github.com/kieler/elkjs).

## Quick start

```bash
git clone https://github.com/DavidBellamy/archway.git
cd archway
npm install
npm run dev
```

Open http://localhost:5173 in Chrome.

## Features

**Canvas**: infinite zoom/pan, shapes, text, freehand drawing, sticky notes, grouping, labeled arrows (everything tldraw provides, plus custom GitHub code blocks).

**GitHub code blocks**: paste any GitHub permalink (`github.com/.../blob/sha/path#L10-L25`) on the canvas. The file is fetched via the GitHub API, syntax-highlighted with Shiki, and rendered as a card showing the exact linked lines. The card header shows filename, line range, repo, branch name, and short commit hash.

**Code popup**: double-click a code block to open a scrollable file viewer with surrounding context and highlighted linked lines. "Load full file" button to see everything.

**Theme**: dark/light/system toggle in the toolbar. Syntax highlighting switches between `github-dark` and `github-light` themes.

**GitHub PAT**: enter a personal access token in Settings to access private repos (5,000 req/hr vs 60). Stored in browser localStorage only, never included in exports.

**Export/Import**: save diagrams as `.archway.json` files. Self-contained (includes fetched code), so anyone with Archway can view them without a PAT.

**YAML import (agent authoring)**: coding agents (Claude Code, Copilot, etc.) can generate diagrams by writing a `.yaml` file:

```yaml
name: "My Architecture"

layout:
  direction: top-to-bottom   # or left-to-right
  layerSpacing: 600           # gap between layers
  nodeSpacing: 250            # gap within layers

blocks:
  - id: handler
    url: https://github.com/org/repo/blob/abc123/src/handler.ts#L10-L30
    branch: main
    label: "Request handler"

  - id: db
    url: https://github.com/org/repo/blob/abc123/src/db.ts#L5-L25
    branch: main

  - id: note-1
    type: note
    content: "All queries use connection pooling"

connections:
  - from: handler
    to: db
    label: "queries"
  - from: db
    to: note-1
```

Blocks without `position` are laid out automatically using ELK's layered algorithm (assigns nodes to ranks, minimizes edge crossings). Arrows bind to shapes and follow them when dragged.

## Tech stack

React, TypeScript, Vite, tldraw, Shiki, ELK (elkjs), Floating UI, Tailwind CSS, DOMPurify, js-yaml.
