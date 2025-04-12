document.addEventListener('DOMContentLoaded', function () {
    const scratchOffBtn = document.getElementById('scratch-off-btn');
    const giftInput = document.getElementById('gift-input');
    const boxesContainer = document.getElementById('boxes');
    const themeToggle = document.getElementById('theme-toggle');
    const bgImageUpload = document.getElementById('bg-image-upload');
    const bgImagePreview = document.getElementById('bg-image-preview');
    const applyBgImage = document.getElementById('apply-bg-image');
    const removeBgImage = document.getElementById('remove-bg-image');
    const bgUploadProgress = document.getElementById('bg-upload-progress');
    const imageUpload = document.getElementById('image-upload');
    const imagePreviews = document.getElementById('image-previews');
    const demoGiftBtns = document.querySelectorAll('.demo-gift-btn');
    const settingsSection = document.getElementById('settings-section');
    const gameOutput = document.getElementById('game-output');
    const backBtn = document.createElement('button');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const container = document.querySelector('.container');
    const zoomModal = document.getElementById('zoom-modal');
    const backButton = document.querySelector('.back-button') || document.createElement('button');

    // Add new elements for gift image upload
    const giftImageUploadBtn = document.createElement('button');
    giftImageUploadBtn.id = 'gift-image-upload-btn';
    giftImageUploadBtn.className = 'gift-image-upload-btn';
    giftImageUploadBtn.innerHTML = '📷 Add Gift Image';
    giftImageUploadBtn.style.marginTop = '10px';
    giftImageUploadBtn.style.padding = '8px 12px';
    giftImageUploadBtn.style.backgroundColor = '#4cc9f0';
    giftImageUploadBtn.style.color = 'white';
    giftImageUploadBtn.style.border = 'none';
    giftImageUploadBtn.style.borderRadius = '5px';
    giftImageUploadBtn.style.cursor = 'pointer';
    giftImageUploadBtn.style.fontWeight = 'bold';

    // Create hidden file input for gift images
    const giftImageInput = document.createElement('input');
    giftImageInput.type = 'file';
    giftImageInput.id = 'gift-image-input';
    giftImageInput.accept = 'image/*';
    giftImageInput.style.display = 'none';

    // Create gift images preview container
    const giftImagesPreview = document.createElement('div');
    giftImagesPreview.id = 'gift-images-preview';
    giftImagesPreview.className = 'gift-images-preview';
    giftImagesPreview.style.display = 'flex';
    giftImagesPreview.style.flexWrap = 'wrap';
    giftImagesPreview.style.gap = '10px';
    giftImagesPreview.style.marginTop = '10px';

    // Insert new elements after gift input
    const giftInputParent = giftInput.parentNode;
    giftInputParent.insertBefore(giftImageUploadBtn, giftInput.nextSibling);
    giftInputParent.insertBefore(giftImageInput, giftImageUploadBtn.nextSibling);
    giftInputParent.insertBefore(giftImagesPreview, giftImageInput.nextSibling);

    // Add new help text for gift images
    // const giftImageHelpText = document.createElement('p');
    // giftImageHelpText.className = 'help-text';
    // giftImageHelpText.textContent = 'You can add images as gifts. They will be displayed when scratched.';
    // giftInputParent.insertBefore(giftImageHelpText, giftImagesPreview.nextSibling);

    const exitFullscreenBtn = document.createElement('button');
    exitFullscreenBtn.id = 'exit-fullscreen-btn';
    exitFullscreenBtn.innerHTML = '✕';
    exitFullscreenBtn.style.display = 'none';

    let isFullscreenLike = false;
    let gifts = loadGifts() || [];
    let giftImages = loadGiftImages() || [];
    let scratchImages = [];
    let bgImage = localStorage.getItem('bgImage') || '';
    let activeColor = localStorage.getItem('bgColor') || '#f0f2f5';
    let currentMode = null;

    init();

    // Event listener for gift image upload button
    giftImageUploadBtn.addEventListener('click', function () {
        giftImageInput.click();
    });

    // Event listener for gift image input change
    giftImageInput.addEventListener('change', function (e) {
        if (e.target.files[0]) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const giftImageData = e.target.result;
                giftImages.push(giftImageData);

                // Add to the gift textarea with a special marker
                const imageMarker = `[IMAGE:${giftImages.length - 1}]`;
                if (giftInput.value) {
                    giftInput.value += '\n' + imageMarker;
                } else {
                    giftInput.value = imageMarker;
                }

                // Add preview
                addGiftImagePreview(giftImageData, giftImages.length - 1);

                // Save gift images and text
                saveGifts();
                saveGiftImages();
            };

            reader.readAsDataURL(e.target.files[0]);
        }
    });

    function addGiftImagePreview(imageData, index) {
        const preview = document.createElement('div');
        preview.className = 'gift-image-preview';
        preview.style.position = 'relative';
        preview.style.width = '60px';
        preview.style.height = '60px';
        preview.style.overflow = 'hidden';
        preview.style.borderRadius = '5px';
        preview.style.border = '2px solid #4cc9f0';

        const img = document.createElement('img');
        img.src = imageData;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';

        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'gift-image-delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '2px';
        deleteBtn.style.right = '2px';
        deleteBtn.style.width = '20px';
        deleteBtn.style.height = '20px';
        deleteBtn.style.borderRadius = '50%';
        deleteBtn.style.backgroundColor = '#e63946';
        deleteBtn.style.color = 'white';
        deleteBtn.style.display = 'flex';
        deleteBtn.style.alignItems = 'center';
        deleteBtn.style.justifyContent = 'center';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.zIndex = '5';

        deleteBtn.addEventListener('click', function () {
            deleteGiftImage(index);
        });

        preview.appendChild(img);
        preview.appendChild(deleteBtn);
        giftImagesPreview.appendChild(preview);
    }

    function deleteGiftImage(index) {
        // Remove from array
        giftImages.splice(index, 1);

        // Update textarea by removing the image marker
        const imageMarker = `[IMAGE:${index}]`;
        giftInput.value = giftInput.value.replace(imageMarker + '\n', '').replace(imageMarker, '');

        // Refresh previews
        refreshGiftImagePreviews();

        // Save updated gifts and images
        saveGifts();
        saveGiftImages();
    }

    function refreshGiftImagePreviews() {
        giftImagesPreview.innerHTML = '';
        giftImages.forEach((img, index) => {
            addGiftImagePreview(img, index);
        });
    }

    function loadGiftImages() {
        const savedGiftImages = localStorage.getItem('giftImages');
        if (savedGiftImages) {
            return JSON.parse(savedGiftImages);
        }
        return [];
    }

    function saveGiftImages() {
        localStorage.setItem('giftImages', JSON.stringify(giftImages));
    }

    fullscreenBtn.addEventListener('click', toggleFullscreenLike);
    exitFullscreenBtn.addEventListener('click', toggleFullscreenLike);

    function toggleFullscreenLike() {
        if (!isFullscreenLike) {
            isFullscreenLike = true;

            gameOutput.dataset.originalDisplay = gameOutput.style.display;

            Array.from(container.children).forEach(element => {
                if (element !== gameOutput) {
                    element.dataset.originalDisplay = element.style.display;
                    element.style.display = 'none';
                }
            });

            container.classList.add('fullscreen-mode');

            gameOutput.style.display = 'block';
            gameOutput.classList.add('fullscreen-mode');

            if (backButton) {
                backButton.dataset.originalDisplay = backButton.style.display;
                backButton.style.display = 'none';
            }

            exitFullscreenBtn.style.display = 'flex';

            document.getElementById('fullscreen-icon').textContent = '⎋';
            document.getElementById('fullscreen-text').textContent = 'Exit Fullscreen';

            // Ensure zoom modal appears above fullscreen
            zoomModal.style.zIndex = '2000';
        } else {
            // Exit fullscreen-like mode
            isFullscreenLike = false;

            // Restore container styles
            container.classList.remove('fullscreen-mode');

            // Restore game output styles
            gameOutput.classList.remove('fullscreen-mode');

            // Restore visibility of other elements
            Array.from(container.children).forEach(element => {
                if (element.dataset.originalDisplay !== undefined) {
                    element.style.display = element.dataset.originalDisplay;
                    delete element.dataset.originalDisplay;
                }
            });

            // Restore back button if it exists
            if (backButton && backButton.dataset.originalDisplay !== undefined) {
                backButton.style.display = backButton.dataset.originalDisplay;
                delete backButton.dataset.originalDisplay;
            }

            // Hide exit button
            exitFullscreenBtn.style.display = 'none';

            // Restore button text
            document.getElementById('fullscreen-icon').textContent = '⛶';
            document.getElementById('fullscreen-text').textContent = 'Fullscreen';
        }
    }

    // Handle ESC key to exit fullscreen-like mode
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isFullscreenLike) {
            toggleFullscreenLike();
        }
    });

    scratchOffBtn.addEventListener('click', function () {
        settingsSection.style.display = 'none';
        gameOutput.style.display = 'block';
        createScratchOffBoxes();

        const themeToggleContainer = document.querySelector('.theme-toggle');
        if (themeToggleContainer) {
            themeToggleContainer.style.display = 'none';
        }
    });

    giftInput.addEventListener('input', saveGifts);
    themeToggle.addEventListener('change', toggleTheme);

    demoGiftBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const demoGifts = this.dataset.gifts.split(',');
            giftInput.value = demoGifts.join('\n');
            saveGifts();
        });
    });

    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            activeColor = this.dataset.color;
            localStorage.setItem('bgColor', activeColor);
            if (!bgImage) {
                document.body.style.backgroundImage = 'none';
                document.body.style.backgroundColor = activeColor;
                document.body.style.backgroundImage = `linear-gradient(315deg, ${activeColor} 0%, ${lightenDarkenColor(activeColor, -20)} 100%)`;
            }
        });
    });

    bgImageUpload.addEventListener('change', function (e) {
        if (e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadstart = function () {
                bgUploadProgress.style.width = '0%';
            };

            reader.onprogress = function (event) {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    bgUploadProgress.style.width = progress + '%';
                }
            };

            reader.onload = function (e) {
                const imageIndex = scratchImages.length - 1;
                bgImagePreview.style.display = 'block';
                bgImagePreview.style.backgroundImage = `url(${e.target.result})`;
                applyBgImage.disabled = false;
                removeBgImage.disabled = false;

                localStorage.setItem('scratchImages', JSON.stringify(scratchImages));
            };

            reader.readAsDataURL(e.target.files[0]);
        }
    });

    applyBgImage.addEventListener('click', function () {
        bgImage = bgImagePreview.style.backgroundImage;
        localStorage.setItem('bgImage', bgImage);
        document.body.style.backgroundImage = bgImage;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    });

    removeBgImage.addEventListener('click', function () {
        bgImage = '';
        localStorage.removeItem('bgImage');
        bgImagePreview.style.display = 'none';
        bgImagePreview.style.backgroundImage = '';
        applyBgImage.disabled = true;
        removeBgImage.disabled = true;
        document.body.style.backgroundImage = `linear-gradient(315deg, ${activeColor} 0%, ${lightenDarkenColor(activeColor, -20)} 100%)`;
    });

    imageUpload.addEventListener('change', function (e) {
        if (e.target.files.length > 0) {

            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i];
                const reader = new FileReader();

                reader.onload = function (e) {
                    scratchImages.push(e.target.result);
                    const imageIndex = scratchImages.length - 1;

                    const preview = document.createElement('div');
                    preview.className = 'image-preview';
                    preview.dataset.index = imageIndex;

                    const img = document.createElement('img');
                    img.src = e.target.result;

                    const number = document.createElement('div');
                    number.className = 'image-number';
                    number.textContent = imageIndex + 1;

                    const deleteBtn = document.createElement('div');
                    deleteBtn.className = 'image-delete-btn';
                    deleteBtn.innerHTML = '&times;';
                    deleteBtn.addEventListener('click', function (event) {
                        event.stopPropagation();
                        deleteImage(imageIndex);
                    });

                    preview.appendChild(img);
                    preview.appendChild(number);
                    preview.appendChild(deleteBtn);
                    imagePreviews.appendChild(preview);

                    localStorage.setItem('scratchImages', JSON.stringify(scratchImages));
                };

                reader.readAsDataURL(file);
            }
        }
    });

    function deleteImage(index) {
        scratchImages.splice(index, 1);
        localStorage.setItem('scratchImages', JSON.stringify(scratchImages));
        refreshImagePreviews();
    }

    function refreshImagePreviews() {
        imagePreviews.innerHTML = '';
        scratchImages.forEach((img, index) => {
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.dataset.index = index;
            const imgEl = document.createElement('img');
            imgEl.src = img;
            const number = document.createElement('div');
            number.className = 'image-number';
            number.textContent = index + 1;
            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'image-delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', function (event) {
                event.stopPropagation();
                deleteImage(index);
            });

            preview.appendChild(imgEl);
            preview.appendChild(number);
            preview.appendChild(deleteBtn);
            imagePreviews.appendChild(preview);
        });
    }

    function init() {
        loadTheme();
        loadBackgroundSettings();
        loadScratchImages();
        loadGiftImagesAndDisplay();
        displayGifts();
    }

    function loadGiftImagesAndDisplay() {
        giftImages = loadGiftImages() || [];
        refreshGiftImagePreviews();
    }

    function loadGifts() {
        const savedGifts = localStorage.getItem('gifts');
        if (savedGifts) {
            giftInput.value = savedGifts;
            return savedGifts.split('\n').filter(gift => gift.trim() !== '');
        }
        return [];
    }

    function saveGifts() {
        const giftText = giftInput.value;
        localStorage.setItem('gifts', giftText);
        gifts = giftText.split('\n').filter(gift => gift.trim() !== '');
    }

    function displayGifts() {
        if (gifts.length > 0) {
            giftInput.value = gifts.join('\n');
        }
    }

    function loadTheme() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        themeToggle.checked = darkMode;
        if (darkMode) {
            document.body.classList.add('dark-theme');
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-theme'));
    }

    function loadBackgroundSettings() {
        document.querySelectorAll('.color-option').forEach(option => {
            if (option.dataset.color === activeColor) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        if (bgImage) {
            document.body.style.backgroundImage = bgImage;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';

            bgImagePreview.style.display = 'block';
            bgImagePreview.style.backgroundImage = bgImage;
            applyBgImage.disabled = false;
            removeBgImage.disabled = false;
        } else {
            document.body.style.backgroundImage = `linear-gradient(315deg, ${activeColor} 0%, ${lightenDarkenColor(activeColor, -20)} 100%)`;
        }
    }

    function loadScratchImages() {
        const savedImages = localStorage.getItem('scratchImages');
        if (savedImages) {
            scratchImages = JSON.parse(savedImages);

            imagePreviews.innerHTML = '';
            scratchImages.forEach((img, index) => {
                const preview = document.createElement('div');
                preview.className = 'image-preview';

                const imgEl = document.createElement('img');
                imgEl.src = img;

                const number = document.createElement('div');
                number.className = 'image-number';
                number.textContent = index + 1;

                preview.appendChild(imgEl);
                preview.appendChild(number);
                imagePreviews.appendChild(preview);
            });
        }
    }

    function createScratchOffBoxes() {
        if (gifts.length === 0) {
            alert('Please add some gifts first!');
            settingsSection.style.display = 'block';
            gameOutput.style.display = 'block';
            return;
        }

        scratchOffBtn.style.display = 'none';
        currentMode = 'scratch';
        boxesContainer.innerHTML = '';
        addBackButton();
        const flexContainer = document.createElement('div');
        flexContainer.className = 'flex-boxes-container';
        flexContainer.style.display = 'flex';
        flexContainer.style.flexWrap = 'wrap';
        flexContainer.style.justifyContent = 'center';
        flexContainer.style.gap = '15px';
        const shuffledGifts = shuffleArray([...gifts]);
        shuffledGifts.forEach((gift, index) => {
            const boxWrapper = document.createElement('div');
            boxWrapper.className = 'box-wrapper';
            boxWrapper.style.position = 'relative';
            boxWrapper.style.margin = '10px';
            const scratchBox = document.createElement('div');
            scratchBox.className = 'scratch-box';
            const numberBadge = document.createElement('div');
            numberBadge.className = 'number-badge';
            numberBadge.textContent = index + 1;
            numberBadge.style.position = 'absolute';
            numberBadge.style.top = '-15px';
            numberBadge.style.left = '50%';
            numberBadge.style.transform = 'translateX(-50%)';
            numberBadge.style.backgroundColor = '#4361ee';
            numberBadge.style.color = 'white';
            numberBadge.style.borderRadius = '50%';
            numberBadge.style.width = '32px';
            numberBadge.style.height = '32px';
            numberBadge.style.display = 'flex';
            numberBadge.style.alignItems = 'center';
            numberBadge.style.justifyContent = 'center';
            numberBadge.style.fontWeight = 'bold';
            numberBadge.style.fontSize = '16px';
            numberBadge.style.zIndex = '10';
            numberBadge.style.border = '2px solid white';
            numberBadge.style.boxShadow = '0 2px 5px rgba(0,0,0,0.5)';
            const prizeLayer = document.createElement('div');
            prizeLayer.className = 'prize-layer';

            // Check if this is an image gift
            const imageMatch = gift.match(/\[IMAGE:(\d+)\]/);
            if (imageMatch && giftImages[parseInt(imageMatch[1])]) {
                const imageIndex = parseInt(imageMatch[1]);
                const prizeImage = document.createElement('img');
                prizeImage.className = 'prize-image';
                prizeImage.src = giftImages[imageIndex];
                prizeImage.style.width = '100%';
                prizeImage.style.height = '100%';
                prizeImage.style.objectFit = 'cover';
                prizeImage.dataset.gift = gift;
                prizeLayer.appendChild(prizeImage);
            } else {
                const prizeText = document.createElement('div');
                prizeText.className = 'prize-text';
                prizeText.textContent = gift;
                prizeText.dataset.gift = gift;
                prizeLayer.appendChild(prizeText);
            }

            scratchBox.appendChild(prizeLayer);
            const canvas = document.createElement('canvas');
            canvas.className = 'scratch-canvas';
            canvas.width = 140;
            canvas.height = 160;
            scratchBox.appendChild(canvas);
            boxWrapper.appendChild(scratchBox);
            boxWrapper.appendChild(numberBadge);
            flexContainer.appendChild(boxWrapper);
            initScratch(canvas, scratchBox, gift);
        });

        boxesContainer.appendChild(flexContainer);
    }

    function addBackButton() {
        const existingBackBtn = document.querySelector('.back-button');
        if (existingBackBtn) {
            existingBackBtn.style.display = 'block';
            return;
        }

        const backBtn = document.createElement('button');
        backBtn.textContent = 'Back to menu';
        backBtn.className = 'back-button';
        backBtn.style.padding = '5px 15px';
        backBtn.style.backgroundColor = '#4cc9f0';
        backBtn.style.color = 'white';
        backBtn.style.border = 'none';
        backBtn.style.borderRadius = '5px';
        backBtn.style.cursor = 'pointer';
        backBtn.style.fontWeight = 'bold';
        backBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        backBtn.style.margin = '0 0 10px 0'; // Add bottom margin

        backBtn.addEventListener('mouseover', function () {
            this.style.backgroundColor = '#3baccd';
        });

        backBtn.addEventListener('mouseout', function () {
            this.style.backgroundColor = '#4cc9f0';
        });

        backBtn.addEventListener('click', function () {
            boxesContainer.innerHTML = '';
            currentMode = null;
            settingsSection.style.display = 'block';
            gameOutput.style.display = 'none';
            scratchOffBtn.style.display = 'block';
            this.style.display = 'none';

            const themeToggleContainer = document.querySelector('.theme-toggle');
            if (themeToggleContainer) {
                themeToggleContainer.style.display = 'flex';
            }
        });

        const gameOutput = document.getElementById('game-output');
        gameOutput.parentNode.insertBefore(backBtn, gameOutput);

        backBtn.style.display = 'block';
    }

    function initScratch(canvas, scratchBox, gift) {
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let percentScratched = 0;
        let lastX, lastY;

        if (scratchImages.length > 0) {
            const randomImg = scratchImages[Math.floor(Math.random() * scratchImages.length)];
            const img = new Image();
            img.onload = function () {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = randomImg;
        } else {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, getRandomColor());
            gradient.addColorStop(0.5, getRandomColor());
            gradient.addColorStop(1, getRandomColor());
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < 100; i++) {
                ctx.beginPath();
                ctx.arc(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    Math.random() * 10 + 2,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
                ctx.fill();
            }
            ctx.font = '18px Montserrat';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText('Scratch here!', canvas.width / 2, canvas.height / 2);
        }
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('touchstart', startDrawingTouch);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('touchmove', drawTouch);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('touchend', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        function startDrawing(e) {
            isDrawing = true;
            lastX = e.offsetX;
            lastY = e.offsetY;
        }

        function startDrawingTouch(e) {
            e.preventDefault();
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            lastX = e.touches[0].clientX - rect.left;
            lastY = e.touches[0].clientY - rect.top;
        }

        function draw(e) {
            if (!isDrawing) return;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 30;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            lastX = e.offsetX;
            lastY = e.offsetY;
            updateScratchProgress();
        }

        function drawTouch(e) {
            e.preventDefault();
            if (!isDrawing) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 30;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();

            lastX = x;
            lastY = y;

            updateScratchProgress();
        }

        function stopDrawing() {
            isDrawing = false;
        }

        function updateScratchProgress() {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let transparentPixels = 0;

            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] === 0) {
                    transparentPixels++;
                }
            }

            const totalPixels = (canvas.width * canvas.height);
            percentScratched = (transparentPixels / totalPixels) * 100;

            if (percentScratched > 50) {
                canvas.style.display = 'none';
                createConfetti();

                scratchBox.addEventListener('click', function () {
                    showZoomedPrize(gift);
                });
            }
        }
    }

    function showZoomedPrize(gift) {
        const modal = document.getElementById('zoom-modal');
        const zoomedPrizeContent = document.getElementById('zoomed-prize-content');

        // Clear previous content
        zoomedPrizeContent.innerHTML = '';

        // Check if this is an image gift
        const imageMatch = gift.match(/\[IMAGE:(\d+)\]/);
        if (imageMatch && giftImages[parseInt(imageMatch[1])]) {
            const imageIndex = parseInt(imageMatch[1]);
            const prizeImage = document.createElement('img');
            prizeImage.className = 'zoomed-prize-image';
            prizeImage.src = giftImages[imageIndex];
            prizeImage.style.maxWidth = '100%';
            prizeImage.style.maxHeight = '80vh';
            prizeImage.style.objectFit = 'contain';
            prizeImage.style.borderRadius = '8px';
            prizeImage.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            zoomedPrizeContent.appendChild(prizeImage);
        } else {
            // For text gifts
            zoomedPrizeContent.textContent = gift;
            zoomedPrizeContent.style.fontSize = '24px';
            zoomedPrizeContent.style.fontWeight = 'bold';
            zoomedPrizeContent.style.textAlign = 'center';
            zoomedPrizeContent.style.padding = '20px';
        }

        // Show the modal
        modal.style.display = 'flex';

        // Setup close button
        const closeBtn = modal.querySelector('.zoom-close');
        closeBtn.onclick = function () {
            modal.style.display = 'none';
        };

        // Close on click outside content
        modal.onclick = function (e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }
    function createConfetti() {

        const container = document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            document.getElementById('game-output');

        for (let i = 0; i < 50; i++) {
            createConfettiPiece(container);
        }
    }

    function createConfettiPiece(container) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        confetti.style.position = 'absolute';
        confetti.style.zIndex = '1000';
        confetti.style.pointerEvents = 'none';
        confetti.style.animation = 'confettiFall linear forwards';

        const colors = ['#f72585', '#4361ee', '#4cc9f0', '#f77f00', '#e63946'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        confetti.style.left = Math.random() * 99.9 + '%';
        confetti.style.top = '-10px';

        const size = Math.random() * 10 + 5;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';

        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

        const duration = Math.random() * 3 + 2;
        confetti.style.animationDuration = duration + 's';

        container.appendChild(confetti);

        setTimeout(() => {
            if (container.contains(confetti)) {
                container.removeChild(confetti);
            }
        }, duration * 900);
    }

    document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes confettiFall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .confetti {
            position: absolute;
            z-index: 1000;
            pointer-events: none;
            animation: confettiFall linear forwards;
        }
        
        /* Ensure zoom modal appears above fullscreen content */
        .zoom-modal {
            z-index: 2000 !important;
        }

    </style>
`);

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function lightenDarkenColor(color, amount) {
        let usePound = false;

        if (color[0] === "#") {
            color = color.slice(1);
            usePound = true;
        }

        const num = parseInt(color, 16);
        let r = (num >> 16) & 255;
        let g = (num >> 8) & 255;
        let b = num & 255;

        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        return (usePound ? "#" : "") + (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0');
    }
});
window.addEventListener('beforeunload', function () {
    localStorage.removeItem('scratchImages');
});
