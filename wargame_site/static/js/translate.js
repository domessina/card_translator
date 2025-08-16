// Handles OCR translation of the selected area through the backend API.
let isLoading = false;

const loader = document.createElement('div');
loader.innerHTML = `<div class="spinner"></div><div class="loader-text">Veuillez patienter…</div>`;
loader.style.position = 'absolute';
loader.style.top = '50%';
loader.style.left = '50%';
loader.style.transform = 'translate(-50%, -50%)';
loader.style.zIndex = '999';
loader.style.display = 'none';

document.body.appendChild(loader);

document.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && highlightBox.style.display === 'block' && !isLoading) {
        isLoading = true;
        loader.style.display = 'block';
        document.body.classList.add('loading');

        document.querySelectorAll('button, input, #imageGrid img').forEach(el => {
            el.disabled = true;
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.5';
        });

        const rect = highlightBox.getBoundingClientRect();
        const previewRect = preview.getBoundingClientRect();
        const canvas = document.createElement('canvas');
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');

        const fullCanvas = document.createElement('canvas');
        fullCanvas.width = previewRect.width;
        fullCanvas.height = previewRect.height;
        const fullCtx = fullCanvas.getContext('2d');

        const img = new Image();
        img.src = preview.style.backgroundImage.slice(5, -2);
        await new Promise(res => {
            img.onload = () => {
                fullCtx.drawImage(img, 0, 0, fullCanvas.width, fullCanvas.height);
                const imgData = fullCtx.getImageData(rect.left - previewRect.left, rect.top - previewRect.top, rect.width, rect.height);
                canvas.getContext('2d').putImageData(imgData, 0, 0);
                res();
            };
        });

        const dataUrl = canvas.toDataURL('image/png');

        const res = await fetch('/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_base64: dataUrl })
        });

        const result = await res.json();
        const html = result.html;

        htmlRawBox.textContent = html;
        htmlPreview.innerHTML = html;
        htmlPreview.style.backgroundColor = selectedColor;
        highlightBox.style.backgroundColor = selectedColor;
        applyFontSettings();
        window.getSelection()?.removeAllRanges();

        adjustFontSizeToFit();
        loader.style.display = 'none';
        document.body.classList.remove('loading');

        document.querySelectorAll('button, input, #imageGrid img').forEach(el => {
            el.disabled = false;
            el.style.pointerEvents = '';
            el.style.opacity = '1';
        });

        isLoading = false;
    }
});
