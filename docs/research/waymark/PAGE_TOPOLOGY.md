# Waymark homepage topology

Source: https://waymark-template.vercel.app/ measured at desktop width.

Applied to this app as a visual system, with Kanban copy, not Waymark’s analytics product.

## Order

1. Sticky pill nav (`top: 8px`, height 48px, radius 24px, `background: rgb(255 255 255 / 0.85)`).
2. Hero on `#f7fafc`. Eyebrow pill, Open Runde h1 at 60px / 600 / line-height 63px / tracking -1.8px. Second line `rgba(10, 10, 10, 0.55)`. Primary pill `#357dff`, height 48px. Secondary pill `#f4f4f5`.
3. Product overview card, radius 18px, shadow `0 0 0 1px rgba(0,0,0,0.06), 0 24px 60px -28px rgba(0,0,0,0.28), 0 40px 90px -48px rgba(0,0,0,0.36)`. Entrance `translateY(20px)` over 0.55s, ease `cubic-bezier(0.16, 1, 0.3, 1)`. Backdrop is a lavender-to-teal wave (`#C4B5FD` to `#99F6E4`).
4. How it works. Three pastel panels (periwinkle, cream, mint) with white inner cards.
5. Feature cards. White, radius 28px, border `rgba(229,229,229,0.55)`. Hover lifts 4px.
6. Pricing, kept because this product sells plans. Same white cards and blue pill.
7. FAQ accordion. First item open. Chevron rotates 180deg over 300ms.
8. Closing band. Radius 24px, fill `#357dff`, white Open Runde heading at 36px.
9. Footer on white.

## Interaction model

- Nav, FAQ, pricing, and week-strip on the dashboard are click-driven.
- Hero overview entrance, row fade, and funnel fill are time-driven CSS.
- No Lenis, no scroll-snap, no scroll-driven tab switching.

## Dashboard

Signed-in `/home` uses the same wash, display face, white 18px cards, and blue `#357dff` selection. Counts come from home data. The icon rail stays the app sidebar.
