# Design System Documentation: The Tactile Discovery Garden

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Tactile Discovery Garden."** In the context of primary education, we move away from the "industrial" look of traditional software. Instead, we treat the interface as a physical, layered environment—reminiscent of high-end children’s editorial design and bespoke wooden toys.

The goal is to move beyond a "template" feel. We achieve this through **intentional asymmetry**, where elements aren't always perfectly boxed, and **tonal depth**, where hierarchy is defined by soft shifts in color rather than rigid lines. This system is designed to be a gentle guide, encouraging young learners through a premium, "touchable" digital experience.

## 2. Colors
Our palette balances the energy of childhood with a sophisticated, warm base. The color strategy focuses on comfort for the eyes and clear functional signaling.

### Tonal Hierarchy
- **Primary (`#9f4200`):** Our "Action Orange." Used for major interactions and achievements. It radiates warmth and encouragement.
- **Secondary (`#0058ca`):** The "Curiosity Blue." Reserved for navigational elements and exploration-based tasks.
- **Tertiary (`#006e2a`):** The "Growth Green." Dedicated to progress, success states, and positive reinforcement.
- **Background & Surfaces:** We use a "warm-paper" approach. The base is `surface` (`#fff8f3`), providing a soft, non-clinical foundation that reduces eye strain for young readers.

### The "No-Line" Rule
To maintain a high-end, organic feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through:
1. **Background Color Shifts:** Placing a `surface-container-low` component on a `surface` background.
2. **Surface Hierarchy & Nesting:** Treat the UI as stacked sheets of fine, heavy-weight paper. An inner card should use `surface-container-highest` to sit atop a `surface-container-low` section, creating natural depth without visual clutter.

### The "Glass & Gradient" Rule
To add "soul" to the UI, main CTAs should utilize a subtle linear gradient transitioning from `primary` to `primary_container`. Floating elements (like navigation bars or pop-overs) should use semi-transparent surface colors with a `backdrop-blur` (Glassmorphism) to feel integrated into the "garden" environment rather than pasted on top.

## 3. Typography
Typography is the primary tool for accessibility in a classroom app. We use two distinct typefaces to balance character and clarity.

- **Lexend (Display & Headlines):** Designed specifically to improve reading fluency. We use Lexend for all `display-` and `headline-` scales. Its geometric, open nature makes it incredibly approachable for young readers.
- **Plus Jakarta Sans (Body & Titles):** A sophisticated sans-serif used for `title-`, `body-`, and `label-` scales. It provides a premium, editorial contrast to the roundness of Lexend.

**Editorial Usage:** Avoid a standard "top-down" text block. Use generous line-height for body text to aid tracking. Headline scales (`display-lg`) should be used boldly and occasionally with intentional asymmetry (e.g., left-aligned with a wide margin) to create a rhythmic, magazine-like feel.

## 4. Elevation & Depth
We reject the "drop shadow" defaults of the early web. Depth in this design system is achieved through **Tonal Layering.**

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background to create a "lifted" effect. This mimics the way natural light hits layered materials.
- **Ambient Shadows:** If a floating effect is required (e.g., a modal or a primary button), use an "Ambient Shadow." This is a high-blur (30px+), low-opacity (4%-8%) shadow tinted with the `on-surface` color (`#231a0d`). Never use pure grey or black for shadows.
- **The "Ghost Border" Fallback:** If a container requires a border for accessibility, use the `outline_variant` at **20% opacity**. This creates a "Ghost Border" that defines the edge without breaking the soft aesthetic.

## 5. Components

### Buttons
- **Primary:** Pill-shaped (`rounded-full`) with a gradient from `primary` to `primary_fixed_dim`. Use `on_primary` for text.
- **Secondary:** `surface_container_highest` background with `secondary` text. No border.
- **Interactive States:** On hover or tap, the button should subtly scale (1.02x) and increase shadow diffusion, rather than just changing color.

### Cards & Lists
- **Cards:** Use `rounded-lg` (2rem) or `rounded-xl` (3rem). Forbid the use of divider lines. Separate content using vertical white space or a subtle shift from `surface-container-low` to `surface-container-high`.
- **Lists:** Use "Floating Items." Each list item is its own pill-shaped container on a slightly different surface tone, rather than a single box with lines between items.

### Inputs & Selection
- **Input Fields:** Use `surface_container_highest` for the field background with `rounded-md` (1.5rem) corners. The `label-md` should sit clearly above the field in `on_surface_variant`.
- **Chips:** Selection chips should use the `full` roundedness scale and transition from `surface_container` to `secondary_container` when selected.

### Custom Component: "The Progress Bloom"
Instead of a standard progress bar, use a series of staggered, overlapping circles (using `tertiary`) that grow or "bloom" as the student completes tasks. This reinforces the "Discovery Garden" theme.

## 6. Do's and Don'ts

### Do:
- **Use Max Roundedness:** Use `rounded-xl` (3rem) for large containers to emphasize the "friendly" and "soft" brand personality.
- **Embrace White Space:** Give elements "room to breathe." High-end design is defined by what you leave out.
- **Layer Surfaces:** Always ask "Can I define this area with a color shift instead of a line?"

### Don't:
- **Don't use 100% Opaque Outlines:** This creates "visual noise" that distracts young readers.
- **Don't Center Everything:** Use asymmetric layouts (e.g., text on the left, illustrative icon partially overlapping the container edge on the right) to create a bespoke feel.
- **Don't Use Harsh Shadows:** Avoid small, dark, high-opacity shadows that feel "heavy."