# Academy of Spirit — UI/UX Design Brief

## App Identity

- **Name:** Academy of Spirit (AOS)
- **Category:** Meditation & Mindfulness
- **Platform:** iOS + Android (React Native / Expo)
- **Tone:** Premium, serene, spiritual. Feels like a luxury wellness app — not clinical, not playful. Think Calm meets Apple Fitness+.

---

## Design Language

### Color Palette

- **`background`** — App background. Dark: `#0C0E14` / Light: `#F7F7F9`
- **`hero`** — Hero card surfaces. Deep navy: `#1A2035`
- **`primary`** — Gold accent. Used for CTAs, icons, active states: `#C79F27`
- **`primary-foreground`** — Text on gold buttons. Near-black.
- **`card`** — Elevated surface above background: `#13151F`
- **`border`** — Subtle dividers: `rgba(255,255,255,0.08)`
- **`foreground`** — Primary text: `#F2F2F5`
- **`muted-foreground`** — Secondary text, labels: `rgba(255,255,255,0.45)`
- **`destructive`** — Danger, live badge: `#EF4444`

Supports **System / Light / Dark** theme toggling via in-app preference.

### Typography

- **Headings** — Tight tracking, bold weight, large sizes (2xl, xl)
- **Section Labels** — ALL CAPS, widest letter-spacing, muted foreground
- **Body** — Regular weight, sm or xs sizes, muted foreground
- **Stats / Numbers** — Bold, gold color

### Shape Language

- **Hero cards** — `border-radius: 24px` (rounded-3xl)
- **List item cards** — `border-radius: 18–16px` (rounded-[18px] / rounded-2xl)
- **CTA buttons** — `border-radius: 16px` (rounded-2xl)
- **Pill chips and icon buttons** — `border-radius: 9999px` (rounded-full)
- **Form inputs** — `border-radius: 16px`, tall height 56px, with inset left icons

### Spacing

- Horizontal page margin: 24px (`px-6`)
- Section vertical gaps: 24–28px
- Card internal padding: 20–24px

---

## Information Architecture

```
App
├── Auth Flow (unauthenticated)
│   ├── Login
│   ├── Register
│   └── Forgot Password
│
└── Main App — 5-tab bottom navigation
    ├── Home        (Dashboard)
    ├── Meditate    (Audio Player)
    ├── Live        (Live Sessions)
    ├── Courses     (Course Library)
    └── Settings    (Profile + Preferences)
```

---

## Screen-by-Screen Breakdown

---

### AUTH SCREENS

---

#### Login Screen

**Layout:** Vertical split — top hero area + bottom form card

**Top — Hero Section**

- Full-bleed `hero` background (dark navy)
- Centered: circular icon badge (72×72, semi-transparent gold ring + gold Sparkles icon)
- App name: "Academy of Spirit" — white, xl heading, tight tracking
- Tagline: "Find your inner peace" — muted white, sm

**Bottom — Form Card**

- Background color with `rounded-t-3xl` top edge, overlaps hero by 16px (bottom sheet feel)
- "Welcome back" heading + "Sign in to continue your journey" subtitle
- Error banner (conditional): red-tinted box with border, sm error text
- **Email field** — card background, 2px border, h-14, left Mail icon
- **Password field** — same style, left Lock icon, right Eye/EyeOff visibility toggle
- **Forgot password** — right-aligned gold link text
- **Sign In button** — full width, gold background, h-14, bold. Shows spinner + "Signing in…" while loading
- **Register link** — centered: muted text + gold "Sign Up" pressable

---

#### Register Screen

Same vertical split layout as Login.

**Top:** Identical hero branding

**Form:**

- "Create account" heading + subtitle
- Name field
- Email field
- Password field
- Confirm Password field
- Full-width gold "Create Account" button with loading state
- Login link at bottom: "Already have an account? Sign In"

---

#### Forgot Password Screen

Two states rendered in one screen.

**State 1 — Input**

- Same hero top section
- "Reset password" heading
- Single email input field
- "Send Reset Link" gold full-width button
- "Back to Sign In" link below

**State 2 — Success (replaces the form)**

- Centered success container with subtle gold tint background and gold border
- CheckCircle icon centered
- "Check your inbox" heading
- Instructional message text
- "Back to Sign In" button

