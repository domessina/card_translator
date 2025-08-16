// Manages image and HTML file loading and navigation.
function renderImageGrid() {
    imageGrid.innerHTML = '';
    images.forEach((file, idx) => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onclick = () => switchToIndex(idx);
        img.dataset.index = idx;
        img.title = file.name;
        imageGrid.appendChild(img);
    });
    if (images.length) switchToIndex(0);
}

function highlightSelectedImage() {
    const imgs = imageGrid.querySelectorAll('img');
    imgs.forEach(img => img.classList.remove('selected'));
    const selected = imageGrid.querySelector(`img[data-index='${currentIndex}']`);
    if (selected) selected.classList.add('selected');
    document.getElementById('gridCounter').textContent = `${currentIndex + 1} / ${images.length}`;
}

function switchToIndex(idx) {
    currentIndex = idx;

    highlightBox.style.display = 'none';
    highlightBox.style.left = '0px';
    highlightBox.style.top = '0px';
    highlightBox.style.width = '0px';
    highlightBox.style.height = '0px';
    htmlPreview.innerHTML = '';
    if (!customColor) {
        selectedColor = 'transparent';
        htmlPreview.style.backgroundColor = selectedColor;
        highlightBox.style.backgroundColor = selectedColor;
        colorSample.style.backgroundColor = selectedColor;
    } else {
        htmlPreview.style.backgroundColor = selectedColor;
        highlightBox.style.backgroundColor = selectedColor;
        colorSample.style.backgroundColor = selectedColor;
    }

    const img = new Image();
    img.onload = () => {
        preview.style.width = img.width + 'px';
        preview.style.height = img.height + 'px';

        if (!customColor) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, 22, 22);
            let r = 0, g = 0, b = 0;
            for (let i = 0; i < imageData.data.length; i += 4) {
                r += imageData.data[i];
                g += imageData.data[i + 1];
                b += imageData.data[i + 2];
            }
            const pixelCount = imageData.data.length / 4;
            r = Math.round(r / pixelCount);
            g = Math.round(g / pixelCount);
            b = Math.round(b / pixelCount);
            selectedColor = `rgb(${r}, ${g}, ${b})`;
            htmlPreview.style.backgroundColor = selectedColor;
            highlightBox.style.backgroundColor = selectedColor;
            colorSample.style.backgroundColor = selectedColor;
        }
    };
    const url = URL.createObjectURL(images[idx]);
    img.src = url;
    preview.style.backgroundImage = `url('${url}')`;
    displayRawHtml(idx % htmlFiles.length);
    highlightSelectedImage();

    document.getElementById('currentFilename').textContent = images[idx]?.name || '';
}

function displayRawHtml(idx) {
    if (!htmlFiles[idx]) return;
    const reader = new FileReader();
    reader.onload = () => {
        htmlRawBox.textContent = reader.result;
        htmlPreview.innerHTML = reader.result;
        adjustFontSizeToFit();
    };
    reader.readAsText(htmlFiles[idx]);
    document.documentElement.style.setProperty('--p-margin', `${paragraphMargin}px`);
}
