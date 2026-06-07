# Ghost in Your Browser — Design Document

> **Status**: Planning
> **Version**: 0.1
> **Last Updated**: 2026-06-07

---

## 1. Concept

A gamified web app that teaches Chrome keyboard shortcuts. A creature (Ghost, Gremlin, Glitch — TBD) has destroyed your mouse cursor. The only way to use your browser is by learning keyboard shortcuts. Each level teaches one shortcut through a scenario-based challenge with progressive hints.

### Core Principles
- **Learn by doing**: You press the real keys, not click buttons
- **Challenge + hints**: Productive struggle, not frustration
- **Immediate payoff**: Most-used shortcuts taught first
- **Creature-agnostic**: Story templates use `{creature}`, swap anytime

---

## 2. Tech Stack

- **HTML / CSS / JS** — No framework
- **Vite** — Dev server with hot reload
- **Vercel** — Free hosting
- Single page, multiple screens (no routing library)

---

## 3. Architecture

### Shortcuts as Data, Modes as Views

```
                    ┌──────────────────┐
                    │  SHORTCUT DATA   │  ← Single flat array
                    │  (shortcuts.js)  │     with all metadata
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
      ┌──────────┐   ┌──────────┐   ┌──────────┐
      │ CAMPAIGN │   │ SPEED    │   │ CATEGORY │
      │ MODE     │   │ RUN      │   │ DRILL    │
      │ (4 acts) │   │ (random) │   │ (by tag) │
      └──────────┘   └──────────┘   └──────────┘
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                    ┌──────────────────┐
                    │   GAME ENGINE    │  ← Same engine renders
                    │  (game.js)       │    any mode's shortcuts
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
      ┌──────────┐   ┌──────────┐   ┌──────────┐
      │ CREATURE │   │ FAKE     │   │ HINT     │
      │ RENDERER │   │ BROWSER  │   │ SYSTEM   │
      └──────────┘   └──────────┘   └──────────┘
```

### Screen Flow

```
START SCREEN ──▶ HOW IT WORKS ──▶ ACT SELECT ──▶ LEVEL
                                                  │
                                    ┌─────────────┘
                                    ▼
                              LEVEL LOOP:
                              1. Show scenario
                              2. Creature acts
                              3. Player presses keys
                              4. Success/Fail animation
                              5. Next level or Act complete
                                    │
                                    ▼
                              ACT RESULTS ──▶ NEXT ACT or REFERENCE
```

---

## 4. Ordering Strategy: Hybrid

Acts are grouped by component, but ordered by frequency/difficulty WITHIN each act.
Acts themselves unlock progressively.

### Campaign Structure (4 Acts, ~22 shortcuts)

**ACT 1: Browser Basics** — "The {creature} locks your browser down"
- Most essential daily shortcuts
- 6 levels + boss
- v0 scope

**ACT 2: Tab Warfare** — "The {creature} multiplies across your tabs"
- Tab navigation and management
- 5 levels + boss

**ACT 3: Navigation & Windows** — "The {creature} escapes into other windows"
- Windows, history, back/forward
- 5 levels + boss

**ACT 4: Page Mastery** — "The {creature} hides in the page content"
- Find, zoom, reload, bookmarks
- 6 levels + boss

*Note: DevTools/Power User act deferred to v2.*

---

## 5. Act 1 — Full User Journey

This section describes EXACTLY what happens from the moment the player starts Act 1 to the moment they complete it. This is the v0 scope.

### 5.1 Act 1 Intro (3-5 seconds)

**What the player sees:**
A clean fake browser window (Mac-style traffic lights, tab bar, address bar, content area). Everything looks normal.

**What happens:**
1. The {creature} scurries onto the screen from the corner (0.5s)
2. The mouse cursor on screen freezes and fizzles (0.5s)
3. A brief message appears center-screen:

```
╔═══════════════════════════════════════════╗
║                                           ║
║   Your mouse is gone.                     ║
║   The {creature} took it.                 ║
║                                           ║
║   Learn keyboard shortcuts to survive.    ║
║                                           ║
║         [ Press any key to start ]        ║
║                                           ║
╚═══════════════════════════════════════════╝
```

4. Player presses any key → transition to Level 1

---

### 5.2 Level Flow (Repeats for each level)

Every level follows this exact sequence:

#### Phase 1: Setup (1-2 seconds)
- The {creature} performs an action tied to this level's shortcut
- The fake browser UI updates to reflect the scenario
- Challenge text appears at the bottom of the screen

#### Phase 2: Challenge (Player input)
- Player reads the challenge and tries to recall the shortcut
- The game listens for keydown events
- Timer is visible but NOT punishing (no fail on timeout — just lower score)

