# Miro landing behaviors (Kanban adaptation)

## Scroll

- Nav stays sticky; background becomes more opaque / gains border after leaving hero (approx. 40–80px).
- Sections fade/slide up on enter (IntersectionObserver-style reveals).
- No Lenis/Locomotive detected as primary scroll driver on marketing home (native smooth).

## Click

- Use-case tabs switch panel content (title, description, visual).
- Pricing period toggle.
- FAQ accordion expand/collapse.
- Nav CTA → signup; secondary → login / demo.

## Hover

- Nav links: color shift to foreground.
- Cards: subtle lift / border emphasis.
- Buttons: primary fill darken.

## Responsive

- 1440: multi-column hero + side visual; horizontal nav.
- 768: stacked hero; fewer nav items or hamburger.
- 390: single column; mobile menu drawer; marquee still horizontal.

## Kanban implementation notes

- INTERACTION MODEL for solutions: **click-driven tabs**
- INTERACTION MODEL for nav: **scroll-driven background**
- INTERACTION MODEL for features/testimonials: **scroll-reveal**
- Keep Kanban teal primary; no Miro brand yellow
