# Trello Board — Behaviors

Source: https://trello.com/b/nC8QJJoZ/trello-tips (public board, Oct 2026)
Customization: keep Kanban brand tokens; preserve crumple-paper card delete/archive animation.

## Interaction model (board canvas)

- **Horizontal scroll** of lists (`overflow-x: auto`, `overflow-y: hidden` on lists row)
- **Vertical scroll** inside each list’s card stack
- **Drag-and-drop** cards between/within lists; drag lists horizontally
- **Click** card → opens card detail modal
- **Hover** card → edit/menu affordance appears top-right; slight surface emphasis
- **Inline composers** at list footer (“Add a card”) — click to expand textarea + Add/Cancel

## Not cloning

- Atlassian global nav / logged-out marketing chrome
- Trello blue brand / Power-Ups marketplace
- Default Trello archive fade — **we keep `playCrumplePaper`**

## Scroll / sticky

- Board header sticky above canvas; canvas fills remaining viewport height
- Lists row is the scroll container (not window)
