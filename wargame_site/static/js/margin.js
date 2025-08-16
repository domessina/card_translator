// Handles paragraph margin adjustments within the preview.
function adjustParagraphMargin(delta) {
    paragraphMargin = Math.max(0, paragraphMargin + delta);
    document.documentElement.style.setProperty('--p-margin', `${paragraphMargin}px`);
}
