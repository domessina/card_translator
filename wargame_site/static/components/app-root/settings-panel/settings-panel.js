const settingsHtml = await fetch(new URL('./settings-panel.html', import.meta.url)).then(r => r.text());
const settingsCss = await fetch(new URL('./settings-panel.css', import.meta.url)).then(r => r.text());
const settingsTemplate = document.createElement('template');
settingsTemplate.innerHTML = `<style>${settingsCss}</style>${settingsHtml}`;

class SettingsPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(settingsTemplate.content.cloneNode(true));
        this.htmlRawBox = this.shadowRoot.getElementById('htmlRawBox');
        this.colorSample = this.shadowRoot.getElementById('colorSample');
        this.roundedCheckbox = this.shadowRoot.getElementById('roundedCorners');
        this.paddingCheckbox = this.shadowRoot.getElementById('innerPadding');
        this.fontSizeDisplay = this.shadowRoot.getElementById('fontSizeDisplay');
        this.fontLockCheckbox = this.shadowRoot.getElementById('fontSizeLock');
        this.persistSelectionCheckbox = this.shadowRoot.getElementById('persistSelection');
    }

    connectedCallback() {
        this.htmlRawBox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.emit('translate');
            }
        });
        this.htmlRawBox.addEventListener('input', () => this.emit('html-changed', { html: this.htmlRawBox.textContent }));
        this.shadowRoot.getElementById('htmlUpload').addEventListener('change', (e) => {
            this.emit('html-files-chosen', { files: Array.from(e.target.files) });
        });
        this.shadowRoot.getElementById('pipetteBtn').addEventListener('click', () => this.emit('pipette-activate'));
        this.roundedCheckbox.addEventListener('change', () => this.emit('rounded-changed', { value: this.roundedCheckbox.checked }));
        this.paddingCheckbox.addEventListener('change', () => this.emit('padding-changed', { value: this.paddingCheckbox.checked }));
        this.shadowRoot.getElementById('fontUpload').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.emit('font-file-chosen', { file });
        });
        this.shadowRoot.getElementById('fontIncrease').addEventListener('click', () => this.emit('font-size-change', { delta: 1 }));
        this.shadowRoot.getElementById('fontDecrease').addEventListener('click', () => this.emit('font-size-change', { delta: -1 }));
        this.fontLockCheckbox.addEventListener('change', () => this.emit('font-size-lock-change', { locked: this.fontLockCheckbox.checked }));
        this.shadowRoot.getElementById('paragraphInc').addEventListener('click', () => this.emit('paragraph-change', { delta: 1 }));
        this.shadowRoot.getElementById('paragraphDec').addEventListener('click', () => this.emit('paragraph-change', { delta: -1 }));
        this.persistSelectionCheckbox.addEventListener('change', () => this.emit('selection-persist-change', { enabled: this.persistSelectionCheckbox.checked }));
    }

    emit(name, detail = {}) {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    }

    setHtml(html) {
        this.htmlRawBox.textContent = html || '';
    }

    setColor(color) {
        this.colorSample.style.backgroundColor = color;
    }

    setFontSize(size) {
        this.fontSizeDisplay.textContent = `${size}px`;
    }

    setFontLock(locked) {
        this.fontLockCheckbox.checked = locked;
    }

    isHtmlBoxTarget(target) {
        return target === this.htmlRawBox;
    }
}

customElements.define('ct-settings-panel', SettingsPanel);
