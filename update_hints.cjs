const fs = require('fs');

let content = fs.readFileSync('src/data/shortcuts.js', 'utf8');

const replacements = {
  'new_tab': "Think 'T' for Tab",
  'close_tab': "Think 'W' for Window/Wipe",
  'reload': "Think 'R' for Reload",
  'address_bar': "Think 'L' for Location",
  'bookmark': "Think 'D' for... well, it's just D",
  'find': "Think 'F' for Find",
  'scroll_down': "It's the biggest key on your keyboard",
  'jump_tab': "Numbers 1-8 go to specific tabs",
  'next_tab': "Option/Alt + Cmd/Ctrl + Right arrow",
  'prev_tab': "Option/Alt + Cmd/Ctrl + Left arrow",
  'reopen_tab': "Shift the new tab shortcut",
  'incognito': "Shift the new window shortcut (N)",
  'new_window': "Think 'N' for New window",
  'history': "Think 'Y' for Histor-Y",
  'downloads': "Think 'J' for... just downloads",
  'zoom_in': "Think '+' for bigger",
  'zoom_out': "Think '-' for smaller",
  'zoom_reset': "Think '0' for default",
  'devtools': "Think 'I' for Inspect",
  'view_source': "Think 'U' for Underlying code",
  'clear_data': "Backspace/Delete with modifiers"
};

content = content.replace(/id:\s*'([^']+)'[\s\S]*?hint2:\s*'[^']*'/g, (match, id) => {
  if (replacements[id]) {
    return match.replace(/hint2:\s*'[^']*'/, `hint2: '${replacements[id]}'`);
  }
  return match;
});

fs.writeFileSync('src/data/shortcuts.js', content);
console.log('Hints updated');
