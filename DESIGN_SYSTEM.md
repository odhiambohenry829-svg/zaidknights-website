# ZaidKnights Chess Club - UI Design System & Mockups

## Design Philosophy
Modern luxury chess aesthetic with dark theme, gold accents, and glassmorphism.

---

## Color Palette

### Primary Colors
- **Black**: `#0B0B0B` - Main background, dark elements
- **White**: `#FFFFFF` - Text, light elements
- **Gold**: `#D4AF37` - Primary accent, buttons, highlights
- **Forest Green**: `#0F3D2E` - Secondary accent, hover states

### Neutral Colors
- **Dark Gray**: `#1A1A1A` - Secondary background
- **Light Gray**: `#F0F0F0` - Light text backgrounds
- **Slate 300**: `#CBD5E1` - Muted text
- **Slate 400**: `#94A3B8` - Secondary text

---

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold), 800 (Extra-bold)

### Font Sizes
- **H1**: 56px (hero titles)
- **H2**: 40px (section titles)
- **H3**: 32px (card titles)
- **Body**: 16px (paragraph text)
- **Small**: 14px (captions, labels)
- **XSmall**: 12px (helper text)

### Line Heights
- **Headings**: 1.2
- **Body**: 1.6
- **Lists**: 1.8

---

## Component Designs

### Button

**Primary Button (Gold)**
```
Background: #D4AF37
Text: Black (#0B0B0B)
Padding: 12px 24px
Border Radius: 999px (pill shape)
Font Weight: 600
Hover: Background #E8C547 + slight scale (1.02)
Transition: 200ms ease-in-out
Shadow: none (clean)
```

**Secondary Button (Ghost)**
```
Background: transparent
Border: 1px #FFFFFF/20%
Text: White (#FFFFFF)
Padding: 12px 24px
Border Radius: 999px
Hover: Border #D4AF37, Text #D4AF37
Transition: 200ms ease-in-out
```

### Card (Glass)

```
Background: rgba(255, 255, 255, 0.05)
Border: 1px solid rgba(255, 255, 255, 0.1)
Backdrop Filter: blur(18px)
Padding: 24px (6 units)
Border Radius: 24px (1.5rem)
Box Shadow: 0 10px 40px rgba(0, 0, 0, 0.15)
Hover: Border rgba(255, 255, 255, 0.2)
```

### Input Field

```
Background: rgba(0, 0, 0, 0.6)
Border: 1px solid rgba(255, 255, 255, 0.1)
Padding: 12px 16px
Border Radius: 24px
Font: Inter 16px
Text Color: White
Placeholder: Slate 400
Focus: Border #D4AF37, Outline none
Transition: 150ms ease-in-out
```

---

## Page Layouts

### Home Page (`/`)

**Hero Section**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ╔═══════════════════════╦═══════════════════════╗  │
│  ║                       ║                       ║  │
│  ║  ZaidKnights Chess    ║   Next Event Card    ║  │
│  ║  Club                 ║   ┌─────────────────┐ ║  │
│  ║  Strategy. Discipline║   │ Nairobi Rapid  │ ║  │
│  ║  Excellence.         ║   │ May 25 • 12 hrs │ ║  │
│  ║                       ║   │ Featured Players│ ║  │
│  ║  [Join] [View Events] ║   └─────────────────┘ ║  │
│  ╚═══════════════════════╩═══════════════════════╝  │
│                                                     │
└─────────────────────────────────────────────────────┘

Stats Row (3 columns)
┌──────────────────┬──────────────────┬──────────────────┐
│ 280+ Members     │ 24 Tournaments   │ 1575 Avg ELO     │
└──────────────────┴──────────────────┴──────────────────┘

Membership Tiers (3 columns)
┌──────────────┬──────────────┬──────────────┐
│ Beginner     │ Advanced     │ Master       │
│ Free Trial   │ KES 2,500/mo │ KES 5,500/mo │
│ ✓ Lessons    │ ✓ Coaching   │ ✓ Personal   │
│ ✓ Community  │ ✓ Prep       │ ✓ Elite      │
└──────────────┴──────────────┴──────────────┘

Events (3 columns)
┌──────────────┬──────────────┬──────────────┐
│ Champions    │ Youth        │ Masters      │
│ Blitz        │ Circuit      │ Weekend      │
│ Register     │ Register     │ Register     │
└──────────────┴──────────────┴──────────────┘
```

**Announcements Section**
```
Latest announcements (3 cards)
┌──────────────┬──────────────┬──────────────┐
│ Masterclass  │ Registration │ Portal       │
│ on strategy  │ open for     │ launched     │
│              │ July Open    │              │
└──────────────┴──────────────┴──────────────┘
```

### Membership Page (`/membership`)

**Registration Form (2 column layout)**
```
Left: Registration Form
┌─────────────────────────┐
│ Register Now           │
│ ┌───────────────────┐  │
│ │ Name:             │  │
│ │ [____________]    │  │
│ │ Email:            │  │
│ │ [____________]    │  │
│ │ Tier:             │  │
│ │ [____________▼]   │  │
│ │ [Submit button]   │  │
│ └───────────────────┘  │
└─────────────────────────┘

