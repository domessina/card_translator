// Supports exporting and saving images from the editor.
function downloadPreview() {
    const originalBorder = highlightBox.style.border;
    const originalBg = highlightBox.style.backgroundColor;

    highlightBox.style.border = 'none';

    html2canvas(preview).then(canvas => {
        highlightBox.style.border = originalBorder;
        highlightBox.style.backgroundColor = originalBg;

        const link = document.createElement('a');
        link.download = 'preview.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

function saveAndNext() {
    const wasVisible = highlightBox.style.display;
    const originalBorder = highlightBox.style.border;

    highlightBox.style.border = 'none';

    html2canvas(preview).then(canvas => {
        highlightBox.style.border = originalBorder;
        highlightBox.style.display = wasVisible;

        const dataUrl = canvas.toDataURL();
        savedImages.push({ dataUrl, filename: images[currentIndex].name });
        const container = document.createElement('div');
        container.className = 'thumbnail-container';

        const img = document.createElement('img');
        img.title = images[currentIndex].name;
        img.src = dataUrl;
        img.addEventListener("dblclick", () => window.open(dataUrl, "_blank"));
        container.appendChild(img);

        const btn = document.createElement('button');
        btn.textContent = '🗑️';
        btn.className = 'delete-btn';
        btn.onclick = () => {
            finalPreview.removeChild(container);
            const idx = savedImages.findIndex(item => item.dataUrl === dataUrl);
            if (idx !== -1) savedImages.splice(idx, 1);
        };
        container.appendChild(btn);

        finalPreview.appendChild(container);

        currentIndex++;
        if (currentIndex < images.length) {
            switchToIndex(currentIndex);
        }
    });
}

function downloadAllImages() {
    const zip = new JSZip();

    savedImages.forEach(({ dataUrl, filename }) => {
        const base64Data = dataUrl.split(',')[1];
        zip.file(filename, base64Data, { base64: true });
    });

    zip.generateAsync({ type: 'blob' }).then(function (content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'images.zip';
        link.click();
    });
}
