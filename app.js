//  Grab page elements 
const puzzleContainer = document.getElementById("puzzle-container");
const message = document.getElementById("message");
const homeScreen = document.getElementById("home-screen");
const puzzleWrapper = document.getElementById("puzzle-container-wrapper");
const leaderboard = document.getElementById("leaderboard");
const menuOptions = document.getElementById("menu-options");
const loginScreen = document.getElementById("login-screen");
const aimTrainerWrapper = document.getElementById("aim-trainer-wrapper");
const aimTrainerContainer = document.getElementById("aim-trainer-container");
const playerNameInput = document.getElementById("player-name");
const displayName = document.getElementById("display-name");
const timerDisplay = document.getElementById("timer");
const leaderboardBody = document.getElementById("leaderboard-body");
const memoryGameWrapper = document.getElementById("memory-game-wrapper");
const dropdownMenu = document.getElementById("dropdown-menu");

//  Global variables 
let tiles = [];
const size = 4;
let startTime, timerInterval;
let playerName = "";
let leaderboardData = JSON.parse(localStorage.getItem("leaderboard")) || [];

/* Home and Login System */


// Show the Home (Recommender) screen
function showHome() {
    hideAllSections();
    homeScreen.style.display = "block";
}


// Show the Login screen
function showLogin() {
    hideAllSections();
    loginScreen.style.display = "block";
    const dropdownMenu = document.getElementById("dropdown-menu");
    if (dropdownMenu) {
        dropdownMenu.style.display = "none"; // Hide dropdown while logging in
    }
}

// Submit login: save name, show home, build menu
function submitLogin() {
    playerName = playerNameInput.value.trim();
    if (playerName === "") {
        alert("Please enter your name!");
        return;
    } 
    displayName.textContent = playerName;
    loginScreen.style.display = "none";
    homeScreen.style.display = "block";
    menuOptions.innerHTML = `
      <a href="#" onclick="showHome()">Home</a>
      <a href="#" onclick="showPuzzle()">4x4 Puzzle</a>
      <a href="#" onclick="showAimTrainer()">Aim Trainer</a>
      <a href="#" onclick="showMemoryGame()">Memory Game</a>
      <a href="#" onclick="signOut()">Sign Out</a>
  `;
  const dropdownMenu = document.getElementById("dropdown-menu");
  if (dropdownMenu) {
    dropdownMenu.style.display = "block";
  }
}

// Recommend a game based on chosen genre
function recommendGame() {
    const genre = document.getElementById("genre-choice").value;

    if (genre === "") {
        alert("Please select a genre!");
        return;
    }

    hideAllSections(); // Hide everything first

    if (genre === "memory") {
        showMemoryGame();
    } else if (genre === "shooter") {
        showAimTrainer();
    } else if (genre === "puzzle") {
        showPuzzle();
    }
}

// Sign out: reset everything
function signOut() {
    // Clear player name
    playerName = "";
    playerNameInput.value = "";
    displayName.textContent = "";

    // Hide everything
    hideAllSections();

    // Hide dropdown
    const dropdownMenu = document.getElementById("dropdown-menu");
    if (dropdownMenu) {
        dropdownMenu.style.display = "none";
    }

    // Show login screen
    loginScreen.style.display = "block";

    // Reset menu options back to only Login
    menuOptions.innerHTML = `
        <a href="#" onclick="showLogin()">Login</a>
    `;
}

/* PUZZLE GAME */
function showPuzzle() {
    homeScreen.style.display = "none";
    aimTrainerWrapper.style.display = "none";
    memoryGameWrapper.style.display = "none";
    puzzleWrapper.style.display = "block"; // Show Puzzle section
    leaderboard.style.display = "block";   // Show Puzzle leaderboard
    createPuzzle(); // Set up a new puzzle
    startTimer();   // Start the game timer
}

// Draw the Puzzle Grid (without reshuffling)
function drawPuzzle() {
    puzzleContainer.innerHTML = ""; // Clear old tiles
    tiles.forEach((tile, index) => {
        const tileElement = document.createElement("div");
        tileElement.classList.add("tile");

        if (tile === null) {
            tileElement.classList.add("empty"); // Style empty tile differently
        } else {
            tileElement.textContent = tile; // Show tile number
            tileElement.addEventListener("click", () => moveTile(index)); // Add click to move tile
        }

        puzzleContainer.appendChild(tileElement);
    });
}

