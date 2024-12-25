
let names = [];
let wheel = document.getElementById('wheelCanvas');
let ctx = wheel.getContext('2d');
let angle = 0;
let spinning = false;

const spinBtn = document.getElementById('spinBtn');
const nameInput = document.getElementById('nameInput');
const winnerPopup = document.getElementById('winnerPopup');
const winnerName = document.getElementById('winnerName');
const mask = document.getElementById('mask');
const deleteAllBtn = document.getElementById('deleteAllBtn');

const colors = ['#009925', '#3369e8', '#EEB211', '#D50F25'];

// Load saved names from localStorage on page load
window.onload = function () {
    const savedNames = localStorage.getItem('names');
    if (savedNames) {
        names = JSON.parse(savedNames);
    }
    updateNameList();
    drawWheel();
    enableSpinButton();
};

// Save names to localStorage
function saveNames() {
    localStorage.setItem('names', JSON.stringify(names));
}

function shuffleNames() {
    for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
    }
}

function handleNameInput() {
    const lines = nameInput.value.split('\n').map(name => name.trim()).filter(name => name);
    if (lines.length > 0) {
        names = [...lines];
        shuffleNames();
        drawWheel();
        enableSpinButton();
    } else {
        names = [];
        drawWheel();
        disableSpinButton();
    }
    saveNames(); // Save updated names
}

function updateNameList() {
    const nameList = document.getElementById('nameList');
    nameList.innerHTML = '';
    names.forEach((name, index) => {
        const li = document.createElement('li');
        li.textContent = name;
        li.contentEditable = true;

        li.oninput = () => {
            names[index] = li.textContent.trim();
            drawWheel();
            saveNames();
        };

        li.onkeydown = (event) => {
            if (event.key === 'Backspace' && !li.textContent.trim()) {
                names.splice(index, 1);
                updateNameList();
                drawWheel();
                disableSpinButton();
                saveNames();
            }
        };

        nameList.appendChild(li);
    });

    deleteAllBtn.style.display = 'none'; // Hide Delete All button initially
}

function drawWheel() {
    const segments = names.length;
    if (segments === 0) {
        ctx.clearRect(0, 0, wheel.width, wheel.height);
        return;
    }

    const radius = 200;
    const segmentAngle = (2 * Math.PI) / segments;

    ctx.clearRect(0, 0, wheel.width, wheel.height);
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(angle);

    for (let i = 0; i < segments; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, i * segmentAngle, (i + 1) * segmentAngle);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        ctx.save();
        ctx.rotate((i + 0.5) * segmentAngle);
        ctx.fillStyle = 'white';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(names[i], radius / 2, 0);
        ctx.restore();
    }

    ctx.restore();
}

function spinWheel() {
    if (spinning || names.length === 0) return;
    spinning = true;

    const spinDuration = 6000;
    const spinStartAngle = angle;
    const spinEndAngle = spinStartAngle + (Math.random() * 10 + 5) * Math.PI;
    const startTime = performance.now();

    function animateSpin(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / spinDuration, 1);
        angle = spinStartAngle + (spinEndAngle - spinStartAngle) * easeOutQuart(progress);

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animateSpin);
        } else {
            spinning = false;
            announceWinner();
            enableInputAndButton();
        }
    }

    requestAnimationFrame(animateSpin);
    disableInputAndButton();
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

function announceWinner() {
    const segments = names.length;
    const winnerAngle = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    const segmentAngle = (2 * Math.PI) / segments;
    const winnerIndex = Math.floor(((2 * Math.PI) - winnerAngle) / segmentAngle) % segments;
    const winner = names[winnerIndex];
    winnerName.textContent = winner;

    winnerPopup.style.display = 'block';
    mask.style.display = 'block';

    const similarNames = names.filter(name => name.toLowerCase() === winner.toLowerCase());
    if (similarNames.length > 1) {
        deleteAllBtn.style.display = 'inline-block';
    }
}

function closeWinnerPopup() {
    winnerPopup.style.display = 'none';
    mask.style.display = 'none';
}

function removeWinner() {
    const winner = winnerName.textContent;
    names = names.filter(name => name !== winner);
    nameInput.value = names.join('\n');
    drawWheel();
    closeWinnerPopup();
    saveNames(); // Save updated names
}

function removeAllSimilarNames() {
    const winner = winnerName.textContent;
    names = names.filter(name => name.toLowerCase() !== winner.toLowerCase());
    nameInput.value = names.join('\n');
    drawWheel();
    closeWinnerPopup();
    saveNames(); // Save updated names
}

function disableSpinButton() {
    if (names.length === 0) {
        spinBtn.disabled = true;
    }
}

function enableSpinButton() {
    if (names.length > 0) {
        spinBtn.disabled = false;
    }
}

function disableInputAndButton() {
    nameInput.disabled = true;
    spinBtn.disabled = true;
}

function enableInputAndButton() {
    nameInput.disabled = false;
    spinBtn.disabled = false;
}

updateNameList();
drawWheel();
enableSpinButton();
