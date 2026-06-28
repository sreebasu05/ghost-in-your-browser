/**
 * shortcuts.js — Single Source of Truth
 *
 * Every Chrome keyboard shortcut lives here with full metadata.
 * Modes, campaigns, and game logic reference this data by ID.
 *
 * The {creature} placeholder in stories is replaced at runtime
 * based on the selected creature config.
 */

// =============================================================
// CREATURE CONFIG — Change this to swap the character everywhere
// =============================================================

export const CREATURE = {
  name: 'Ghost',       // 'Ghost' | 'Gremlin' | 'Glitch' — swap anytime
  emoji: '👻',
  color: '#00ffcc',
  // svg: '/assets/ghost.svg',  // TODO: add SVG asset
};

// =============================================================
// SHORTCUT DATABASE
// =============================================================
//
// Fields:
//   id             — unique string identifier
//   action         — human-readable description of what this shortcut does
//   category       — 'tab' | 'window' | 'nav' | 'page' | 'find' | 'zoom' | 'bookmark' | 'devtools'
//   difficulty     — 1 (beginner) to 5 (power user)
//   frequency      — 'daily' | 'weekly' | 'rare'
//   interceptable  — 'yes' (can preventDefault), 'simulate' (must fake the action), 'no' (OS-level, can't capture)
//   keys.mac       — { mods: string[], key: string, display: string }
//   keys.win       — { mods: string[], key: string, display: string }
//   story          — one-line narrative hook with {creature} placeholder
//   hint1          — contextual hint (vague)
//   hint2          — partial hint (shows modifier key)
//   hint3          — full answer (still must press it)
//   ghostAction    — what the creature does during setup
//   successAnim    — what animation plays on correct input

