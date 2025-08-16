// Provides a way to reset the current text and color selection.
function resetSelection() {
    highlightBox.style.display = 'none';
    highlightBox.style.left = '0px';
    highlightBox.style.top = '0px';
    highlightBox.style.width = '0px';
    highlightBox.style.height = '0px';
    htmlPreview.innerHTML = '';
    applyFontSettings();
    selectedColor = 'transparent';
    customColor = false;
    htmlPreview.style.backgroundColor = selectedColor;
    highlightBox.style.backgroundColor = selectedColor;
    colorSample.style.backgroundColor = selectedColor;
}
