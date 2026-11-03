// Fixed phrase artwork only; no font files or reusable character outlines.
const artworkBase = new URL('./text-art/', import.meta.url);
const manifestRequest = fetch(new URL('manifest.json', artworkBase)).then(response => {
  if (!response.ok) throw new Error(`Text artwork: ${response.status}`);
  return response.json();
});
const svgNS = 'http://www.w3.org/2000/svg';
const normalize = text => text.replace(/\s+/g, ' ').trim();
const styleText = `
outline-text { display:inline; position:relative; font-family:Arial,sans-serif; }
outline-text .outline-accessible { position:absolute!important; width:1px!important; height:1px!important; padding:0!important; margin:-1px!important; overflow:hidden!important; clip-path:inset(50%)!important; white-space:nowrap!important; border:0!important; font:inherit!important; }
outline-text svg.outline-word { display:inline-block; height:1.285em; vertical-align:-.265em; overflow:visible; fill:currentColor; stroke:none; max-width:none; pointer-events:none; }
@media print { outline-text svg.outline-word { print-color-adjust:exact; } }
`;
export async function initializeTextArtwork(root) {
  const manifest = await manifestRequest;
  const style = document.createElement('style');
  style.textContent = styleText;
  (root === document ? document.head : root).append(style);
  const host = root === document ? document.body : root;
  const missing = new Set();
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; paint(); });
  });
  function paint() {
    observer.disconnect();
    try {
      const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const parent = node.parentElement;
        if (!parent || parent.closest('outline-text,svg,script,style,textarea,pre,code,[contenteditable]') || !normalize(node.data)) continue;
        if (!getComputedStyle(parent).fontFamily.includes('FigureArtwork')) continue;
        nodes.push(node);
      }
      for (const node of nodes) {
        const text = normalize(node.data);
        const transform = getComputedStyle(node.parentElement).textTransform;
        const painted = transform === 'uppercase' ? text.toUpperCase() : transform === 'lowercase' ? text.toLowerCase() : text;
        if (!manifest[painted]) {
          if (!missing.has(painted)) { console.warn('Missing fixed text artwork:', painted); missing.add(painted); }
          continue;
        }
        const wrapper = document.createElement('outline-text');
        wrapper.dataset.copy = text;
        wrapper.dataset.art = painted;
        const pieces = [];
        if (/^\s/.test(node.data)) pieces.push(document.createTextNode(' '));
        pieces.push(wrapper);
        if (/\s$/.test(node.data)) pieces.push(document.createTextNode(' '));
        node.replaceWith(...pieces);
      }
      for (const wrapper of host.querySelectorAll('outline-text')) {
        const weight = Number(getComputedStyle(wrapper).fontWeight) >= 600 ? '700' : '400';
        if (wrapper.dataset.weight === weight) continue;
        const entry = manifest[wrapper.dataset.art][weight];
        const accessible = document.createElement('span');
        accessible.className = 'outline-accessible';
        accessible.textContent = wrapper.dataset.copy;
        const content = [accessible];
        entry.widths.forEach((width, i) => {
          if (i) content.push(document.createTextNode(' '));
          if (entry.fallbacks?.[i]) {
            const symbol = document.createElement('outline-symbol');
            symbol.setAttribute('aria-hidden', 'true');
            symbol.textContent = entry.fallbacks[i];
            content.push(symbol);
            return;
          }
          const svg = document.createElementNS(svgNS, 'svg');
          svg.classList.add('outline-word');
          svg.setAttribute('viewBox', `0 -1020 ${width * 1000} 1285`);
          svg.setAttribute('width', `${width}em`);
          svg.setAttribute('height', '1.285em');
          svg.setAttribute('aria-hidden', 'true');
          svg.setAttribute('focusable', 'false');
          const use = document.createElementNS(svgNS, 'use');
          use.setAttribute('href', new URL(`${entry.file}#w${i}`, artworkBase).href);
          svg.append(use);
          content.push(svg);
        });
        wrapper.style.wordSpacing = `${entry.space - 0.277832}em`;
        wrapper.replaceChildren(...content);
        wrapper.dataset.weight = weight;
      }
    } finally {
      observer.observe(host, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['class','aria-pressed','data-phase','hidden']});
    }
  }
  paint();
}
initializeTextArtwork(document).catch(error => console.error('Could not load fixed text artwork:', error));