export const SHORTCUTS = [

  {
    id: 'new_tab',
    action: 'Open a new tab',
    category: 'tab',
    difficulty: 1,
    frequency: 'daily',
    interceptable: 'simulate',
    arcReserved: true, // Arc owns ⌘T at the chrome level; the page never sees the event
    keys: {
      mac: { mods: ['meta'], key: 't', display: '⌘ + T' },
      win: { mods: ['ctrl'], key: 't', display: 'Ctrl + T' },
    },
    story: 'The {creature} locked your current tab. Open a new one to get around it.',
    hint1: 'Open a fresh tab strip container.',
    hint2: "First letter of 'Tab'.",
    hint3: 'Press ⌘ + T',
    ghostAction: 'sits_on_active_tab',
    successAnim: 'pushed_off_tab',
  },

  {
    id: 'close_tab',
    action: 'Close the current tab',
    category: 'tab',
    difficulty: 1,
    frequency: 'daily',
    interceptable: 'simulate',
    keys: {
      mac: { mods: ['meta'], key: 'w', display: '⌘ + W' },
      win: { mods: ['ctrl'], key: 'w', display: 'Ctrl + W' },
    },
    story: 'The {creature} infested this tab. Shut it down!',
    hint1: 'Shut down and terminate the active tab.',
    hint2: "First letter of 'Window' or 'Wipe'.",
    hint3: 'Press ⌘ + W',
    ghostAction: 'nests_in_tab',
    successAnim: 'tab_shatter',
  },

  {
    id: 'reload',
    action: 'Reload the page',
    category: 'page',
    difficulty: 1,
    frequency: 'daily',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta'], key: 'r', display: '⌘ + R' },
      win: { mods: ['ctrl'], key: 'r', display: 'Ctrl + R' },
    },
    story: 'The {creature} corrupted the page with static. Reload to clear its interference.',
    hint1: 'Refresh the page to get a clean render.',
    hint2: "First letter of 'Reload'.",
    hint3: 'Press ⌘ + R',
    ghostAction: 'projects_static',
    successAnim: 'scanline_wipe',
  },

  {
    id: 'address_bar',
    action: 'Jump to the address bar',
    category: 'nav',
    difficulty: 1,
    frequency: 'daily',
    interceptable: 'yes',
    arcReserved: true, // Arc opens its Command Bar on ⌘L; the page never sees the event
    keys: {
      mac: { mods: ['meta'], key: 'l', display: '⌘ + L' },
      win: { mods: ['ctrl'], key: 'l', display: 'Ctrl + L' },
    },
    story: 'The {creature} is hiding in the URL. Focus the address bar to expose it.',
    hint1: 'Target the bar at the top where URLs are entered.',
    hint2: "First letter of 'Location'.",
    hint3: 'Press ⌘ + L',
    ghostAction: 'hides_in_url',
    successAnim: 'address_bar_glow',
  },

  {
    id: 'scroll_down',
    action: 'Scroll down a page',
    category: 'page',
    difficulty: 1,
    frequency: 'daily',
    interceptable: 'yes',
    keys: {
      mac: { mods: [], key: ' ', display: 'Space' },
      win: { mods: [], key: ' ', display: 'Space' },
    },
    story: 'The {creature} fled below the fold. Scroll down to chase it.',
    hint1: 'Push the viewport downward to view more content.',
    hint2: "The longest key.",
    hint3: 'Press Space',
    ghostAction: 'flees_below_fold',
    successAnim: 'page_scroll_reveal',
  },

  {
    id: 'find',
    action: 'Find on page',
    category: 'find',
    difficulty: 1,
    frequency: 'daily',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta'], key: 'f', display: '⌘ + F' },
      win: { mods: ['ctrl'], key: 'f', display: 'Ctrl + F' },
    },
    story: 'The {creature} went invisible in a wall of system logs. Activate your search scanner to find it.',
    hint1: 'Open the search bar to locate specific terms on this page.',
    hint2: "First letter of 'Find'.",
    hint3: 'Press ⌘ + F',
    ghostAction: 'invisible_in_text',
    successAnim: 'find_highlight_reveal',
  },

  // ----- ACT 2: TAB WARFARE -----

  {
    id: 'next_tab',
    action: 'Jump to the next tab',
    category: 'tab',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'simulate',
    keys: {
      mac: { mods: ['meta', 'alt'], key: 'ArrowRight', display: '⌘ + Option + →' },
      win: { mods: ['ctrl'], key: 'Tab', display: 'Ctrl + Tab' },
    },
    story: 'The {creature} jumped to the next tab. Cycle forward to follow it!',
    hint1: 'Cycle focus to the tab immediately to your right.',
    hint2: 'Move right with modifiers.',
    hint3: 'Press ⌘ + Option + → (Mac) or Ctrl + Tab (Win)',
    ghostAction: 'jumps_to_next_tab',
    successAnim: 'tab_selection_shift',
  },
  
  {
    id: 'prev_tab',
    action: 'Jump to the previous tab',
    category: 'tab',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'simulate',
    keys: {
      mac: { mods: ['meta', 'alt'], key: 'ArrowLeft', display: '⌘ + Option + ←' },
      win: { mods: ['ctrl', 'shift'], key: 'Tab', display: 'Ctrl + Shift + Tab' },
    },
    story: 'The {creature} is backtracking! Reverse cycle to cut it off.',
    hint1: 'Cycle focus to the tab immediately to your left.',
    hint2: 'Move left with modifiers.',
    hint3: 'Press ⌘ + Option + ← (Mac) or Ctrl + Shift + Tab (Win)',
    ghostAction: 'darts_to_prev_tab',
    successAnim: 'tab_selection_reverse',
  },

  {
    id: 'reopen_tab',
    action: 'Reopen the last closed tab',
    category: 'tab',
    difficulty: 1,
    frequency: 'daily',
    interceptable: 'simulate',
    keys: {
      mac: { mods: ['meta', 'shift'], key: 't', display: '⌘ + Shift + T' },
      win: { mods: ['ctrl', 'shift'], key: 't', display: 'Ctrl + Shift + T' },
    },
    story: 'The {creature} deleted your evidence tab! Restore it from the void.',
    hint1: 'Retrieve and reopen the last closed tab.',
    hint2: 'New tab shortcut + Shift.',
    hint3: 'Press ⌘ + Shift + T',
    ghostAction: 'deletes_a_tab',
    successAnim: 'tab_materializes',
  },

  {
    id: 'jump_tab',
    action: 'Jump to a specific tab (1-8)',
    category: 'tab',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'simulate',
    keys: {
      mac: { mods: ['meta'], key: '1-8', display: '⌘ + 1 through ⌘ + 8' },
      win: { mods: ['ctrl'], key: '1-8', display: 'Ctrl + 1 through Ctrl + 8' },
    },
    story: 'The {creature} leaped to Tab 5. Teleport directly to it!',
    hint1: 'Teleport directly to a specific tab number on your strip.',
    hint2: 'Use the tab\'s number index.',
    hint3: 'Press ⌘ + 5',
    ghostAction: 'jumps_to_tab_5',
    successAnim: 'targeting_reticle_zap',
  },

  {
    id: 'last_tab',
    action: 'Jump to the last tab',
    category: 'tab',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'simulate',
    keys: {
      mac: { mods: ['meta'], key: '9', display: '⌘ + 9' },
      win: { mods: ['ctrl'], key: '9', display: 'Ctrl + 9' },
    },
    story: 'The {creature} is clinging to the last tab. Snap to the edge to pin it!',
    hint1: 'Snap directly to the tab at the far right end of the strip.',
    hint2: 'The highest single digit.',
    hint3: 'Press ⌘ + 9',
    ghostAction: 'clings_to_last_tab',
    successAnim: 'edge_snap_pin',
  },

  // ----- ACT 3: NAVIGATION & WINDOWS -----

  {
    id: 'back',
    action: 'Go back to the previous page',
    category: 'nav',
    difficulty: 1,
    frequency: 'daily',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta'], key: '[', display: '⌘ + [' },
      win: { mods: ['alt'], key: 'ArrowLeft', display: 'Alt + ←' },
    },
    story: 'The {creature} retreated to the previous page. Follow it back in time.',
    hint1: 'Return to the page you just visited in this tab.',
    hint2: "Move back with modifiers.",
    hint3: 'Press ⌘ + [ (Mac) or Alt + ← (Win)',
    ghostAction: 'retreats_to_prev_page',
    successAnim: 'page_slide_right',
  },

  {
    id: 'forward',
    action: 'Go forward to the next page',
    category: 'nav',
    difficulty: 1,
    frequency: 'daily',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta'], key: ']', display: '⌘ + ]' },
      win: { mods: ['alt'], key: 'ArrowRight', display: 'Alt + →' },
    },
    story: 'The {creature} is trying to escape forward. Leap ahead to intercept!',
    hint1: 'Navigate forward to the next page in your history.',
    hint2: "Move forward with modifiers.",
    hint3: 'Press ⌘ + ] (Mac) or Alt + → (Win)',
    ghostAction: 'flees_forward',
    successAnim: 'page_slide_left',
  },

  {
    id: 'new_window',
    action: 'Open a new window',
    category: 'window',
    difficulty: 2,
    frequency: 'daily',
    interceptable: 'simulate',
    keys: {
      mac: { mods: ['meta'], key: 'n', display: '⌘ + N' },
      win: { mods: ['ctrl'], key: 'n', display: 'Ctrl + N' },
    },
    story: 'The {creature} escaped your browser. Deploy a second window to surround it.',
    hint1: 'Launch an entirely new browser window.',
    hint2: "First letter of 'New window'.",
    hint3: 'Press ⌘ + N',
    ghostAction: 'escapes_browser',
    successAnim: 'second_window_spawns',
  },

  {
    id: 'incognito',
    action: 'Open a new incognito window',
    category: 'window',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'simulate',
    keys: {
      mac: { mods: ['meta', 'shift'], key: 'n', display: '⌘ + Shift + N' },
      win: { mods: ['ctrl', 'shift'], key: 'n', display: 'Ctrl + Shift + N' },
    },
    story: 'The {creature} is fleeing into an incognito session to wipe its footprints. Follow it in private mode to catch it!',
    hint1: 'Open a private window to follow the ghost into its stealth environment.',
    hint2: 'New window shortcut + Shift.',
    hint3: 'Press ⌘ + Shift + N',
    ghostAction: 'goes_stealth',
    successAnim: 'dark_window_spawns',
  },

  {
    id: 'close_window',
    action: 'Close the current window',
    category: 'window',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'simulate',
    keys: {
      mac: { mods: ['meta', 'shift'], key: 'w', display: '⌘ + Shift + W' },
      win: { mods: ['ctrl', 'shift'], key: 'w', display: 'Ctrl + Shift + W' },
    },
    story: 'Cut off the {creature}\'s escape route. Collapse the secondary window.',
    hint1: 'Shut down and close the entire browser window.',
    hint2: 'Close tab shortcut + Shift.',
    hint3: 'Press ⌘ + Shift + W',
    ghostAction: 'hides_in_secondary_window',
    successAnim: 'window_collapse',
  },

  // ----- ACT 4: PAGE MASTERY -----

  {
    id: 'scroll_up',
    action: 'Scroll up a page',
    category: 'page',
    difficulty: 1,
    frequency: 'daily',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['shift'], key: ' ', display: 'Shift + Space' },
      win: { mods: ['shift'], key: ' ', display: 'Shift + Space' },
    },
    story: 'The {creature} doubled back upward! Scroll up to intercept.',
    hint1: 'Push the viewport back upward.',
    hint2: 'Scroll down shortcut + Shift.',
    hint3: 'Press Shift + Space',
    ghostAction: 'flees_above_fold',
    successAnim: 'page_scroll_up_reveal',
  },

  {
    id: 'find_next',
    action: 'Jump to the next Find match',
    category: 'find',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta'], key: 'g', display: '⌘ + G' },
      win: { mods: ['ctrl'], key: 'g', display: 'Ctrl + G' },
    },
    story: 'Found one trace, but the {creature} left more. Jump to the next match.',
    hint1: 'Jump forward to the next matched search result.',
    hint2: "First letter of 'Go'.",
    hint3: 'Press ⌘ + G',
    ghostAction: 'leaves_multiple_traces',
    successAnim: 'highlight_jump',
  },

  {
    id: 'find_prev',
    action: 'Jump to the previous Find match',
    category: 'find',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta', 'shift'], key: 'g', display: '⌘ + Shift + G' },
      win: { mods: ['ctrl', 'shift'], key: 'g', display: 'Ctrl + Shift + G' },
    },
    story: 'The last match was a decoy! Go back to the previous one.',
    hint1: 'Jump backward to the previous matched search result.',
    hint2: 'Find next shortcut + Shift.',
    hint3: 'Press ⌘ + Shift + G',
    ghostAction: 'decoy_at_current_match',
    successAnim: 'highlight_reverse',
  },

  {
    id: 'hard_reload',
    action: 'Reload, bypassing cache',
    category: 'page',
    difficulty: 3,
    frequency: 'weekly',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta', 'shift'], key: 'r', display: '⌘ + Shift + R' },
      win: { mods: ['ctrl', 'shift'], key: 'r', display: 'Ctrl + Shift + R' },
    },
    story: 'The {creature} is hiding in your cached files. Force a deep reload to flush it out.',
    hint1: 'Perform a deep reload of the page, completely ignoring the cache.',
    hint2: 'Reload shortcut + Shift.',
    hint3: 'Press ⌘ + Shift + R',
    ghostAction: 'hides_in_cache',
    successAnim: 'electromagnetic_wave',
  },

  {
    id: 'zoom_in',
    action: 'Zoom in (make everything bigger)',
    category: 'zoom',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta'], key: '=', display: '⌘ + +' },
      win: { mods: ['ctrl'], key: '=', display: 'Ctrl + +' },
    },
    story: 'The {creature} shrunk to microscopic size. Zoom in to spot it!',
    hint1: 'Magnify the page content to enlarge elements.',
    hint2: 'The addition symbol.',
    hint3: 'Press ⌘ + + (plus)',
    ghostAction: 'shrinks_tiny',
    successAnim: 'zoom_enlarge_reveal',
  },

  {
    id: 'zoom_out',
    action: 'Zoom out (make everything smaller)',
    category: 'zoom',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta'], key: '-', display: '⌘ + -' },
      win: { mods: ['ctrl'], key: '-', display: 'Ctrl + -' },
    },
    story: 'The {creature} grew enormous, filling the whole screen! Zoom out to see it fully.',
    hint1: 'Scale down the page content to fit more on the screen.',
    hint2: 'The subtraction symbol.',
    hint3: 'Press ⌘ + - (minus)',
    ghostAction: 'grows_huge',
    successAnim: 'zoom_shrink_reveal',
  },

  {
    id: 'zoom_reset',
    action: 'Reset zoom to 100%',
    category: 'zoom',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta'], key: '0', display: '⌘ + 0' },
      win: { mods: ['ctrl'], key: '0', display: 'Ctrl + 0' },
    },
    story: 'Snap the viewport back to normal. The containment trap engages!',
    hint1: 'Reset the zoom scale back to the default 100% size.',
    hint2: 'The number zero.',
    hint3: 'Press ⌘ + 0',
    ghostAction: 'caught_in_zoom',
    successAnim: 'zoom_snap_trap',
  },

  {
    id: 'stop_load',
    action: 'Stop page loading',
    category: 'page',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'yes',
    keys: {
      mac: { mods: [], key: 'Escape', display: 'Esc' },
      win: { mods: [], key: 'Escape', display: 'Esc' },
    },
    story: 'The {creature} triggered an infinite loading loop. Hit the emergency stop!',
    hint1: 'Abort the current page connection and loading process.',
    hint2: 'The abort key at the top-left.',
    hint3: 'Press Esc',
    ghostAction: 'triggers_infinite_load',
    successAnim: 'loading_halt',
  },

  {
    id: 'bookmark',
    action: 'Bookmark the current page',
    category: 'bookmark',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta'], key: 'd', display: '⌘ + D' },
      win: { mods: ['ctrl'], key: 'd', display: 'Ctrl + D' },
    },
    story: 'Save this page as evidence. Bookmark the {creature}\'s last known location.',
    hint1: 'Save this page address to your browser bookmarks folder.',
    hint2: "First letter of 'Done'.",
    hint3: 'Press ⌘ + D',
    ghostAction: 'tries_to_erase_page',
    successAnim: 'bookmark_star_flash',
  },

  {
    id: 'print',
    action: 'Print the current page',
    category: 'page',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta'], key: 'p', display: '⌘ + P' },
      win: { mods: ['ctrl'], key: 'p', display: 'Ctrl + P' },
    },
    story: 'Create a hard copy of the {creature}\'s data signature before it erases itself.',
    hint1: 'Open the print layout options for this page.',
    hint2: "First letter of 'Print'.",
    hint3: 'Press ⌘ + P',
    ghostAction: 'tries_to_self_destruct',
    successAnim: 'print_capture',
  },

  {
    id: 'save',
    action: 'Save the current page',
    category: 'page',
    difficulty: 2,
    frequency: 'weekly',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta'], key: 's', display: '⌘ + S' },
      win: { mods: ['ctrl'], key: 's', display: 'Ctrl + S' },
    },
    story: 'Download the {creature}\'s data before it corrupts. Save the page now!',
    hint1: 'Download and save this page code directly to your local drive.',
    hint2: "First letter of 'Save'.",
    hint3: 'Press ⌘ + S',
    ghostAction: 'corrupting_data',
    successAnim: 'save_download',
  },

  {
    id: 'home_page',
    action: 'Open the home page',
    category: 'nav',
    difficulty: 3,
    frequency: 'rare',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta', 'shift'], key: 'h', display: '⌘ + Shift + H' },
      win: { mods: ['alt'], key: 'Home', display: 'Alt + Home' },
    },
    story: 'Return to base! The {creature} lured you deep — navigate home to regroup.',
    hint1: 'Go directly to your home page preset.',
    hint2: "First letter of 'Home'.",
    hint3: 'Press ⌘ + Shift + H',
    ghostAction: 'lures_deep_into_pages',
    successAnim: 'home_beacon',
  },

  {
    id: 'history',
    action: 'Open History page',
    category: 'nav',
    difficulty: 3,
    frequency: 'rare',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta'], key: 'y', display: '⌘ + Y' },
      win: { mods: ['ctrl'], key: 'h', display: 'Ctrl + H' },
    },
    story: 'Check the browsing history. The {creature} left footprints across your sessions.',
    hint1: 'Open your browser history page to see past sessions.',
    hint2: "Last letter of 'Histor-Y' (Mac) or first letter of 'History' (Win).",
    hint3: 'Press ⌘ + Y (Mac) or Ctrl + H (Win)',
    ghostAction: 'leaves_footprints',
    successAnim: 'history_timeline_reveal',
  },

  {
    id: 'toggle_bookmarks',
    action: 'Toggle the Bookmarks Bar',
    category: 'bookmark',
    difficulty: 3,
    frequency: 'rare',
    interceptable: 'yes',
    keys: {
      mac: { mods: ['meta', 'shift'], key: 'b', display: '⌘ + Shift + B' },
      win: { mods: ['ctrl', 'shift'], key: 'b', display: 'Ctrl + Shift + B' },
    },
    story: 'The {creature} hid behind the bookmarks bar. Toggle it to expose the hiding spot.',
    hint1: 'Show or hide the bookmarks bar strip below the URL bar.',
    hint2: "First letter of 'Bookmarks' + Shift.",
    hint3: 'Press ⌘ + Shift + B',
    ghostAction: 'hides_behind_bookmarks_bar',
    successAnim: 'bookmarks_bar_toggle_reveal',
  },

  {
    id: 'fullscreen',
    action: 'Toggle fullscreen mode',
    category: 'window',
    difficulty: 3,
    frequency: 'rare',
    interceptable: 'simulate',
    keys: {
      mac: { mods: [], key: 'f', display: 'Fn + F' },
      win: { mods: [], key: 'F11', display: 'F11' },
    },
    story: 'The {creature} is hiding in the window chrome. Go fullscreen to eliminate its hiding spots.',
    hint1: 'Make the browser window expand to cover the entire physical screen.',
    hint2: "First letter of 'Fullscreen' (Mac) or functional key F11 (Win).",
    hint3: 'Press Fn + F (Mac) or F11 (Win)',
    ghostAction: 'hides_in_window_frame',
    successAnim: 'fullscreen_expand',
  },
];


