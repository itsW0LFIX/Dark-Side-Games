
let prizes = {
  5: "50 million",
  4: "2 million",
  3: "1,200,000",
  2: "1 million",
  1: "Loser",
  0: "Loser"
};

let isDrawing = false;
let winningNumbers = [];

function generateNumber(min, max, exclude) {
  let num;
  do {
    num = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (exclude.includes(num));
  return num;
}

function startDraw() {
  if (isDrawing) return;
  
  isDrawing = true;
  const drawButton = document.getElementById('drawButton');
  drawButton.disabled = true;
  drawButton.textContent = 'Drawing...';

  // Get settings values
  const numBalls = parseInt(document.getElementById('num-balls').value);
  const minNumber = parseInt(document.getElementById('min-number').value);
  const maxNumber = parseInt(document.getElementById('max-number').value);

  // Dynamically generate the balls based on the numBalls setting
  const ballsContainer = document.getElementById('ballsContainer');
  ballsContainer.innerHTML = ''; // Clear previous balls

  // Create the required number of balls
  for (let i = 0; i < numBalls; i++) {
    const ball = document.createElement('div');
    ball.classList.add('ball', 'empty');
    ballsContainer.appendChild(ball);
  }

  // Reset and start spinning
  const balls = ballsContainer.querySelectorAll('.ball');
  balls.forEach(ball => {
    ball.textContent = '';  // Make sure the ball has no text initially
    ball.classList.remove('empty');  // Remove empty class
    ball.classList.add('spin');  // Add the spinning class
  });

  // Generate winning numbers globally
  winningNumbers = []; // Use global `winningNumbers`
  for (let i = 0; i < numBalls; i++) {
    winningNumbers.push(generateNumber(minNumber, maxNumber, winningNumbers));
  }

  // Reveal numbers one by one
  winningNumbers.forEach((number, index) => {
    setTimeout(() => {
      const ball = balls[index];
      ball.className = 'ball'; // Remove the spin class (stops spinning)
      ball.textContent = number; // Add the drawn number

      if (index === numBalls - 1) {
        isDrawing = false;
        drawButton.disabled = false;
        drawButton.textContent = 'Draw Numbers';
        checkResults();
      }
    }, (index + 1) * 1000); // Adjust time delay between revealing numbers
  });

  console.log('Winning Numbers:', winningNumbers); // Debug output
}

function checkResults() {
  const participantsText = document.getElementById('participants').value;
  const resultsTable = document.getElementById('resultsTable');
  resultsTable.innerHTML = '';

  const participants = participantsText.trim().split('\n')
    .map(line => {
      const [name, numbers] = line.split('-');
      if (!name || !numbers) return null;

      const playerNumbers = numbers.trim().split(' ')
        .map(Number)
        .filter(n => !isNaN(n));

      const matches = playerNumbers.filter(num => 
        winningNumbers.includes(num)
      );

      return {
        name: name.trim(),
        numbers: playerNumbers,
        matches: matches,
        prize: prizes[matches.length]
      };
    })
    .filter(p => p !== null);

  participants.forEach(participant => {
    const row = document.createElement('tr');
    
    // Here we assume prizes is an array where a valid prize is not 'Loser'
    const prizeClass = participant.prize && participant.prize !== 'Loser' ? 'winner' : 'loser';

    row.innerHTML = `
      <td>${participant.name}</td>
      <td>${participant.numbers.join(', ')}</td>
      <td>${participant.matches.join(', ') || 'None'}</td>
      <td class="${prizeClass}">
        ${participant.prize}
      </td>
    `;
    resultsTable.appendChild(row);
  });
}


// Settings panel functionality
document.addEventListener("DOMContentLoaded", () => {
  const settingsButton = document.getElementById('settings-button');
  const settingsPanel = document.getElementById('settings-panel');

  // Toggle the visibility of the settings panel
  settingsButton.addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");
  });
});



function toggleModal() {
  const modal = document.getElementById("prizes-modal");
  const overlay = document.getElementById("overlay");
  if (modal && overlay) {
    modal.classList.toggle("active");
    overlay.classList.toggle("active");
  } else {
    console.error("Modal or overlay not found in the DOM.");
  }
}

function savePrizes() {
  prizes[5] = document.getElementById("prize-5").value;
  prizes[4] = document.getElementById("prize-4").value;
  prizes[3] = document.getElementById("prize-3").value;
  prizes[2] = document.getElementById("prize-2").value;
  prizes[1] = document.getElementById("prize-1").value;
  prizes[0] = document.getElementById("prize-0").value;
  toggleModal();
}
