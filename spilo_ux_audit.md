# Spilo.ge - Master Design QA + UX + CRO + Accessibility Audit

> Evidence: 5 screenshots at 1920x945px + source code for 10 components
> [V-visual] = screenshot-verified | [V-code] = code-verified | [Hypothesis] | [Cannot verify]

---
# SECTION 1 - Executive Summary

## Overall Score: 4.1 / 10 | Launch Readiness: 31%

## Biggest Strengths

1. [V-visual] Triple-panel hero — best design decision on the site
2. [V-visual] Dark "All Categories" anchor card — distinctive entry point
3. [V-code] Architecture — Next.js App Router, Zustand, Framer Motion, SSR skeletons — professional grade
4. [V-visual] Dark footer — premium visual closure
5. [V-visual] Feature banners (iPhone 16 Pro, PS5) — coherent, editorial design language

## Biggest Weaknesses

1. [V-visual] Price data catastrophe — Samsung S26 shows 22,992,199 crossed-out with -100% badge
2. [V-code] Language toggle cosmetic — useState only, no routing, no i18n
3. [V-code] Add-to-cart hidden desktop — md:opacity-0 md:scale-90 md:group-hover:opacity-100
4. [V-visual] Broken brand logos — Apple, ASUS, DJI show alt text; Wikipedia CORS failing
5. [V-code] Zero focus states — no :focus-visible CSS globally
6. [V-code] Ratings never rendered — rating and reviewsCount props exist, never appear in JSX
7. [V-code] 11+ border-radius values — no token system whatsoever
8. [V-visual] Trust strip duplicated — identical 4-item grid in section AND footer

## Top 10 Must-Fix Before Launch

1. Fix price data bug (22M crossed-out price) [V-visual]
2. Remove language toggle or implement next-intl [V-code]
3. Make add-to-cart always visible — remove md:opacity-0 [V-code]
4. Host brand logos locally in /public/brands/ [V-visual]
5. Add global :focus-visible to globals.css [V-code]
6. Display rating + reviewsCount in ProductCard [V-code]
7. Hero arrows always visible on mobile [V-code]
8. Category text: text-[11px] -> text-xs minimum [V-code]
9. Remove duplicate trust strip from footer [V-visual]
10. Standardize logo dot to #FF5238 everywhere [V-visual]

---
# SECTION 2 - Component Audit

## 2.1 Header | Score: 5/10