// Create and shuffle a new Puzzle
function createPuzzle() {
    // Create numbers 1-15 + one empty space (null)
    tiles = Array.from({ length: size * size - 1 }, (_, i) => i + 1).concat(null);
    shuffleTiles(); // Shuffle them
    drawPuzzle();   // Draw on screen
}

// Shuffle Puzzle tiles randomly
function shuffleTiles() {
    for (let i = tiles.length - 2; i > 0; i--) { // Don't shuffle the empty tile
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
}

// Try to move a tile
function moveTile(index) {
    const emptyIndex = tiles.indexOf(null); // Find empty spot
    const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - size, emptyIndex + size]; // Adjacent moves only

    if (validMoves.includes(index)) {
        [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]]; // Swap clicked tile and empty spot
        drawPuzzle(); // Redraw tiles after move
        checkWin();   // Check if player has won
    }
}

// Start the Puzzle game timer
function startTimer() {
    clearInterval(timerInterval); // Clear old timer
    startTime = Date.now();        // Start new timer

    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`; // Show timer on page
    }, 1000);
}

// Stop the timer and return final time
function stopTimer() {
    clearInterval(timerInterval);
    return timerDisplay.textContent;
}

// Check if Puzzle is solved
function checkWin() {
    // Check if tiles 1-15 are in the right order
    if (tiles.slice(0, 15).every((tile, index) => tile === index + 1)) {
        const timeTaken = stopTimer(); // Stop timer
        message.textContent = `🎉 You Win, ${playerName}! Time: ${timeTaken} 🎉`; // Show win message
        updateLeaderboard(playerName, timeTaken); // Save score
    } else {
        message.textContent = "";
    }
}

// Update Puzzle Leaderboard
function updateLeaderboard(name, time) {
    leaderboardData.push({ name, time }); // Add new entry
    leaderboardData.sort((a, b) => {
        const [minA, secA] = a.time.split(":").map(Number);
        const [minB, secB] = b.time.split(":").map(Number);
        return minA * 60 + secA - (minB * 60 + secB); // Sort by fastest time
    });

    localStorage.setItem("leaderboard", JSON.stringify(leaderboardData)); // Save to localStorage
    displayLeaderboard(); // Refresh display
}

// Draw Puzzle Leaderboard Table
function displayLeaderboard() {
    leaderboardBody.innerHTML = ""; // Clear old rows

    leaderboardData.forEach((entry, index) => {
        leaderboardBody.innerHTML += `<tr>
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.time}</td>
        </tr>`;
    });
}
// Restart Puzzle: New Puzzle + New Timer
function restartPuzzle() {
    clearInterval(timerInterval); // Stop any running timer
    message.textContent = "";      // Clear win message
    createPuzzle();                // Reshuffle puzzle
    startTimer();                  // Restart timer
}

/* Aim Trainer Game */

// Global variables for Aim Trainer
let aimStartTime, targetCount = 0;
const maxTargets = 10;
const aimLeaderboard = document.getElementById("aim-leaderboard");
const aimLeaderboardBody = document.getElementById("aim-leaderboard-body");
let aimLeaderboardData = JSON.parse(localStorage.getItem("aimLeaderboard")) || [];
let aimGameActive = false; // Prevents extra clicks after completion
let aimTimerInterval; // Declare timer variable


// Show the Aim Trainer screen
function showAimTrainer() {
    homeScreen.style.display = "none"; // Hide Home
    puzzleWrapper.style.display = "none"; // Hide Puzzle
    leaderboard.style.display = "none";   // Hide Puzzle leaderboard
    memoryGameWrapper.style.display = "none"; // Hide Memory Game
    aimTrainerWrapper.style.display = "block"; // Show Aim Trainer
    aimLeaderboard.style.display = "block";    // Show Aim Leaderboard
    aimTrainerContainer.innerHTML = ""; // Clear previous targets
    targetCount = 0; // Reset hit count
}
// Start a new Aim Trainer session
function startAimTrainer() {
    aimGameActive = true;  // Enable clicking targets
    aimStartTime = Date.now(); // Record start time
    targetCount = 0; // Reset how many targets hit

    document.getElementById("aim-score").textContent = ""; // Clear score text
    document.getElementById("aim-timer-display").textContent = "Time: 0.00s"; // Reset timer text
    document.getElementById("aim-trainer-start-button").textContent = "Restart"; // Change Start button to "Restart"

    clearInterval(aimTimerInterval); // Clear any previous timer
    aimTimerInterval = setInterval(updateAimTimer, 10); // Start updating live timer

    createTarget(); // Create the first target
}

// Update the live Aim Trainer timer every 10ms
function updateAimTimer() {
    if (!aimGameActive) return; // If game is over, stop updating
    const elapsedTime = ((Date.now() - aimStartTime) / 1000).toFixed(2); // Calculate elapsed time
    document.getElementById("aim-timer-display").textContent = `Time: ${elapsedTime}s`; // Update timer display
}

// Create a new target randomly placed in the play area
function createTarget() {
    aimTrainerContainer.innerHTML = ""; // Remove previous target
    const target = document.createElement("div");
    target.classList.add("target");
    target.style.top = `${Math.random() * 90}%`; // Random vertical position
    target.style.left = `${Math.random() * 90}%`; // Random horizontal position
    target.addEventListener("click", hitTarget); // Clicking target triggers hitTarget()
    aimTrainerContainer.appendChild(target); // Add target to the play area
}

// Handle a target being clicked
function hitTarget() {
    if (!aimGameActive) return; // Don't register hits after game over
    targetCount++; // Add to hit counter
    if (targetCount < maxTargets) {
        createTarget(); // Create next target
    } else {
        aimGameActive = false; // Game over, stop accepting hits
        const timeTaken = ((Date.now() - aimStartTime) / 1000).toFixed(2); // Calculate total time
        document.getElementById("aim-score").textContent = `Completed in ${timeTaken} seconds!`; // Show score
        document.getElementById("aim-timer-display").textContent = `Time: ${timeTaken}s`; // Show final timer
        updateAimLeaderboard(playerName, timeTaken); // Save score
    }
}

// Update the Aim Trainer leaderboard
function updateAimLeaderboard(name, time) {
    aimLeaderboardData.push({ name, time }); // Add new entry
    aimLeaderboardData.sort((a, b) => parseFloat(a.time) - parseFloat(b.time)); // Sort fastest times first
    localStorage.setItem("aimLeaderboard", JSON.stringify(aimLeaderboardData)); // Save to localStorage
    displayAimLeaderboard(); // Redraw leaderboard
}

// Draw the Aim Trainer leaderboard table
function displayAimLeaderboard() {
    aimLeaderboardBody.innerHTML = ""; // Clear old leaderboard
    aimLeaderboardData.forEach((entry, index) => {
        aimLeaderboardBody.innerHTML += `<tr>
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.time}s</td>
        </tr>`;
    });
}


/* Memory Game */

// Global variables for Memory Game
let memoryFlippedCards = []; // Cards currently flipped
let memoryMatchedPairs = 0; // Number of matched pairs
let memoryTimer = null; // Timer interval
let memoryStartTime = null; // When the game started
let memoryGameActive = false; // Whether player can flip cards
let memoryLeaderboardData = JSON.parse(localStorage.getItem("memoryLeaderboard")) || []; // Load memory leaderboard or empty

// Show the Memory Game screen
function showMemoryGame() {
    hideAllSections(); // Hide other screens
    document.getElementById("memory-game-wrapper").style.display = "block"; // Show Memory Game wrapper
    document.getElementById("memory-leaderboard").style.display = "block"; // Show Memory leaderboard
    createMemoryGame(); // Set up a new game
}

// Create and shuffle a new Memory Game
function createMemoryGame() {
    const board = document.getElementById("memory-board");
    board.innerHTML = ""; // Clear previous cards
    memoryFlippedCards = []; // Reset flipped cards
    memoryMatchedPairs = 0; // Reset match counter
    memoryGameActive = true; // Allow flipping

    const symbols = ["🍎", "🎮", "🚀", "🐱", "🎧", "🧠", "🌟", "🪐"]; // 8 unique symbols
    const cardSymbols = [...symbols, ...symbols]; // Duplicate for pairs (16 cards total)
    shuffleArray(cardSymbols); // Shuffle the array

    // Create cards
    cardSymbols.forEach((symbol) => {
        const card = document.createElement("div");
        card.classList.add("memory-card");

        const inner = document.createElement("div");
        inner.classList.add("memory-card-inner");

        const front = document.createElement("div");
        front.classList.add("memory-card-front");
        front.textContent = symbol; // Show symbol on front

        const back = document.createElement("div");
        back.classList.add("memory-card-back"); // Empty back

        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);

        card.addEventListener("click", () => flipCard(card)); // Click event to flip

        board.appendChild(card);
    });

    startMemoryTimer(); // Start game timer
}

// Handle flipping a card
function flipCard(card) {
    // Don't allow flipping if game inactive or too many cards flipped
    if (!memoryGameActive || card.classList.contains("flip") || memoryFlippedCards.length === 2) return;

    card.classList.add("flip"); // Add flip animation
    memoryFlippedCards.push(card); // Track flipped card

    if (memoryFlippedCards.length === 2) {
        const [card1, card2] = memoryFlippedCards;
        const symbol1 = card1.querySelector(".memory-card-front").textContent;
        const symbol2 = card2.querySelector(".memory-card-front").textContent;

        if (symbol1 === symbol2) {
            memoryMatchedPairs++; // One more pair matched
            memoryFlippedCards = []; // Clear flipped cards

            if (memoryMatchedPairs === 8) {
                endMemoryGame(); // All pairs found!
            }
        } else {
            // If not a match, flip back after short delay
            setTimeout(() => {
                card1.classList.remove("flip");
                card2.classList.remove("flip");
                memoryFlippedCards = [];
            }, 800);
        }
    }
}


// Start the Memory Game timer
function startMemoryTimer() {
    memoryStartTime = Date.now(); // Record start
    clearInterval(memoryTimer);   // Clear old timer
    memoryTimer = setInterval(() => {
        const elapsed = ((Date.now() - memoryStartTime) / 1000).toFixed(2);
        document.getElementById("memory-timer-display").textContent = `Time: ${elapsed}s`; // Show elapsed time
    }, 100); // Update every 0.1 second
}

// End Memory Game and save score
function endMemoryGame() {
    memoryGameActive = false; // Stop allowing flips
    clearInterval(memoryTimer); // Stop timer
    const finalTime = ((Date.now() - memoryStartTime) / 1000).toFixed(2);
    document.getElementById("memory-complete-message").textContent = `🎉 Completed in ${finalTime} seconds!`;
    updateMemoryLeaderboard(playerName, finalTime); // Save to leaderboard
}

// Update Memory Game leaderboard
function updateMemoryLeaderboard(name, time) {
    memoryLeaderboardData.push({ name, time }); // Add new score
    memoryLeaderboardData.sort((a, b) => parseFloat(a.time) - parseFloat(b.time)); // Sort fastest first
    localStorage.setItem("memoryLeaderboard", JSON.stringify(memoryLeaderboardData)); // Save to localStorage
    displayMemoryLeaderboard(); // Update table
}

// Draw the Memory Leaderboard table
function displayMemoryLeaderboard() {
    const table = document.getElementById("memory-leaderboard-body");
    table.innerHTML = ""; // Clear old rows
    memoryLeaderboardData.forEach((entry) => {
        table.innerHTML += `<tr>
            <td>${entry.name}</td>
            <td>${entry.time}</td>
        </tr>`;
    });
}

// Shuffle any array (used for shuffling cards)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Restart Memory Game: new board, reset timer
function restartMemoryGame() {
    clearInterval(memoryTimer); // Stop any running timer
    document.getElementById("memory-complete-message").textContent = ""; // Clear completion message
    createMemoryGame(); // Setup a fresh game
}

// Hide all major screen sections (home, puzzle, aim trainer, memory)
function hideAllSections() {
    const sections = document.querySelectorAll("#home-screen, #puzzle-container-wrapper, #aim-trainer-wrapper, #memory-game-wrapper");
    sections.forEach(section => section.style.display = "none");
}

/*  Initial display when page loads */ 

displayLeaderboard(); // Load Puzzle Leaderboard
displayAimLeaderboard(); // Load Aim Trainer Leaderboard
displayMemoryLeaderboard(); // Load Memory Game Leaderboard
showLogin(); // Start at the login screen
