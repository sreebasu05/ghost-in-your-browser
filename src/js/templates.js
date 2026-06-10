/**
 * templates.js — Reusable HTML layouts
 */

export function getSystemEventLogHTML(ghostWordId = '', isScrollable = false, reverseOrder = false) {
  const idAttr1 = ghostWordId ? `id="${ghostWordId}-1"` : '';
  const idAttr2 = ghostWordId ? `id="${ghostWordId}-2"` : '';
  const heightStyle = isScrollable ? 'height: 200%;' : 'height: 100%;';
  const selectPage = document.getElementById('start-page-2');
  const selectPageHtml = selectPage ? selectPage.innerHTML : '';

  const eventLogHtml = `
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
    </div>`;

  const selectPageWrapperHtml = isScrollable ? `<div class="start-page" id="start-page-2"><div class="act-menu" style="width: 100%;">${selectPageHtml}</div></div>` : '';

  return `
    <div style="display: flex; flex-direction: column; width: 100%; ${heightStyle}">
      <style>
        #view-game .start-page { flex: 0 0 100% !important; height: 100% !important; min-height: 100% !important; }
        ${isScrollable ? '#view-game .start-page { flex: 0 0 50% !important; height: 50% !important; min-height: 50% !important; }' : ''}
      </style>
      ${reverseOrder ? eventLogHtml + selectPageWrapperHtml : selectPageWrapperHtml + eventLogHtml}
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

export function getNewTabHTML() {
  return `
    <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #18181c; color: #fff; font-family: 'Inter', sans-serif; padding: 20px; box-sizing: border-box; user-select: none;">
      <div style="font-size: 54px; font-weight: 700; margin-bottom: 30px; letter-spacing: -1.5px; background: linear-gradient(90deg, #B331F1, #da7dfc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 15px rgba(179,49,241,0.25)); font-family: 'JetBrains Mono', monospace;">
        New Tab
      </div>
      <div style="display: flex; align-items: center; background: #222227; border: 1px solid rgba(255,255,255,0.06); border-radius: 28px; padding: 12px 24px; width: 100%; max-width: 500px; margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#666" stroke-width="2.5" style="margin-right: 12px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Search the web or type a URL" style="background: transparent; border: none; outline: none; color: #fff; width: 100%; font-size: 15px;" readonly>
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; width: 100%; max-width: 440px;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #222227; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 1px solid rgba(255,255,255,0.06);">🐈</div>
          <span style="font-size: 11px; color: #888;">GitHub</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #222227; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 1px solid rgba(255,255,255,0.06);">📺</div>
          <span style="font-size: 11px; color: #888;">YouTube</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #222227; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 1px solid rgba(255,255,255,0.06);">💬</div>
          <span style="font-size: 11px; color: #888;">Discord</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #222227; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 1px solid rgba(255,255,255,0.06);">👻</div>
          <span style="font-size: 11px; color: #888;">Ghost</span>
        </div>
      </div>
    </div>`;
}

export function getIncognitoPageHTML() {
  return `
    <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0c0a0f; color: #e2dcf0; font-family: 'Inter', sans-serif; padding: 40px; box-sizing: border-box; text-align: center; position: relative; user-select: none;">
      <div style="background: rgba(179, 49, 241, 0.08); border: 1px solid rgba(179, 49, 241, 0.2); border-radius: 50%; width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 0 25px rgba(179, 49, 241, 0.25);">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#B331F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4.5"></path><path d="M12 10.5v8"></path><circle cx="7" cy="14" r="3.5"></circle><circle cx="17" cy="14" r="3.5"></circle><path d="M10.5 14h3"></path><path d="M2 10.5h20"></path></svg>
      </div>
      <h2 style="font-size: 26px; font-weight: 600; margin-bottom: 12px; color: #fff; letter-spacing: -0.5px; font-family: 'JetBrains Mono', monospace;">You've gone incognito</h2>
      <p style="font-size: 13px; color: #a49db2; max-width: 520px; line-height: 1.6; margin-bottom: 30px;">
        Now you can browse privately, and other people who use this device won't see your activity. However, downloads, bookmarks and reading list items will still be saved.
      </p>
      
      <!-- Ghost containment area -->
      <div class="incognito-container" style="position: relative; display: flex; align-items: center; justify-content: center; width: 140px; height: 140px; border: 2px dashed rgba(179, 49, 241, 0.3); border-radius: 12px; background: rgba(179, 49, 241, 0.02); margin-top: 10px;">
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: rgba(179, 49, 241, 0.5); font-weight: bold; letter-spacing: 1.5px; position: absolute; bottom: 12px;">CONTAINMENT ZONE</span>
      </div>
    </div>`;
}
