export function initializeCardEditor(root) {
  if (!['localhost','127.0.0.1'].includes(location.hostname)) return;
  const card = root.querySelector('#formation .formation-sheet');
  if (!card) return;
  const key = 'formation-card-layout-v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
  const heading = card.querySelector('.sheet-heading');
  for (const node of [...heading.childNodes]) {
    if (node.nodeType === 3 && node.textContent.trim()) {
      const span = document.createElement('span'); span.textContent = node.textContent; node.replaceWith(span);
    }
  }
  const items = [...card.querySelectorAll('.sheet-heading>img,.sheet-heading>span,.sheet-heading>outline-text,.mini-behavior>img,.mini-behavior>span,.pair-plus')];
  let positions = structuredClone(saved);
  const apply = () => items.forEach((el,i) => {
    const p = positions[i];
    if (!p) { el.style.removeProperty('transform'); return; }
    el.style.transform = `translate(${p.x * card.clientWidth}px,${p.y * card.clientWidth}px)`;
  });
  new ResizeObserver(apply).observe(card);
  apply();
  if (new URLSearchParams(location.search).get('layout') !== '1') return;
  const style = document.createElement('style');
  style.textContent = `.layout-editor{padding:12px;margin:0 0 14px;background:#fff8e5;border:1px solid #d8bb64;border-radius:8px;font:14px/1.5 Arial,sans-serif;color:#263238}.layout-editor p{margin:0 0 8px}.layout-editor button{font:14px Arial,sans-serif;padding:7px 12px;margin:0 6px 4px 0;background:white;border:1px solid #89969b;border-radius:5px}.layout-editor [role=status]{display:block;margin-top:5px}.layout-editing{position:relative;overflow:visible!important;outline:2px dashed #c39828;outline-offset:4px}.layout-editing .layout-item{position:relative;cursor:grab;touch-action:none;user-select:none;outline:1px dashed #8c9fa6;outline-offset:3px}.layout-editing .layout-item:hover,.layout-editing .layout-item:focus{outline:2px solid #be8b12;z-index:5}.layout-editing .layout-item:active{cursor:grabbing}`;
  root.append(style);
  card.classList.add('layout-editing');
  const panel = document.createElement('div'); panel.className='layout-editor';
  panel.innerHTML='<p><strong>카드 위치 편집</strong> · 아이콘·글자·+를 드래그하세요.<br>선택 후 방향키로 미세 조정 · Shift는 10px</p><button type="button" data-save>저장</button><button type="button" data-undo>저장한 배치로</button><button type="button" data-reset>초기화</button><span role="status">배치는 이 브라우저에만 저장됩니다.</span>';
  root.querySelector('#formation .experiment').before(panel);
  const status = panel.querySelector('[role=status]');
  const changed = () => {apply();status.textContent='변경됨 · 저장 버튼을 눌러주세요.';};
  items.forEach((el,i) => {
    el.classList.add('layout-item'); el.tabIndex=0; el.draggable=false;
    el.setAttribute('aria-label', (el.textContent.trim() || el.alt || '아이콘')+' 위치 조절');
    let drag;
    el.addEventListener('pointerdown',e=>{
      if(e.button!==0)return; e.preventDefault();el.focus();el.setPointerCapture(e.pointerId);
      drag={x:e.clientX,y:e.clientY,start:{...(positions[i]||{x:0,y:0})}};
    });
    el.addEventListener('pointermove',e=>{if(!drag)return;
      positions[i]={x:drag.start.x+(e.clientX-drag.x)/card.clientWidth,y:drag.start.y+(e.clientY-drag.y)/card.clientWidth};changed();
    });
    const end=()=>{drag=null;};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',end);
    el.addEventListener('keydown',e=>{
      const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!d)return;e.preventDefault();
      const p=positions[i]||{x:0,y:0},step=(e.shiftKey?10:1)/card.clientWidth;
      positions[i]={x:p.x+d[0]*step,y:p.y+d[1]*step};changed();
    });
  });
  panel.querySelector('[data-save]').onclick=()=>{try{localStorage.setItem(key,JSON.stringify(positions));saved=structuredClone(positions);status.textContent='저장됨 · 새로고침해도 유지됩니다.';}catch{status.textContent='브라우저 저장 실패 · 배치를 유지한 채 다시 시도하세요.';}};
  panel.querySelector('[data-undo]').onclick=()=>{positions=structuredClone(saved);apply();status.textContent='저장한 배치로 복원했습니다.';};
  panel.querySelector('[data-reset]').onclick=()=>{positions={};changed();};
  panel.scrollIntoView({block:'start'});
}
