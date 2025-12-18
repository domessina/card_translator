import './image-gallery/image-gallery.js';
import './preview-panel/preview-panel.js';
import './controls-panel/controls-panel.js';
import './settings-panel/settings-panel.js';
import './final-strip/final-strip.js';
import './comparison-modal/comparison-modal.js';

const appHtml = await fetch(new URL('./app-root.html', import.meta.url)).then(r => r.text());
const appCss = await fetch(new URL('./app-root.css', import.meta.url)).then(r => r.text());
const appTemplate = document.createElement('template');
appTemplate.innerHTML = `<style>${appCss}</style>${appHtml}`;

class CardTranslatorApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(appTemplate.content.cloneNode(true));
        this.images = [];
        this.htmlFiles = [];
        this.currentIndex = 0;
        this.savedImages = [];
        this.paragraphMargin = 10;
        this.currentFont = "'Arial', serif";
        this.currentFontSize = 14;
        this.selectedColor = 'transparent';
        this.customColor = false;
        this.isLoading = false;
        this.persistSelection = false;
        this.savedSelection = null;
        this.isAutoTranslating = false;
        this.fontSizeLocked = false;
        this.defaultLoaderText = 'Please wait...';
    }

    connectedCallback() {
        this.gallery = this.shadowRoot.getElementById('gallery');
        this.preview = this.shadowRoot.getElementById('preview');
        this.controls = this.shadowRoot.getElementById('controls');
        this.settings = this.shadowRoot.getElementById('settings');
        this.finalStrip = this.shadowRoot.getElementById('finalStrip');
        this.comparisonModal = this.shadowRoot.getElementById('comparisonModal');
        this.loader = this.shadowRoot.getElementById('loader');

        this.gallery.addEventListener('images-chosen', (e) => this.handleImages(e.detail.files));
        this.gallery.addEventListener('image-selected', (e) => this.switchToIndex(e.detail.index));

        this.settings.addEventListener('html-files-chosen', (e) => this.handleHtmlFiles(e.detail.files));
        this.settings.addEventListener('html-changed', (e) => this.updateHtml(e.detail.html));
        this.settings.addEventListener('pipette-activate', () => this.preview.activatePipette());
        this.settings.addEventListener('rounded-changed', (e) => this.preview.setRoundedCorners(e.detail.value));
        this.settings.addEventListener('padding-changed', (e) => this.preview.setHighlightPadding(e.detail.value));
        this.settings.addEventListener('selection-persist-change', (e) => this.toggleSelectionPersistence(e.detail.enabled));
        this.settings.addEventListener('font-file-chosen', (e) => this.loadFont(e.detail.file));
        this.settings.addEventListener('font-size-change', (e) => this.changeFontSize(e.detail.delta));
        this.settings.addEventListener('font-size-lock-change', (e) => this.setFontSizeLock(e.detail.locked));
        this.settings.addEventListener('paragraph-change', (e) => this.adjustParagraphMargin(e.detail.delta));
        this.settings.addEventListener('translate', () => this.translateSelection());

        this.preview.addEventListener('color-auto-picked', (e) => this.setColor(e.detail.color, false));
        this.preview.addEventListener('color-picked', (e) => this.setColor(e.detail.color, true));
        this.preview.addEventListener('font-size-updated', (e) => this.settings.setFontSize(e.detail.size));
        this.preview.addEventListener('selection-updated', () => this.saveCurrentSelection());

        this.controls.addEventListener('reset', () => this.resetSelection());
        this.controls.addEventListener('download', () => this.downloadPreview());
        this.controls.addEventListener('translate', () => this.translateSelection());
        this.controls.addEventListener('validate', () => this.saveAndNext());
        this.controls.addEventListener('compare', () => this.showComparison());
        this.controls.addEventListener('download-all', () => this.downloadAllImages());
        this.controls.addEventListener('auto-translate', () => this.autoTranslateAll());

        this.finalStrip.addEventListener('thumbnail-removed', (e) => {
            this.savedImages = this.savedImages.filter(item => item.dataUrl !== e.detail.dataUrl);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !this.settings.isHtmlBoxTarget(e.target)) this.translateSelection();
        });

        this.applyGlobalFont();
        this.preview.setParagraphMargin(this.paragraphMargin);
        this.settings.setFontSize(this.currentFontSize);
    }

    showLoader(message = this.defaultLoaderText) {
        this.setLoaderText(message);
        this.loader.classList.add('active');
        this.isLoading = true;
    }

    hideLoader() {
        this.loader.classList.remove('active');
        this.setLoaderText(this.defaultLoaderText);
        this.isLoading = false;
    }

    handleImages(files) {
        this.images = files;
        this.gallery.setImages(files);
        if (files.length) this.switchToIndex(0);
    }

    handleHtmlFiles(files) {
        this.htmlFiles = files;
        if (files.length) this.displayRawHtml(0);
    }

    updateHtml(html) {
        this.preview.setHtmlContent(html);
    }

    async switchToIndex(idx) {
        if (!this.images[idx]) return;
        this.currentIndex = idx;
        this.gallery.setSelectedIndex(idx);
        const url = URL.createObjectURL(this.images[idx]);
        this.preview.setFilename(this.images[idx].name);
        this.preview.setBackgroundImage(url, {autoPickColor: !this.customColor});
        if (this.htmlFiles.length) this.displayRawHtml(idx % this.htmlFiles.length);
        this.applySavedSelectionIfNeeded();
    }

    displayRawHtml(idx) {
        if (!this.htmlFiles[idx]) return;
        const reader = new FileReader();
        reader.onload = () => {
            const content = reader.result;
            this.settings.setHtml(content);
            this.preview.setHtmlContent(content);
            this.preview.setParagraphMargin(this.paragraphMargin);
            this.preview.setFont(this.currentFont, this.currentFontSize);
        };
        reader.readAsText(this.htmlFiles[idx]);
    }

    resetSelection() {
        this.preview.resetSelection();
        this.settings.setHtml('');
    }

    async downloadPreview() {
        const canvas = await this.preview.capturePreviewCanvas();
        const link = document.createElement('a');
        link.download = 'preview.png';
        link.href = canvas.toDataURL();
        link.click();
    }

    async saveAndNext() {
        const canvas = await this.preview.capturePreviewCanvas();
        const dataUrl = canvas.toDataURL();
        const filename = this.images[this.currentIndex]?.name || 'preview.png';
        this.savedImages.push({dataUrl, filename});
        this.finalStrip.addThumbnail(dataUrl, filename);
        this.currentIndex++;
        this.resetSelection();
        if (this.currentIndex < this.images.length) {
            this.switchToIndex(this.currentIndex);
        }
    }

    async showComparison() {
        if (!this.images[this.currentIndex]) return;
        const canvas = await this.preview.capturePreviewCanvas();
        const translatedUrl = canvas.toDataURL();
        const originalUrl = URL.createObjectURL(this.images[this.currentIndex]);
        this.comparisonModal.show(originalUrl, translatedUrl);
    }

    setLoaderText(message) {
        const loaderText = this.loader?.querySelector('.loader-text');
        if (loaderText) {
            loaderText.textContent = message;
        }
    }

    async translateSelection(options = {}) {
        const {keepLoaderVisible = false, loaderMessage} = options;
        if (!this.preview.hasSelection() && this.persistSelection) {
            this.applySavedSelectionIfNeeded();
        }
        if (this.isLoading) return;
        const dataUrl = await this.preview.captureSelectionDataUrl();
        if (!dataUrl) return false;
        this.showLoader(loaderMessage);
        try {
            const res = await fetch('/translate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({image_base64: dataUrl})
            });
            const result = await res.json();
            const html = result.html;
            this.settings.setHtml(html);
            this.preview.setHtmlContent(html);
            this.preview.setBackgroundColor(this.selectedColor, {custom: this.customColor});
            this.preview.applyFontSettings();
            this.preview.adjustFontSizeToFit();
            window.getSelection()?.removeAllRanges();
            return true;
        } finally {
            this.isLoading = false;
            if (!keepLoaderVisible) {
                this.hideLoader();
            }
        }
    }

    setColor(color, custom) {
        this.selectedColor = color;
        this.customColor = custom;
        this.settings.setColor(color);
        this.preview.setBackgroundColor(color, {custom});
    }

    async loadFont(file) {
        const fontName = file.name.replace(/\.[^/.]+$/, '');
        const url = URL.createObjectURL(file);
        const font = new FontFace(fontName, `url(${url})`);
        const loaded = await font.load();
        document.fonts.add(loaded);
        this.currentFont = `'${fontName}'`;
        this.applyGlobalFont();
        this.preview.setFont(this.currentFont, this.currentFontSize);
    }

    applyGlobalFont() {
        document.documentElement.style.setProperty('--app-font-family', this.currentFont);
    }

    changeFontSize(delta) {
        this.preview.changeFontSize(delta);
    }

    setFontSizeLock(locked) {
        this.fontSizeLocked = locked;
        this.settings.setFontLock(locked);
        this.preview.setFontSizeLock(locked);
    }

    adjustParagraphMargin(delta) {
        this.paragraphMargin = Math.max(0, this.paragraphMargin + delta);
        this.preview.setParagraphMargin(this.paragraphMargin);
    }

    async downloadAllImages() {
        if (!this.savedImages.length) return;
        const zip = new JSZip();
        this.savedImages.forEach(({dataUrl, filename}) => {
            const base64Data = dataUrl.split(',')[1];
            zip.file(filename, base64Data, {base64: true});
        });
        const content = await zip.generateAsync({type: 'blob'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'images.zip';
        link.click();
    }

    toggleSelectionPersistence(enabled) {
        this.persistSelection = enabled;
        if (!enabled) {
            this.savedSelection = null;
        } else {
            this.saveCurrentSelection();
        }
        this.syncAutoTranslateAvailability();
    }

    saveCurrentSelection() {
        if (!this.persistSelection) return;
        const snapshot = this.preview.getSelectionSnapshot();
        if (snapshot) {
            this.savedSelection = snapshot;
            this.syncAutoTranslateAvailability();
        }
    }

    applySavedSelectionIfNeeded() {
        if (!this.persistSelection || !this.savedSelection) {
            return false;
        }
        this.preview.applySelectionSnapshot(this.savedSelection);
        return true;
    }

    syncAutoTranslateAvailability() {
        const enabled = this.persistSelection && !!this.savedSelection && !this.isAutoTranslating;
        this.controls.setAutoTranslateEnabled(enabled);
    }

    async autoTranslateAll() {
        if (this.isAutoTranslating || !this.persistSelection || !this.savedSelection) return;
        this.isAutoTranslating = true;
        this.syncAutoTranslateAvailability();
        this.controls.setAutoTranslateBusy(true);
        try {
            let idx = this.currentIndex;
            const total = this.images.length;
            while (idx < this.images.length && this.persistSelection && this.savedSelection) {
                const filename = this.images[idx]?.name || 'Unknown file';
                const loaderMessage = `Translating ${idx + 1}/${total} · ${filename}`;
                this.applySavedSelectionIfNeeded();
                const translated = await this.translateSelection({keepLoaderVisible: true, loaderMessage});
                if (!translated) break;
                await this.saveAndNext();
                idx = this.currentIndex;
            }
        } catch (err) {
            console.error('Auto translate failed', err);
        } finally {
            this.hideLoader();
            this.isAutoTranslating = false;
            this.controls.setAutoTranslateBusy(false);
            this.syncAutoTranslateAvailability();
        }
    }
}

customElements.define('card-translator-app', CardTranslatorApp);
