# SkillSync Design System

## Color Palette

### Surface (Neutral)
```css
50:  #fafaf9   /* page bg */
55:  #f8f8f7   /* section bg (alternate) */
100: #f5f5f4   /* card inner bg, borders */
200: #e5e7eb   /* subtle borders */
300: #d1d5db   /* light text, muted borders */
400: #9CA3AF   /* secondary text */
500: #6B7280   /* muted text */
600: #4B5563   /* medium grey (hover states) */
700: #333333   /* dark cards, inner elements */
800: #1a1a1a   /* section bg (pricing), dark mode card */
900: #0d0d0d   /* dark mode section bg */
950: #000000  /* dark mode page bg */
```

### Stitch (Brand)
```css
primary:           #006948    /* green — main CTA, accents */
primary-container: #00855d    /* green — containers */
primary-fixed:     #85f8c4    /* green — dark mode text on glass */
primary-fixed-dim: #68dba9    /* green — dark mode muted */
secondary:         #712ae2    /* purple — secondary accents */
secondary-container:#8a4cfc   /* purple — containers */
secondary-fixed:   #eaddff    /* purple — dark mode text on glass */
```

**Accent strategy:** Only 2 accents (green + purple). No blue. Green is primary (CTAs, key data, progress). Purple is secondary (alternate cards, badges, variety).

