---
name: Korvex Dev Technical Survey System
colors:
  surface: '#12131c'
  surface-dim: '#12131c'
  surface-bright: '#383843'
  surface-container-lowest: '#0d0e16'
  surface-container-low: '#1a1b24'
  surface-container: '#1e1f28'
  surface-container-high: '#292933'
  surface-container-highest: '#33343e'
  on-surface: '#e3e1ee'
  on-surface-variant: '#c5c5d9'
  inverse-surface: '#e3e1ee'
  inverse-on-surface: '#2f303a'
  outline: '#8f8fa2'
  outline-variant: '#444656'
  surface-tint: '#bdc2ff'
  primary: '#bdc2ff'
  on-primary: '#00159e'
  primary-container: '#2f43ea'
  on-primary-container: '#ced1ff'
  inverse-primary: '#3347ed'
  secondary: '#bcc5e8'
  on-secondary: '#262f4b'
  secondary-container: '#3f4865'
  on-secondary-container: '#aeb7d9'
  tertiary: '#ffb59f'
  on-tertiary: '#5f1600'
  tertiary-container: '#aa2f00'
  on-tertiary-container: '#ffc8b8'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dfe0ff'
  primary-fixed-dim: '#bdc2ff'
  on-primary-fixed: '#000964'
  on-primary-fixed-variant: '#0925d7'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#bcc5e8'
  on-secondary-fixed: '#111a35'
  on-secondary-fixed-variant: '#3d4662'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb59f'
  on-tertiary-fixed: '#3a0a00'
  on-tertiary-fixed-variant: '#862300'
  background: '#12131c'
  on-background: '#e3e1ee'
  surface-variant: '#33343e'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  counter-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  progress-bar-height: 4px
  container-max-width: 720px
  gutter-md: 24px
  stack-lg: 48px
  margin-edge: 32px
---

## Brand & Style
The design system is engineered for a high-end, developer-centric survey experience. The brand personality is precise, technical, and authoritative, favoring clarity over ornamentation. 

The aesthetic follows a **Modern Minimalist** approach with a focus on flat surfaces and high-definition "hairline" strokes. It avoids all forms of skeuomorphism—specifically gradients, shadows, and glows—to ensure a focused, distraction-free environment. The interface emphasizes functional elegance through generous whitespace and a strictly governed color palette, making the content the primary focal point.

The logo consists of an angular, geometric 'K' in a dual-tone Blue/Silver execution, paired with the 'KORVEX DEV' wordmark in a structured, monospaced-adjacent arrangement.

## Colors
The palette is deeply rooted in a dark, nocturnal spectrum to reduce eye strain and project a premium "IDE-inspired" feel.

- **Primary:** Electric Blue (#2f43ea). Used exclusively for active states, the progress bar, and the 'K' icon.
- **Background:** Deep Navy (#0a0c14). The base canvas for all views.
- **Surface:** Subtle Navy (#161a2b). Used for card elements and interactive containers to provide structural separation.
- **Borders:** Slate Blue (#262c45). A low-contrast hairline color for defining boundaries without adding visual weight.
- **Typography:** Primary text uses Off-White (#f2f4fb) for maximum legibility, while secondary text uses Muted Slate (#9aa3c4) for metadata and hints.

## Typography
This design system utilizes **Inter** exclusively. To maintain a clean, technical look, only **Regular (400)** and **Medium (500)** weights are permitted.

- **Headlines:** Use Medium weight with slight negative letter-spacing for a modern, compact appearance.
- **Body:** Use Regular weight with generous line height to ensure readability in a single-question-per-view format.
- **Labels:** Use Medium weight with slight tracking for uppercase labels or interactive button text.
- **Language:** All system text, including placeholders and instructions, must be in Spanish (e.g., "Presiona Enter", "Siguiente", "Pregunta {n} de {total}").

## Layout & Spacing
The layout is strictly non-scrolling. Every view is a vertically and horizontally centered "stage" for a single question.

- **Progress Bar:** A 4px Electric Blue bar is pinned to the absolute top of the viewport, spanning the width relative to completion percentage.
- **Counter:** The question counter (e.g., "01 / 12") is positioned in the top-right corner with fixed margins.
- **Centering:** Content must be centered using a flexible box model. If content exceeds the viewport height on small devices, the font size should scale down rather than introducing a scrollbar.
- **Grid:** Use a single-column layout centered within a 720px max-width container for desktop.

## Elevation & Depth
Depth is achieved through **Tonal Layering** and **Hairline Outlines**. 

There are no shadows or blurs in this system. Elements are separated by their background fills and 1px solid borders (#262c45). Higher hierarchy elements (like a selected option) do not lift off the page; instead, they change their border color to the Primary Electric Blue or change their fill slightly to indicate focus. 

The background is always the darkest layer, with surfaces being one step lighter.

## Shapes
The shape language is sophisticated and modern. All interactive elements—cards, input fields, and buttons—use a consistent **12px to 14px corner radius**. 

- **Standard Elements:** 12px (0.75rem)
- **Large Containers/Cards:** 14px (0.875rem)
- **Progress Bar:** 0px (Flush to edges)

## Components
### Buttons & Inputs
- **Primary Action:** Solid Electric Blue background with White text (Medium weight). No hover glow; use a slight brightness shift (10%) for hover states.
- **Input Fields:** Transparent background with a 1px #262c45 border. Upon focus, the border changes to #2f43ea. Text is `headline-lg`.
- **Choice Chips/Cards:** Surface color (#161a2b) with a 1px border. Selected state uses a Primary Blue border and a subtle indicator (like a letter 'A', 'B', 'C' key hint).

### Navigation & Progress
- **Progress Bar:** A flat, 4px horizontal line. No rounding on the progress indicator itself; it should feel like a technical gauge.
- **Question Counter:** Positioned top-right, using `counter-sm` typography. 

### Cards
- Used to wrap multiple-choice options. Cards should have a 1px border (#262c45) and 24px internal padding. They should stack vertically with 12px gaps.