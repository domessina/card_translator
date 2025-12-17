const previewHtml = await fetch(new URL('./preview-panel.html', import.meta.url)).then(r => r.text());
const previewCss = await fetch(new URL('./preview-panel.css', import.meta.url)).then(r => r.text());
const previewTemplate = document.createElement('template');
previewTemplate.innerHTML = `<style>${previewCss}</style>${previewHtml}`;

const pipetteCursor = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJibGFjayIgZD0iTTE3IDJsLTIgMiAzIDMtOC41IDguNS0yLTItMiAyIDIgMi00LjUgNC41TDUgMjNsNC41LTQuNSAyIDIgMi0yLTItMkwxOCA4bDMgMyAyLTJ6Ii8+PC9zdmc+';

class PreviewPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(previewTemplate.content.cloneNode(true));
        this.previewContainer = this.shadowRoot.getElementById('previewContainer');
        this.highlightBox = this.shadowRoot.getElementById('highlightBox');
        this.htmlPreview = this.shadowRoot.getElementById('htmlPreview');
        this.filenameLabel = this.shadowRoot.getElementById('currentFilename');
        this.currentFont = "'Arial', serif";
        this.currentFontSize = 14;
        this.paragraphMargin = 10;
        this.selectedColor = 'transparent';
        this.customColor = false;
        this.pipetteActive = false;
        this.backgroundUrl = '';
        this.selection = {startX: 0, startY: 0, width: 0, height: 0};
        this.selectionRect = {x: 0, y: 0, width: 0, height: 0};
        this.currentPadding = 0;
        this.resizeObserver = null;
    }

    connectedCallback() {
        this.previewContainer.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.resizeObserver = new ResizeObserver(() => {
            if (this.highlightBox.style.display === 'none') return;
            this.adjustFontSizeToFit();
            this.dispatchSelection();
        });
        this.resizeObserver.observe(this.highlightBox);
    }

    disconnectedCallback() {
        this.resizeObserver?.disconnect();
    }

    setFilename(name) {
        this.filenameLabel.textContent = name || '';
    }

    setParagraphMargin(value) {
        this.paragraphMargin = value;
        this.htmlPreview.style.setProperty('--p-margin', `${value}px`);
    }

    setFont(fontFamily, fontSize) {
        this.currentFont = fontFamily || this.currentFont;
        this.currentFontSize = fontSize ?? this.currentFontSize;
        this.applyFontSettings();
    }

    applyFontSettings() {
        this.htmlPreview.style.fontFamily = this.currentFont;
        this.htmlPreview.style.fontSize = `${this.currentFontSize}px`;
    }

    setHtmlContent(html) {
        this.htmlPreview.innerHTML = html || '';
        this.applyFontSettings();
        this.adjustFontSizeToFit();
    }

    setBackgroundColor(color, {custom} = {custom: false}) {
        this.selectedColor = color;
        this.customColor = custom;
        this.highlightBox.style.backgroundColor = color;
        this.htmlPreview.style.backgroundColor = 'transparent';
    }

    setBackgroundImage(url, {autoPickColor = true} = {}) {
        this.backgroundUrl = url;
        this.previewContainer.style.backgroundImage = url ? `url('${url}')` : '';
        if (url && autoPickColor) {
            this.extractAverageColor(url).then(color => {
                if (!this.customColor) {
                    this.setBackgroundColor(color, {custom: false});
                    this.dispatchEvent(new CustomEvent('color-auto-picked', {detail: {color}}));
                }
            });
        }
    }

    async extractAverageColor(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const data = ctx.getImageData(0, 0, 22, 22).data;
                let r = 0, g = 0, b = 0;
                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                }
                const count = data.length / 4;
                resolve(`rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`);
            };
            img.src = url;
        });
    }

    handleMouseDown(e) {
        if (this.pipetteActive) return;

        if (this.selectedColor === 'transparent') {
            this.extractAverageColor(this.backgroundUrl).then(color => {
                this.setBackgroundColor(color, {custom: false});
                this.dispatchEvent(new CustomEvent('color-auto-picked', {detail: {color}}));
            });
        }

        const rect = this.previewContainer.getBoundingClientRect();
        this.selection.startX = e.clientX - rect.left;
        this.selection.startY = e.clientY - rect.top;

        const onMouseMove = (ev) => {
            const currX = ev.clientX - rect.left;
            const currY = ev.clientY - rect.top;
            const x = Math.min(this.selection.startX, currX);
            const y = Math.min(this.selection.startY, currY);
            const w = Math.abs(currX - this.selection.startX);
            const h = Math.abs(currY - this.selection.startY);

            this.selectionRect = {x, y, width: w, height: h};
            this.renderSelection();
            this.adjustFontSizeToFit();
            this.dispatchSelection();
        };

        const onMouseUp = () => {
            this.previewContainer.removeEventListener('mousemove', onMouseMove);
            this.previewContainer.removeEventListener('mouseup', onMouseUp);
        };

        this.previewContainer.addEventListener('mousemove', onMouseMove);
        this.previewContainer.addEventListener('mouseup', onMouseUp);
    }

    dispatchSelection() {
        const rect = this.highlightBox.getBoundingClientRect();
        this.dispatchEvent(new CustomEvent('selection-updated', {
            detail: {
                width: rect.width,
                height: rect.height,
                x: rect.left,
                y: rect.top
            }
        }));
    }

    adjustFontSizeToFit({allowGrow = true} = {}) {
        if (!this.highlightBox.offsetWidth || !this.highlightBox.offsetHeight) return;
        let fontSize = this.currentFontSize;
        this.htmlPreview.style.width = '100%';
        this.htmlPreview.style.height = 'auto';
        this.htmlPreview.style.fontSize = `${fontSize}px`;

        const availableWidth = Math.max(0, this.highlightBox.clientWidth - this.currentPadding * 2);
        const availableHeight = Math.max(0, this.highlightBox.clientHeight - this.currentPadding * 2);

        while ((
            this.htmlPreview.scrollHeight > availableHeight ||
            this.htmlPreview.scrollWidth > availableWidth
        ) && fontSize > 6) {
            fontSize--;
            this.htmlPreview.style.fontSize = `${fontSize}px`;
        }

        if (allowGrow) {
            while (fontSize < 300) {
                const testSize = fontSize + 1;
                this.htmlPreview.style.fontSize = `${testSize}px`;
                const fits =
                    this.htmlPreview.scrollHeight <= availableHeight &&
                    this.htmlPreview.scrollWidth <= availableWidth;
                if (!fits) break;
                fontSize = testSize;
            }
        }

        this.currentFontSize = fontSize;
        this.dispatchEvent(new CustomEvent('font-size-updated', {detail: {size: fontSize}}));
    }

    canIncreaseFont() {
        if (!this.highlightBox.offsetWidth || !this.highlightBox.offsetHeight) return true;
        const testSize = this.currentFontSize + 1;
        this.htmlPreview.style.fontSize = `${testSize}px`;
        const availableWidth = Math.max(0, this.highlightBox.clientWidth - this.currentPadding * 2);
        const availableHeight = Math.max(0, this.highlightBox.clientHeight - this.currentPadding * 2);
        const fits =
            this.htmlPreview.scrollHeight <= availableHeight &&
            this.htmlPreview.scrollWidth <= availableWidth;
        this.htmlPreview.style.fontSize = `${this.currentFontSize}px`;
        return fits;
    }

    changeFontSize(delta) {
        const nextSize = this.currentFontSize + delta;
        if (nextSize < 1) return;
        this.currentFontSize = nextSize;
        this.applyFontSettings();
        this.adjustFontSizeToFit({allowGrow: false});
    }

    resetSelection() {
        this.highlightBox.style.display = 'none';
        this.highlightBox.style.left = '0px';
        this.highlightBox.style.top = '0px';
        this.highlightBox.style.width = '0px';
        this.highlightBox.style.height = '0px';
        this.selectionRect = {x: 0, y: 0, width: 0, height: 0};
        this.htmlPreview.innerHTML = '';
        this.applyFontSettings();
    }

    setRoundedCorners(enabled) {
        const radius = enabled ? '8px' : '0';
        this.highlightBox.style.borderRadius = radius;
        this.htmlPreview.style.borderRadius = radius;
    }

    setHighlightPadding(enabled) {
        this.currentPadding = enabled ? 6 : 0;
        this.highlightBox.style.padding = `${this.currentPadding}px`;
        if (this.highlightBox.style.display !== 'none') {
            this.renderSelection();
            this.adjustFontSizeToFit();
            this.dispatchSelection();
        }
    }

    renderSelection() {
        const pad = this.currentPadding;
        const width = Math.max(0, this.selectionRect.width);
        const height = Math.max(0, this.selectionRect.height);
        Object.assign(this.highlightBox.style, {
            left: `${this.selectionRect.x - pad}px`,
            top: `${this.selectionRect.y - pad}px`,
            width: `${width}px`,
            height: `${height}px`,
            padding: `${pad}px`,
            display: width && height ? 'block' : 'none'
        });
    }

    activatePipette() {
        this.pipetteActive = true;
        this.previewContainer.style.cursor = `url(${pipetteCursor}) 0 24, auto`;
        const clickHandler = (e) => {
            const rect = this.previewContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const img = new Image();
            img.src = this.backgroundUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = rect.width;
                canvas.height = rect.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const data = ctx.getImageData(x, y, 1, 1).data;
                const color = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
                this.setBackgroundColor(color, {custom: true});
                this.dispatchEvent(new CustomEvent('color-picked', {detail: {color}}));
                this.previewContainer.style.cursor = 'default';
                this.previewContainer.removeEventListener('click', clickHandler);
                this.pipetteActive = false;
            };
        };
        this.previewContainer.addEventListener('click', clickHandler);
    }

    async capturePreviewCanvas() {
        const originalBorder = this.highlightBox.style.border;
        const originalBg = this.highlightBox.style.backgroundColor;
        const previewBorder = this.previewContainer.style.border;
        const previewBg = this.previewContainer.style.backgroundColor;
        this.highlightBox.style.border = 'none';
        this.previewContainer.style.border = 'none';
        this.previewContainer.style.backgroundColor = 'transparent';
        const canvas = await html2canvas(this.previewContainer, {backgroundColor: null});
        this.highlightBox.style.border = originalBorder;
        this.highlightBox.style.backgroundColor = originalBg;
        this.previewContainer.style.border = previewBorder;
        this.previewContainer.style.backgroundColor = previewBg;
        return canvas;
    }

    async captureSelectionDataUrl() {
        const rect = this.highlightBox.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;
        const previewRect = this.previewContainer.getBoundingClientRect();
        const canvas = document.createElement('canvas');
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');

        const fullCanvas = document.createElement('canvas');
        fullCanvas.width = previewRect.width;
        fullCanvas.height = previewRect.height;
        const fullCtx = fullCanvas.getContext('2d');

        await new Promise((res) => {
            const img = new Image();
            img.src = this.backgroundUrl;
            img.onload = () => {
                fullCtx.drawImage(img, 0, 0, fullCanvas.width, fullCanvas.height);
                const imgData = fullCtx.getImageData(rect.left - previewRect.left, rect.top - previewRect.top, rect.width, rect.height);
                ctx.putImageData(imgData, 0, 0);
                res();
            };
        });

        return canvas.toDataURL('image/png');
    }
}

customElements.define('ct-preview-panel', PreviewPanel);
