let names = [];
let nameWeights = {}; // Store weights for each name
let animationInterval;
let selectionHistory = [];


// Add this to your global variables at the top of script.js
let excludedNames = {}; // Format: {name: expirationTimestamp}

// Add this function to load excluded names from localStorage
function loadExcludedNames() {
    const savedExclusions = localStorage.getItem("excludedNames");
    if (savedExclusions) {
        excludedNames = JSON.parse(savedExclusions);

        // Clean up expired exclusions
        const now = Date.now();
        for (const name in excludedNames) {
            if (excludedNames[name] < now) {
                delete excludedNames[name];
            }
        }

        // Save the cleaned list
        localStorage.setItem("excludedNames", JSON.stringify(excludedNames));

        // Update visual indicators
        updateNameBlocks();
    }
}

// Add this to your window.onload function
window.onload = function () {
    const savedNames = localStorage.getItem("savedNames");
    if (savedNames) {
        document.getElementById("nameInput").value = savedNames;
        names = savedNames
            .split("\n")
            .map((name) => name.trim())
            .filter((name) => name !== "");

        // Load saved weights if they exist
        const savedWeights = localStorage.getItem("nameWeights");
        if (savedWeights) {
            nameWeights = JSON.parse(savedWeights);
        }

        // Load excluded names
        loadExcludedNames();

        updateNameBlocks();
    }

    // Set up the weight double-click handler
    setupWeightDoubleClickHandler();

    // Initialize weight controls visibility
    if (document.getElementById("useWeights")) {
        toggleWeightControls();
    }
};

// Add exclusion settings to Advanced Settings panel
function addExclusionSettingsToUI() {
    // Add to advanced settings
    const advancedSettings = document.getElementById('advancedSettings');
    const lastSettingGroup = advancedSettings.querySelector('.setting-group:last-child');

    const exclusionSettings = document.createElement('div');
    exclusionSettings.classList.add('setting-group');
    exclusionSettings.innerHTML = `
        <h4>Name Exclusion</h4>
        <div class="setting-row">
            <label for="excludeSelected">Exclude selected winners:</label>
            <input type="checkbox" id="excludeSelected">
        </div>
        <div class="exclusion-duration-row setting-row">
            <label for="excludeDuration">Exclusion period:</label>
            <div class="exclusion-inputs">
                <input type="number" id="excludeDuration" min="1" value="1">
                <select id="excludeUnit">
                    <option value="seconds">Seconds</option>
                    <option value="minutes" selected>Minutes</option>
                </select>
            </div>
        </div>
        <div class="setting-row">
            <button class="secondary-btn" id="manageExclusions">Manage Exclusions</button>
        </div>
    `;

    // Insert before the last button
    advancedSettings.insertBefore(exclusionSettings, advancedSettings.querySelector('.close-btn'));

    // Add event listener for the Manage Exclusions button
    document.getElementById('manageExclusions').addEventListener('click', function () {
        openExclusionManager();
    });
}

