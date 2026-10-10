# Trello Card Specification

## Overview
- **Target files:** `Task.tsx`, `TaskCardBody.tsx`
- **Screenshot:** `docs/design-references/trello/board-desktop-1440.png`
- **Interaction model:** click open, hover menu, DnD

## Computed / CSS (`.list-card` + modern card)

### Card surface
- borderRadius: 8px (modern) / classic 3px — use **8px**
- background: raised surface (`#fff` light / dark card)
- boxShadow: `0 1px 1px #091e4240, 0 0 1px #091e424f`
- **No border**
- cursor: pointer
- details padding: `8px 8px 4px 12px`
- title: 14px, line-height 20px, medium weight

### Labels
- Colored bars (height ~8px, width ~40px, radius 4px), not text pills with dots
- Optional name via `title` attribute

### Hover
- Menu/ops button visible top-right
- No underline; surface stays raised

## CRITICAL — keep delete animation
- `removeWithCrumple` + `playCrumplePaper` from `@/lib/crumple-paper` must remain the archive/delete exit path
- Do not replace with Trello fade/collapse