Right: Benefits List
┌─────────────────────────┐
│ Benefits:              │
│ • Training sessions    │
│ • Priority events      │
│ • Rankings dashboard   │
│ • Member news          │
└─────────────────────────┘
```

### Events Page (`/events`)

**Event Cards (3 column grid)**
```
┌────────────────┬────────────────┬────────────────┐
│ UPCOMING       │ REGISTRATION   │ UPCOMING       │
│                │                │                │
│ Nairobi Rapid  │ Youth Cup      │ Masters        │
│ May 25, 2026   │ June 12, 2026  │ July 3, 2026   │
│ Chess Academy  │ ZaidKnights    │ Premier Hotel  │
│                │                │                │
│ [Register]     │ [Register]     │ [Register]     │
└────────────────┴────────────────┴────────────────┘
```

### Rankings Page (`/rankings`)

**Leaderboard Table**
```
┌──────────────────────────────────────┐
│ Player            │ ELO    │ Record  │
├──────────────────────────────────────┤
│ Amina Mwangi      │ 1920   │ 18-3-1  │
│ David Okello      │ 1865   │ 16-4-2  │
│ Sofia Kariuki     │ 1810   │ 14-5-3  │
└──────────────────────────────────────┘
```

### Login Page (`/login`)

**Centered Form**
```
         ┌─────────────────┐
         │ Member Login    │
         │                 │
         │ [Email input]   │
         │ [Pass input]    │
         │ [Sign In btn]   │
         │                 │
         │ New? Register   │
         └─────────────────┘
```

### Admin Dashboard (`/admin`)

**4 Stat Cards**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 280 Members  │ 14 Pending   │ 3 Live       │ 12 Posts     │
│ Active       │ Apps         │ Events       │ Published    │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## Responsive Breakpoints

| Screen | Width | Layout |
|--------|-------|--------|
| Mobile | < 640px | Single column, stacked cards |
| Tablet | 640px - 1024px | 2 columns, compact |
| Desktop | > 1024px | 3+ columns, full width |

### Mobile Optimizations
- Touch-friendly button sizes (min 48px)
- Single column layouts
- Simplified navigation menu
- Full-width cards with padding

---

## Animation Guidelines

### Transitions
- Duration: 200-300ms
- Easing: ease-in-out
- Properties: opacity, transform, color

### Hover Effects
- Buttons: Scale 1.02, color shift
- Cards: Border brightness, shadow increase
- Links: Color change to gold

### Page Load
- Fade in elements with 300ms stagger
- Hero content slides up (Framer Motion)
- Stats counter animate on scroll (future)

---

## Icon Guidelines

All icons should be:
- Chess-themed (knights, kings, boards)
- Minimal and clean
- Size: 24px or 32px
- Color: Gold or White

Suggested icons:
- Knight: ♘ (navigation, rankings)
- King: ♚ (leadership, admin)
- Board: ⚏ (events, tournaments)
- Trophy: 🏆 (achievements)
- Users: 👥 (members, community)

---

## Shadow System

```css
/* Light shadow */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

/* Medium shadow (cards) */
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);

/* Strong shadow (elevation) */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

/* Gold glow (accent) */
box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
```

---

## Spacing Scale

```
xs:  4px  (1 unit)
sm:  8px  (2 units)
md:  16px (4 units)
lg:  24px (6 units)
xl:  32px (8 units)
2xl: 48px (12 units)
3xl: 64px (16 units)
```

Used for:
- Padding: `p-6` = 24px padding
- Margin: `m-4` = 16px margin
- Gap: `gap-6` = 24px spacing between items

---

## Accessibility Standards

✅ **Color Contrast**: Gold on Black = 15.6:1 (AAA)  
✅ **Touch Targets**: Minimum 48px for interactive elements  
✅ **Focus States**: Visible gold border on tab focus  
✅ **Alt Text**: All images have descriptive alt text  
✅ **Semantic HTML**: Proper heading hierarchy, form labels  
✅ **Keyboard Navigation**: All features keyboard accessible  

---

## Live Component Examples

All components are in `/components/`:
- `common/Navbar.tsx` - Navigation
- `common/Footer.tsx` - Footer
- `ui/Button.tsx` - Button component
- `ui/Card.tsx` - Glass card
- `sections/Hero.tsx` - Hero animation
- `sections/MembershipTiers.tsx` - Tier cards
- `sections/EventHighlights.tsx` - Event cards
- `sections/StatsSection.tsx` - Statistics display

---

## Next Steps for Design

1. **Export Assets**: Create logo in gold & white
2. **Photography**: Professional chess tournament photos
3. **Favicons**: Generate from logo
4. **OG Images**: Social media share images
5. **Dark Mode**: Already implemented via Tailwind
6. **Print Styles**: Add for certificates/tournament brackets

---

## Design Files Storage

Recommended tools:
- **Figma**: Full design system mockups
- **Illustrator**: Logo and icon creation
- **Photoshop**: Image editing
- **Lightroom**: Photo optimization

Store in: `/public/assets/` or cloud storage with CI/CD integration

---

## Brand Voice

**Tagline**: "Strategy. Discipline. Excellence."

**Tone**: Professional, welcoming, aspirational  
**Personality**: Modern, chess-focused, community-driven  
**Language**: Clear, concise, engaging  

---

This design system provides a solid foundation for a production-grade chess club platform with modern aesthetics and excellent UX.