// Add context menu for exclusion management
function openNameContextMenu(event, name) {
    // Remove any existing context menus
    const existingMenu = document.querySelector('.name-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    // Create context menu
    const contextMenu = document.createElement('div');
    contextMenu.classList.add('name-context-menu');
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;

    // Check if name is currently excluded
    const now = Date.now();
    const isExcluded = excludedNames[name] && excludedNames[name] > now;

    if (isExcluded) {
        // Calculate remaining time
        const remainingMs = excludedNames[name] - now;
        let timeDisplay = "";

        if (remainingMs > 60 * 1000) {
            timeDisplay = Math.ceil(remainingMs / (60 * 1000)) + " minutes";
        } else {
            timeDisplay = Math.ceil(remainingMs / 1000) + " seconds";
        }

        contextMenu.innerHTML = `
            <div class="menu-item">${name}</div>
            <div class="menu-separator"></div>
            <div class="menu-item excluded-info">Excluded for ${timeDisplay}</div>
            <div class="menu-item" data-action="remove-exclusion">Remove Exclusion</div>
        `;
    } else {
        contextMenu.innerHTML = `
            <div class="menu-item">${name}</div>
            <div class="menu-separator"></div>
            <div class="menu-item" data-action="exclude-30s">Exclude for 30 seconds</div>
            <div class="menu-item" data-action="exclude-1m">Exclude for 1 minute</div>
            <div class="menu-item" data-action="exclude-5m">Exclude for 5 minutes</div>
            <div class="menu-item" data-action="exclude-custom">Custom exclusion...</div>
        `;
    }

    // Add to document
    document.body.appendChild(contextMenu);

    // Add event listeners
    contextMenu.addEventListener('click', function (e) {
        const action = e.target.dataset.action;

        if (action === 'remove-exclusion') {
            delete excludedNames[name];
            localStorage.setItem("excludedNames", JSON.stringify(excludedNames));
            updateNameBlocks();
        } else if (action === 'exclude-30s') {
            excludedNames[name] = Date.now() + (30 * 1000);
            localStorage.setItem("excludedNames", JSON.stringify(excludedNames));
            updateNameBlocks();
        } else if (action === 'exclude-1m') {
            excludedNames[name] = Date.now() + (60 * 1000);
            localStorage.setItem("excludedNames", JSON.stringify(excludedNames));
            updateNameBlocks();
        } else if (action === 'exclude-5m') {
            excludedNames[name] = Date.now() + (5 * 60 * 1000);
            localStorage.setItem("excludedNames", JSON.stringify(excludedNames));
            updateNameBlocks();
        } else if (action === 'exclude-custom') {
            openCustomExclusionDialog(name);
        }

        // Close the menu
        contextMenu.remove();
    });

    // Close menu when clicking elsewhere
    document.addEventListener('click', function closeMenu() {
        contextMenu.remove();
        document.removeEventListener('click', closeMenu);
    });
}

// Add custom exclusion dialog
function openCustomExclusionDialog(name) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    // Create modal
    const modal = document.createElement('div');
    modal.classList.add('exclusion-modal');

    modal.innerHTML = `
        <div class="modal-header">
            <h3>Set Exclusion Period</h3>
        </div>
        <div class="modal-body">
            <p>Exclude "${name}" for:</p>
            <div class="exclusion-input">
                <input type="number" id="customExcludeDuration" min="1" value="1">
                <select id="customExcludeUnit">
                    <option value="seconds">Seconds</option>
                    <option value="minutes" selected>Minutes</option>
                </select>
            </div>
        </div>
        <div class="modal-footer">
            <button class="secondary-btn" id="cancelExclusion">Cancel</button>
            <button class="primary-btn" id="confirmExclusion">Exclude</button>
        </div>
    `;

    // Add to document
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Add event listeners
    document.getElementById('cancelExclusion').addEventListener('click', function () {
        overlay.remove();
        modal.remove();
    });

    document.getElementById('confirmExclusion').addEventListener('click', function () {
        const duration = parseInt(document.getElementById('customExcludeDuration').value);
        const unit = document.getElementById('customExcludeUnit').value;

        let exclusionTime = 0;
        switch (unit) {
            case "seconds":
                exclusionTime = duration * 1000;
                break;
            case "minutes":
                exclusionTime = duration * 60 * 1000;
                break;
        }

        excludedNames[name] = Date.now() + exclusionTime;
        localStorage.setItem("excludedNames", JSON.stringify(excludedNames));
        updateNameBlocks();

        overlay.remove();
        modal.remove();
    });

    // Close on escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            overlay.remove();
            modal.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

// Modify finishSelection function to handle seconds for exclusion
function finishSelection(winnerCount) {
    const blocks = document.querySelectorAll(".nameBlock");
    const resultElement = document.getElementById("result");
    const winnersContainer = document.getElementById("winnersContainer");
    const useWeights = document.getElementById("useWeights")?.checked;

    // Clear any existing highlight classes
    blocks.forEach((block) => {
        block.classList.remove(
            "highlight",
            "pulse",
            "spin",
            "bounce",
            "flip",
            "shake",
            "glow",
            "colorShift",
            "zigzag"
        );
    });

    let selectedWinners = [];
    let selectedIndices = [];

    // Filter out excluded names before selection
    let availableIndices = [];
    const now = Date.now();

    names.forEach((name, index) => {
        // Only include names that aren't excluded or whose exclusion has expired
        if (!excludedNames[name] || excludedNames[name] < now) {
            availableIndices.push(index);
        }
    });

    // Check if we have any names available to select
    if (availableIndices.length === 0) {
        resultElement.innerText = "All names are currently excluded!";
        resultElement.classList.add("show");
        return;
    }

    if (useWeights) {
        // Create weighted array of indices (only for available names)
        let weightedIndices = [];

        availableIndices.forEach(index => {
            const name = names[index];
            const weight = nameWeights[name] || 1;
            // Add index to array multiple times based on weight
            for (let i = 0; i < Math.ceil(weight * 10); i++) {
                weightedIndices.push(index);
            }
        });

        // Select winners without replacement from weighted indices
        for (let i = 0; i < winnerCount; i++) {
            if (weightedIndices.length === 0) break;

            // Select random index from weighted array
            const randomPosition = Math.floor(Math.random() * weightedIndices.length);
            const selectedIndex = weightedIndices[randomPosition];

            // Add to winners
            selectedWinners.push(names[selectedIndex]);
            selectedIndices.push(selectedIndex);

            // Remove all occurrences of this index from weightedIndices to prevent re-selection
            weightedIndices = weightedIndices.filter(idx => idx !== selectedIndex);
        }
    } else {
        // Original non-weighted selection logic (but only from available indices)
        for (let i = 0; i < winnerCount; i++) {
            if (availableIndices.length === 0) break;

            const randomIndex = Math.floor(Math.random() * availableIndices.length);
            const nameIndex = availableIndices[randomIndex];

            selectedWinners.push(names[nameIndex]);
            selectedIndices.push(nameIndex);

            // Remove this index from available indices
            availableIndices.splice(randomIndex, 1);
        }
    }

    // Add to history if tracking is enabled
    if (document.getElementById("trackHistory").checked) {
        const timestamp = new Date().toLocaleTimeString();
        selectionHistory.unshift({
            names: selectedWinners,
            time: timestamp,
        });
        updateHistory();
    }

    // Highlight winners in the display
    selectedIndices.forEach((index) => {
        if (blocks[index]) {
            blocks[index].classList.add("winner");
            blocks[index].style.backgroundColor = "rgba(46, 204, 113, 0.8)";
        }
    });

    // Show celebration if enabled
    if (document.getElementById("showConfetti").checked) {
        createConfetti();
    }

    // Display results
    if (winnerCount === 1) {
        resultElement.innerText = `The chosen one is: ${selectedWinners[0]}!`;
        resultElement.classList.add("show");
    } else {
        resultElement.innerText = `${winnerCount} Winners Selected!`;
        resultElement.classList.add("show");

        // Create winner cards
        selectedWinners.forEach((winner) => {
            const winnerCard = document.createElement("div");
            winnerCard.classList.add("winner-card");
            winnerCard.innerText = winner;
            winnersContainer.appendChild(winnerCard);
        });
    }

    // Remove selected names if option is checked
    if (document.getElementById("removeSelected").checked) {
        setTimeout(() => {
            // Remove in reverse order to maintain correct indices
            selectedIndices
                .sort((a, b) => b - a)
                .forEach((index) => {
                    names.splice(index, 1);
                });

            document.getElementById("nameInput").value = names.join("\n");
            updateNameBlocks();
        }, 2000);
    }

    // If exclusion checkbox is checked, exclude the selected winners
    if (document.getElementById("excludeSelected").checked) {
        const excludeDuration = parseInt(document.getElementById("excludeDuration").value || "1");
        const excludeUnit = document.getElementById("excludeUnit").value;

        // Calculate exclusion time in milliseconds
        let exclusionTime = 0;
        switch (excludeUnit) {
            case "seconds":
                exclusionTime = excludeDuration * 1000;
                break;
            case "minutes":
                exclusionTime = excludeDuration * 60 * 1000;
                break;
        }

        // Set exclusion expiration timestamp for each winner
        const now = Date.now();
        selectedWinners.forEach(name => {
            excludedNames[name] = now + exclusionTime;
        });

        // Save exclusions to localStorage
        localStorage.setItem("excludedNames", JSON.stringify(excludedNames));

        // Update name blocks to show exclusion status
        updateNameBlocks();
    }
}

// Update the updateNameBlocks function to show seconds remaining
function updateNameBlocks() {
    let container = document.getElementById("nameContainer");
    container.innerHTML = "";
    const useWeights = document.getElementById("useWeights")?.checked || false;
    const now = Date.now();

    names.forEach((name, index) => {
        let div = document.createElement("div");
        div.classList.add("nameBlock");

        // Check if name is excluded
        const isExcluded = excludedNames[name] && excludedNames[name] > now;

        if (isExcluded) {
            div.classList.add("excluded");

            // Calculate remaining time
            const remainingMs = excludedNames[name] - now;
            let timeDisplay = "";

            if (remainingMs > 60 * 1000) {
                timeDisplay = Math.ceil(remainingMs / (60 * 1000)) + "m";
            } else {
                timeDisplay = Math.ceil(remainingMs / 1000) + "s";
            }

            div.title = `Excluded for ${timeDisplay}`;
        }

        // Create main content with name and optional weight display
        if (useWeights) {
            const weight = nameWeights[name] || 1;
            div.innerHTML = `
                <span>${name}</span>
                <span class="weight-badge">${weight}x</span>
                ${isExcluded ? '<span class="exclusion-badge">⏱️</span>' : ''}
            `;

            if (useWeights && !isExcluded) {
                div.title = `Double-click to change weight (currently ${weight}x)`;
            }

            div.dataset.weight = weight;
        } else {
            div.innerHTML = `
                ${name}
                ${isExcluded ? '<span class="exclusion-badge">⏱️</span>' : ''}
            `;
        }

        // Add double-click event for weight editing (only if not excluded)
        if (useWeights && !isExcluded) {
            div.addEventListener("dblclick", function () {
                openWeightEditor(name);
            });
        }

        // Add right-click context menu for exclusion management
        div.addEventListener("contextmenu", function (event) {
            event.preventDefault();
            openNameContextMenu(event, name);
        });

        container.appendChild(div);
    });

    // Save weights to localStorage
    localStorage.setItem('nameWeights', JSON.stringify(nameWeights));
}

// Update the exclusion manager to show seconds
function openExclusionManager() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    // Create modal
    const modal = document.createElement('div');
    modal.classList.add('exclusion-manager-modal');

    // Get excluded names
    const now = Date.now();
    let excludedList = '';

    Object.keys(excludedNames).forEach(name => {
        if (excludedNames[name] > now) {
            const remainingMs = excludedNames[name] - now;
            let timeDisplay = "";

            if (remainingMs > 60 * 1000) {
                timeDisplay = Math.ceil(remainingMs / (60 * 1000)) + " minutes";
            } else {
                timeDisplay = Math.ceil(remainingMs / 1000) + " seconds";
            }

            const date = new Date(excludedNames[name]);
            const formattedDate = date.toLocaleString();

            excludedList += `
                <div class="exclusion-item">
                    <div class="exclusion-name">${name}</div>
                    <div class="exclusion-time">
                        <span title="Until ${formattedDate}">${timeDisplay}</span>
                        <button class="remove-exclusion" data-name="${name}">✕</button>
                    </div>
                </div>
            `;
        }
    });

    if (!excludedList) {
        excludedList = '<p class="no-exclusions">No names are currently excluded.</p>';
    }

    modal.innerHTML = `
        <div class="modal-header">
            <h3>Manage Excluded Names</h3>
            <button class="close-modal">✕</button>
        </div>
        <div class="modal-body exclusion-list">
            ${excludedList}
        </div>
        <div class="modal-footer">
            <button class="secondary-btn clear-all-exclusions">Clear All Exclusions</button>
            <button class="primary-btn close-btn">Close</button>
        </div>
    `;

    // Add to document
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', function () {
        overlay.remove();
        modal.remove();
    });

    modal.querySelector('.close-btn').addEventListener('click', function () {
        overlay.remove();
        modal.remove();
    });

    modal.querySelector('.clear-all-exclusions').addEventListener('click', function () {
        excludedNames = {};
        localStorage.setItem("excludedNames", JSON.stringify(excludedNames));
        updateNameBlocks();
        overlay.remove();
        modal.remove();
    });

    // Add event listeners for individual remove buttons
    const removeButtons = modal.querySelectorAll('.remove-exclusion');
    removeButtons.forEach(button => {
        button.addEventListener('click', function () {
            const name = this.dataset.name;
            delete excludedNames[name];
            localStorage.setItem("excludedNames", JSON.stringify(excludedNames));
            updateNameBlocks();

            // Remove the item from the list
            this.closest('.exclusion-item').remove();

            // If no more items, show no exclusions message
            if (modal.querySelectorAll('.exclusion-item').length === 0) {
                const noExclusions = document.createElement('p');
                noExclusions.classList.add('no-exclusions');
                noExclusions.innerText = 'No names are currently excluded.';
                modal.querySelector('.exclusion-list').appendChild(noExclusions);
            }
        });
    });

    // Close on escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            overlay.remove();
            modal.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function () {
    addExclusionSettingsToUI();
});

