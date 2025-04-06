// Add these functions to your existing JavaScript

// Toggle display of background options based on selection
function toggleBackgroundOptions() {
    const option = document.getElementById("backgroundOption").value;
    const customRow = document.getElementById("customBackgroundRow");
    const galleryRow = document.getElementById("galleryBackgroundRow");

    // Hide both rows first
    customRow.style.display = "none";
    galleryRow.style.display = "none";

    // Show the appropriate row based on selection
    if (option === "custom") {
        customRow.style.display = "flex";
    } else if (option === "gallery") {
        galleryRow.style.display = "flex";
    } else {
        // Reset to default background
        document.body.style.backgroundImage =
            "url('501c82db-88cb-43df-bc4d-0ac9044fb640.png')";
        localStorage.removeItem("customBackground");
    }

    // Save the background preference
    localStorage.setItem("backgroundOption", option);
}


// Gallery background options
const backgroundGallery = {
    geometric: "linear-gradient(45deg, #0099f7, #f11712)",
    gradient: "linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)",
    confetti: "linear-gradient(45deg, #FC466B, #3F5EFB)",
    stars: "linear-gradient(45deg, #1e3c72, #2a5298)",
    abstract: "linear-gradient(45deg, #8360c3, #2ebf91)",
};


// Handle custom background image upload
function updateBackground(event) {
    const file = event.target.files[0];
    if (file) {
        // Create a truncated filename for display
        const fileName = file.name;
        const truncatedName = fileName.length > 10 ?
            fileName.substring(0, 7) + "..." :
            fileName;

        // Update the file name display
        const fileNameDisplay = document.querySelector(".file-name");
        if (fileNameDisplay) {
            fileNameDisplay.textContent = truncatedName;
        }

        // Process the file as before
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageDataUrl = e.target.result;
            document.body.style.backgroundImage = `url('${imageDataUrl}')`;
            document.body.style.backgroundSize = "100% 100%";
            document.body.style.backgroundAttachment = "fixed";
            localStorage.setItem('customBackground', imageDataUrl);
        };
        reader.readAsDataURL(file);
    }
}
// Update background from gallery selection
function updateGalleryBackground() {
    const option = document.getElementById("galleryBackground").value;
    const background = backgroundGallery[option];
    document.body.style.backgroundImage = background;
    // Save the gallery background choice
    localStorage.setItem("galleryBackground", option);
}

// Load saved background settings on page load
function loadSavedBackgroundSettings() {
    // Get saved background option
    const savedOption = localStorage.getItem("backgroundOption");
    if (savedOption) {
        document.getElementById("backgroundOption").value = savedOption;

        // Apply the saved background based on the option
        if (savedOption === "custom") {
            const customBackground = localStorage.getItem("customBackground");
            if (customBackground) {
                document.body.style.backgroundImage = `url(${customBackground})`;
                document.getElementById("customBackgroundRow").style.display =
                    "flex";
            }
        } else if (savedOption === "gallery") {
            const galleryChoice = localStorage.getItem("galleryBackground");
            if (galleryChoice && backgroundGallery[galleryChoice]) {
                document.body.style.backgroundImage =
                    backgroundGallery[galleryChoice];
                document.getElementById("galleryBackground").value =
                    galleryChoice;
                document.getElementById("galleryBackgroundRow").style.display =
                    "flex";
            }
        }
    }
}

// Modify the existing window.onload function to include background loading
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

        updateNameBlocks();
    }

    // Load saved background settings
    loadSavedBackgroundSettings();
};
