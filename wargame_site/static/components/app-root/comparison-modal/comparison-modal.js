const modalHtml = await fetch(new URL('./comparison-modal.html', import.meta.url)).then(r => r.text());
const modalCss = await fetch(new URL('./comparison-modal.css', import.meta.url)).then(r => r.text());
const modalTemplate = document.createElement('template');
modalTemplate.innerHTML = `<style>${modalCss}</style>${modalHtml}`;

class ComparisonModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(modalTemplate.content.cloneNode(true));
    this.modal = this.shadowRoot.getElementById('modal');
    this.originalImg = this.shadowRoot.getElementById('comparisonOriginal');
    this.translatedImg = this.shadowRoot.getElementById('comparisonTranslated');
  }

  connectedCallback() {
    this.shadowRoot.getElementById('closeComparison').addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hide();
    });
  }

  show(originalUrl, translatedUrl) {
    this.originalImg.src = originalUrl;
    this.translatedImg.src = translatedUrl;
    this.modal.style.display = 'flex';
  }

  hide() {
    this.modal.style.display = 'none';
  }
}

customElements.define('ct-comparison-modal', ComparisonModal);