---

### MAIN APP SCREENS

---

### 1. Home — Dashboard

**Purpose:** Daily dashboard. Motivates practice, shows streaks and progress, surfaces recommended content.

**Layout (vertical scroll):**

**Header**

- Left column:
  - Sun icon + "Good morning" (muted, xs, icon inline)
  - User display name — 2xl bold heading below
- Right: Avatar circle (48×48, gold background, white initial letter)
- Second row below header:
  - Left: Today's date (xs, muted)
  - Right: Flame icon (filled gold) + "7 day streak" (gold bold xs)

**Today's Practice Hero Card**

- Full-bleed hero card — `bg-hero`, rounded-3xl, 224px tall, justified between top and bottom
- Top section:
  - "TODAY'S PRACTICE" — uppercase, widest tracking, gold, 2xs
  - "Morning Clarity" — white 2xl bold heading
  - "15 min · Guided · Beginner" — muted white sm
- Bottom row:
  - Left: Pill chip "Mindfulness Series" — frosted `bg-white/10`, rounded-full, sm white/70 text
  - Right: Play button — 56×56 gold circle with filled white play icon

**Quick Start**

- Section row: "Quick Start" bold + "See all" gold link (right-aligned)
- 3-column equal-width tile grid:
  - Each tile: card background, rounded-[18px], border, items centered
  - Large bold gold duration text ("5 min", "10 min", "20 min")
  - Small muted label below ("Quick Reset", "Focus", "Deep Dive")

**Weekly Progress**

- Card with rounded-3xl, border
- Header row: "Weekly Progress" label + "5 of 7 days" count (muted right)
- 7-day row (M T W T F S S):
  - Each day: circle (36×36) + day letter below (muted 2xs)
  - Completed day: gold filled circle with white checkmark icon
  - Incomplete day: border-color filled circle (empty)

**Recommended — Horizontal Scroll**

- Section row: "Recommended" label + "See all" with ChevronRight icon
- Horizontally scrolling course cards (160×208, rounded-[22px]):
  - Per-course unique dark background (navy, dark green, deep purple, dark brown)
  - Content bottom-aligned:
    - Session count — small muted white
    - Course title — bold white, tight line height
    - Level badge — frosted pill `bg-white/15`, rounded-full, 2xs white/85

---

### 2. Meditate — Audio Player

**Purpose:** Core feature. Browse and play guided meditation audio sessions with session persistence (resume from last position).

**Layout (vertical scroll):**

**Header**

- "Meditate" — 2xl bold heading
- "Breathe. Be present. Transcend." — muted sm subtitle

**Player Hero Card**

- `bg-hero`, rounded-3xl, padded, centered content, 20px vertical gap

- **Breathing Circle (container: 210px)**
  - Outer glow ring: rgba(gold, 0.19), full 210px circle — animates opacity 0.2↔0.6 on 4-second inhale/exhale cycle
  - Inner circle: 160×160, dark navy background, 2.5px solid gold border — animates scale 1.0↔1.3 on same 4-second cycle
  - Idle state (no session selected): Headphones icon in gold, centered
  - Active state: "PLAYING" uppercase gold label + "0:42 / 15:00" time display centered

- **Track info** (below circle):
  - Bold white title, 1 line max
  - Muted description, 2 lines max
  - Idle: "Select a session below to begin" muted centered text

- **Progress bar** — 3px tall, full width, `bg-white/8` track, gold fill progressing left to right

- **Play/Pause button** — 64×64 circle
  - Active (session selected): gold background, filled white Play or Pause icon
  - Inactive (no session): frosted `bg-white/8` background, white/25 dimmed icon

**Sessions List**

- "Sessions" section bold label
- Loading state: centered gold spinner
- Error state: destructive red text centered
- Empty state: muted text centered
- Session rows (card bg, rounded-2xl, border):
  - Left: 40×40 icon circle
    - Active + playing: gold background, filled Pause icon
    - Active + paused: gold background, filled Play icon
    - Inactive: border background, muted filled Play icon
  - Center: Title (gold when active, foreground when inactive, 1 line) + muted description (1 line)
  - Right: Clock icon + formatted duration (mm:ss)
  - **Active row highlight:** `bg-primary/8` background, gold border

