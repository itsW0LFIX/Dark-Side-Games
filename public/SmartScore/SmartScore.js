const createPollBtn = document.getElementById('create-poll-btn');
const pollForm = document.getElementById('poll-form');
const pollQuestionInput = document.getElementById('poll-question');
const pollOptionsList = document.querySelector('.poll-options');
const addOptionBtn = document.querySelector('.add-option-btn');
const startPollBtn = document.getElementById('start-poll-btn');
const pollDisplay = document.getElementById('poll-display');
const displayQuestion = document.getElementById('display-question');
const displayOptions = document.getElementById('display-options');
const pollWinner = document.getElementById('poll-winner');
const timerDisplay = document.getElementById('timer-display');
const pollTimerInput = document.getElementById('poll-timer');
const useTimerCheckbox = document.getElementById('use-timer-checkbox');
const finishPollBtn = document.getElementById('finish-poll-btn');
const finishVoteBtn = document.getElementById('finish-vote-btn'); // New button for finishing the vote

let votes = {};
let timerInterval;

// Show the poll creation form when the button is clicked
createPollBtn.addEventListener('click', () => {
    pollForm.style.display = 'block';      // Show the poll form
    createPollBtn.style.display = 'none'; // Hide the "Create Poll" button
});

// Enable/Disable Timer Input based on checkbox
useTimerCheckbox.addEventListener('change', () => {
    if (useTimerCheckbox.checked) {
        pollTimerInput.disabled = false;
        finishPollBtn.style.display = 'none'; // Hide finish button when timer is enabled
        finishVoteBtn.style.display = 'none'; // Hide finish vote button when timer is enabled
    } else {
        pollTimerInput.disabled = true;
        finishPollBtn.style.display = 'none'; // Hide finish button when no timer is used
        finishVoteBtn.style.display = 'block'; // Show finish vote button when no timer is used
    }
});

// Add a new option input when the "Add Option" button is clicked
addOptionBtn.addEventListener('click', () => {
    const newOption = document.createElement('li');
    newOption.innerHTML = `<input type="text" class="poll-option" placeholder="Option ${pollOptionsList.children.length + 1}">`;
    pollOptionsList.appendChild(newOption);
});

// Start the poll when the user clicks the "Start Event Score" button
startPollBtn.addEventListener('click', () => {
    const question = pollQuestionInput.value.trim();
    const options = Array.from(document.querySelectorAll('.poll-option'))
        .map(input => input.value.trim())
        .filter(value => value);

    // Validation for poll question and options
    if (!question || options.length < 2) {
        alert('Please enter a question and at least two options.');
        return;
    }

    // Initialize votes for each option
    votes = {};
    options.forEach(option => {
        votes[option] = 0;
    });

    // Display the poll options
    displayQuestion.textContent = question;
    displayOptions.innerHTML = '';
    options.forEach(option => {
        const li = document.createElement('li');

        // Vote increment/decrement buttons
        const incrementBtn = document.createElement('button');
        incrementBtn.textContent = `+1 ${option}`;
        incrementBtn.className = 'vote-btn';
        incrementBtn.addEventListener('click', () => {
            votes[option]++;
            updateVoteCounts();
        });

        const decrementBtn = document.createElement('button');
        decrementBtn.textContent = `-1 ${option}`;
        decrementBtn.className = 'vote-btn';
        decrementBtn.addEventListener('click', () => {
            if (votes[option] > 0) {
                votes[option]--;
                updateVoteCounts();
            } else {
                // alert(`Votes for ${option} cannot go below zero.`);
            }
        });

        // Vote count display
        const voteCount = document.createElement('span');
        voteCount.className = 'vote-count';
        voteCount.textContent = `Votes: 0`;

        // Progress bar design elements
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = '0%';
        progressBar.style.height = '20px';
        progressBar.style.backgroundColor = getRandomColor();
        progressBar.style.transition = 'width 0.3s ease';

        // Progress bar container (for styling)
        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';
        barContainer.style.width = '100%';
        barContainer.style.backgroundColor = '#f0f0f0';
        barContainer.style.borderRadius = '10px';
        barContainer.style.overflow = 'hidden';
        barContainer.style.margin = '10px 0';
        barContainer.appendChild(progressBar);

        // Append elements to the list item
        li.appendChild(incrementBtn);
        li.appendChild(voteCount);
        li.appendChild(decrementBtn);
        li.appendChild(barContainer);
        displayOptions.appendChild(li);
    });

    pollForm.style.display = 'none';    // Hide the poll form
    pollDisplay.style.display = 'block'; // Show the poll display section

    if (useTimerCheckbox.checked) {
        const timerValue = parseInt(pollTimerInput.value, 10);
        if (timerValue && timerValue > 0) {
            startTimer(timerValue);
        } else {
            alert('Please set a valid timer.');
        }
    }
});

// Update vote counts and progress bars
function updateVoteCounts() {
    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
    Array.from(displayOptions.children).forEach(li => {
        const option = li.querySelector('button').textContent.split(' ')[1];
        const percentage = totalVotes ? (votes[option] / totalVotes) * 100 : 0;
        li.querySelector('.vote-count').textContent = `Votes: ${votes[option]}`;
        li.querySelector('.progress-bar').style.width = `${percentage}%`;
    });
}

// Timer logic
function startTimer(seconds) {
    let remainingTime = seconds;
    timerDisplay.textContent = `Time Remaining: ${remainingTime} seconds`;
    timerInterval = setInterval(() => {
        remainingTime--;
        timerDisplay.textContent = `Time Remaining: ${remainingTime} seconds`;
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            announceWinner();
        }
    }, 1000);
}

// Finish the poll and announce the winner
finishPollBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    announceWinner();
});

// Finish the poll and announce the winner if no timer is used
finishVoteBtn.addEventListener('click', () => {
    announceWinner();
});

// Announce the winner based on votes
function announceWinner() {
    const maxVotes = Math.max(...Object.values(votes));
    const winners = Object.keys(votes).filter(option => votes[option] === maxVotes);
    pollWinner.textContent = `The winner is: ${winners.join(', ')} with ${maxVotes} votes!`;
}

// Generate random color for the progress bar
function getRandomColor() {
    const r = Math.floor(Math.random() * 127 + 128); // Random color value between 128 and 255
    const g = Math.floor(Math.random() * 127 + 128); // Random color value between 128 and 255
    const b = Math.floor(Math.random() * 127 + 128); // Random color value between 128 and 255
    return `rgb(${r}, ${g}, ${b})`;
}