### Light Mode
- Page bg: `surface-50` (#fafaf9)
- Section bg: `surface-55` (#f8f8f7)
- Card bg: `bg-white/70` (frosted glass)
- Card border: `border-white/30`
- Text: `surface-900` (headings), `surface-500` (body), `surface-400` (muted)
- Shadow: `rgba(20,27,43,0.04)` — blue-tinted, very subtle

### Dark Mode
- Page bg: `surface-950` (#000000)
- Section bg: `surface-900` (#0d0d0d)
- Card bg: `dark:bg-white/[0.06]` (frosted glass on black)
- Card border: `dark:border-white/15`
- Text: `white` (headings), `white/60` (body), `white/50` (muted)
- Accent text: `stitch-primary-fixed` (green), `stitch-secondary-fixed` (purple)
- Shadow: `rgba(255,255,255,0.04)` — white-based, subtle glow
- Hover shadow: `rgba(255,255,255,0.07)`

### Section Background Rhythm
| Section | Light | Dark |
|---|---|---|
| Hero | `surface-55` | `surface-950` |
| Features | `surface-55` | `surface-900` |
| How it Works | `surface-55` | `surface-900` |
| Testimonials | `surface-55` | `surface-900` |
| Pricing | `surface-900` | `surface-800` |
| CTA | `surface-55` | `surface-900` |
| Trusted By | `surface-55` | `surface-900` |
| Footer | `surface-900` | `surface-950` |

## Glassmorphism

Card glass pattern (all cards across the site):
```html
bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl
border border-white/30 dark:border-white/15
shadow-[0_10px_20px_rgba(20,27,43,0.04)] dark:shadow-[0_10px_20px_rgba(255,255,255,0.04)]
```

Inner section glass (nested inside cards):
```html
bg-surface-100 dark:bg-white/[0.04] backdrop-blur-sm
border border-surface-200 dark:border-white/10
```

Navbar glass:
```html
bg-white/70 dark:bg-white/[0.05] backdrop-blur-2xl
border-b border-surface-200/10 dark:border-white/10
shadow-lg shadow-surface-900/10 dark:shadow-white/5
```

Icon container glass:
```html
bg-stitch-primary/10 dark:bg-stitch-primary/20 backdrop-blur-sm
```

### Opacity Scale for Dark Mode Glass
| Use | Opacity |
|---|---|
| Outermost glass (card) | `0.06` |
| Inner glass (section) | `0.04` |
| Icon bg / tags | `0.10` - `0.20` |
| Navbar | `0.05` |
| Borders | `0.10` - `0.15` |

## Typography

### Fonts
- **Display:** `Plus Jakarta Sans` (`font-display`) — headings, logos, emphasis
- **Sans:** `Inter` (`font-sans`) — body, UI text
- **Mono:** `JetBrains Mono` (`font-mono`) — code

### Weight Hierarchy
| Weight | Use |
|---|---|
| `font-bold` | Badges, tags, stat numbers, CTAs, hero heading |
| `font-semibold` | Card titles, section headings, subheadings, buttons |
| `font-medium` | Nav links, feature lists, company names |
| `font-normal` | Body text, descriptions |

### Font Sizes
- Hero heading: `text-[44px]` leading `[1.15]`
- Section heading: `text-[28px]` leading `[1.25]`
- Card heading: `text-[22px]` or `text-xl`
- Section subtitle: `text-base`
- Card description: `text-sm` or `text-base`
- Labels/captions: `text-xs`
- Chat bubbles: `text-[10px]`

## Shadow System

| State | Light Mode | Dark Mode |
|---|---|---|
| Default card | `rgba(20,27,43,0.04)` | `rgba(255,255,255,0.04)` |
| Hover card | `rgba(20,27,43,0.08)` | `rgba(255,255,255,0.07)` |
| Pricing popular | `rgba(0,105,72,0.3)` green | `rgba(0,170,110,0.15)` lighter green |
| Pricing hover | `rgba(20,27,43,0.08)` | `rgba(255,255,255,0.07)` |

## Card Hierarchy (Dark Mode)
```
Black page (#000) → Dark section (#0d0d) → Glass card (white/0.06) → Inner pane (white/0.04)
```

### Card Types

**Bento Cards** (Features section): Glass card with `border-t-4` accent (green `border-t-stitch-primary` or purple `border-t-stitch-secondary`). Hover lifts `-translate-y-2` with enhanced shadow.

**Step Cards** (How it Works): Glass card with centered icon + title + description. Connected by horizontal line on desktop.

**Testimonial Cards**: Glass card with quote icon, italic text, and profile row. `stitch-hover-float` animation.

**Pricing Cards**: Glass cards with `rounded-[2rem]`. Popular plan gets `scale-105`, green border, green glow hover. Non-popular plans are more transparent (`white/[0.04]`).

**Dashboard Mockup** (Hero): Glass card at `white/[0.08]` (slightly more opaque). Rotated 2deg. Inner grid of 3 stat columns. Floating "Resume Analyzed" card at `white/[0.08]` below-left.

## Particles (Hero BG)
- Canvas 2D (not Three.js) — eliminates NaN errors
- 100 particles with sine-wave drift
- Mouse repulsion within 100px radius
- Green color: `rgb(0,105,72)` light mode, `rgb(0,170,110)` dark mode
- Alpha pulses `0.3 ± 0.15`
- Size: `2-6px`, displayed as radial gradient glow `2.5x` size

## Top Accent Borders
Bento cards use `border-t-4` with brand accent:
```html
border-t-4 border-t-stitch-primary dark:border-t-stitch-primary
```
Must duplicate in `dark:` variant because `border` shorthand overrides `border-t-color`.

## Animations

### framer-motion
- `fadeUp()` — shared `initial`/`whileInView` config (opacity 0→1, y 30→0, ease c-bezier 0.22 1 0.36 1, duration 0.8)
- Card hover: `whileHover={{ y: -8 }}` (pricing)
- Button hover: `whileHover={{ scale: 1.05 }}`
- Dashboard mockup: `rotate(2deg)` → `rotate(0deg)` on hover
- stagger delays: sections use `delay: i * 0.1` or `0.15`

### CSS Transitions
- `.stitch-hover-float` — `translateY(-8px)` + shadow on hover
- `.stitch-text-gradient` — green→purple gradient text (hero wordmark)
- `.stitch-bg-soft` — radial gradient overlay for page bg

## Navbar
- Fixed top, `z-50`
- Frosted glass: `backdrop-blur-2xl`
- Light: `bg-white/70`
- Dark: `dark:bg-white/[0.05]`
- Logo: gradient green→purple box with "S", `font-bold text-xl`
- Nav links: `font-medium text-sm`, hover → accent green
- Theme toggle: top-right, sun/moon icon
- User menu: avatar + name, dropdown with Dashboard + Sign Out
- Mobile: hamburger menu, full glass drawer

## Spacing
- Max container: `1280px`, px-2
- Section padding: `py-[120px]`
- Card padding: `p-5` (bento), `p-8` (testimonials), `p-10` (pricing)
- Grid gaps: `gap-4` (tight), `gap-8` (standard)
- Section heading bottom margin: `mb-16` or `mb-20`

## Key Implementation Rules

1. Never hardcode hex colors — always use `surface-*` / `stitch-*` tokens. Exceptions: error reds (`#ffdad6`, `#ba1a1a`), pricing text (`#dce2f7`).
2. Every dark mode card border must specify `dark:border-*` — don't rely on the `* { border-color }` global.
3. Top accent borders (`border-t-stitch-*`) need explicit `dark:border-t-stitch-*` duplicate.
4. Shadows must have both light and dark variants — black-based shadows are invisible on black bg.
5. Cards use `backdrop-blur-xl`; inner sections use `backdrop-blur-sm`; navbar uses `backdrop-blur-2xl`.