// =============================================================
// CAMPAIGN MODES
// =============================================================
//
// Each mode is a filtered, ordered view of the SHORTCUTS array.
// The game engine reads a mode config and plays through its shortcuts.

export const CAMPAIGN = {
  acts: [
    {
      id: 'act1',
      name: 'Browser Basics',
      narrative: 'The {creature} locks your browser down. Learn the essentials to fight back.',
      shortcuts: ['scroll_down', 'find', 'reload', 'address_bar', 'new_tab', 'close_tab'],
      boss: {
        name: 'The Lockdown',
        description: 'Chain three shortcuts to break through the {creature}\'s defenses!',
        combo: ['new_tab', 'address_bar', 'find'],
      },
    },
    {
      id: 'act2',
      name: 'Tab Warfare',
      narrative: 'The {creature} multiplies across your tabs. Hunt every copy.',
      shortcuts: ['next_tab', 'prev_tab', 'reopen_tab', 'jump_tab', 'last_tab'],
      boss: {
        name: 'The Swarm',
        description: 'The {creature} scattered across 5 tabs. Navigate them all to contain it!',
        combo: ['next_tab', 'next_tab', 'prev_tab', 'jump_tab', 'last_tab'],
      },
    },
    {
      id: 'act3',
      name: 'Navigation & Windows',
      narrative: 'The {creature} escapes into other windows and pages. No escape route is safe.',
      shortcuts: ['back', 'forward', 'new_window', 'incognito', 'close_window'],
      boss: {
        name: 'The Escape',
        description: 'The {creature} fled through windows and history. Chase it down!',
        combo: ['new_window', 'back', 'forward', 'close_window'],
      },
    },
    {
      id: 'act4',
      name: 'Page Mastery',
      narrative: 'The {creature} hides in the page content itself. Master the page to corner it.',
      shortcuts: ['scroll_up', 'find_next', 'hard_reload', 'zoom_in', 'zoom_out', 'zoom_reset', 'stop_load', 'bookmark', 'print'],
      boss: {
        name: 'The Final Stand',
        description: 'The {creature} used every trick. Combine your skills to end this!',
        combo: ['find', 'find_next', 'zoom_in', 'hard_reload', 'zoom_reset'],
      },
    },
  ],
};

