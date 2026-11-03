import { initializeTextArtwork } from '../text-art.js?v=outline-1';
import { initializeCardEditor } from './card-layout-editor.js?v=outline-1';
import { initializeFigure } from './demo.js?v=bft-response-1';

const base = new URL('./', import.meta.url);
const templateRequest = fetch(new URL('figure-template.html?v=selective-hint-2', base))
  .then(response => {
    if (!response.ok) throw new Error(`Figure template: ${response.status}`);
    return response.text();
  });

async function mountFigure(host) {
  const target = host.dataset.figure;
  const template = document.createElement('template');
  template.innerHTML = await templateRequest;
  const wrapper = template.content.querySelector('.figure-body');
  wrapper.hidden = true;
  wrapper.querySelectorAll('header, .switcher, footer').forEach(el => el.hidden = true);
  wrapper.querySelectorAll('main > section').forEach(section => {
    section.hidden = section.id !== target;
    const caption = section.querySelector('.section-heading p');
    caption.classList.add('interaction-caption');
    if (section.id === 'formation') {
      section.insertBefore(caption, section.querySelector('.condition-map'));
      caption.style.padding = '0 0 12px';
    } else if (section.id === 'composition') {
      section.querySelector('.composition-documents').append(caption);
    } else if (section.id === 'selective') {
      caption.textContent = 'Choose a BFT example to see the result.';
      section.querySelector('.prompt-row.bft-question').append(caption);
    } else {
      section.append(caption);
    }
    if (section.id !== 'formation') section.querySelector('.section-heading').hidden = true;
  });
  // Put the shadow outside the clipped paper silhouette.
  wrapper.querySelectorAll('.document-set').forEach(card => {
    const shell = document.createElement('div');
    shell.className = 'document-shadow';
    card.before(shell);
    shell.append(card);
  });
  wrapper.querySelectorAll('[src]').forEach(el => {
    el.setAttribute('src', new URL(el.getAttribute('src'), base).href);
  });

  // Shadow DOM isolates the paper figure styles without a nested viewport.
  const shadow = host.attachShadow({ mode: 'open' });
  const fallback = document.createElement('slot');
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('inline-figures.css?v=outline-1', base).href;
  const ready = new Promise((resolve, reject) => {
    stylesheet.addEventListener('load', resolve, { once: true });
    stylesheet.addEventListener('error', reject, { once: true });
  });
  shadow.append(fallback, stylesheet, wrapper);
  try {
    await ready;
    initializeFigure(shadow, new URL('assets/', base));
    await initializeTextArtwork(shadow);
    wrapper.hidden = false;
    fallback.remove();
    host.replaceChildren();
    if (target === 'formation') initializeCardEditor(shadow);
  } catch (error) {
    wrapper.remove();
    throw error;
  }
}

document.querySelectorAll('[data-figure]').forEach(host => {
  mountFigure(host).catch(error => console.error('Could not initialize interactive figure:', error));
});
