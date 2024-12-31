let questions = [];
let currentQuestionIndex = 0;
let currentTeam = 1;
let team1Name, team2Name;
let scores = { team1: 0, team2: 0 };
let maxPoints = 10;
let timerDuration = 30;
let timeRemaining = 30;
let timer;

document.getElementById('startButton').addEventListener('click', startGame);
// document.getElementById('settingsButton').addEventListener('click', openSettings);
// document.getElementById('stopGameButton').addEventListener('click', stopGame);
// document.getElementById('exitGameButton').addEventListener('click', exitGame);

async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    questions = await response.json();
  } catch (error) {
    console.error('Error loading questions:', error);
  }
}

// Function to shuffle the questions array
function shuffleQuestions() {
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]]; // Swap elements
  }
}

function startGame() {
  team1Name = document.getElementById('team1Name').value || "Team 1";
  team2Name = document.getElementById('team2Name').value || "Team 2";
  maxPoints = parseInt(document.getElementById('maxPoints').value);
  timerDuration = parseInt(document.getElementById('timerDuration').value);
  timeRemaining = timerDuration;

  document.getElementById('team1NameDisplay').innerText = team1Name;
  document.getElementById('team2NameDisplay').innerText = team2Name;

  document.getElementById('gameSection').style.display = 'block';
  document.getElementById('setupSection').style.display = 'none';

  loadQuestions().then(() => {
    shuffleQuestions();  // Shuffle questions when the game starts
    loadQuestion();
    startTimer();
  });
}

function loadQuestion() {
  if (currentQuestionIndex >= questions.length) {
    declareWinner();
    return;
  }

  let question = questions[currentQuestionIndex];
  document.getElementById('question').innerText = question.question;
  document.getElementById('options').innerHTML = `
    <button class="option" onclick="handleAnswer('A')">A: ${question.options.A}</button>
    <button class="option" onclick="handleAnswer('B')">B: ${question.options.B}</button>
    <button class="option" onclick="handleAnswer('C')">C: ${question.options.C}</button>
    <button class="option" onclick="handleAnswer('D')">D: ${question.options.D}</button>
  `;
  document.getElementById('status-message').innerText = `${currentTeam === 1 ? team1Name : team2Name}'s turn`;

  // Reset the timer at the start of each question
  timeRemaining = timerDuration;
  document.getElementById('timer').innerText = timeRemaining;
}

function showGreenOverlay() {
  const greenOverlay = document.getElementById('greenOverlay');
  greenOverlay.style.display = 'block';
  setTimeout(() => {
    greenOverlay.style.display = 'none';
  }, 500); // Display the overlay for 1 second
}

function showRedOverlay() {
  const redOverlay = document.getElementById('redOverlay');
  redOverlay.style.display = 'block';
  setTimeout(() => {
    redOverlay.style.display = 'none';
  }, 500); // Display the overlay for 1 second
}

function handleAnswer(selectedAnswer) {
  const correctAnswer = questions[currentQuestionIndex].correctAnswer;
  if (selectedAnswer === correctAnswer) {
    showGreenOverlay(); // Show green overlay for the correct answer
    if (currentTeam === 1) {
      scores.team1++;
      document.getElementById('score1').innerText = scores.team1;
    } else {
      scores.team2++;
      document.getElementById('score2').innerText = scores.team2;
    }
  } else {
    showRedOverlay(); // Show red overlay for an incorrect answer
  }
  currentQuestionIndex++;
  clearInterval(timer);
  switchTeam();
}

document.querySelectorAll('.option').forEach((button) => {
  button.addEventListener('click', () => {
    const choice = button.getAttribute('data-choice');
    handleAnswer(choice);
  });
});


function switchTeam() {
  if (scores.team1 >= maxPoints || scores.team2 >= maxPoints) {
    declareWinner();
  } else {
    currentTeam = currentTeam === 1 ? 2 : 1;
    loadQuestion();
    startTimer(); // Restart the timer for the next question
  }
}

function declareWinner() {
  let winner = scores.team1 > scores.team2 ? team1Name : team2Name;
  if (scores.team1 === scores.team2) {
    winner = "It's a tie!";
  }

  // Hide game sections and display the winner
  document.getElementById('question').style.display = 'none';
  document.getElementById('options').style.display = 'none';
  document.getElementById('timer').style.display = 'none'; // Hide the timer
  document.getElementById('status-message').innerText = `${winner} wins!`;

  // Show the winner message
  document.getElementById('winnerMessage').style.display = 'block';
}

function startTimer() {
  clearInterval(timer); // Clear any existing timer before starting a new one

  timer = setInterval(() => {
    timeRemaining--;
    document.getElementById('timer').innerText = timeRemaining;
    if (timeRemaining <= 0) {
      clearInterval(timer);
      switchTeam();
    }
  }, 1000);
}

document.getElementById('settingsButton').addEventListener('click', openSettings);
document.getElementById('stopGameButton').addEventListener('click', stopTimer);
document.getElementById('exitGameButton').addEventListener('click', exitGame);

function openSettings() {
  document.getElementById('settingsModal').style.display = 'block';
}

function closeSettings() {
  document.getElementById('settingsModal').style.display = 'none';
}

function stopTimer() {
  clearInterval(timer); // Pause the timer without ending the game
}

function exitGame() {
  location.reload(); // Reload the page to reset the game
}


document.getElementById('exitGameButton').addEventListener('click', skipTurn);

function startTimer() {
  clearInterval(timer); // Clear any existing timer before starting a new one

  timer = setInterval(() => {
    timeRemaining--;
    document.getElementById('timer').innerText = timeRemaining;
    if (timeRemaining <= 0) {
      clearInterval(timer);
      switchTeam();
    }
  }, 1000);
}


function skipTurn() {
  clearInterval(timer); // Stop the timer for the current question
  currentQuestionIndex++; // Skip to the next question
  switchTeam(); // Move to the next team's turn
}



// Initializing questions on page load
window.onload = loadQuestions;