### Logo
[V-visual] Plain lowercase "spilo." in text-2xl tracking-tighter.
[V-visual] Header dot: dark (#1D1D1F). Footer: [V-code] text-white. Drawer: [V-code] text-[#FF5238].
THREE different treatments of one brand element. Fix: #111111 + #FF5238 dot, everywhere, always.
Priority: CRITICAL

### Announcement Bar
[V-visual] "Free delivery across Georgia" — right-aligned, tiny white text. Invisible during logo scan.
Fix: Center text. 3-message rotation cycle.
Priority: HIGH

### Language Toggle
[V-code] setLang() flips useState only. No routing, no i18n, no locale cookie.
Fix: Remove. Add back when next-intl is implemented.
Priority: CRITICAL

### Search Bar
[V-code] Placeholder color #6B7280 on white = ~3.9:1 contrast. WCAG AA needs 4.5:1. FAILS.
[V-visual] Search icon neutral dark — no visual affordance as primary search trigger.
Fix: Placeholder #9CA3AF. Icon #FF5238. Radius 12px not rounded-full.
Priority: HIGH

### Wishlist
[V-visual] Heart icon, red badge count 1.
[V-code] hidden sm:flex — wishlist completely inaccessible on mobile.
Fix: Add wishlist tab to MobileBottomNav.
Priority: CRITICAL (mobile)

### Cart Dropdown
[V-code] onMouseEnter/Leave — cursor moving from icon to dropdown may exit zone and close dropdown.
Fix: 150ms debounce or restructure parent div.
Priority: MEDIUM

### Sub-Navigation
[V-visual] 5 items: Categories | Discounts | Brands | Pickup | Compare
[V-code] First 3 all go to /catalog. Only Compare is unique.
Fix: /catalog?sort=discount, /brands, /pickup-points
Priority: HIGH

---
## 2.2 Hero Banner | Score: 6/10

### Layout
[V-visual] Triple-panel: left (gift), center (PS5/VR2), right (iPhone 16 Pro).
THE BEST DESIGN DECISION ON THIS SITE. Borrowed from premium editorial commerce.

### Gradient Overlay
[V-visual] Center slide (PS5) heavily darkened — photography barely visible.
[V-code] TWO stacked gradients: from-black/90 via-black/55 (left) + from-black/85 via-transparent to-black/30 (vertical). Combined = near-opaque blackout.
Fix: ONE gradient: from-black/60 to-transparent (left-to-right). Remove vertical gradient.
Priority: HIGH

### Navigation Arrows
[V-code] opacity-0 group-hover:opacity-100 — invisible on mobile (no hover on touch).
Fix: sm:opacity-0 sm:group-hover:opacity-100. Mobile: always opacity-80.
Priority: CRITICAL

### Typography
[V-code] Title: text-xl sm:text-4xl md:text-[42px] — 20px on mobile is too small for hero headline.
[V-code] Subtitle: text-[11px] sm:text-base — 11px mobile FAILS WCAG 1.4.4.
Fix: Title text-2xl minimum mobile. Subtitle text-sm minimum mobile.
Priority: HIGH

### CTA
[V-code] py-2.5 on mobile = ~36px height. Below 44px minimum.
Fix: h-12 (48px) on mobile.
Priority: HIGH

### Side Cards
[V-code] hidden xl:block — only at 1280px+. Laptops 1024-1279px get degraded single-card hero.
Fix: lg:block.
Priority: MEDIUM

---
## 2.3 Category Carousel | Score: 5.5/10

### Text Size — WCAG FAIL
[V-code] text-[11px] sm:text-xs md:text-[13px]
11px on mobile fails WCAG 1.4.4. Legal compliance issue.
Fix: text-xs sm:text-xs — 12px absolute minimum.
Priority: CRITICAL

### Icons
[V-visual] Lucide icons consistent. Generic vs premium custom icon sets.
Priority: MEDIUM

### Hover States
[V-code] hover:bg-[#FFF5F2] hover:border-[#FED7CC] group-hover:text-[#FF5238] scale-110.
Subtle and appropriate. This is working correctly.

---
## 2.4 Product Cards | Score: 3/10

### CRITICAL: Price Data Bug
[V-visual] Samsung Galaxy S26 card:
  Current: 2199
  Crossed-out: 22,992,199
  Badge: -100%
  Installment: 958,008/month

[V-code] Component math is correct. Data pipeline corrupted (likely string concatenation).
Fix: Guard in ProductCard.tsx:
  if (!price || price > 99999 || (discountPrice && discountPrice > 99999)) return null;
Then find and fix root cause in data pipeline.
Priority: CRITICAL

### Add-to-Cart Visibility
[V-code] md:opacity-0 md:scale-90 md:group-hover:opacity-100 md:group-hover:scale-100
[V-visual] CONFIRMED: No cart buttons visible in screenshot.
Industry: visible cart buttons increase conversion 15-25%.
Fix: Remove md:opacity-0 md:scale-90. Always visible.
Priority: CRITICAL

### Ratings
[V-code] ProductCardProps has rating?: number and reviewsCount?: number.
[V-code] Full JSX scan lines 96-275: these are NEVER rendered.
Fix:
  {rating && rating > 0 && (
    <div className="flex items-center gap-1 text-[11px]">
      <span className="text-[#F59E0B]">star {rating.toFixed(1)}</span>
      <span className="text-zinc-400">({reviewsCount})</span>
    </div>
  )}
Priority: CRITICAL

### Discount Badge Color
[V-code] bg-[#10B981] (emerald green) for discount badges.
[V-visual] Green badges visible: -25%, -13%, -8%, -9%, -100%, -7%
Green = in-stock color = semantic collision. Brand accent is red.
Fix: bg-[#FF5238]. In-stock keeps #10B981.
Priority: HIGH

### Image Treatment
[V-code] mix-blend-multiply — dark-background products render with artifacts.
Fix: Remove mix-blend-multiply.
Priority: HIGH

### Wishlist / Compare
[V-code] md:opacity-0 md:group-hover:opacity-100
Fix: opacity-40 default. opacity-100 on card hover.
Priority: HIGH

---
## 2.5 Promo Cards | Score: 6/10

[V-visual] Three colorful cards: purple (clothing), blue (audio), orange (watches).
[V-visual] Section title contains "(Promo Cards)" literally — debug text in production.
[V-visual] Fire emoji badge — inconsistent cross-OS rendering.
Fix: Remove debug text. Replace emoji with Lucide Flame icon.
Priority: CRITICAL (debug text)

---
## 2.6 Feature Banners | Score: 7.5/10

[V-visual] iPhone 16 Pro: "APPLE FLAGSHIP" red + title + CTA. Strong.
[V-visual] PlayStation 5: "NEXT-GEN GAMING" red + title + CTA. Strong.
THESE ARE THE STRONGEST VISUAL ELEMENTS ON THE PAGE.

Issues:
[V-visual] CTA buttons rounded-full (pill). Hero CTA uses rounded-xl. Two button shapes for same action.
Fix: Standardize to rounded-[10px] for all primary CTAs.
Priority: MEDIUM

---
## 2.7 Brand Carousel | Score: 3.5/10

[V-visual] Apple shows [Apple] alt text — broken image.
[V-visual] ASUS shows [ASUS] alt text — broken image.
[V-visual] DJI shows [DJI] — broken.
[V-code] All logos sourced from Wikipedia SVG URLs — CORS failing in browser.
Fix: Download all 12 SVGs, /public/brands/, update BrandsGrid.tsx fallback array.
Priority: CRITICAL

---
## 2.8 Trust Section | Score: 4/10

[V-visual] 4 items with 4 different icon accent colors (blue, green, orange, purple).
[V-visual] Same 4-item grid appears again at top of footer.
[V-code] truncate class — text clips on narrow screens.
Fix: Remove footer duplicate. Unify icon colors. Remove truncate.
Priority: HIGH (duplicate), MEDIUM (visual)

---
## 2.9 Footer | Score: 4.5/10

[V-visual] Logo dot appears white.
[V-code] Line 56: text-white on dot — confirmed white.
Header: dark dot. Drawer: red dot. Footer: white dot. THREE LOGOS.

[V-visual] "TBC Bank * Bank of Georgia * Apple Pay" as plain gray text.
Fix: SVG payment logos row, 24px height, opacity-60.
Priority: HIGH

[V-code] Social links href="#" — placeholders.
[V-visual] Phone: +995 32 2 00 00 00 — placeholder (all zeros suffix).
Priority: CRITICAL (phone), MEDIUM (social)

---
# SECTION 3 - Visual Design System

## Current State Problems
[V-code] Colors: Emerald-500 used for BOTH in-stock AND discount badges — semantic collision.
[V-code] Radius: 11+ distinct values. No token system.
[V-code] Shadows: 8+ values with no elevation hierarchy.
[V-code] Typography: 14+ arbitrary sizes. No scale.

## Color Token Proposal

  --color-brand:         #FF4D33  (CTAs, badges — the "do something" signal)
  --color-brand-light:   #FFF5F2  (tint surfaces)
  --color-brand-border:  #FED7CC  (tint borders)
  --color-dark:          #111111  (logo, footer — unify both darks)
  --color-text-primary:  #111111
  --color-text-muted:    #6B7280
  --color-text-subtle:   #9CA3AF
  --color-surface-1:     #FFFFFF  (cards)
  --color-surface-2:     #F8FAFC  (containers)
  --color-border:        #F0F1F3  (default)
  --color-border-hover:  #E5E7EB  (hover)
  --color-success:       #10B981  (in-stock ONLY)
  --color-warning:       #F59E0B  (rating stars only)
  --color-error:         #EF4444  (errors, out-of-stock)
  --gradient-hero:       linear-gradient(90deg, rgba(0,0,0,0.65), rgba(0,0,0,0))

RULE: Discount = --color-brand (#FF4D33). In-stock = --color-success (#10B981). NEVER the same.

## Typography Scale

Current: 14+ arbitrary sizes. Proposed 8-step scale:

  Display:  clamp(36px, 5vw, 56px) / lh 1.05 / ls -0.03em
  Hero:     clamp(28px, 4vw, 44px) / lh 1.10 / ls -0.025em
  H1:       clamp(22px, 3vw, 32px) / lh 1.15 / ls -0.02em
  H2:       clamp(18px,2.5vw,24px) / lh 1.20 / ls -0.015em
  H3:       18px / lh 1.28
  H4:       15px / lh 1.35
  Body:     15px / lh 1.55
  Small:    13px / lh 1.45
  Micro:    11px / lh 1.35 (ABSOLUTE MINIMUM — never below this)

RULE: Nothing below 11px. Nothing on mobile below 12px.

## Radius Token System

Current: 11+ distinct values.

  --r-xs:   6px   (discount badges, chips)
  --r-sm:  10px   (ALL buttons, inputs — one rule, no exceptions)
  --r-md:  16px   (dropdowns, toasts)
  --r-lg:  24px   (cards, modals, category cards)
  --r-xl:  32px   (hero panels, feature banners)
  --r-full: pill  (tag labels ONLY, NEVER for CTA buttons)

RULE: All primary CTA buttons = --r-sm (10px). Not pill. Not rounded-xl. One value.

## Shadow System

Current: 8+ values, no elevation hierarchy.

  --shadow-card:       0 1px 3px rgba(0,0,0,0.05)
  --shadow-card-hover: 0 8px 24px rgba(0,0,0,0.09)
  --shadow-dropdown:   0 12px 40px rgba(0,0,0,0.14)
  --shadow-modal:      0 20px 60px rgba(0,0,0,0.20)
  --shadow-hero:       0 24px 64px rgba(0,0,0,0.22)
  --shadow-cta:        0 6px 24px rgba(255,77,51,0.36)
  --shadow-cta-hover:  0 10px 36px rgba(255,77,51,0.48)

## Spacing

  4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96px

  Between sections: py-10 (40px)
  Card padding: p-4 (16px)
  Card gap: gap-4 (16px)
  Section header mb: mb-6 (24px)

Container: Unify to max-w-[1440px] everywhere.
Currently mixed with max-w-[1560px] and uncapped container.

---
# SECTION 4 - UX Audit (40 Issues)

## Navigation
CRITICAL  3/5 sub-nav links to /catalog          Signifier: nav must go different places     Unique URLs
CRITICAL  Language toggle does nothing            Feedback: system must respond               Remove or implement
HIGH      MegaMenu close behavior [Cannot verify] Click-outside UX                           Verify
HIGH      No breadcrumbs [Cannot verify]          Wayfinding                                 Add breadcrumbs
MEDIUM    Cart dropdown premature close           Fitts Law                                  150ms delay
MEDIUM    4 different sub-nav badge colors        Visual consistency                         Unify

## Discovery
CRITICAL  No ratings displayed                   Social proof, information scent             Render rating props
CRITICAL  Add-to-cart hidden desktop             Affordance — primary actions visible         Remove md:opacity-0
HIGH      Green discount = green in-stock        Semantic color consistency                  Discount -> red
HIGH      No Best Seller / New badges            Discovery signals                           CMS badge flags
HIGH      No quick view overlay                  Progressive disclosure                      Implement
MEDIUM    Section title has "(Promo Cards)"      Copy hygiene                               Remove
MEDIUM    Side card alt = previous/next          Information scent                          Better alt text

## Shopping
CRITICAL  Price bug: 22M lari                    Data integrity                              Guard + fix pipeline
CRITICAL  No urgency/scarcity signals            Scarcity principle                          X left when stock <10
HIGH      Wishlist hidden on mobile              Mobile-first                                Add to bottom nav
HIGH      Product image 155px mobile             Object recognition — too small              h-[200px] minimum
HIGH      Cart CTA copy not urgent               CTA optimization                            Rename to Checkout
MEDIUM    No "free delivery" near cart           Trust at point of action                    Micro-badge
MEDIUM    mix-blend-multiply on images           Product confidence                          Remove

## Product Browsing
HIGH      Hero arrows invisible mobile           Discoverability                             Always visible
HIGH      Hero gradient too dark                 Visual clarity                              Single 60% max
MEDIUM    Category text 11px mobile             Readability / WCAG                          12px minimum
MEDIUM    Card title h-[34px] fixed              Content integrity                           line-clamp-2 only
MEDIUM    Hero subtitle 11px mobile              WCAG 1.4.4                                 text-sm minimum
LOW       "Standard Price" label no value        Content value                               Remove
LOW       Brand count in font-mono               Typography consistency                      Sans-serif

## Trust
CRITICAL  Placeholder phone (all zeros)          Authenticity                               Real number
CRITICAL  Broken brand logos                     Professionalism                            Host locally
HIGH      Payment methods as text               Trust signals                               SVG logos
HIGH      Social links href="#"                 Authenticity                               Real URLs or remove
HIGH      Trust strip duplicated                Signal dilution                             Remove footer duplicate
HIGH      Logo dot 3 different colors           Brand consistency                          Standardize

## Checkout Readiness
HIGH      No installment calculator             Decision support                            Interactive calc
HIGH      No delivery ETA                       Purchase confidence                         Tomorrow delivery badge
MEDIUM    No cross-sell in cart                Revenue per visit                            Recommendation row
MEDIUM    No quick checkout                    Friction reduction                           Apple Pay button

## Mobile UX
CRITICAL  Wishlist inaccessible mobile          Mobile completeness                         Bottom nav
CRITICAL  Hero arrows invisible touch           Discoverability                             Always visible
HIGH      Hero CTA 36px (below 44px)            Touch target                                h-12
HIGH      Category text 11px mobile            Readability                                 12px

## Loading / Empty States
MEDIUM    Large blank gap before footer         Layout completeness                          Recently Viewed or reduce
MEDIUM    Cart empty state icon only           Guidance                                     Add CTA
LOW       Generic rectangle skeletons          Branded loading                              Match card shapes

---
# SECTION 5 - CRO Audit

## Highest Revenue Impact Fixes (Ranked)

1. CRITICAL  Fix price data bug — trust restored, biggest single barrier
2. HIGH      Remove md:opacity-0 from add-to-cart — est +15-25% cart rate
3. HIGH      Display rating + reviewsCount — est +10-20% conversion
4. HIGH      Stock scarcity "only X left" when < 10 — urgency
5. HIGH      Fix broken brand logos — trust restored
6. HIGH      Flash sale countdown timer
7. HIGH      Cart cross-sell row
8. HIGH      "X lari from free delivery" indicator
9. MEDIUM    Activate RecentlyViewedSection (component exists already)
10. MEDIUM   Express checkout (Apple Pay)

## What Is Missing vs Competitors

Trust: No rating display, no payment logos, no dealer badges, placeholder phone
Urgency: No stock counts, no countdown timers
Social proof: No sold counts, no best-seller badges
Convenience: No quick view, no express checkout, no predictive search
Post-purchase: No order tracking, no return request flow

---
# SECTION 6 - Accessibility Audit (WCAG 2.2 AA)

## Failures (Verified)

ID | Issue                                    | Criterion         | Severity | Evidence
A1 | No :focus-visible globally               | 2.4.7             | CRITICAL | [V-code]
A2 | Language toggle non-functional            | 4.1.2             | CRITICAL | [V-code]
A3 | Cart dropdown: onMouseEnter only          | 2.1.1 Keyboard    | CRITICAL | [V-code]
A4 | Brand Swiper keyboard [Cannot verify]     | 2.1.1 Keyboard    | HIGH     | Cannot verify
A5 | Category text 11px mobile                | 1.4.4 Resize Text | HIGH     | [V-code]
A6 | Hero subtitle 11px mobile               | 1.4.4 Resize Text | HIGH     | [V-code]
A7 | Cart badge no aria-live                  | 4.1.3 Status Msg  | HIGH     | [V-code]
A8 | Stock: dot + text present (partial OK)   | 1.4.1 Use of Color| MEDIUM   | [V-code]

## Contrast
Search placeholder #6B7280 on white: ~3.9:1 — FAILS WCAG AA (needs 4.5:1) [V-code]
White on hero image overlay: Cannot verify — image-dependent
Category hover #FF5238 on #FFF5F2: Cannot verify without tooling

## Immediate Fixes

globals.css:
  :focus-visible {
    outline: 2px solid #FF4D33;
    outline-offset: 2px;
    border-radius: 4px;
  }

ProductCard.tsx cart badge:
  aria-live="polite" aria-label={`${count} items in cart`}

---
# SECTION 7 - Brand Identity Audit

## Current State
[V-visual] + [V-code]: One brand color (#FF5238), plain text logo, Lucide utility icons, no illustration system, no motion signature, no editorial grid language.
Nothing communicates Georgian, premium, or trustworthy.

## Brand Identity Bible

### Philosophy
Spilo is for people who know what they want and expect it to work.
We do not entertain — we execute. Clean, fast, honest.

### Core Principles
1. Restraint Over Decoration — white space is confidence, not emptiness
2. Red for Action — #FF4D33 signals the one thing that matters on this screen
3. Editorial Grid — every section is a considered layout decision

### Color Language
  #FF4D33  Brand Red   — CTAs, active states. The "do something" signal.
  #111111  Brand Dark  — Logo, footer. Gravitas.
  #F8F9FA  Surface     — Content space.
  #F59E0B  Gold        — Rating stars ONLY. Excellence signal.
  #10B981  Success     — In-stock ONLY. Available signal.

### Icon Language
  Base: Lucide, stroke-width: 1.75px, rounded joins
  Sizes: 16px inline / 20px nav+action / 24px section icons
  Rule: never mix filled and outline at same hierarchy level

### Motion Language
  Micro 0-150ms:       State changes, hover transitions
  Interaction 150-300ms: Button press, card lift
  Transition 300-500ms: Modal open, cross-fade
  Reveal 400-600ms:    Section entrance (whileInView)
  Never: Rotation for decoration. Spring physics on utility UI.

### Photography Language
  Products: pure white background, consistent shadow, 3/4 angle
  Lifestyle: editorial dark backgrounds, product as hero
  No stock photos without actual product
  Banner images: min 1400px, optimized for dark overlay

---
# SECTION 8 - Premium Redesign Specification

## Header
  Announcement: h-8, #111111, centered, 3-message crossfade, 11px text
  Main: h-20, max-w-1440px, mx-auto, px-6
  Logo: "spilo" #111111 + "." #FF4D33, 26px, ls -0.04em
  Search: h-12, border 1.5px #E5E7EB, radius 10px, icon #FF4D33
  Icon buttons: 44x44px, #F4F5F7, radius 10px
  Sub-nav: all badge icons unified to #FF4D33

## Hero
  Center: flex-1, max-w-960px, h-500px, radius 28px, shadow var(--shadow-hero)
  Sides: 240px, h-440px, radius 24px, shown at lg: (1024px)
  SINGLE gradient: linear-gradient(to right, rgba(0,0,0,0.65), rgba(0,0,0,0))
  Title: 44px / lh 1.1 / ls -0.025em / white
  Subtitle: 16px / lh 1.55 / white/80
  CTA: h-52px, px-8, radius 10px, #FF4D33, shadow 0 8px 32px rgba(255,77,51,0.4)
  Arrows: mobile always opacity-80 / desktop opacity-0 -> opacity-100 hover
  Progress: 3px height, active 44px wide red, inactive 12px wide white/30

## Product Cards
  Padding 16px | Radius 24px | Border 1px #F0F1F3 | Shadow var(--shadow-card)
  Hover: translateY(-3px) + var(--shadow-card-hover) + border #E5E7EB
  Image: 220px height, #FAFAFA bg, radius 16px, NO mix-blend-multiply
  Discount badge: bg #FF4D33, radius 6px
  Cart: ALWAYS VISIBLE, 44x44px, radius 10px
  Wishlist: opacity-40 default, opacity-100 on card hover
  Rating: star #F59E0B + count text-zinc-400, 11px

## Footer
  Background: #0A0A0A
  Logo: "spilo" #FFFFFF + "." #FF4D33 (matches everywhere)
  Social: 40x40px, radius 10px, bg rgba(255,255,255,0.07)
  Payment: SVG logos (TBC, BOG, Apple Pay, Visa, MC), h-24px, opacity-60
  Section headers: 11px, UPPERCASE, ls 0.12em, rgba(255,255,255,0.35)
  Links: 14px, rgba(255,255,255,0.55) -> rgba(255,255,255,0.95), 150ms

---
# SECTION 9 - Mobile Redesign

## Verified Issues
  [V-code] Wishlist hidden sm:flex — inaccessible on mobile
  [V-code] Hero arrows opacity-0 — carousel navigation broken
  [V-code] Category text 11px — fails WCAG
  [V-code] Hero CTA py-2.5 = 36px — below 44px minimum
  [V-code] Hero subtitle 11px — fails WCAG

## Mobile Layout (< 640px)
  1. Announcement: 32px, centered, rotating
  2. Header: 64px — [menu 44px] [spilo. centered] [search 44px] [cart 44px]
  3. Categories: 108px scroll, 88x108 cards, 12px text, 3.5 visible
  4. Hero: 300px, arrows opacity-80 always, title 24px min, CTA h-12
  5. Products: horizontal swipe, 160px cards, cart always visible
  6. Promo cards: full-width stacked
  7. Feature banners: full-width stacked, 200px min height
  8. Brands: horizontal scroll
  9. Trust: 2x2 grid, no truncation
  10. Footer: accordion links, logo + payment logos + social
  11. Bottom nav: 56px fixed — Home | Search | Wishlist | Cart | Profile

## Gestures
  Hero: Swiper touch already enabled [V-code]
  Categories: Swiper freeMode touch already enabled [V-code]
  Products: [Cannot verify] — check carousel implementation
  Bottom nav: independent tab links

---
# SECTION 10 - Apple vs VELI vs Spilo

Feature               Apple           VELI             Spilo                Winner
Logo                  SF wordmark     Custom wordmark  text-2xl plain text  Apple
Hero overlay          <20% dark       Editorial        85-90% blackout      VELI
Product images        White bg CGI    White bg clean   mix-blend-multiply   Apple/VELI
Category icons        Custom          Custom illust    Lucide generics      Apple/VELI
Ratings on cards      Always visible  Always visible   Never rendered       Apple/VELI
Add to cart           Always visible  Always visible   Hidden desktop       Apple/VELI
Urgency               Ships by X      X left in stock  None                 VELI
Payment logos         Apple Pay row   Visa/MC logos    Plain text           Apple/VELI
Keyboard access       Full            Full             Zero focus states    Apple/VELI
Typography            Defined scale   Defined scale    14+ arbitrary        Apple
Mobile nav            Bottom tabs     Bottom tabs      Missing wishlist      Apple/VELI

Spilo is furthest behind on:
  Social proof, add-to-cart visibility, keyboard accessibility, brand logo assets, price data integrity.

---
# SECTION 11 - Missing Features (60 Items)

CRITICAL:
1.  Star ratings on cards (props exist, never rendered)
2.  Review count on cards
3.  Always-visible add-to-cart on desktop
4.  "Only X left" scarcity (stock < 10)
5.  Real contact phone number

HIGH:
6.  Flash sale countdown timer
7.  Payment SVG logos in footer
8.  Real social media links
9.  "Best Seller" badge system
10. "New Arrival" badge
11. Quick view product overlay
12. Express checkout (Apple Pay)
13. Frequently Bought Together
14. Cart cross-sell row
15. "X lari from free delivery" indicator
16. Sticky cart on product page
17. Delivery ETA on cards
18. Installment calculator on PDP

MEDIUM:
19. Recently Viewed (component exists — just activate)
20. Personalized For You row
21. Comparison feature matrix
22. Predictive search
23. Zero-results search with suggestions
24. Price drop alert on wishlisted items
25. Notify me when in stock
26. Bundle deals
27. Free gift with purchase
28. Product video support
29. Live chat (functional)
30. Order tracking page
31. Order history page
32. Return request flow
33. Review submission flow
34. Newsletter signup
35. SMS notification opt-in
36. Cookie consent banner (GDPR)
37. Product Q&A section
38. Customers Also Viewed
39. Brand pages (per-brand catalog)
40. Seasonal collections

LOW:
41. Wishlist sharing
42. Referral program
43. Loyalty points
44. Gift card system
45. Coupon/promo code at checkout
46. Affiliate links
47. Dark mode
48. 360 product view
49. Age verification (if applicable)
50. Accessibility statement page
51. Sitemap page
52. Structured data JSON-LD
53. Open Graph per product
54. Canonical URLs
55. Filter + sort on catalog (cannot verify if implemented)
56. Faceted search
57. Seasonal collection pages
58. Staff picks collection
59. Blog/editorial content
60. Multi-currency (future expansion)

---
# SECTION 12 - Implementation Roadmap

## Phase 1 - Critical Launch Blockers

Task                                          Effort  UX Impact      Business Impact
Fix price data bug (guard + root cause)       4h      Catastrophic   Trust restored
Remove language toggle                        30min   Deception gone Trust
Make add-to-cart always visible               15min   Primary CTA    +15-25% cart rate
Display rating + reviewsCount                 2h      Social proof   +10-20% conversion
Host brand logos /public/brands/              3h      Professional   Trust
Hero arrows always visible mobile             30min   Navigable      Engagement
Add :focus-visible globals.css               15min   Keyboard       Legal compliance
Category text 11px -> text-xs                 15min   WCAG           Legal compliance
Remove footer trust duplicate                 30min   Layout clarity Design
Standardize logo dot #FF4D33 everywhere       1h      Brand          Trust
Fix sub-nav URLs unique per link              30min   Navigation     SEO
Remove href="#" social links / real URLs      15min   Authenticity   Trust
Add real phone number                         5min    Trust          Trust
Hero CTA h-12 on mobile                       15min   Touch target   Mobile conversion

## Phase 2 - Premium UI

Task                                          Effort
Create design-tokens.css                      4h
Standardize border-radius 4-token system      8h
Standardize shadow tokens                     4h
Discount badge bg-[#FF4D33]                   15min
Remove mix-blend-multiply                     15min
Image container h-[200px] sm:h-[220px]        30min
Hero gradient single from-black/60            30min
Payment SVG logos footer                      3h
Button component variant system               4h
Typography scale globals.css                  2h
Announcement bar center + rotation            2h
Remove truncate from trust text               30min
Hero sides at lg: not xl:                     30min
Brand hover: colored logos not dark bg        1h

## Phase 3 - Motion

Task                                          Effort
Verify hero progress keyframe tailwind.config 30min
Card hover translateY(-3px)                   30min
Add-to-cart success bounce animation          1h
Section entrance whileInView                  4h
Hero text stagger (badge->title->sub->CTA)    2h
Cart badge pulse on count change              1h
Announcement bar crossfade                    2h
prefers-reduced-motion wrap                   2h

## Phase 4 - CRO

Task                                          Revenue Impact
"Only X left" when stock < 10                 Very High
Activate RecentlyViewedSection                Medium
Flash sale countdown component                High
"Free delivery" micro-badge under cart        High
Cart cross-sell recommendation row            High
"Best Seller" CMS badge flag                  High
Predictive search in SearchModal              High
Newsletter capture footer                     Medium
Cart CTA rename to Checkout                   Medium
Express checkout button                       Very High

## Phase 5 - Accessibility

Cart badge aria-live="polite"
Cart dropdown keyboard access (Tab + Escape)
Brand Swiper keyboard navigation
Heading hierarchy audit all pages
Search modal role="dialog" aria-label
Auth modal ARIA
Form label association audit
44px touch target audit all components
WCAG contrast tool run all color pairs
Cookie consent banner (GDPR)
Structured data JSON-LD on product pages

---
# SECTION 13 - QA Checklist (100 Items)

## Header (15)
[ ] Logo dot is #FF4D33 in header, drawer, AND footer
[ ] Announcement bar text is centered
[ ] Announcement bar rotates 3+ messages
[ ] Language toggle removed OR i18n fully implemented
[ ] Search bar height >= 48px
[ ] Search icon is brand red #FF4D33
[ ] Search placeholder contrast >= 4.5:1
[ ] Wishlist accessible on mobile via bottom nav
[ ] Cart badge has aria-live="polite"
[ ] Cart dropdown does not close prematurely on cursor move
[ ] All sub-nav links have unique meaningful URLs
[ ] Sub-nav badge icons use consistent color
[ ] All interactive elements have :focus-visible ring
[ ] Header position: sticky, top: 0
[ ] Header z-index above all page content

## Hero (12)
[ ] Navigation arrows visible on mobile (opacity-80+)
[ ] Navigation arrows appear on hover on desktop
[ ] Single directional gradient, max 65% opacity
[ ] Center slide title >= 24px mobile
[ ] Subtitle >= 14px mobile
[ ] CTA button height >= 48px mobile
[ ] Progress animation keyframe confirmed working
[ ] Side cards visible at lg: (1024px+)
[ ] Autoplay pauses on hover
[ ] First slide image loading="eager"
[ ] Side card alt text is descriptive
[ ] Hero keyboard accessible

## Categories (8)
[ ] Text >= 12px on all breakpoints
[ ] Cards provide >= 44px minimum tap area (whole card)
[ ] "All Categories" card present and first
[ ] Desktop arrows appear at scroll boundaries
[ ] Horizontal swipe on mobile works
[ ] Consistent border radius (one value everywhere)
[ ] Consistent icon stroke-width
[ ] Hover states present on desktop

## Product Cards (18)
[ ] Price guard: no price > 99,999 shown
[ ] Crossed-out price never exceeds display price
[ ] Discount badge uses #FF4D33 (red, not green)
[ ] Rating stars displayed when prop available
[ ] Review count displayed when prop available
[ ] Add-to-cart always visible (no md:opacity-0)
[ ] Add-to-cart button >= 44x44px
[ ] Wishlist button visible at 40% default opacity
[ ] Compare button visible at 40% default opacity
[ ] mix-blend-multiply removed from images
[ ] Image container >= 200px mobile
[ ] Card hover: translateY(-3px) + shadow escalation
[ ] "Only X left" shown when stock 1-9
[ ] Stock text accompanies color indicator
[ ] "Standard Price" label removed when no installment
[ ] Card border radius consistent (24px everywhere)
[ ] Add-to-cart success: animation + color change
[ ] Out-of-stock: button replaced with "Sold Out" text

## Promo (6)
[ ] "(Promo Cards)" debug text removed from section title
[ ] Fire emoji replaced with Lucide Flame icon
[ ] Discount percentages accurate / dynamic from CMS
[ ] Promo card CTA buttons consistent border-radius
[ ] Feature banner CTAs use rounded-[10px] (not pill)
[ ] Feature banners full-width on mobile

## Brands (6)
[ ] All logos hosted locally in /public/brands/
[ ] Zero broken alt-text placeholder images
[ ] Hover state shows colored logos (no dark bg inversion)
[ ] Brand count badge uses sans-serif not font-mono
[ ] Nav arrows appear when scrollable
[ ] Keyboard navigation for brand carousel

## Trust (5)
[ ] Trust strip NOT duplicated in footer
[ ] Trust icon accent colors unified (one color)
[ ] Trust text does not truncate on mobile
[ ] 4 items visible without scrolling on desktop
[ ] Trust section links functional if linked

## Footer (10)
[ ] Logo dot #FF4D33 in footer
[ ] Footer trust grid REMOVED (TrustStripSection handles this)
[ ] Payment SVG logos row visible
[ ] Social links point to real URLs
[ ] Phone number is real (not placeholder)
[ ] Section headers visually distinct from link text
[ ] Copyright year is current
[ ] All footer links functional
[ ] Mobile footer accessible (accordion or visible)
[ ] Bottom nav does not obscure footer content

## Mobile (10)
[ ] All CTAs >= 48px height on mobile
[ ] Bottom nav has 5 tabs: Home Search Wishlist Cart Profile
[ ] Wishlist tab present and functional
[ ] Bottom nav does not obscure last content element
[ ] Hero carousel swipeable on touch
[ ] Category carousel swipeable on touch
[ ] Font size >= 12px everywhere on mobile
[ ] No horizontal overflow (no page-wide side-scroll)
[ ] Hamburger menu functional and accessible
[ ] Product carousel swipeable on touch

## Accessibility (10)
[ ] :focus-visible defined globally in globals.css
[ ] All interactive elements have visible focus ring
[ ] Cart badge has aria-live="polite"
[ ] Cart dropdown keyboard-accessible (Tab + Escape)
[ ] All images have meaningful alt text
[ ] No heading levels skipped
[ ] Search modal role="dialog" with aria-label
[ ] Color is never sole indicator of information
[ ] All form inputs have associated label elements
[ ] prefers-reduced-motion respected in CSS animations

## Brand Consistency (10)
[ ] Logo dot #FF4D33 in 100% of locations
[ ] CTA buttons all use same border-radius (10px)
[ ] Discount badges all #FF4D33
[ ] In-stock indicator #10B981 exclusively
[ ] All cards same border-radius (24px)
[ ] Shadows follow token system
[ ] Section titles same typography style
[ ] Icon stroke-width consistent (1.75px) across Lucide icons
[ ] Font stack consistent everywhere
[ ] Animation durations follow motion scale

---
End of Audit
100 checklist items | 40 UX issues | 60 missing features | 5-phase roadmap
Do NOT launch without completing all Phase 1 tasks (14 items).