// Save exclusions when saving names
function saveNames() {
    const nameString = document.getElementById("nameInput").value;
    localStorage.setItem("savedNames", nameString);

    // Also save weights and exclusions
    localStorage.setItem("nameWeights", JSON.stringify(nameWeights));
    localStorage.setItem("excludedNames", JSON.stringify(excludedNames));

    const resultElement = document.getElementById("result");
    resultElement.innerText = "Names saved successfully!";
    resultElement.classList.add("show");

    setTimeout(() => {
        resultElement.classList.remove("show");
    }, 2000);
}


// Handle input event to add names from textarea
document
    .getElementById("nameInput")
    .addEventListener("input", function () {
        let nameInput = document.getElementById("nameInput");
        let inputValue = nameInput.value.trim();
        if (inputValue === "") {
            names = []; // Clear the names array if the textarea is empty
            updateNameBlocks(); // Update the name blocks (clear them)
        } else {
            let newNames = inputValue
                .split("\n")
                .map((name) => name.trim())
                .filter((name) => name !== "");
            names = newNames;
            updateNameBlocks();
        }
    });



function createConfetti() {
    const confettiCount = 100;
    const colors = [
        "#ff0000",
        "#00ff00",
        "#0000ff",
        "#ffff00",
        "#ff00ff",
        "#00ffff",
    ];

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.width = Math.random() * 10 + 5 + "px";
        confetti.style.height = confetti.style.width;
        confetti.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
        confetti.style.opacity = Math.random();
        document.body.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

function pickRandom() {
    const resultElement = document.getElementById("result");
    const winnersContainer = document.getElementById("winnersContainer");
    resultElement.classList.remove("show");
    resultElement.innerText = "";
    winnersContainer.innerHTML = "";

    if (names.length === 0) {
        resultElement.innerText = "Please add at least one name";
        resultElement.classList.add("show");
        return;
    }

    // Get number of winners to select
    const winnerCount = Math.min(
        parseInt(document.getElementById("winnerCount")?.value || 1),
        names.length
    );

    let blocks = document.querySelectorAll(".nameBlock");

    // Reset all blocks to default state
    blocks.forEach((block) => {
        block.classList.remove(
            "highlight",
            "winner",
            "pulse",
            "spin",
            "bounce",
            "flip",
            "shake"
        );
        block.style.backgroundColor = "rgba(52, 152, 219, 0.8)";
    });

    // Get animation style
    const animationStyle =
        document.getElementById("animationStyle")?.value || "pulse";

    // Animation variables
    let highlightIndex = -1;
    const animationDuration =
        parseFloat(document.getElementById("animationDuration")?.value || 3) *
        1000;
    const startTime = Date.now();

    // Clear any existing interval
    if (animationInterval) clearInterval(animationInterval);

    // Define the animation function
    function animateSelection() {
        // Remove highlight from previous block
        if (highlightIndex >= 0 && highlightIndex < blocks.length) {
            blocks[highlightIndex].classList.remove(
                "highlight",
                "pulse",
                "spin",
                "bounce",
                "flip",
                "shake",
                "glow",
                "colorShift",
                "zigzag"
            );
        }

        // Calculate new highlight index
        highlightIndex = Math.floor(Math.random() * names.length);

        // Add highlight to new block with selected animation style
        blocks[highlightIndex].classList.add("highlight", animationStyle);

        // Calculate progress of animation
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // If animation is complete, clear interval and show result
        if (progress >= 1) {
            clearInterval(animationInterval);
            finishSelection(winnerCount);
        }
    }

    // Start the animation interval
    animationInterval = setInterval(animateSelection, 100);
}

// Function to toggle weight editing mode
function toggleWeightEditing() {
    const nameBlocks = document.querySelectorAll(".nameBlock");
    const weightEditing = document.getElementById("enableWeights").checked;

    nameBlocks.forEach((block, index) => {
        const name = names[index];

        // Clear existing weight UI
        if (block.querySelector(".weight-control")) {
            block.querySelector(".weight-control").remove();
        }

        if (weightEditing) {
            // Add weight controls to each name block
            const weightControl = document.createElement("div");
            weightControl.classList.add("weight-control");

            // Get current weight or default to 1
            const currentWeight = nameWeights[name] || 1;

            // Create weight display and controls
            weightControl.innerHTML = `
                <span class="weight-value">${currentWeight}×</span>
                <div class="weight-buttons">
                    <button class="weight-btn" onclick="adjustWeight('${name}', -0.5)">-</button>
                    <button class="weight-btn" onclick="adjustWeight('${name}', 0.5)">+</button>
                </div>
            `;

            block.appendChild(weightControl);
        }
    });
}

// Function to adjust weight for a specific name
function adjustWeight(name, change) {
    // Initialize weight if it doesn't exist
    if (!nameWeights[name]) {
        nameWeights[name] = 1;
    }

    // Adjust weight and ensure it's at least 0.5
    nameWeights[name] = Math.max(0.5, nameWeights[name] + change);

    // Update the display
    updateNameBlocks();

    // Save weights to localStorage
    localStorage.setItem("nameWeights", JSON.stringify(nameWeights));
}

// Add this function to toggle the weight instruction visibility
function toggleWeightControls() {
    const useWeights = document.getElementById("useWeights").checked;
    const weightControls = document.getElementById("weightControls");

    weightControls.style.display = useWeights ? "block" : "none";

    // Update the name blocks to show weights if enabled
    updateNameBlocks();
}

// Add event listener to detect double-click on name blocks
function setupWeightDoubleClickHandler() {
    const nameContainer = document.getElementById("nameContainer");

    // Use event delegation for efficiency
    nameContainer.addEventListener("dblclick", function (event) {
        const nameBlock = event.target.closest(".nameBlock");

        // Only proceed if useWeights is checked and we clicked a name block
        if (!document.getElementById("useWeights").checked || !nameBlock) {
            return;
        }

        const nameIndex = Array.from(nameBlock.parentNode.children).indexOf(nameBlock);
        const name = names[nameIndex];

        // Get current weight or default to 1
        const currentWeight = nameWeights[name] || 1;

        // Prompt user for new weight
        const newWeight = prompt(`Enter weight for "${name}" (current: ${currentWeight}×):`, currentWeight);

        // Validate and update weight if user didn't cancel
        if (newWeight !== null) {
            const weightValue = parseFloat(newWeight);

            if (!isNaN(weightValue) && weightValue > 0) {
                nameWeights[name] = weightValue;

                // Save weights and update display
                localStorage.setItem("nameWeights", JSON.stringify(nameWeights));
                updateNameBlocks();
            } else {
                alert("Please enter a valid positive number.");
            }
        }
    });
}

function loadNames() {
    const savedNames = localStorage.getItem("savedNames");
    if (savedNames) {
        document.getElementById("nameInput").value = savedNames;
        names = savedNames
            .split("\n")
            .map((name) => name.trim())
            .filter((name) => name !== "");

        // Load saved weights
        const savedWeights = localStorage.getItem("nameWeights");
        if (savedWeights) {
            nameWeights = JSON.parse(savedWeights);
        }

        updateNameBlocks();

        const resultElement = document.getElementById("result");
        resultElement.innerText = "Names loaded successfully!";
        resultElement.classList.add("show");

        setTimeout(() => {
            resultElement.classList.remove("show");
        }, 2000);
    } else {
        const resultElement = document.getElementById("result");
        resultElement.innerText = "No saved names found";
        resultElement.classList.add("show");

        setTimeout(() => {
            resultElement.classList.remove("show");
        }, 2000);
    }
}

function clearNames() {
    document.getElementById("nameInput").value = "";
    names = [];
    nameWeights = {};
    updateNameBlocks();

    const resultElement = document.getElementById("result");
    resultElement.innerText = "All names cleared";
    resultElement.classList.add("show");

    setTimeout(() => {
        resultElement.classList.remove("show");
    }, 2000);
}

function toggleHistory() {
    const historyDiv = document.getElementById("history");
    if (document.getElementById("trackHistory").checked) {
        historyDiv.style.display = "block";
        updateHistory();
    } else {
        historyDiv.style.display = "none";
    }
}

function updateHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    selectionHistory.forEach((item) => {
        const historyItem = document.createElement("div");
        historyItem.classList.add("history-item");

        if (Array.isArray(item.names)) {
            historyItem.innerText = `${item.time}: ${item.names.join(", ")}`;
        } else {
            historyItem.innerText = `${item.time}: ${item.name || item.names}`;
        }

        historyList.appendChild(historyItem);
    });
}

