# Trello List (Column) Specification

## Overview
- **Target file:** `src/components/features/kanban/Column.tsx`
- **Screenshot:** `docs/design-references/trello/board-desktop-1440.png`
- **Interaction model:** click (rename/menu) + DnD (sortable column)

## Computed styles (from getComputedStyle on `[data-testid="list"]`)

### List container
- width: 272px (wrapper padding 0 6px → ~12px gap between lists)
- maxHeight: 100%
- display: flex; flexDirection: column
- borderRadius: 12px
- backgroundColor: dark sample `rgb(16, 18, 4)` → light map `#f1f2f4` / token `muted`
- boxShadow: `0 0 0 1px transparent, 0 1px 1px rgba(1,4,4,.5), 0 0 1px rgba(1,4,4,.5)` (dark) → light: soft raised
- padding: 0 0 4px
- **No hard 1px border**

### List header
- padding: 8px 8px 0
- display: flex; justifyContent: space-between; alignItems: flex-start
- Title (`list-name`): fontSize ~14–20px, fontWeight ~650, no bottom border under header

### List cards (`ol`)
- margin: -4px 4px 0; padding: 4px
- overflow-y: auto; flex column
- card gap ≈ 8px

### Footer / Add a card
- Inside list, no separator border-top
- Ghost full-width “Add a card” control

## Preserve
- Context menu + delete confirm for columns
- Sortable/droppable wiring
