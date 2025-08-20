// Sets up global application state and initial event listeners.
let paragraphMargin = 10;

let images = [];
let htmlFiles = [];
let currentIndex = 0;
let savedImages = [];
let selection = { startX: 0, startY: 0, width: 0, height: 0 };
let currentFont = "'Times New Roman', serif";
let currentFontSize = 14;

const imageGrid = document.getElementById('imageGrid');
const preview = document.getElementById('previewContainer');
const highlightBox = document.getElementById('highlightBox');
const htmlPreview = document.getElementById('htmlPreview');
const htmlRawBox = document.getElementById('htmlRawBox');
const finalPreview = document.getElementById('finalPreview');
const colorSample = document.getElementById('colorSample');
const fontSizeDisplay = document.getElementById('fontSizeDisplay');
const roundedCornersCheckbox = document.getElementById('roundedCorners');

let pipetteActive = false;
let selectedColor = 'transparent';
let customColor = false;
const pipetteCursor = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJibGFjayIgZD0iTTE3IDJsLTIgMiAzIDMtOC41IDguNS0yLTItMiAyIDIgMi00LjUgNC41TDUgMjNsNC41LTQuNSAyIDIgMi0yLTItMkwxOCA4bDMgMyAyLTJ6Ii8+PC9zdmc+';
function updateFontDisplay() {
    fontSizeDisplay.textContent = currentFontSize + 'px';
}

roundedCornersCheckbox.addEventListener('change', () => {
    const radius = roundedCornersCheckbox.checked ? '8px' : '0';
    highlightBox.style.borderRadius = radius;
    htmlPreview.style.borderRadius = radius;
});


function applyFontSettings() {
    htmlPreview.style.fontFamily = currentFont;
    htmlPreview.style.fontSize = currentFontSize + 'px';
}

htmlRawBox.addEventListener('input', () => {
    htmlPreview.innerHTML = htmlRawBox.textContent;
    applyFontSettings();
});

document.getElementById('imageUpload').addEventListener('change', (e) => {
    images = Array.from(e.target.files);
    renderImageGrid();
});

document.getElementById('htmlUpload').addEventListener('change', (e) => {
    htmlFiles = Array.from(e.target.files);
    displayRawHtml(0);
});

document.getElementById('fontUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const fontName = file.name.replace(/\.[^/.]+$/, "");
        const url = URL.createObjectURL(file);
        const font = new FontFace(fontName, `url(${url})`);
        font.load().then((loaded) => {
            document.fonts.add(loaded);
            currentFont = `'${fontName}'`;
            applyFontSettings();
        });
    }
});

document.getElementById('fontIncrease').addEventListener('click', () => {
    currentFontSize++;
    applyFontSettings();
    updateFontDisplay();
});

document.getElementById('fontDecrease').addEventListener('click', () => {
    if (currentFontSize > 1) currentFontSize--;
    applyFontSettings();
    updateFontDisplay();
});
updateFontDisplay();
