// Handles drawing the selection box and color picking with the pipette tool.
preview.addEventListener('mousedown', (e) => {
    if (pipetteActive) return;

    if (selectedColor === 'transparent') {
        const img = new Image();
        img.src = preview.style.backgroundImage.slice(5, -2);
        img.onload = () => {
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
            highlightBox.style.backgroundColor = selectedColor;
            htmlPreview.style.backgroundColor = selectedColor;
            colorSample.style.backgroundColor = selectedColor;
        };
    } else {
        highlightBox.style.backgroundColor = selectedColor;
        htmlPreview.style.backgroundColor = selectedColor;
        colorSample.style.backgroundColor = selectedColor;
    }

    const rect = preview.getBoundingClientRect();
    selection.startX = e.clientX - rect.left;
    selection.startY = e.clientY - rect.top;

    function onMouseMove(ev) {
        const currX = ev.clientX - rect.left;
        const currY = ev.clientY - rect.top;
        const x = Math.min(selection.startX, currX);
        const y = Math.min(selection.startY, currY);
        const w = Math.abs(currX - selection.startX);
        const h = Math.abs(currY - selection.startY);

        Object.assign(highlightBox.style, {
            left: `${x}px`,
            top: `${y}px`,
            width: `${w}px`,
            height: `${h}px`,
            display: 'block'
        });
    }

    function onMouseUp() {
        preview.removeEventListener('mousemove', onMouseMove);
        preview.removeEventListener('mouseup', onMouseUp);
    }

    preview.addEventListener('mousemove', onMouseMove);
    preview.addEventListener('mouseup', onMouseUp);
});

function activatePipette() {
    pipetteActive = true;
    preview.style.cursor = `url(${pipetteCursor}) 0 24, auto`;
    preview.addEventListener('click', pipetteClickHandler);
}

function pipetteClickHandler(e) {
    const rect = preview.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const img = new Image();
    img.src = preview.style.backgroundImage.slice(5, -2);
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(x, y, 1, 1).data;
        selectedColor = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
        customColor = true;
        htmlPreview.style.backgroundColor = selectedColor;
        highlightBox.style.backgroundColor = selectedColor;
        colorSample.style.backgroundColor = selectedColor;
        preview.style.cursor = 'default';
        preview.removeEventListener('click', pipetteClickHandler);
        pipetteActive = false;
    };
}
