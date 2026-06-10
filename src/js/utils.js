/**
 * utils.js — Reusable helper utilities and transition animations
 */

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function triggerTextShatter(parentElement) {
  const textNodes = parentElement.querySelectorAll('p, h1, h2, span, div, kbd');
  textNodes.forEach((node) => {
    if (node.children.length === 0 && node.textContent.trim().length > 0) {
      const delayVal = Math.random() * 0.4;
      const rotate = (Math.random() - 0.5) * 60;
      setTimeout(() => {
        node.style.transition = `transform 1.2s cubic-bezier(0.55, 0.085, 0.68, 0.53) ${delayVal}s, opacity 1.2s ease ${delayVal}s`;
        node.style.transform = `translateY(500vh) rotate(${rotate}deg)`;
        node.style.opacity = '0';
      }, 50);
    }
  });
}

export async function fadeViewOut(viewElement, duration = 2000) {
  viewElement.style.transition = `opacity ${duration / 1000}s ease-in-out`;
  viewElement.style.opacity = '0';
  await delay(duration);
}
