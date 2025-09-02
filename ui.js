// UI interaction management
function initializeCharacterSelection() {
    const characterSlots = document.querySelectorAll('.character-slot');

    characterSlots.forEach(slot => {
        const characterIndex = parseInt(slot.dataset.characterIndex, 10);
        const characterData = characters[characterIndex];
        
        // Initial color shader application
        applyColorShader(slot);

        // Hide gender toggle if character doesn't have variants
        const genderToggleWrapper = slot.querySelector('.gender-toggle-wrapper');
        if (genderToggleWrapper && !characterData.variants) {
            genderToggleWrapper.style.display = 'none';
        }

        // Arrow click listeners for character swapping
        const leftArrow = slot.querySelector('.left-arrow');
        const rightArrow = slot.querySelector('.right-arrow');

        leftArrow.addEventListener('click', () => {
            let currentIndex = parseInt(slot.dataset.characterIndex, 10);
            currentIndex = (currentIndex - 1 + characters.length) % characters.length;
            slot.dataset.characterIndex = currentIndex;
            updateCharacterSlot(slot, characters[currentIndex], 'left');
        });

        rightArrow.addEventListener('click', () => {
            let currentIndex = parseInt(slot.dataset.characterIndex, 10);
            currentIndex = (currentIndex + 1) % characters.length;
            slot.dataset.characterIndex = currentIndex;
            updateCharacterSlot(slot, characters[currentIndex], 'right');
        });

        // Gender toggle listener
        const genderToggle = slot.querySelector('.gender-toggle');
        if (genderToggle) {
            genderToggle.addEventListener('click', () => {
                const currentGender = slot.dataset.gender;
                const newGender = currentGender === 'male' ? 'female' : 'male';
                slot.dataset.gender = newGender;

                // Update button visual state
                genderToggle.dataset.activeGender = newGender;
                genderToggle.querySelector('.gender-male').classList.toggle('active', newGender === 'male');
                genderToggle.querySelector('.gender-female').classList.toggle('active', newGender === 'female');

                const currentIndex = parseInt(slot.dataset.characterIndex, 10);
                const character = characters[currentIndex];
                
                // Animate image swap
                const imageWrapper = slot.querySelector('.character-image-wrapper');
                const oldImage = imageWrapper.querySelector('.character-image');
                const color = slot.dataset.color;

                const newImage = document.createElement('img');
                const characterImg = getCharacterImage(character, newGender);
                const cachedSrc = characterImageCache[characterImg]?.[color];

                newImage.src = cachedSrc || characterImg;
                newImage.alt = character.name;
                newImage.className = 'character-image';
                newImage.dataset.baseHue = character.baseHue;
                newImage.style.opacity = '0';
                imageWrapper.appendChild(newImage);

                if (!cachedSrc) {
                    applyColorShaderToImage(newImage, color);
                }

                playSound(stoneShiftBuffer);

                // Fade out old, fade in new
                oldImage.style.transition = 'opacity 0.25s ease-out';
                newImage.style.transition = 'opacity 0.25s ease-in';
                
                oldImage.style.opacity = '0';
                setTimeout(() => newImage.style.opacity = '1', 50);

                setTimeout(() => {
                    if (oldImage.dataset.blobUrl) {
                        URL.revokeObjectURL(oldImage.dataset.blobUrl);
                    }
                    oldImage.remove();
                }, 250);
            });
        }
    });
}

// Set up the start overlay
function initializeStartOverlay() {
    const startOverlay = document.getElementById('start-overlay');

    startOverlay.addEventListener('click', async () => {
        startOverlay.classList.add('hidden');
        await initializeAudio();
    }, { once: true }); // The event listener will only run once
}