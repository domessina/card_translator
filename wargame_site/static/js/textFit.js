// Handles automatic text resizing to fit within the selection box.
function adjustFontSizeToFit() {
    if (!highlightBox.offsetWidth || !highlightBox.offsetHeight) return;
    const container = highlightBox;
    let fontSize = currentFontSize;
    htmlPreview.style.width = '100%';
    htmlPreview.style.height = 'auto';
    htmlPreview.style.fontSize = fontSize + 'px';

    // First, try growing the text until it no longer fits
    while (
        htmlPreview.scrollHeight <= container.clientHeight &&
        htmlPreview.scrollWidth <= container.clientWidth &&
        fontSize < 300
    ) {
        fontSize++;
        htmlPreview.style.fontSize = fontSize + 'px';
    }

    // If we overflowed, shrink until it fits
    while (
        (htmlPreview.scrollHeight > container.clientHeight ||
            htmlPreview.scrollWidth > container.clientWidth) &&
        fontSize > 6
    ) {
        fontSize--;
        htmlPreview.style.fontSize = fontSize + 'px';
    }

    currentFontSize = fontSize;
    if (typeof updateFontDisplay === "function") updateFontDisplay();
}
