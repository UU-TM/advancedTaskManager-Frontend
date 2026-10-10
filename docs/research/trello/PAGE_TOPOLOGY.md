# Trello Board — Page Topology

## Layers (top → bottom)

1. **App chrome** (ours) — existing board-shell header (views, filters, members). Keep.
2. **Board canvas** — full-bleed soft surface under header; horizontal list row.
3. **List columns** — 272px wide, 12px radius, muted surface, soft raised shadow, no hard border.
4. **Cards** — 8px radius, raised surface + dual soft shadow, no border; 8px vertical gap.
5. **Card detail modal** — existing modal (not restyled in this pass beyond board surface).

## Interaction model per section

| Section | Model |
|---------|--------|
| Lists row | scroll-driven horizontal + DnD |
| List | static chrome + header rename click |
| Card | click open, hover menu, DnD |
| Add card | click-to-expand composer |
| Delete/archive | **crumple paper** (custom, preserve) |
