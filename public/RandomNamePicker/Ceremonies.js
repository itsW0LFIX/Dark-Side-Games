// <!-- Selection Ceremonies -->
    // Add to the Advanced Settings HTML inside the setting-group before </div>
    const themeSelectionHTML = `
<h4>Theme Selection</h4>
<div class="setting-row">
    <label for="ceremonyTheme">Selection Ceremony Theme:</label>
    <select id="ceremonyTheme">
        <option value="none">None</option>
        <option value="halloween">Halloween</option>
        <option value="christmas">Christmas</option>
        <option value="birthday">Birthday</option>
        <option value="new-year">New Year</option>
        <option value="valentine">Valentine's Day</option>
    </select>
</div>
`;

    // Function to create themed confetti
    function createThemedConfetti() {
        const confettiCount = 100;
        const theme = document.getElementById("ceremonyTheme").value;

        let colors = [
            "#ff0000",
            "#00ff00",
            "#0000ff",
            "#ffff00",
            "#ff00ff",
            "#00ffff",
        ];

        // Set theme-specific confetti colors
        switch (theme) {
            case "halloween":
                colors = ["#FF6600", "#000000", "#663399", "#66FF00"];
                break;
            case "christmas":
                colors = ["#FF0000", "#00FF00", "#FFFFFF", "#FFD700"];
                break;
            case "birthday":
                colors = ["#FF1493", "#00BFFF", "#FFFF00", "#FF4500", "#7CFC00"];
                break;
            case "new-year":
                colors = ["#FFD700", "#FF0000", "#00FF00", "#0000FF", "#FF00FF"];
                break;
            case "valentine":
                colors = ["#FF69B4", "#FF1493", "#C71585", "#DB7093", "#FFC0CB"];
                break;
        }

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement("div");
            confetti.classList.add("confetti");

            // Add theme-specific class if theme is selected
            if (theme !== "none") {
                confetti.classList.add(theme);
            }

            confetti.style.left = Math.random() * 100 + "vw";
            confetti.style.width = Math.random() * 10 + 5 + "px";
            confetti.style.height = confetti.style.width;

            // Only set background color if not using themed SVG shapes
            if (
                theme !== "halloween" &&
                theme !== "christmas" &&
                theme !== "valentine"
            ) {
                confetti.style.backgroundColor =
                    colors[Math.floor(Math.random() * colors.length)];
            }

            confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
            confetti.style.opacity = Math.random();
            document.body.appendChild(confetti);

            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    // Modify the existing pickRandom function to use themed animations
    function pickRandomWithTheme() {
        // Get the theme
        const theme = document.getElementById("ceremonyTheme")?.value || "none";

        // If no theme selected, use the selected animation style
        let animationStyle =
            document.getElementById("animationStyle")?.value || "pulse";

        // If theme is selected, override the animation style
        if (theme !== "none") {
            switch (theme) {
                case "halloween":
                    animationStyle = "halloween-bats";
                    break;
                case "christmas":
                    animationStyle = "christmas-snow";
                    break;
                case "birthday":
                    animationStyle = "birthday-balloons";
                    break;
                case "new-year":
                    animationStyle = "new-year-fireworks";
                    break;
                case "valentine":
                    animationStyle = "valentine-hearts";
                    break;
            }
        }

        // Replace the original createConfetti with the themed version
        if (document.getElementById("showConfetti").checked) {
            createThemedConfetti();
        }

        // Use the determined animation style
        return animationStyle;
    }

    // Modify your existing finishSelection function to use themed celebrations
    function modifyFinishSelection() {
        // Inside your finishSelection function, replace the confetti call with:
        if (document.getElementById("showConfetti").checked) {
            createThemedConfetti();
        }
    }



// 

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
                "shake",
                "halloween-bats",
                "christmas-snow",
                "birthday-balloons",
                "new-year-fireworks",
                "valentine-hearts"
            );
            block.style.backgroundColor = "rgba(52, 152, 219, 0.8)";
        });

        // Get theme and determine animation style
        const theme = document.getElementById("ceremonyTheme")?.value || "none";
        let animationStyle =
            document.getElementById("animationStyle")?.value || "pulse";

        // If theme is selected, override the animation style
        if (theme !== "none") {
            switch (theme) {
                case "halloween":
                    animationStyle = "halloween-bats";
                    break;
                case "christmas":
                    animationStyle = "christmas-snow";
                    break;
                case "birthday":
                    animationStyle = "birthday-balloons";
                    break;
                case "new-year":
                    animationStyle = "new-year-fireworks";
                    break;
                case "valentine":
                    animationStyle = "valentine-hearts";
                    break;
            }
        }

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
                    "zigzag",
                    "halloween-bats",
                    "christmas-snow",
                    "birthday-balloons",
                    "new-year-fireworks",
                    "valentine-hearts"
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

// ////////////////

    function createConfetti() {
        const confettiCount = 100;
        const theme = document.getElementById("ceremonyTheme")?.value || "none";

        let colors = [
            "#ff0000",
            "#00ff00",
            "#0000ff",
            "#ffff00",
            "#ff00ff",
            "#00ffff",
        ];

        // Set theme-specific confetti colors
        switch (theme) {
            case "halloween":
                colors = ["#FF6600", "#000000", "#663399", "#66FF00"];
                break;
            case "christmas":
                colors = ["#FF0000", "#00FF00", "#FFFFFF", "#FFD700"];
                break;
            case "birthday":
                colors = ["#FF1493", "#00BFFF", "#FFFF00", "#FF4500", "#7CFC00"];
                break;
            case "new-year":
                colors = ["#FFD700", "#FF0000", "#00FF00", "#0000FF", "#FF00FF"];
                break;
            case "valentine":
                colors = ["#FF69B4", "#FF1493", "#C71585", "#DB7093", "#FFC0CB"];
                break;
        }

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement("div");
            confetti.classList.add("confetti");

            // Add theme-specific class if theme is selected
            if (theme !== "none") {
                confetti.classList.add(theme);
            }

            confetti.style.left = Math.random() * 100 + "vw";
            confetti.style.width = Math.random() * 10 + 5 + "px";
            confetti.style.height = confetti.style.width;

            // Only set background color if not using themed SVG shapes
            if (
                theme !== "halloween" &&
                theme !== "christmas" &&
                theme !== "valentine"
            ) {
                confetti.style.backgroundColor =
                    colors[Math.floor(Math.random() * colors.length)];
            }

            confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
            confetti.style.opacity = Math.random();
            document.body.appendChild(confetti);

            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }
