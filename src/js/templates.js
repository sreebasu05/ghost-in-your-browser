/**
 * templates.js — Reusable HTML layouts
 */

export function getSystemEventLogHTML(ghostWordId = '', isScrollable = false) {
  const idAttr1 = ghostWordId ? `id="${ghostWordId}-1"` : '';
  const idAttr2 = ghostWordId ? `id="${ghostWordId}-2"` : '';
  const heightStyle = isScrollable ? 'height: 300%;' : 'height: 200%;';
  const selectPage = document.getElementById('start-page-2');
  const selectPageHtml = selectPage ? selectPage.innerHTML : '';

  return `
    <div style="display: flex; flex-direction: column; width: 100%; ${heightStyle}">
      <style>
        #view-game .start-page { flex: 0 0 50% !important; height: 50% !important; min-height: 50% !important; }
        ${isScrollable ? '#view-game .start-page { flex: 0 0 33.333% !important; height: 33.333% !important; min-height: 33.333% !important; }' : ''}
      </style>
      <div class="start-page" style="justify-content: flex-start; padding-top: 60px;">
        <div style="padding:24px; max-width: 700px; text-align: left; width: 100%;">
          <p style="color:var(--text-content-muted);margin-bottom:16px;">&gt; System Event Log...</p>
          <p style="color:var(--text-content-muted);margin-bottom:4px;">&gt; Process 0x8B5CF6 attempted to evade detection</p>
          <p style="color:var(--text-content-muted);margin-bottom:4px;">&gt; Attempting visual lock... FAILED</p>
          <p style="color:var(--color-error);margin-bottom:4px;">&gt; Target went INVISIBLE</p>
          <p style="color:var(--text-content-muted);margin-bottom:16px;">&gt; Recommend: search scan to locate hidden entities</p>
          <p style="color:var(--text-content-muted);">---</p>
          <p style="color:var(--text-content-muted);margin-top:12px; line-height: 1.6;">
            The system kernel identified anomalies in the sector cache. Data fragments scattered across the memory pool suggest a hidden presence. 
            While executing routine garbage collection, the daemon process encountered an unhandled exception triggered by a malicious <span class="ghost-hidden-word" ${idAttr1}>GHOST</span> entity.
            This entity operates by intercepting DOM painting cycles and rewriting the display buffer before frames are rendered.
            Administrators are advised to initiate a manual search protocol to isolate the rogue <span class="ghost-hidden-word" ${idAttr2}>GHOST</span> thread.
            Failure to do so will result in cascading visual artifacts and potential corruption of the active viewport.
          </p>
        </div>
      </div>
      ${isScrollable ? selectPageHtml : ''}
    </div>`;
}

export function getGhostgleHTML(searchValue = "how to exorcise a browser window") {
  return `
    <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #202124; color: #e8eaed; font-family: arial, sans-serif;">
      <div style="font-size: 80px; font-weight: bold; letter-spacing: -2px; margin-bottom: 24px; text-shadow: 0 0 20px rgba(179, 49, 241, 0.4);">
        <span class="gg-g">G</span><span class="gg-h">h</span><span class="gg-o">o</span><span class="gg-s">s</span><span class="gg-t">t</span><span class="gg-g2">g</span><span class="gg-l">l</span><span class="gg-e">e</span>
      </div>
      <div style="display: flex; align-items: center; background: #303134; border: 1px solid #5f6368; border-radius: 24px; padding: 10px 20px; width: 100%; max-width: 584px; margin-bottom: 24px;">
        <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: #9aa0a6; width: 20px; height: 20px; margin-right: 12px;"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>
        <input type="text" style="background: transparent; border: none; outline: none; color: #e8eaed; width: 100%; font-size: 16px;" value="${searchValue}" readonly>
        <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-left: 8px;">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="var(--ghost-color)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C7.03 2 3 6.03 3 11v11a1 1 0 0 0 1.7.7l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4 0l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4 0l2.3-2.3 2.3 2.3a1 1 0 0 0 1.7-.7V11c0-4.97-4.03-9-9-9z"></path></svg>
        </div>
      </div>
      <div style="display: flex; gap: 12px;">
        <button style="background: #303134; border: 1px solid #303134; border-radius: 4px; color: #e8eaed; font-family: arial, sans-serif; font-size: 14px; padding: 10px 16px; cursor: default;">Ghost Search</button>
        <button style="background: #303134; border: 1px solid #303134; border-radius: 4px; color: #e8eaed; font-family: arial, sans-serif; font-size: 14px; padding: 10px 16px; cursor: default;">I'm Feeling Spooky</button>
      </div>
    </div>`;
}

export function wrapSelectPageHTML() {
  const selectPage = document.getElementById('start-page-2');
  const innerHtml = selectPage ? selectPage.innerHTML : '';
  return `
    <div class="start-page" style="height: 100%; min-height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <div class="act-menu" style="width: 100%;">
        ${innerHtml}
      </div>
    </div>`;
}

export function getGibberishHTML(isIncognito = false) {
  const bg = isIncognito ? '#09090b' : '#18181c';
  const color = isIncognito ? '#4c1d95' : '#6a3482';
  const glow = isIncognito ? 'rgba(124, 58, 237, 0.4)' : 'rgba(179, 49, 241, 0.5)';
  const textColor = isIncognito ? '#8b5cf6' : '#a78bfa';
  
  if (isIncognito) {
    return `
      <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; overflow: hidden; user-select: none; position: relative;">
        <!-- Ring of Huge Numbers surrounding the ghost in incognito -->
        <div class="incognito-container" style="position: relative; display: flex; align-items: center; justify-content: center; width: 450px; height: 450px; z-index: 2;">
          <div class="huge-numbers-ring" style="position: absolute; inset: 0; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 84px; color: rgba(179, 49, 241, 0.15); display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); text-align: center; align-items: center;">
            <div>8</div> <div>3</div> <div>0</div>
            <div>5</div> <div style="font-size: 20px; color: transparent;">GHOST</div>  <div>9</div>
            <div>2</div> <div>7</div> <div>1</div>
          </div>
          <!-- Glowing containment circle in the center -->
          <div style="width: 120px; height: 120px; border-radius: 50%; border: 3px dashed rgba(179, 49, 241, 0.4); box-shadow: 0 0 30px rgba(179, 49, 241, 0.15); display: flex; align-items: center; justify-content: center;">
            <span style="font-family: monospace; font-size: 10px; color: rgba(179, 49, 241, 0.5); letter-spacing: 1px;">CONTAINED</span>
          </div>
        </div>
      </div>`;
  }

  return `
    <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; color: ${color}; font-family: monospace; padding: 40px; overflow: hidden; user-select: none; position: relative;">
      <div style="position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center;">
        <h2 class="distorted-page" style="font-size: 32px; margin-bottom: 20px; color: #B331F1; text-shadow: 0 0 10px ${glow};">01000111 01001000 01001111 01010011 01010100</h2>
        <p style="color: ${textColor}; font-size: 14px; text-align: center; max-width: 500px; line-height: 1.6;">
          ERR_CORRUPT_HISTORY: Memory pointer out of bounds. The previous session is glitched. Exorcise the rendering pipeline.
        </p>
      </div>
    </div>`;
}
