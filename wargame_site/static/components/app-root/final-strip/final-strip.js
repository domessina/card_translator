const stripHtml = await fetch(new URL('./final-strip.html', import.meta.url)).then(r => r.text());
const stripCss = await fetch(new URL('./final-strip.css', import.meta.url)).then(r => r.text());
const stripTemplate = document.createElement('template');
stripTemplate.innerHTML = `<style>${stripCss}</style>${stripHtml}`;

class FinalStrip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(stripTemplate.content.cloneNode(true));
    this.strip = this.shadowRoot.getElementById('strip');
  }

  addThumbnail(dataUrl, filename) {
    const container = document.createElement('div');
    container.className = 'thumbnail-container';

    const img = document.createElement('img');
    img.title = filename;
    img.src = dataUrl;
    img.addEventListener('dblclick', () => window.open(dataUrl, '_blank'));
    container.appendChild(img);

    const btn = document.createElement('button');
    btn.textContent = '🗑️';
    btn.className = 'delete-btn';
    btn.onclick = () => {
      this.strip.removeChild(container);
      this.dispatchEvent(new CustomEvent('thumbnail-removed', { detail: { dataUrl }, bubbles: true, composed: true }));
    };
    container.appendChild(btn);

    this.strip.appendChild(container);
  }
}

customElements.define('ct-final-strip', FinalStrip);
