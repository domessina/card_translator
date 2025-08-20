// Handles text fitting within the selection box and updates font controls.
function canIncreaseFont() {
    if (!highlightBox.offsetWidth || !highlightBox.offsetHeight) return true;
    const testSize = currentFontSize + 1;
    htmlPreview.style.fontSize = testSize + 'px';
    const fits =
        htmlPreview.scrollHeight <= highlightBox.clientHeight &&
        htmlPreview.scrollWidth <= highlightBox.clientWidth;
    htmlPreview.style.fontSize = currentFontSize + 'px';
    return fits;
}

function updateFontIncreaseState() {
    const incBtn = document.getElementById('fontIncrease');
    incBtn.disabled = !canIncreaseFont();
}

// Shrinks the font size until the text fits inside the selection box.
function adjustFontSizeToFit() {
    if (!highlightBox.offsetWidth || !highlightBox.offsetHeight) {
        updateFontIncreaseState();
        return;
    }
    let fontSize = currentFontSize;
    htmlPreview.style.width = '100%';
    htmlPreview.style.height = 'auto';
    htmlPreview.style.fontSize = fontSize + 'px';

    while (
        (htmlPreview.scrollHeight > highlightBox.clientHeight ||
            htmlPreview.scrollWidth > highlightBox.clientWidth) &&
        fontSize > 6
    ) {
        fontSize--;
        htmlPreview.style.fontSize = fontSize + 'px';
    }

    currentFontSize = fontSize;
    if (typeof updateFontDisplay === 'function') updateFontDisplay();
    updateFontIncreaseState();
}

