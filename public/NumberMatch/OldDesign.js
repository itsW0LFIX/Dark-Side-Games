let winningNumbers = [];
let prizes = {
  5: "50 million",
  4: "2 million",
  3: "1,200,000",
  2: "1 million",
  1: "Loser",
  0: "Loser",
};

function saveWinningNumbers() {
  const input = document.getElementById("winning-numbers").value.trim();
  winningNumbers = input
    .split(" ")
    .map(Number)
    .filter((n) => !isNaN(n));
  displayWinningNumbers();
}

function displayWinningNumbers() {
  const container = document.getElementById("winning-numbers-container");
  container.innerHTML = ""; // Clear previous numbers
  if (winningNumbers.length === 0) {
    container.innerHTML = "<span>No Winning Numbers</span>";
    return;
  }
  winningNumbers.forEach((num) => {
    const span = document.createElement("span");
    span.className = "winning-number";
    span.textContent = num;
    container.appendChild(span);
  });
}

// Function to handle input in the textarea
function handleParticipantsInput() {
  const textarea = document.getElementById("participants");
  // Split by newline, trim each line, and filter out empty lines
  const nonEmptyLines = textarea.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const lineCount = nonEmptyLines.length; // Count the non-empty lines

  const lineCountDisplay = document.getElementById("howmanylineintextarea");

  // Display the number of non-empty lines in the paragraph
  lineCountDisplay.textContent = `users : ${lineCount}`;
}

function addParticipants() {
  const participantsText = document.getElementById("participants").value.trim();
  const lines = participantsText.split("\n");
  const resultsTable = document.getElementById("results-table");
  resultsTable.innerHTML = ""; // Clear previous results

  // Store participants in an array with their match count
  let participants = [];

  lines.forEach((line) => {
    // Split by any of the specified delimiters: ':', ';', ',', '-', '_', '=', '+'
    const [name, numbersString] = line.split(/[;:,_\-=+]/);

    if (!name || !numbersString) return;

    // Split by space, remove extra spaces, and convert to numbers
    const numbers = numbersString
      .trim()
      .split(/\s+/) // Split by one or more spaces
      .map(Number)
      .filter((n) => !isNaN(n));

    const matches = numbers.filter((num) => winningNumbers.includes(num));
    const matchCount = matches.length;

    const prize = prizes[matchCount];

    participants.push({
      name,
      matches,
      prize,
    });
  });

  // Sort participants by match count (highest to lowest)
  participants.sort((a, b) => b.matches.length - a.matches.length);

  // Display sorted results
  participants.forEach((participant) => {
    const row = document.createElement("tr");
    const prizeClass = participant.prize === "Loser" ? "Loser" : ""; // Add "Loser" class if prize is "Loser"

    row.innerHTML = `
    <td>${participant.name}</td>
    <td>${participant.matches.join(", ") || "None"}</td>
    <td class="prize ${prizeClass}">${participant.prize}</td>
`;
    resultsTable.appendChild(row);
  });
}

function closeWinnerPopup() {
  document.getElementById("winnerPopup").style.display = "none";
  document.getElementById("mask").style.display = "none";
}

function removeWinner() {
  const winnerName = document.getElementById("winnerName").textContent;
  // Add your logic for removing winner here
}
function toggleModal() {
  const modal = document.getElementById("prizes-modal");
  const overlay = document.getElementById("overlay");
  modal.classList.toggle("active");
  overlay.classList.toggle("active");
}

function savePrizes() {
  prizes = {
    5: document.getElementById("prize-5").value,
    4: document.getElementById("prize-4").value,
    3: document.getElementById("prize-3").value,
    2: document.getElementById("prize-2").value,
    1: document.getElementById("prize-1").value,
    0: document.getElementById("prize-0").value,
  };
  toggleModal();
  //    alert('Prizes updated successfully!');
}