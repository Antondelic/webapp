window.onload = function () {
    var drawingCanvas = document.getElementById("paint-canvas");
    var drawingContext = drawingCanvas.getContext("2d");
    var outputCanvas = document.createElement("canvas");
    var outputContext = outputCanvas.getContext("2d");
    outputCanvas.width = 1024;
    outputCanvas.height = 1024;
    drawingCanvas.width = 1024; // Set the canvas width to 1024 pixels
    drawingCanvas.height = 1024; // Set the canvas height to 1024 pixels
    var boundings = drawingCanvas.getBoundingClientRect();

    var mouseX = 0;
    var mouseY = 0;
    drawingContext.strokeStyle = 'black';
    drawingContext.lineWidth = 1;
    var isDrawing = false;

    drawingCanvas.addEventListener('mousedown', function (event) {
        setMouseCoordinates(event);
        isDrawing = true;
        drawingContext.beginPath();
        drawingContext.moveTo(mouseX, mouseY);
    });

    drawingCanvas.addEventListener('mousemove', function (event) {
        setMouseCoordinates(event);
        if (isDrawing) {
            drawingContext.lineTo(mouseX, mouseY);
            drawingContext.stroke();
        }
    });

    drawingCanvas.addEventListener('mouseup', function (event) {
        setMouseCoordinates(event);
        isDrawing = false;
    });

    function setMouseCoordinates(event) {
        mouseX = event.clientX - boundings.left;
        mouseY = event.clientY - boundings.top;
    }

    // Handle Color Buttons
    var colorButtons = document.querySelectorAll('.colors button');

    colorButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            drawingContext.strokeStyle = button.value || 'black';
        });
    });

    // Handle Brush Buttons
    var brushButtons = document.querySelectorAll('.brushes button');

    brushButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            drawingContext.lineWidth = button.value || 1;
        });
    });

    // Handle Clear Button
    var clearButton = document.getElementById('clear');

    clearButton.addEventListener('click', function () {
        drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    });

    var submitButton = document.getElementById('submit');

    submitButton.addEventListener('click', function () {
        outputContext.drawImage(drawingCanvas, 0, 0, 1024, 1024);
        var canvasDataURL = outputCanvas.toDataURL();

        var formData = new FormData();
        var canvasBlob = dataURLtoBlob(canvasDataURL);

        formData.append('sketch_file', canvasBlob, 'sketch.png');
        formData.append('prompt', 'anime'); // Provide a prompt

        fetch('https://clipdrop-api.co/sketch-to-image/v1/sketch-to-image', {
            method: 'POST',
            headers: {
                'x-api-key': 'b220db301cec59cd93551eb21ef23c1d44b4b0030e8f669f3d6d8f66da904644a2cb23b4b8b252bdac34cf31ce8f0818' // Replace with your actual API key
            },
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    return response.blob();
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .then(imageBlob => {
                var imageUrl = URL.createObjectURL(imageBlob);

                // Create a container for the result
                var resultContainer = document.createElement('div');
                resultContainer.className = 'result-container';

                // Create an image element for the thumbnail
                var thumbnailImage = document.createElement('img');
                thumbnailImage.src = imageUrl;
                thumbnailImage.className = 'thumbnail';

                // Append thumbnail to the result container
                resultContainer.appendChild(thumbnailImage);

                // Create a download button
                var downloadButton = document.createElement('a');
                downloadButton.href = imageUrl;
                downloadButton.download = 'result.png';
                downloadButton.className = 'download';
                downloadButton.innerHTML = 'Download';

                // Append download button to the result container
                resultContainer.appendChild(downloadButton);

                // Append the result container to the results container
                var resultsContainer = document.querySelector('.results-container');
                resultsContainer.appendChild(resultContainer);
            });
    });

    // Add an event listener to the dropdown
    document.getElementById('result-dropdown').addEventListener('change', function () {
        var selectedValue = this.value;
        if (selectedValue) {
            // Display the selected result in an image element
            var selectedImage = document.createElement('img');
            selectedImage.src = selectedValue;

            // Clear any existing result and append the selected image
            var resultContainer = document.getElementById('result-container');
            resultContainer.innerHTML = '';
            resultContainer.appendChild(selectedImage);
        }
    });

    function dataURLtoBlob(dataURL) {
        var byteString = atob(dataURL.split(',')[1]);
        var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }
};
