
let prizes = {
  5: "50 million",
  4: "5 million",
  3: "1,500,000",
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



document.addEventListener("DOMContentLoaded", () => {
  const ticketInput = document.getElementById('tickets');
  const remainingTicketsElement = document.getElementById('remaining-tickets');

  // Initialize remaining tickets from input value
  remainingTickets = parseInt(ticketInput.value);
  remainingTicketsElement.textContent = `Remaining Tickets: ${remainingTickets}`;

  // Update remaining tickets when the input value changes
  ticketInput.addEventListener('input', () => {
      remainingTickets = parseInt(ticketInput.value);
      if (isNaN(remainingTickets) || remainingTickets < 0) {
          remainingTickets = 0;
      }
      remainingTicketsElement.textContent = `Remaining Tickets: ${remainingTickets}`;
  });
});


let remainingTickets = parseInt(document.getElementById('tickets').value);
function startDraw() {
  const participantsText = document.getElementById('participants').value.trim();
    const participantsCount = participantsText ? participantsText.split('\n').length : 0;

    if (participantsCount > remainingTickets) {
        alert('Not enough tickets for this draw!');
        return;
    }

    if (remainingTickets <= 0) {
        alert('Tickets exhausted! Reloading the page...');
        location.reload();
        return;
    }

    // Proceed with the draw
    isDrawing = true;
    const drawButton = document.getElementById('drawButton');
    drawButton.disabled = true;
    drawButton.textContent = 'IWA TSNA NTA ZRBAN';

    remainingTickets -= participantsCount;
    document.getElementById('remaining-tickets').textContent = `Remaining Tickets: ${remainingTickets}`;


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
      const [name, numbers] = line.split(/[-:]/);
      if (!name || !numbers) return null;

      const playerNumbers = numbers
        .trim()
        .split(/\s+/) // Split by one or more spaces
        .filter(n => n.trim() !== '') // Remove empty entries
        .map(Number)
        .filter(n => !isNaN(n)); // Ensure only valid numbers are kept

      const matches = playerNumbers.filter(num => 
        winningNumbers.includes(num)
      );

      return {
        name: name.trim(),
        numbers: playerNumbers,
        matches: matches,
        prize: prizes[matches.length] || "Loser",
        matchCount: matches.length
      };
    })
    .filter(p => p !== null);

  participants.sort((a, b) => b.matchCount - a.matchCount);

  participants.forEach(participant => {
    const row = document.createElement('tr');
    
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