**On WRONG key press:**
- Subtle screen shake (100ms)
- {creature} does a taunt wiggle
- Text: "Not quite. Try again or use a hint."
- Wrong attempt counter increments

**On HINT button press (or '?' key):**
Hints are layered — each press reveals more:

```
Hint 1 (contextual):  "Think about how you'd create something new..."
Hint 2 (partial):     "It starts with ⌘ ..."
Hint 3 (answer):      "Press ⌘ + T"  (still must press it)
```

Each hint used reduces score for this level but NEVER blocks progress.

**On CORRECT key press:**
- Success animation plays (creature reacts, sparkle effect)
- The shortcut name + description briefly flashes as reinforcement:
  ```
  ✓ ⌘ + T — Open New Tab
  ```
- Score awarded (based on: no hints used, no wrong attempts, time)
- 1-second pause, then auto-advance to next level

#### Phase 3: Transition (0.5 seconds)
- Smooth slide/fade to next level
- Level counter updates
- Progress bar fills

---

### 5.3 Act 1 Levels — Detailed

#### Level 1: Open New Tab (⌘+T / Ctrl+T)

**Setup:**
The fake browser shows one tab. The {creature} is sitting ON the current tab, blocking it with a "LOCKED" overlay. The content area is grayed out.

**Challenge Text:**
> "The {creature} locked your current tab. Open a new one to get around it."

**{creature} behavior:**
Sitting smugly on the tab, arms crossed. Small idle animation (bobbing).

**On correct (⌘+T):**
A new tab slides in from the right, pushing the {creature} sideways. It shrieks and tumbles off. The new tab is clean and bright.

**Hints:**
1. "You need to create a brand new tab..."
2. "⌘ + ..."
3. "Press ⌘ + T"

---

#### Level 2: Close Tab (⌘+W / Ctrl+W)

**Setup:**
Two tabs are now visible. The {creature} has crawled into Tab 2 and is nesting there. Tab 2 has a glitchy/corrupted appearance.

**Challenge Text:**
> "The {creature} infested Tab 2. Shut it down!"

**{creature} behavior:**
Peeking out from Tab 2, making the tab glow with a sickly color.

**On correct (⌘+W):**
Tab 2 shatters/collapses. The {creature} is ejected with a poof animation. Falls down into the content area.

**Hints:**
1. "You need to close the active tab..."
2. "⌘ + ..."
3. "Press ⌘ + W"

---

#### Level 3: Reload Page (⌘+R / Ctrl+R)

**Setup:**
The content area is filled with static/glitchy noise. The {creature}'s silhouette is visible behind the static, projecting interference patterns.

**Challenge Text:**
> "The {creature} corrupted the page. Reload to clear the interference."

**{creature} behavior:**
Hiding behind static overlay, only its eyes visible, glowing.

**On correct (⌘+R):**
A top-to-bottom scan line wipes the page clean. The static dissolves. The {creature} is exposed, standing in the clean page, looking panicked.

**Hints:**
1. "Refresh the page to get a clean version..."
2. "⌘ + ..."
3. "Press ⌘ + R"

---

#### Level 4: Focus Address Bar (⌘+L / Ctrl+L)

**Setup:**
The {creature} is hiding inside the address bar. The URL text is scrambled/glitched. The creature's tiny form is mixed in with the text characters.

**Challenge Text:**
> "The {creature} is hiding in the URL. Focus the address bar to expose it."

**{creature} behavior:**
Camouflaged among URL characters, occasionally blinking.

**On correct (⌘+L):**
The address bar glows with a bright highlight. All text is selected (like real Chrome behavior). The {creature} is illuminated and can't hide — it jumps out of the address bar down to the content area.

**Hints:**
1. "Target the bar at the top where you type URLs..."
2. "⌘ + ..."
3. "Press ⌘ + L"

---

#### Level 5: Scroll Down (Space)

**Setup:**
The content area shows a fake webpage. The {creature} has fled below the visible area. An arrow pointing down indicates "the {creature} went this way." The page is tall — the scrollbar shows you're at the top.

**Challenge Text:**
> "The {creature} fled below the fold. Scroll down to chase it."

**{creature} behavior:**
Not visible — off-screen below.

**On correct (Space):**
The page smoothly scrolls down one viewport. The {creature} is revealed at the bottom of the new view, caught mid-escape.

**Hints:**
1. "You need to scroll the page down..."
2. "No modifier key needed. Think of the biggest key..."
3. "Press Space"

---

#### Level 6: Find on Page (⌘+F / Ctrl+F)

**Setup:**
The content area is filled with dense paragraph text (fake lorem-style but themed: "system log entries"). The {creature} is invisible — completely blended with the text. No visual indicator of where it is.

