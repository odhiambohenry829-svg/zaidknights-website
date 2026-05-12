# Zaid Knights Chess Club — Design System

## Design Philosophy

Modern luxury chess aesthetic: dark background, gold accents, glassmorphism cards, clean typography.

---

## Color Palette

Defined in `tailwind.config.js` under `theme.extend.colors`:

| Token | Hex | Use |
|-------|-----|-----|
| `gold.DEFAULT` | `#D4AF37` | Primary accent, buttons, highlights |
| `gold.light` | `#E8C84A` | Hover state for gold elements |
| `gold.dark` | `#B8941E` | Active / pressed state |
| `dark.DEFAULT` | `#0B0B0B` | Page background |
| `dark.2` | `#111111` | Card backgrounds |
| `dark.3` | `#1A1A1A` | Secondary surfaces |
| `slate-300` | `#CBD5E1` | Muted body text |
| `slate-400` | `#94A3B8` | Placeholder, secondary text |

---

## Typography

Defined in `tailwind.config.js` under `theme.extend.fontFamily`:

| Family | Fonts | Use |
|--------|-------|-----|
| `font-serif` | Playfair Display, Georgia | Hero titles, section headings |
| `font-sans` | Inter, system-ui | Body text, UI labels |

### Scale

| Class | Size | Use |
|-------|------|-----|
| `text-5xl` / `text-6xl` | 48–60px | Hero titles |
| `text-3xl` / `text-4xl` | 30–36px | Section headings |
| `text-xl` / `text-2xl` | 20–24px | Card titles |
| `text-base` | 16px | Body text |
| `text-sm` | 14px | Labels, captions |
| `text-xs` | 12px | Helper text, badges |

---

## Glassmorphism System

Global classes in `styles/globals.css`:

```css
.glass         /* card surface: rgba white 5%, blur 18px, border rgba white 10% */
.glass-hover   /* same + hover: border rgba white 20% */
.glass-gold    /* gold-tinted glass: rgba gold 10%, border rgba gold 20% */
```

### Card spec

```
background:      rgba(255, 255, 255, 0.05)
border:          1px solid rgba(255, 255, 255, 0.10)
backdrop-filter: blur(18px)
border-radius:   1.5rem (24px)
box-shadow:      0 10px 40px rgba(0, 0, 0, 0.15)
```

---

## Buttons

Global classes in `styles/globals.css`:

```css
.btn-primary    /* gold bg, dark text, pill shape, hover: gold-light + scale 1.02 */
.btn-secondary  /* transparent, white border, hover: gold border + gold text */
```

Spec:

| Property | Primary | Secondary |
|----------|---------|-----------|
| Background | `#D4AF37` | transparent |
| Text color | `#0B0B0B` | white |
| Border | none | `1px rgba(255,255,255,0.2)` |
| Border radius | 999px (pill) | 999px |
| Padding | 12px 24px | 12px 24px |
| Hover | bg `#E8C84A`, scale 1.02 | border+text gold |
| Transition | 200ms ease-in-out | 200ms ease-in-out |

---

## Input Fields

```
background:     rgba(0, 0, 0, 0.6)
border:         1px solid rgba(255, 255, 255, 0.1)
border-radius:  24px
padding:        12px 16px
color:          white
placeholder:    slate-400
focus:          border gold, outline none
transition:     150ms ease-in-out
```

---

## Animations

Defined in `tailwind.config.js`:

| Class | Effect |
|-------|--------|
| `animate-fade-in` | opacity 0→1, 300ms |
| `animate-slide-up` | translateY 16px→0 + fade, 500ms |
| `animate-pulse-gold` | opacity 0.6↔1 pulse, 2s |
| `animate-shimmer` | loading shimmer sweep |

---

## Shadows

```css
/* Card */
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);

/* Elevated */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

/* Gold glow (tailwind: shadow-gold) */
box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
```

---

## Spacing Scale

Tailwind default spacing (4px base unit).

| Class | Value | Use |
|-------|-------|-----|
| `p-4` | 16px | Compact padding |
| `p-6` | 24px | Standard card padding |
| `p-8` | 32px | Generous section padding |
| `gap-4` | 16px | Tight grid gap |
| `gap-6` | 24px | Standard grid gap |
| `gap-8` | 32px | Section gap |

---

## Responsive Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 640px | Single column, stacked |
| Tablet (`sm`) | 640px | 2 columns |
| Desktop (`lg`) | 1024px | 3+ columns, full width |
| Wide (`xl`) | 1280px | Max-width container |

---

## Components

### UI components (`components/ui/`)

| Component | File | Purpose |
|-----------|------|---------|
| `Button` | Button.tsx | Primary/secondary variants |
| `Card` | Card.tsx | Glass container |
| `Badge` | Badge.tsx | Status/level pill |
| `Countdown` | Countdown.tsx | Animated timer |
| `EmptyState` | EmptyState.tsx | Empty list placeholder |
| `Modal` | Modal.tsx | Overlay dialog |
| `ProgressBar` | ProgressBar.tsx | Step/completion bar |
| `SkeletonCard` | SkeletonCard.tsx | Loading skeleton |
| `Toast` | Toast.tsx | Success/error notification |
| `Accordion` | Accordion.tsx | Collapsible FAQ item |

### Common components (`components/common/`)

| Component | File | Purpose |
|-----------|------|---------|
| `Layout` | Layout.tsx | Page wrapper with SEO head |
| `Navbar` | Navbar.tsx | Responsive top nav |
| `Footer` | Footer.tsx | Contact, socials, links |
| `ProtectedRoute` | ProtectedRoute.tsx | Redirect to login if unauth |

### Section components (`components/sections/`)

`Hero` · `StatsSection` · `EventHighlights` · `MembershipTiers`

### Dashboard components (`components/dashboard/`)

`StatusBanner` · `RenewalBanner` · `EventCountdown` · `MemberStats`

---

## Membership Tiers (Design)

| Tier | Badge Color | Price (Annual) |
|------|-------------|----------------|
| Beginner | slate | KES 4,000 |
| Intermediate | blue | KES 6,500 |
| Advanced | gold | KES 10,000 |
| Competitive Squad | red/premium | KES 16,000 |

---

## Accessibility

- Color contrast — Gold on Black: 15.6:1 (AAA)
- Touch targets — minimum 48px for all interactive elements
- Focus states — gold ring on keyboard focus
- Alt text — required on all `<img>` elements
- Semantic HTML — `<main>`, `<nav>`, `<section>`, form `<label>` associations
- Keyboard navigation — all flows reachable via Tab

---

## Page Layout Patterns

### 3-column grid (events, blog, gallery)
```
[  Card  ] [  Card  ] [  Card  ]
```
`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`

### 2-column split (forms + info)
```
[ Form (left 60%) ] [ Info (right 40%) ]
```
`grid grid-cols-1 lg:grid-cols-5 gap-8` — form is `lg:col-span-3`, info is `lg:col-span-2`

### Centered card (login, single-step forms)
```
max-w-md mx-auto
```

### Stats row
```
[ Stat ] [ Stat ] [ Stat ] [ Stat ]
```
`grid grid-cols-2 lg:grid-cols-4 gap-4`

---

## Brand Voice

**Tagline**: "Strategy. Discipline. Excellence."

Tone: Professional, welcoming, aspirational — write for serious chess players who are also community-minded. Avoid jargon-heavy chess notation in marketing copy.
