# Ghost in Your Browser 👻

An interactive, gamified keyboard shortcut trainer designed to turn browser navigation into an immersive cyber-survival experience.

🎮 **Play the game live:** [ghost-in-your-browser.vercel.app](https://ghost-in-your-browser.vercel.app/) 

When a rogue ghost daemon hijacks your pointer and disconnects your mouse, you are forced to navigate the interface, restore browser operations, and track down the entity using **keyboard shortcuts alone**.

---

## 🎯 The Purpose

Many users rely heavily on mouse clicking for basic browser operations, slowing down their workflow. **Ghost in Your Browser** teaches essential and advanced web browser keyboard shortcuts through immediate, gameplay-driven reinforcement. 

By forcing the player to intercept a glitched ghost running rampant inside a simulated browser container, the game builds muscle memory for core shortcuts (tab management, window control, viewport scaling, history navigation, and search scan commands) in a fun, retro-hacker terminal aesthetic.

---

## 🛠️ Technology Stack

*   **Core**: HTML5, Vanilla ES6 JavaScript (logic, event capture, coordinates calculation).
*   **Styling**: Vanilla CSS3 using custom properties (supporting cyber-glow theme shifts and a CRT terminal vibe).
*   **Bundler**: Vite (for fast hot reloading and minified static asset distribution).
*   **Target Environments**: Designed for desktop browsers (Chrome / macOS & Windows).

---

## 🕹️ Game Structure (The Acts)

The game is divided into four sequential Acts, each introducing progressively advanced shortcut mechanics:

1.  **Act 1: Browser Basics**  
    Learn tab creation (`⌘+T`), closing active pages (`⌘+W`), reloading crashed/static sites (`⌘+R`), finding page terms (`⌘+F`), page scrolling (`Space`), and URL focus (`⌘+L`).
2.  **Act 2: Tab Warfare**  
    Manage a crowded tab strip. Switch tabs right/left (`Ctrl+Tab` / `Ctrl+Shift+Tab`), restore closed windows (`⌘+Shift+T`), and perform targeted tab jumps (`⌘+1` to `⌘+8`). *Be careful: the ghost will scramble your tabs if you try to cheat!*
3.  **Act 3: Navigation & Windows**  
    Control browser history (Back `⌘+[` / Forward `⌘+]`), spawn separate browser windows (`⌘+N`), open private sessions to avoid cookie-tracking (`⌘+Shift+N`), and close active windows (`⌘+Shift+W`).
4.  **Act 4: Page Mastery**  
    Manipulate advanced viewport coordinates. Scroll up to follow target paths (`Shift+Space`), jump to search matches (`Enter`), reload without cache (`⌘+Shift+R`), halt infinite spinner pages (`Escape`), scale the viewport zoom (`⌘+=` / `⌘+-` / `⌘+0`), and trigger a print pipeline purge (`⌘+P`).

For detailed programmatic guides on each level's setups, onSuccess callbacks, and ghost states, refer to the [Gameplay & Mechanics Guide](GAMEPLAY_MECHANICS.md).

---

## 🚀 Running Locally

Follow these steps to launch the game on your local computer:

### 1. Install Dependencies
Make sure you have Node.js installed, then run:
```bash
npm install
```

### 2. Start the Development Server
Launch the local dev environment with Vite:
```bash
npm run dev
```
Open the local URL (usually `http://localhost:5173`) in your web browser.

### 3. Build for Production
To bundle and optimize the static assets for hosting (such as on Vercel):
```bash
npm run build
```
This generates a clean, ready-to-deploy folder called `dist/`.

---

## 💻 Playing Guidelines

*   **Go Fullscreen**: For the best immersion and to prevent native OS shortcuts from conflicting with the game's simulated browser, play the game in your browser's **Full Screen** mode.
*   **Disable Chrome Toolbar (macOS)**: If playing in Google Chrome on Mac, go to the top menu and uncheck **View → Always Show Toolbar in Full Screen** so that window-height changes don't distort alignment.
