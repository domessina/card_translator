const controlsHtml = await fetch(new URL('./controls-panel.html', import.meta.url)).then(r => r.text());
const controlsCss = await fetch(new URL('./controls-panel.css', import.meta.url)).then(r => r.text());
const controlsTemplate = document.createElement('template');
controlsTemplate.innerHTML = `<style>${controlsCss}</style>${controlsHtml}`;

class ControlsPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(controlsTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    this.shadowRoot.getElementById('resetBtn').addEventListener('click', () => this.emit('reset'));
    this.shadowRoot.getElementById('downloadBtn').addEventListener('click', () => this.emit('download'));
    this.shadowRoot.getElementById('validateBtn').addEventListener('click', () => this.emit('validate'));
    this.shadowRoot.getElementById('compareBtn').addEventListener('click', () => this.emit('compare'));
    this.shadowRoot.getElementById('downloadAllBtn').addEventListener('click', () => this.emit('download-all'));
  }

  emit(name) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }
}

customElements.define('ct-controls-panel', ControlsPanel);
