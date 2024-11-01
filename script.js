// Reset all stored timer data on page load
window.addEventListener('load', () => {
    localStorage.clear();
});

// Confirmation dialog for page refresh
window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = ''; // Most browsers display a generic message
});

const formatCost = (cost) => {
    if (isNaN(cost) || cost < 0) return "Invalid Cost";
    return cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " IQD";
};

const createConsoleSection = (index) => `
    <section class="console" id="console${index}">
        <h2>Console ${index}</h2>
        <label for="consoleSelect${index}">Type:</label>
        <select id="consoleSelect${index}" class="consoleSelect">
            <option value="0">Select...</option>
            <option value="2000">PS4 (2000 IQD/hour)</option>
            <option value="3000">PS5 (3000 IQD/hour)</option>
            <option value="375">FIFA (1000 IQD for 16 min)</option>
        </select>
        <div class="errorMessage" style="color: red;"></div>
        <div class="currentCost">Current Cost: ${formatCost(0)}</div>
        <div class="finalCost">Final Cost: ${formatCost(0)}</div>
        <div class="timer" id="timer">00:00:00</div>
        <button class="startButton" aria-label="Start the timer">Start</button>
        <button class="pauseButton" disabled aria-label="Pause the timer">Pause</button>
        <button class="resetButton" disabled aria-label="Reset the timer">Reset</button>
    </section>
`;

const consolesContainer = document.createDocumentFragment();
for (let i = 1; i <= 14; i++) {
    consolesContainer.appendChild(new DOMParser().parseFromString(createConsoleSection(i), 'text/html').body.firstChild);
}
document.body.appendChild(consolesContainer);

const consoles = document.querySelectorAll('.console');

consoles.forEach(consoleDiv => {
    let counter = 0;
    let incrementPerSecond = 0;
    let totalSeconds = 0;
    let intervalId = null;

    const currentCostDiv = consoleDiv.querySelector('.currentCost');
    const finalCostDiv = consoleDiv.querySelector('.finalCost');
    const timerDiv = consoleDiv.querySelector('.timer');
    const startButton = consoleDiv.querySelector('.startButton');
    const pauseButton = consoleDiv.querySelector('.pauseButton');
    const resetButton = consoleDiv.querySelector('.resetButton');
    const consoleSelect = consoleDiv.querySelector('.consoleSelect');
    const errorMessageDiv = consoleDiv.querySelector('.errorMessage');

    function updateDisplay() {
        const roundedCounter = Math.round(counter / 250) * 250;
        currentCostDiv.textContent = `Current Cost: ${formatCost(Math.floor(counter))}`;
        finalCostDiv.textContent = `Final Cost: ${formatCost(roundedCounter)}`;

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        timerDiv.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    updateDisplay();

    startButton.addEventListener('click', () => {
        const costPerHour = parseFloat(consoleSelect.value);
        errorMessageDiv.textContent = ""; // Clear any previous error message

        if (isNaN(costPerHour) || costPerHour <= 0) {
            errorMessageDiv.textContent = "Please select a valid Type.";
            return;
        }

        if (costPerHour === 375) {
            incrementPerSecond = 1000 / 960;
        } else {
            incrementPerSecond = costPerHour / 3600;
        }

        startButton.disabled = true;
        pauseButton.disabled = false;
        resetButton.disabled = false;
        consoleSelect.disabled = true;

        intervalId = setInterval(() => {
            totalSeconds++;
            counter += incrementPerSecond;
            updateDisplay();
        }, 1000);
    });

    pauseButton.addEventListener('click', () => {
        clearInterval(intervalId);
        startButton.disabled = false;
        pauseButton.disabled = true;
        consoleSelect.disabled = false;
    });

    resetButton.addEventListener('click', () => {
        const confirmReset = confirm("Do you really want to reset?");
        if (confirmReset) {
            clearInterval(intervalId);
            counter = 0;
            totalSeconds = 0;
            updateDisplay();
            startButton.disabled = false;
            pauseButton.disabled = true;
            resetButton.disabled = true;
            consoleSelect.disabled = false;
            consoleSelect.selectedIndex = 0;
        }
    });
});
