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

let tiles = [];
const size = 4;
let startTime, timerInterval;
let playerName = "";
let leaderboardData = JSON.parse(localStorage.getItem("leaderboard")) || [];

/* LOGIN SYSTEM */
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
        <a href="#" onclick="showPuzzle()">4x4 Puzzle</a>
        <a href="#" onclick="showAimTrainer()">Aim Trainer</a>
    `;
}

/* PUZZLE GAME */
function showPuzzle() {
    homeScreen.style.display = "none";
    aimTrainerWrapper.style.display = "none";
    puzzleWrapper.style.display = "block";
    leaderboard.style.display = "block";
    createPuzzle();
    startTimer();
}

function createPuzzle() {
    puzzleContainer.innerHTML = "";
    tiles = Array.from({ length: size * size - 1 }, (_, i) => i + 1).concat(null);
    shuffleTiles();
    tiles.forEach((tile, index) => {
        const tileElement = document.createElement("div");
        tileElement.classList.add("tile");
        if (tile === null) {
            tileElement.classList.add("empty");
        } else {
            tileElement.textContent = tile;
            tileElement.addEventListener("click", () => moveTile(index));
        }
        puzzleContainer.appendChild(tileElement);
    });
}

function shuffleTiles() {
    for (let i = tiles.length - 2; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
}

function moveTile(index) {
    const emptyIndex = tiles.indexOf(null);
    const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - size, emptyIndex + size];

    if (validMoves.includes(index)) {
        [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];
        createPuzzle();
        checkWin();
    }
}

function startTimer() {
    clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    return timerDisplay.textContent;
}

function checkWin() {
    if (tiles.slice(0, 15).every((tile, index) => tile === index + 1)) {
        const timeTaken = stopTimer();
        message.textContent = `🎉 You Win, ${playerName}! Time: ${timeTaken} 🎉`;
        updateLeaderboard(playerName, timeTaken);
    } else {
        message.textContent = "";
    }
}

function updateLeaderboard(name, time) {
    leaderboardData.push({ name, time });
    leaderboardData.sort((a, b) => {
        const [minA, secA] = a.time.split(":").map(Number);
        const [minB, secB] = b.time.split(":").map(Number);
        return minA * 60 + secA - (minB * 60 + secB);
    });
    localStorage.setItem("leaderboard", JSON.stringify(leaderboardData));
    displayLeaderboard();
}

function displayLeaderboard() {
    leaderboardBody.innerHTML = "";
    leaderboardData.forEach((entry, index) => {
        leaderboardBody.innerHTML += `<tr>
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.time}</td>
        </tr>`;
    });
}

let aimStartTime, targetCount = 0;
const maxTargets = 10;
const aimLeaderboard = document.getElementById("aim-leaderboard");
const aimLeaderboardBody = document.getElementById("aim-leaderboard-body");
let aimLeaderboardData = JSON.parse(localStorage.getItem("aimLeaderboard")) || [];
let aimGameActive = false; // Prevents extra clicks after completion
let aimTimerInterval; // Declare timer variable

/* Show Aim Trainer */
function showAimTrainer() {
    homeScreen.style.display = "none";
    puzzleWrapper.style.display = "none";
    leaderboard.style.display = "none";
    aimTrainerWrapper.style.display = "block";
    aimLeaderboard.style.display = "block";
    aimTrainerContainer.innerHTML = "";
    targetCount = 0;
}

/* Start Aim Trainer */
function startAimTrainer() {
    aimGameActive = true;
    aimStartTime = Date.now();
    targetCount = 0;
    document.getElementById("aim-score").textContent = ""; // Reset display
    document.getElementById("aim-timer-display").textContent = "Time: 0.00s"; // Reset timer

    // Start live timer
    clearInterval(aimTimerInterval);
    aimTimerInterval = setInterval(updateAimTimer, 10);

    createTarget();
}

/* Update timer */
function updateAimTimer() {
    if (!aimGameActive) return;
    const elapsedTime = ((Date.now() - aimStartTime) / 1000).toFixed(2);
    document.getElementById("aim-timer-display").textContent = `Time: ${elapsedTime}s`;
}


/* Create Moving Target */
function createTarget() {
    aimTrainerContainer.innerHTML = "";
    const target = document.createElement("div");
    target.classList.add("target");
    target.style.top = `${Math.random() * 90}%`;
    target.style.left = `${Math.random() * 90}%`;
    target.addEventListener("click", hitTarget);
    aimTrainerContainer.appendChild(target);
}

/* Hit Target */
function hitTarget() {
    if (!aimGameActive) return; // Prevent extra clicks

    targetCount++;
    if (targetCount < maxTargets) {
        createTarget();
    } else {
        aimGameActive = false; // Stop further clicks
        const timeTaken = ((Date.now() - aimStartTime) / 1000).toFixed(2);
        document.getElementById("aim-score").textContent = `Completed in ${timeTaken} seconds!`;
        document.getElementById("aim-timer-display").textContent = `Time: ${timeTaken}s`;
        updateAimLeaderboard(playerName, timeTaken);
    }
}

/* Update Aim Trainer Leaderboard */
function updateAimLeaderboard(name, time) {
    aimLeaderboardData.push({ name, time });
    aimLeaderboardData.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
    localStorage.setItem("aimLeaderboard", JSON.stringify(aimLeaderboardData));
    displayAimLeaderboard();
}

/* Display Aim Trainer Leaderboard */
function displayAimLeaderboard() {
    aimLeaderboardBody.innerHTML = "";
    aimLeaderboardData.forEach((entry, index) => {
        aimLeaderboardBody.innerHTML += `<tr>
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.time}s</td>
        </tr>`;
    });
}

/* INIT */
displayLeaderboard();
displayAimLeaderboard();
showLogin();
