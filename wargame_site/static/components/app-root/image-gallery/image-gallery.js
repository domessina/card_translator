const galleryHtml = await fetch(new URL('./image-gallery.html', import.meta.url)).then(r => r.text());
const galleryCss = await fetch(new URL('./image-gallery.css', import.meta.url)).then(r => r.text());

const galleryTemplate = document.createElement('template');
galleryTemplate.innerHTML = `<style>${galleryCss}</style>${galleryHtml}`;

class ImageGallery extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(galleryTemplate.content.cloneNode(true));
    this.imageUpload = this.shadowRoot.getElementById('imageUpload');
    this.imageGrid = this.shadowRoot.getElementById('imageGrid');
    this.gridCounter = this.shadowRoot.getElementById('gridCounter');
    this.images = [];
  }

  connectedCallback() {
    this.imageUpload.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      this.dispatchEvent(new CustomEvent('images-chosen', { detail: { files } }));
    });
  }

  setImages(files) {
    this.images = files;
    this.renderGrid();
  }

  setSelectedIndex(idx) {
    this.imageGrid.querySelectorAll('img').forEach(img => img.classList.remove('selected'));
    const selected = this.imageGrid.querySelector(`img[data-index='${idx}']`);
    if (selected) selected.classList.add('selected');
    this.gridCounter.textContent = this.images.length ? `${idx + 1} / ${this.images.length}` : '';
  }

  renderGrid() {
    this.imageGrid.innerHTML = '';
    this.images.forEach((file, idx) => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.dataset.index = idx;
      img.title = file.name;
      img.addEventListener('click', () => this.dispatchEvent(new CustomEvent('image-selected', { detail: { index: idx } })));
      this.imageGrid.appendChild(img);
    });
    if (this.images.length) this.setSelectedIndex(0);
    else this.gridCounter.textContent = '';
  }
}

customElements.define('ct-image-gallery', ImageGallery);