// Future modes (not yet implemented):
// - speed_run: All shortcuts, random order, timed
// - daily_challenge: 5 random shortcuts, changes daily
// - category_drill: Pick a category, practice just those
// - weak_spots: Replay shortcuts you scored low on


// =============================================================
// HELPERS
// =============================================================

/**
 * Replace {creature} placeholder in any string with the current creature name.
 */
export function renderCreatureText(text) {
  return text.replace(/{creature}/g, CREATURE.name);
}

/**
 * Get the correct key config for the current platform.
 */
export function getPlatform() {
  return navigator.platform?.toLowerCase().includes('mac') ? 'mac' : 'win';
}

/**
 * Detect the Arc browser.
 *
 * Arc injects a set of `--arc-palette-*` CSS custom properties onto the root
 * element. No other browser exposes these, so a non-empty value is a reliable
 * signal. Memoized since the result can't change within a session.
 *
 * This matters because Arc reserves some shortcuts (⌘T, ⌘L) at the browser
 * chrome level — those keydown events never reach the page, so the game can't
 * intercept them. See `arcReserved` on the affected shortcuts.
 */
let _isArc = null;
export function isArc() {
  if (_isArc !== null) return _isArc;
  try {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue('--arc-palette-title');
    _isArc = v.trim() !== '';
  } catch {
    _isArc = false;
  }
  return _isArc;
}

/**
 * Look up a shortcut by its ID.
 */
export function getShortcutById(id) {
  return SHORTCUTS.find(s => s.id === id) || null;
}

/**
 * Get all shortcuts for a given category.
 */
export function getShortcutsByCategory(category) {
  return SHORTCUTS.filter(s => s.category === category);
}

/**
 * Get all shortcuts for a given act in the campaign.
 */
export function getActShortcuts(actId) {
  const act = CAMPAIGN.acts.find(a => a.id === actId);
  if (!act) return [];
  return act.shortcuts.map(id => getShortcutById(id)).filter(Boolean);
}
