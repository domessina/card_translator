// Handles automatic text resizing to fit within the selection box.
function adjustFontSizeToFit() {
    if (!highlightBox.offsetWidth || !highlightBox.offsetHeight) return;
    const container = highlightBox;
    let fontSize = currentFontSize;
    htmlPreview.style.fontSize = fontSize + 'px';
    htmlPreview.style.width = '100%';
    htmlPreview.style.height = 'auto';
    while (htmlPreview.scrollHeight > container.clientHeight && fontSize > 6) {
        fontSize--;
        htmlPreview.style.fontSize = fontSize + 'px';
    }
    currentFontSize = fontSize;
    if (typeof updateFontDisplay === "function") updateFontDisplay();
}