**Challenge Text:**
> "The {creature} went invisible in a wall of system logs. Activate your search scanner to find it."

**{creature} behavior:**
Invisible. Can't be seen at all.

**On correct (⌘+F):**
The find bar slides open at the top-right (mimicking Chrome's real find bar). A pre-filled search term highlights the word "GHOST" (or {creature} name) in the text. A yellow highlight box wraps around the {creature}'s position, revealing its outline.

**Hints:**
1. "You need to search for something on this page..."
2. "⌘ + ..."
3. "Press ⌘ + F"

---

### 5.4 Boss Level: Chain Combo

**Setup:**
The {creature} is at full strength. The screen shows a sequence of 3 icons representing the shortcuts learned:

```
[ ⌘+T ] → [ ⌘+L ] → [ ⌘+F ]
  NEW       FOCUS      FIND
  TAB       URL BAR    ON PAGE
```

**Challenge Text:**
> "The {creature} deployed all its defenses. Chain three shortcuts to break through!"

**Flow:**
1. "Your tab is locked!" → Player presses ⌘+T → New tab opens ✓
2. "Now target its URL hideout!" → Player presses ⌘+L → Address bar focused ✓
3. "It's invisible in the page! Find it!" → Player presses ⌘+F → Found ✓

Each step has a 1-second pause between. The {creature} gets progressively more damaged/panicked with each successful shortcut.

**On all 3 correct:**
Big success animation. {creature} is captured in a containment effect.
Act 1 complete screen.

---

### 5.5 Act 1 Results Screen

**What the player sees:**

```
╔═══════════════════════════════════════════╗
║                                           ║
║      ✦ ACT 1 COMPLETE ✦                  ║
║      Browser Basics                       ║
║                                           ║
║   Shortcuts Learned:  6                   ║
║   Accuracy:           83%                 ║
║   Hints Used:         3                   ║
║   Time:               2:34                ║
║                                           ║
║   ┌─────────────────────────────────┐     ║
║   │ ⌘+T  Open New Tab          ★★★ │     ║
║   │ ⌘+W  Close Tab             ★★☆ │     ║
║   │ ⌘+R  Reload Page           ★★★ │     ║
║   │ ⌘+L  Focus Address Bar     ★★☆ │     ║
║   │ Space Scroll Down           ★★★ │     ║
║   │ ⌘+F  Find on Page          ★☆☆ │     ║
║   └─────────────────────────────────┘     ║
║                                           ║
║   [ REPLAY ACT 1 ]   [ NEXT: ACT 2 → ]  ║
║                                           ║
╚═══════════════════════════════════════════╝
```

Stars reflect performance per shortcut (no hints = 3 stars, 1 hint = 2, 2+ hints = 1).

---

## 6. Fake Browser UI

The entire game takes place inside a fake browser window:

```
┌──────────────────────────────────────────────────────┐
│ ● ● ●  │ Tab 1 │ Tab 2 │ Tab 3 │  +                 │  ← Traffic lights + tabs
├──────────────────────────────────────────────────────┤
│  ← → ↻  │ https://example.com                  🔒   │  ← Nav buttons + address bar
├──────────────────────────────────────────────────────┤
│                                                      │
│                                                      │
│              CONTENT AREA                            │
│         (where the game plays out)                   │
│                                                      │
│                   👻 ← creature                      │
│                                                      │
├──────────────────────────────────────────────────────┤
│  CHALLENGE: "The ghost locked your tab..."           │  ← Challenge bar
│  ⏱ 0:12    💡 Hint (3)    ★★★    Level 1/6          │  ← Status bar
└──────────────────────────────────────────────────────┘
```

The fake browser elements are INTERACTIVE in the game:
- Tabs light up, shake, get added/removed
- Address bar glows when focused
- Content area scrolls, zooms, shows find bar
- Nav buttons (back/forward) animate

---

## 7. Creature Design

- **Size**: ~30px (favicon-sized, sits naturally on browser UI elements)
- **Style**: SVG, flat/minimal, 2-3 colors — matches browser icon aesthetic
- **States**: idle (floating/bobbing), hit (shrinks/flashes), taunt (wiggles), flee (scurries)
- **Name**: TBD — Ghost, Gremlin, or Glitch
- **Swappable**: Change `CREATURE.name` + SVG asset, all stories auto-update

---

## 8. Open Decisions

- [ ] Creature name: Ghost vs Gremlin vs Glitch
- [ ] Visual tone: Apple modern vs retro Mac vs neon
- [ ] Sound effects: yes/no for v0?
- [ ] Mobile support: defer to v2?