---

### 3. Live — Live Sessions

**Purpose:** Join real-time group meditation sessions. View upcoming schedule.

**Layout (vertical scroll):**

**Header**

- "Live" — 2xl bold heading
- "Join live meditation sessions" — muted sm subtitle

**Live Now Hero Card**

- `bg-hero`, rounded-3xl, padded

- **Live badge row:**
  - Animated pulse dot: red circle with repeating scale (1→1.8) + opacity (1→0.2) at 900ms — signals real-time status
  - "LIVE NOW" — uppercase, widest tracking, destructive red, xs bold

- Session title — white xl heading, tight tracking
- Instructor — "with Dr. Sarah Chen" — white/55 sm

- Stats row:
  - Users icon + "1.2k watching"
  - Clock icon + "32 min live"

- **"Join Session" button** — full width, destructive red fill, rounded-2xl, lg, bold

**Upcoming Sessions**

- Calendar icon + "Upcoming Sessions" bold label

- Each session row (card bg, rounded-[18px], border, flex-row, no padding):
  - Left: **Color-coded time column** (70px wide)
    - Unique background color per session (navy, purple, dark green, brown)
    - Day label — white/60 2xs stacked above bold white time
  - Center content (padded):
    - Session title — sm bold foreground
    - Instructor — xs muted
    - Clock icon + duration — xs muted
  - Right: "Remind" ghost button — `bg-primary/13`, rounded-xl, gold text

---

### 4. Courses — Course Library

**Purpose:** Discover and browse the full library of meditation courses.

**Layout (vertical scroll):**

**Header**

- "Courses" — 2xl bold heading

**Search Bar**

- Full-width input, card background, border, rounded-2xl, height 48px
- Left-inset Search icon (muted)
- Placeholder: "Search courses..."

**Category Filter Chips (Horizontal Scroll, no scroll indicator)**

- Pill buttons: All · Mindfulness · Breathing · Sleep · Stress · Focus
- Active chip: gold filled background, white bold text (variant="default")
- Inactive chip: outline border, muted foreground text

**Featured Course Card**

- `bg-hero`, rounded-3xl, padded, 16px gap between elements

- Top: "FEATURED" pill badge — gold fill, white uppercase 2xs bold text, rounded-full
- Course title — white xl heading
- Instructor — "with {name}" white/60 sm

- Stats row:
  - Clock icon + duration
  - Star icon (filled gold) + rating + student count

- "Start Course" button — gold, full width, rounded-2xl, lg, bold

**All Courses List**

- "All Courses" section bold label

- Each course row (card bg, rounded-[18px], border, flex-row, overflow hidden):
  - Left: **Color accent strip** (56px wide, per-category solid color)
    - Category name — small white/80 bold text centered
  - Center (padded):
    - Course title — sm bold foreground
    - Instructor — xs muted
    - Metadata row:
      - Clock icon + duration per day
      - Star icon (filled gold) + rating
      - Level pill badge (border, muted bg, 2xs muted text)
  - Right: ChevronRight icon (muted)

---

### 5. Settings — Profile & Preferences

**Purpose:** User profile overview, app preferences, account management.

**Layout (vertical scroll):**

**Header**

- "Settings" — 2xl bold heading

**Profile Card**

- `bg-hero`, rounded-3xl, flex-row, padded

- Avatar: 60×60 gold circle, white initial letter (2xl bold)
- Right of avatar:
  - Display name — white lg bold
  - Email — white/50 xs
- Far right: "Pro" badge pill — semi-transparent gold border, gold text, xs bold

**Stats Row — 3 Equal Cards**

Each card: card background, border, rounded-2xl, items centered, padded

- Card 1: "7" (xl bold gold) + "Day Streak" (2xs muted)
- Card 2: "43" (xl bold gold) + "Sessions" (2xs muted)
- Card 3: "12h" (xl bold gold) + "Total Time" (2xs muted)

**Settings Sections**

Each section has a section label above it (uppercase, widest tracking, muted) and a grouped card below (rounded-[20px], border, overflow hidden). Rows inside are separated by Dividers that start after the icon (not full-bleed).

