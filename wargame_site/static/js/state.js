// Sets up global application state and initial event listeners.
let paragraphMargin = 10;

let images = [];
let htmlFiles = [];
let currentIndex = 0;
let savedImages = [];
let selection = { startX: 0, startY: 0, width: 0, height: 0 };

const imageGrid = document.getElementById('imageGrid');
const preview = document.getElementById('previewContainer');
const highlightBox = document.getElementById('highlightBox');
const htmlPreview = document.getElementById('htmlPreview');
const htmlRawBox = document.getElementById('htmlRawBox');
const finalPreview = document.getElementById('finalPreview');
const colorSample = document.getElementById('colorSample');

let pipetteActive = false;
let selectedColor = 'transparent';
let customColor = false;
const pipetteCursor = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJibGFjayIgZD0iTTE3IDJsLTIgMiAzIDMtOC41IDguNS0yLTItMiAyIDIgMi00LjUgNC41TDUgMjNsNC41LTQuNSAyIDIgMi0yLTItMkwxOCA4bDMgMyAyLTJ6Ii8+PC9zdmc+';

htmlRawBox.addEventListener('input', () => {
    htmlPreview.innerHTML = htmlRawBox.textContent;
    adjustFontSizeToFit();
});

document.getElementById('imageUpload').addEventListener('change', (e) => {
    images = Array.from(e.target.files);
    renderImageGrid();
});

document.getElementById('htmlUpload').addEventListener('change', (e) => {
    htmlFiles = Array.from(e.target.files);
    displayRawHtml(0);
});
