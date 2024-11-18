document.addEventListener('DOMContentLoaded', () => {
    // Reset all stored timer data on page load
    window.addEventListener('load', () => {
        localStorage.clear();
    });

    const formatCost = (cost) => {
        if (isNaN(cost) || cost < 0) return "Invalid Cost";
        return cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " IQD";
    };

    const createConsoleSection = (index) => `
        <section class="console" id="console${index}">
            <button class="removeConsoleButton" aria-label="Remove Console" title="Remove Console">×</button>
            <h2>Console ${index}</h2>
            <label for="name${index}">Name:</label>
            <input type="text" id="name${index}" class="nameInput" placeholder="Enter name" />
            <label for="consoleSelect${index}"><br>Type:</label>
            <select id="consoleSelect${index}" class="consoleSelect">
                <option value="0">Select...</option>
                <option value="2000">PS4 (2000 IQD/hour)</option>
                <option value="3000">PS5 (3000 IQD/hour)</option>
                <option value="1500">PS4X (1500 IQD/hour)</option>
            </select>
            <div class="errorMessage" style="color: red;"></div>
            <div class="currentCost">Current Cost: ${formatCost(0)}</div>
            <div class="finalCost">Final Cost: ${formatCost(0)}</div>
            <div class="timer" id="timer${index}">00:00:00</div>
            <button class="startButton" aria-label="Start the timer">Start</button>
            <button class="pauseButton" disabled aria-label="Pause the timer">Pause</button>
            <button class="resetButton" disabled aria-label="Reset the timer">Reset</button>
            <!-- Alert Time Input -->
            <label for="alertTime${index}">Set Alert Time (minutes):</label>
            <input type="number" id="alertTime${index}" class="alertTimeInput" placeholder="Enter alert time in minutes" min="1" step="1" />


            <button class="stopAlertButton" disabled>Stop Alert</button>
        </section>
    `;

    let consoleIndex = 1; // Start with the first console
    const consolesContainer = document.getElementById('consolesContainer');

    // Function to initialize each console's behavior (timer, start/pause/reset, etc.)
    const initializeConsole = (consoleDiv) => {
        let counter = 0;
        let incrementPerSecond = 0;
        let totalSeconds = 0;
        let intervalId = null;
        let alertTime = 0;
        let alertTriggered = false;

        const currentCostDiv = consoleDiv.querySelector('.currentCost');
        const finalCostDiv = consoleDiv.querySelector('.finalCost');
        const timerDiv = consoleDiv.querySelector('.timer');
        const startButton = consoleDiv.querySelector('.startButton');
        const pauseButton = consoleDiv.querySelector('.pauseButton');
        const resetButton = consoleDiv.querySelector('.resetButton');
        const consoleSelect = consoleDiv.querySelector('.consoleSelect');
        const nameInput = consoleDiv.querySelector('.nameInput');
        const errorMessageDiv = consoleDiv.querySelector('.errorMessage');
        const alertTimeInput = consoleDiv.querySelector('.alertTimeInput');
        const stopAlertButton = consoleDiv.querySelector('.stopAlertButton');

        const alertSound = new Audio('alert-sound.mp3'); // Load the sound file
        alertSound.loop = true; // Set the alert sound to loop indefinitely

        // Function to update display (cost and timer)
        function updateDisplay() {
            const roundedCounter = Math.round(counter / 250) * 250;
            currentCostDiv.textContent = `Current Cost: ${formatCost(Math.floor(counter))}`;
            finalCostDiv.textContent = `Final Cost: ${formatCost(roundedCounter)}`;

            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const secs = totalSeconds % 60;

            timerDiv.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        updateDisplay(); // Initial display update

        // Event listener for alert time input change
        alertTimeInput.addEventListener('change', () => {
            alertTime = parseInt(alertTimeInput.value) * 60; // Convert minutes to seconds
            alertTriggered = false;
        });

        stopAlertButton.addEventListener('click', () => {
            alertSound.pause();
            alertSound.currentTime = 0;
            stopAlertButton.disabled = true; // Disable the button after it is clicked
        });

        // Start button functionality
        startButton.addEventListener('click', () => {
            const costPerHour = parseFloat(consoleSelect.value);
            errorMessageDiv.textContent = ""; // Clear any previous error message

            if (isNaN(costPerHour) || costPerHour <= 0) {
                errorMessageDiv.textContent = "Please select a valid Type.";
                return;
            }

            // Set increment per second based on the hourly rate
            incrementPerSecond = costPerHour / 3600;

            if (nameInput.value.trim() === "") {
                nameInput.value = "N/A"; // Set default if no name entered
            }

            alertTimeInput.disabled = true;

            startButton.disabled = true;
            pauseButton.disabled = false;
            resetButton.disabled = false;
            consoleSelect.disabled = true;
            nameInput.disabled = true;

            intervalId = setInterval(() => {
                totalSeconds++;
                counter += incrementPerSecond;
                updateDisplay();

                if (alertTime > 0 && totalSeconds >= alertTime && !alertTriggered) {
                    alertTriggered = true;
                    alertSound.play();
                    stopAlertButton.disabled = false;
                }
            }, 1000);
        });

        // Pause button functionality
        pauseButton.addEventListener('click', () => {
            clearInterval(intervalId);
            startButton.disabled = false;
            pauseButton.disabled = true;
            consoleSelect.disabled = false;
            alertTimeInput.disabled = false;
        });

resetButton.addEventListener('click', () => {
    const confirmReset = confirm("Do you really want to reset?");
    if (confirmReset) {
        // Clear the interval and reset all the time and counters
        clearInterval(intervalId);
        counter = 0;
        totalSeconds = 0;

        // Reset the displayed timer
        timerDiv.textContent = "00:00:00";

        // Reset the cost values to 0
        currentCostDiv.textContent = "Current Cost: " + formatCost(0);
        finalCostDiv.textContent = "Final Cost: " + formatCost(0);

        // Reset the alert time input
        alertTimeInput.value = ""; // Clear the alert time input
        alertTimeInput.setCustomValidity(""); // Reset the validation message

        // Disable the Stop Alert button
        stopAlertButton.disabled = true;

        // Enable all buttons again
        startButton.disabled = false;
        pauseButton.disabled = true;
        resetButton.disabled = true;

        // Reset the console selection dropdown to the default "Select..."
        consoleSelect.selectedIndex = 0;
        consoleSelect.disabled = false; // Ensure the dropdown is enabled

        // Reset the name input field
        nameInput.disabled = false;
        nameInput.value = ""; // Clear the name input field

        // Enable the alert time input field
        alertTimeInput.disabled = false;
    }
});


        // Remove console functionality
        const removeConsoleButton = consoleDiv.querySelector('.removeConsoleButton');
        removeConsoleButton.addEventListener('click', () => {
            const confirmRemove = confirm("Are you sure you want to remove this console?");
            if (confirmRemove) {
                consoleDiv.remove();
            }
        });
    };

    let firstConsole = new DOMParser().parseFromString(createConsoleSection(consoleIndex), 'text/html').body.firstChild;
    consolesContainer.appendChild(firstConsole);
    initializeConsole(firstConsole); // Initialize first console

    // Add new consoles dynamically
    document.getElementById('addConsoleButton').addEventListener('click', () => {
        consoleIndex++;
        const newConsole = new DOMParser().parseFromString(createConsoleSection(consoleIndex), 'text/html').body.firstChild;
        consolesContainer.appendChild(newConsole);
        initializeConsole(newConsole); // Initialize the new console
    });
});