function toggleAdvancedSettings() {
    const advancedSettings = document.getElementById("advancedSettings");
    const overlay = document.getElementById("settingsOverlay");
    advancedSettings.classList.toggle("show");
    overlay.classList.toggle("show");
}

// Add click event to close when clicking outside the panel (on the overlay)
document.getElementById("settingsOverlay").addEventListener("click", function (event) {
    // Only close if clicking directly on the overlay (not its children)
    if (event.target === this) {
        toggleAdvancedSettings();
    }
});

// Add keyboard event to close with Escape key
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        const advancedSettings = document.getElementById("advancedSettings");
        if (advancedSettings.classList.contains("show")) {
            toggleAdvancedSettings();
        }
    }
});

// Open the weight editor for a name
function openWeightEditor(name) {
    // Get current weight
    const currentWeight = nameWeights[name] || 1;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('weight-editor-overlay');
    document.body.appendChild(overlay);

    // Create modal
    const modal = document.createElement('div');
    modal.classList.add('weight-editor-modal');

    // Create modal content
    modal.innerHTML = `
        <div class="weight-editor-title">Set Weight For</div>
        <div class="weight-name">${name}</div>
        
        <div class="weight-value">${currentWeight}x</div>
        
        <div class="weight-slider-container">
            <input type="range" min="0.1" max="10" step="0.1" value="${currentWeight}" 
                  class="weight-slider" id="weightSlider">
        </div>
        
        <div class="weight-editor-buttons">
            <button class="weight-editor-button weight-cancel-button">Cancel</button>
            <button class="weight-editor-button weight-save-button">Save</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Update weight value when slider changes
    const slider = document.getElementById('weightSlider');
    const weightValue = modal.querySelector('.weight-value');

    slider.addEventListener('input', function () {
        weightValue.textContent = `${this.value}x`;
    });

    // Handle save button click
    const saveButton = modal.querySelector('.weight-save-button');
    saveButton.addEventListener('click', function () {
        const newWeight = parseFloat(slider.value);
        nameWeights[name] = newWeight;

        // Save weights to localStorage
        localStorage.setItem('nameWeights', JSON.stringify(nameWeights));

        // Close modal
        closeWeightEditor();

        // Update name blocks
        updateNameBlocks();
    });

    // Handle cancel button click
    const cancelButton = modal.querySelector('.weight-cancel-button');
    cancelButton.addEventListener('click', closeWeightEditor);

    // Handle overlay click
    overlay.addEventListener('click', closeWeightEditor);

    // Highlight the name block that is being edited
    const nameBlocks = document.querySelectorAll('.nameBlock');
    nameBlocks.forEach(block => {
        const blockName = block.querySelector('span')?.textContent || block.textContent;
        if (blockName === name) {
            block.classList.add('name-highlight');
        }
    });

    // Handle Escape key
    document.addEventListener('keydown', handleEscapeKey);
}

// Close the weight editor
function closeWeightEditor() {
    // Remove overlay and modal
    const overlay = document.querySelector('.weight-editor-overlay');
    const modal = document.querySelector('.weight-editor-modal');

    if (overlay) overlay.remove();
    if (modal) modal.remove();

    // Remove event listener
    document.removeEventListener('keydown', handleEscapeKey);

    // Remove highlight from name blocks
    const nameBlocks = document.querySelectorAll('.nameBlock');
    nameBlocks.forEach(block => {
        block.classList.remove('name-highlight');
    });
}

// Handle Escape key
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeWeightEditor();
    }
}

function updateNameBlocks() {
    let container = document.getElementById("nameContainer");
    container.innerHTML = "";
    const useWeights = document.getElementById("useWeights")?.checked || false;

    names.forEach((name, index) => {
        let div = document.createElement("div");
        div.classList.add("nameBlock");

        // Create main content with name and optional weight display
        if (useWeights) {
            const weight = nameWeights[name] || 1;
            div.innerHTML = `
                <span>${name}</span>
                <span class="weight-badge">${weight}x</span>
            `;
            div.title = `Double-click to change weight (currently ${weight}x)`;
            div.dataset.weight = weight;
        } else {
            div.innerText = name;
        }

        // Add double-click event for weight editing
        if (useWeights) {
            div.addEventListener("dblclick", function () {
                openWeightEditor(name);
            });
        }

        container.appendChild(div);
    });

    // Save weights to localStorage
    localStorage.setItem('nameWeights', JSON.stringify(nameWeights));
}

// Function to toggle weighted selection
function toggleWeightedSelection() {
    const useWeights = document.getElementById("useWeights");
    const nameBlocks = document.querySelectorAll(".nameBlock");

    if (useWeights.checked) {
        // Turn on weighted selection
        nameBlocks.forEach(block => {
            const name = block.querySelector("span")?.textContent || block.textContent;
            const weight = nameWeights[name] || 1;
            block.innerHTML = `
                <span>${name}</span>
                <span class="weight-badge">${weight}x</span>
            `;
        });
    } else {
        // Turn off weighted selection and reset weights to 1
        nameBlocks.forEach(block => {
            const name = block.querySelector("span")?.textContent || block.textContent;
            nameWeights[name] = 1;
            block.innerHTML = `
                <span>${name}</span>
            `;
        });

        // Save weights to localStorage
        localStorage.setItem('nameWeights', JSON.stringify(nameWeights));
    }
}

// Add event listener to weighted selection checkbox
document.getElementById("useWeights").addEventListener("change", toggleWeightedSelection);