**Settings row pattern:**
- Left: Colored rounded-xl icon square (9px radius) with white icon
- Middle: Label text (destructive red for danger actions)
- Right: Value text OR Switch toggle OR ChevronRight icon

---

**PREFERENCES group:**

- 🔔 Notifications — Blue icon bg `#5B8DEF` — Toggle Switch (on/off)
- 🔊 Ambient Sounds — Green icon bg `#5BC85B` — Toggle Switch (on/off)
- 🌙 Appearance — Purple icon bg `#8B5CF6`:
  - Inline 3-button segmented selector below the row label:
    - System (Smartphone icon) · Light (Sun icon) · Dark (Moon icon)
    - Active: gold border (2px), gold icon, gold bold text, `bg-primary/15`
    - Inactive: border color, muted icon, muted text
- 🌐 Language — Amber icon bg `#F59E0B` — Value "English" + ChevronRight

**CONTENT group:**

- ⬇️ Downloaded Sessions — Teal icon bg `#14B8A6` — Value "3 files" + ChevronRight
- ⭐ Rate the App — Primary icon bg — ChevronRight

**SUPPORT group:**

- ❓ Help & FAQ — Blue icon bg
- 🛡 Privacy Policy — Gray icon bg

**SIGN OUT (standalone card):**

- Icon: LogOut in destructive red, icon bg rgba(red, 0.13)
- Label: "Sign Out" in destructive red
- No right element (no chevron, no value)
- On press: triggers **AlertDialog** with backdrop
  - Title: "Sign Out"
  - Body: "Are you sure you want to sign out?"
  - Footer: Cancel (ghost) + Sign Out (destructive) buttons

**Footer**

- "Academy of Spirit v1.0.0" — xs muted, centered

---

## Key Interaction Patterns

**Bottom sheet auth entry**
Auth form cards use `rounded-t-3xl` and overlap the hero section by 16px — creates a modal sheet feel without a native modal.

**Breathing animation**
Meditate screen: synchronized expand/contract (scale 1.0→1.3) + outer glow fade (opacity 0.2→0.6) on a 4-second inhale → 4-second hold → 4-second exhale → 4-second hold cycle using Reanimated.

**Live pulse dot**
Live badge: animated dot scales from 1→1.8 and fades from opacity 1→0.2 on repeat at 900ms. Signals real-time activity.

**Active session highlight**
Selected session row applies gold border + `bg-primary/8` tint and fills the icon circle gold. All other rows revert to default.

**Loading states**
Buttons: inline spinner + text mutation ("Signing in…"). Lists: centered spinner replaces list.

**Error states**
Auth: red-tinted banner box with border above the form. Lists: inline destructive text centered in the list area.

**Destructive confirmation**
Sign out uses an AlertDialog with a semi-transparent backdrop. Never a native action sheet.

**Theme toggle**
Inline segmented 3-button picker (not a dropdown or radio list) — System / Light / Dark.

---

## Accessibility Considerations

- All white text on hero backgrounds uses opacity variants (white/55, white/60) — verify contrast ratio ≥ 4.5:1
- Icon-only buttons are paired with visible context (title text, tab label) or should receive an `accessibilityLabel`
- Form fields have explicit text labels above — not relying solely on placeholder text
- Destructive actions are gated behind a confirmation dialog

---

## Missing Screens — Opportunities for AI Expansion

1. **Onboarding flow** — Goals, experience level, daily reminder time setup (3–5 steps)
2. **Course Detail screen** — Instructor bio, session list, progress tracker, enroll CTA
3. **Player Full-Screen / Now Playing** — Expanded artwork, sleep timer, playback speed, ambient sound layering
4. **Progress / Journal screen** — Session history, calendar heatmap, total minutes chart
5. **Notification Permission Prompt** — Custom in-app prompt before native OS dialog
6. **Paywall / Upgrade screen** — Pro plan benefits, pricing, CTA (the Pro badge exists but no screen)
7. **Empty states** — Illustrated empty states for: no meditations, no live sessions, no downloads
8. **Instructor Profile** — Bio, session count, ratings, course list
9. **Search Results screen** — Filtered view from the Courses search bar
10. **Onboarding Completion / Welcome** — Post-registration celebration screen before the main app
