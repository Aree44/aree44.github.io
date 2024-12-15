document.addEventListener('DOMContentLoaded', () => {
    // Clear localStorage immediately when the page is loaded
    localStorage.clear();

    const formatCost = (cost) => {
        if (isNaN(cost) || cost < 0) return "Invalid Cost";
        return cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " IQD";
    };

    const createConsoleSection = (index) => {
        const section = document.createElement('section');
        section.className = 'console';
        section.id = `console${index}`;
        section.innerHTML = `
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
            <label for="alertTime${index}">Set Alert Time (minutes):</label>
            <input type="number" id="alertTime${index}" class="alertTimeInput" placeholder="Enter alert time in minutes" min="1" step="1" />
            <button class="stopAlertButton" disabled>Stop Alert</button>
        `;
        return section;
    };

    let consoleIndex = 1; // Start with the first console
    const consolesContainer = document.getElementById('consolesContainer');

    const initializeConsole = (consoleDiv) => {
        let counter = 0;
        let incrementPerSecond = 0;
        let totalSeconds = 0;
        let intervalId = null;
        let startTimestamp = null;  // Store the start timestamp
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

        const alertSound = new Audio('alert-sound.aac');
        alertSound.loop = true;

        function updateDisplay() {
            const roundedCounter = Math.round(counter / 250) * 250;
            currentCostDiv.textContent = `Current Cost: ${formatCost(Math.floor(counter))}`;
            finalCostDiv.textContent = `Final Cost: ${formatCost(roundedCounter)}`;

            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const secs = totalSeconds % 60;

            timerDiv.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        function saveState() {
            const state = {
                counter,
                totalSeconds,
                incrementPerSecond,
                alertTime,
                alertTriggered,
                name: nameInput.value,
                costPerHour: consoleSelect.value,
                startTimestamp,  // Save the timestamp to preserve the pause state
            };
            localStorage.setItem(consoleDiv.id, JSON.stringify(state));
        }

        function restoreState() {
            const savedState = JSON.parse(localStorage.getItem(consoleDiv.id));
            if (savedState) {
                counter = savedState.counter;
                totalSeconds = savedState.totalSeconds;
                incrementPerSecond = savedState.incrementPerSecond;
                alertTime = savedState.alertTime;
                alertTriggered = savedState.alertTriggered;
                nameInput.value = savedState.name;
                consoleSelect.value = savedState.costPerHour;
                startTimestamp = savedState.startTimestamp;  // Restore the start timestamp
                updateDisplay();
            }
        }

        restoreState();
        updateDisplay();

        alertTimeInput.addEventListener('change', () => {
            alertTime = parseInt(alertTimeInput.value) * 60;

            if (alertTime < 60) {
                alertTime = 60; // Ensure the alert time is at least 1 minute
                alertTimeInput.value = 1; // Update the input field
            }

            alertTriggered = false;
        });

        stopAlertButton.addEventListener('click', () => {
            alertSound.pause();
            alertSound.currentTime = 0;
            stopAlertButton.disabled = true;
        });

        // Start button functionality (Resume Timer)
        startButton.addEventListener('click', () => {
            const costPerHour = parseFloat(consoleSelect.value);
            if (isNaN(costPerHour) || costPerHour <= 0) {
                errorMessageDiv.textContent = "Please select a valid Type.";
                return;
            }

            errorMessageDiv.textContent = ""; // Clear any previous error message if a valid console type is selected

            incrementPerSecond = costPerHour / 3600;
            if (!nameInput.value.trim()) {
                nameInput.value = "N/A";
            }

            // Set the start timestamp only if the timer was previously paused
            if (!startTimestamp) {
                startTimestamp = Date.now() - totalSeconds * 1000; // Adjust for already elapsed time
            }

            alertTimeInput.disabled = true;
            startButton.disabled = true;
            pauseButton.disabled = false;
            resetButton.disabled = false;
            consoleSelect.disabled = true;
            nameInput.disabled = true; // Disable name input when running

            intervalId = setInterval(() => {
                const now = Date.now();
                totalSeconds = Math.floor((now - startTimestamp) / 1000); // Calculate elapsed time
                counter = totalSeconds * incrementPerSecond; // Update cost
                updateDisplay();

                if (alertTime > 0 && totalSeconds >= alertTime && !alertTriggered) {
                    alertTriggered = true;
                    alertSound.play();
                    stopAlertButton.disabled = false;
                }

                saveState();
            }, 1000);
        });

        // Pause button functionality
        pauseButton.addEventListener('click', () => {
            clearInterval(intervalId); // Stop the timer
            intervalId = null; // Stop the interval
            startTimestamp = null; // Indicate the timer is paused
            saveState(); // Save the state when paused

            startButton.disabled = false; // Enable Start button
            pauseButton.disabled = true; // Disable Pause button
            alertTimeInput.disabled = false; // Allow editing alert time
            nameInput.disabled = false; // Allow editing name when paused

                        nameInput.addEventListener('focus', () => {
                if (nameInput.value === "N/A") {
                    nameInput.value = ""; // Clear the "N/A" placeholder when focused
                }
            });
        });


        // Reset button functionality
resetButton.addEventListener('click', () => {
    if (confirm("Do you really want to reset?")) {
        clearInterval(intervalId); // Stop the timer
        intervalId = null; // Ensure no interval is running
        startTimestamp = null; // Reset the start timestamp
        counter = 0; // Reset the cost counter
        totalSeconds = 0; // Reset the timer seconds
        alertTriggered = false; // Reset the alert trigger flag

        // Reset the displayed timer and cost
        timerDiv.textContent = "00:00:00";
        currentCostDiv.textContent = `Current Cost: ${formatCost(0)}`;
        finalCostDiv.textContent = `Final Cost: ${formatCost(0)}`;

        // Reset select and input fields
        consoleSelect.selectedIndex = 0;
        consoleSelect.disabled = false;
        nameInput.disabled = false;
        nameInput.value = ""; // Clear the name field
        alertTimeInput.value = "";
        alertTimeInput.disabled = false;

        // Reset buttons and disable as needed
        startButton.disabled = false;
        pauseButton.disabled = true;
        resetButton.disabled = true;
        stopAlertButton.disabled = true;

        // Remove the saved state from localStorage
        localStorage.removeItem(consoleDiv.id); // Remove specific console state

        saveState(); // Save the reset state (which is now zeroed out)
    }
});



        const removeConsoleButton = consoleDiv.querySelector('.removeConsoleButton');
        removeConsoleButton.addEventListener('click', () => {
            if (confirm("Are you sure you want to remove this console?")) {
                clearInterval(intervalId);
                localStorage.removeItem(consoleDiv.id);
                consoleDiv.remove();
            }
        });
    };

    const firstConsole = createConsoleSection(consoleIndex);
    consolesContainer.appendChild(firstConsole);
    initializeConsole(firstConsole);

const MAX_CONSOLES = 16; // Set the maximum number of consoles

document.getElementById('addConsoleButton').addEventListener('click', () => {
    if (consoleIndex < MAX_CONSOLES) {  // Check if the number of consoles is less than the limit
        consoleIndex++; // Increment the console index
        const newConsole = createConsoleSection(consoleIndex); // Create the new console section
        consolesContainer.appendChild(newConsole); // Append it to the container
        initializeConsole(newConsole); // Initialize the new console (set up timer, buttons, etc.)
    } else {
        alert("You can only add up to " + MAX_CONSOLES + " consoles.");
    }
});

});

window.addEventListener('beforeunload', (event) => {
    // Set a custom message to ask for confirmation
    const message = "Are you sure you want to leave this page? Any unsaved progress will be lost.";
    
    // Display the confirmation dialog
    event.returnValue = message;  // Standard for most browsers
    return message;  // Some older browsers may require this line
});
