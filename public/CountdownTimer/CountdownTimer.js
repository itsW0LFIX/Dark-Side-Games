let timer;
let timeRemaining = 0; // Time in seconds
let isRunning = false;

const timerElement = document.getElementById("timer");
const presetButtons = document.querySelectorAll(".preset");
const customMinutesInput = document.getElementById("custom-minutes");
const customSecondsInput = document.getElementById("custom-seconds");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");

// Optional: Add a sound for when the timer ends
const endSound = new Audio("https://www.soundjay.com/button/beep-07.wav");

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function startTimer() {
  if (isRunning) return;

  // If no time is set, try to read custom inputs
  if (timeRemaining <= 0) {
    // Show '00:00' with red color and move left and right
    timerElement.textContent = "00:00";
    timerElement.style.color = "red"; // Red color
    timerElement.classList.add("shake"); // Add shake animation class

    // Reset the animation after it's completed and reset color
    setTimeout(() => {
      timerElement.classList.remove("shake"); // Remove shake class
      timerElement.style.color = "#333"; // Reset color back to default
    }, 1000); // Remove shake after 1 second (adjust as needed)

    return; // Prevent starting the timer
  }

  isRunning = true;
  disableButton(startButton); // Disable start button
  disableInputFields(); // Disable custom time inputs
  enableCounterButtons(); // Enable counter buttons when timer starts
  timer = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateTimerDisplay();
    } else {
      clearInterval(timer);
      endCountdown();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  enableButton(startButton); // Enable start button
  enableInputFields(); // Enable custom time inputs
  disableCounterButtons(); // Disable counter buttons when timer is paused
}

function resetTimer() {
  pauseTimer();
  timeRemaining = 0;
  updateTimerDisplay();
  timerElement.style.color = "#333"; // Reset to normal color
  timerElement.classList.remove("time-up"); // Remove animation class
  enableAllButtons(); // Re-enable all buttons
  customMinutesInput.value = ""; // Clear input fields
  customSecondsInput.value = "";
  enableInputFields(); // Enable custom time inputs

  // Reset account counter when the timer is reset
  accountCounter = 0; // Reset the account counter
  updateAccountCounter(); // Update the display of the account counter
}

function endCountdown() {
  isRunning = false;
  timerElement.textContent = "Time's up!";
  timerElement.style.color = "red"; // Highlight the timer
  timerElement.classList.add("time-up"); // Add animation class

  // Play sound when the countdown ends
  endSound.play();

  // Disable all buttons except reset
  disableAllButtons();
  enableButton(resetButton);
}

// Utility Functions for Button Control
function disableButton(button) {
  button.disabled = true;
  button.style.opacity = "0.5";
  button.style.cursor = "not-allowed";
}

function enableButton(button) {
  button.disabled = false;
  button.style.opacity = "1";
  button.style.cursor = "pointer";
}

function disableAllButtons() {
  [
    startButton,
    pauseButton,
    ...presetButtons,
    incrementButton,
    decrementButton,
  ].forEach(disableButton);
}

function enableAllButtons() {
  [
    startButton,
    pauseButton,
    ...presetButtons,
    incrementButton,
    decrementButton,
  ].forEach(enableButton);
}

// Disable Input Fields
function disableInputFields() {
  customMinutesInput.disabled = true;
  customSecondsInput.disabled = true;
}

function enableInputFields() {
  customMinutesInput.disabled = false;
  customSecondsInput.disabled = false;
}

// Enable/Disable counter buttons
function disableCounterButtons() {
  const incrementButton = document.getElementById("increment");
  const decrementButton = document.getElementById("decrement");
  incrementButton.disabled = true;
  decrementButton.disabled = true;
}

function enableCounterButtons() {
  const incrementButton = document.getElementById("increment");
  const decrementButton = document.getElementById("decrement");
  incrementButton.disabled = false;
  decrementButton.disabled = false;
}

// Event Listeners
presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const time = parseInt(button.dataset.time, 10);
    timeRemaining = time;
    updateTimerDisplay();
    timerElement.style.color = "#333"; // Reset to normal color
    enableAllButtons(); // Re-enable all buttons
  });
});

startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);

updateTimerDisplay();

// Account Counter Logic
let accountCounter = 0;

const accountCounterElement = document.getElementById("account-counter");
const incrementButton = document.getElementById("increment");
const decrementButton = document.getElementById("decrement");
const resetCounterButton = document.getElementById("reset-counter");

function updateAccountCounter() {
  accountCounterElement.textContent = accountCounter;
}

incrementButton.addEventListener("click", () => {
  accountCounter++;
  updateAccountCounter();
});

decrementButton.addEventListener("click", () => {
  if (accountCounter > 0) {
    accountCounter--;
    updateAccountCounter();
  } else {
    // alert("Counter can't go below 0!");
  }
});

resetCounterButton.addEventListener("click", () => {
  accountCounter = 0;
  updateAccountCounter();
});

// Update Timer Automatically on Input Change
customMinutesInput.addEventListener("input", updateCustomTime);
customSecondsInput.addEventListener("input", updateCustomTime);

function updateCustomTime() {
  if (!isRunning) {
    // Only update if the timer is not running
    const customMinutes = parseInt(customMinutesInput.value, 10) || 0;
    const customSeconds = parseInt(customSecondsInput.value, 10) || 0;
    timeRemaining = customMinutes * 60 + customSeconds;
    updateTimerDisplay();
  }
}
