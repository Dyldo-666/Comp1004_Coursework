const puzzleContainer = document.getElementById("puzzle-container");
const message = document.getElementById("message");
const homeScreen = document.getElementById("home-screen");
const puzzleWrapper = document.getElementById("puzzle-container-wrapper");
const menuOptions = document.getElementById("menu-options");

let tiles = [];
const size = 4; // 4x4 grid

function createPuzzle() {
    tiles = [...Array(15).keys()].map(n => n + 1);
    tiles.push(null);
    shuffleTiles();
}

function shuffleTiles() {
    do {
        tiles = tiles.sort(() => Math.random() - 0.5);
    } while (!isSolvable(tiles));
    renderPuzzle();
}

function isSolvable(tiles) {
    let inversions = 0;
    let tileArray = tiles.filter(n => n !== null);
    for (let i = 0; i < tileArray.length; i++) {
        for (let j = i + 1; j < tileArray.length; j++) {
            if (tileArray[i] > tileArray[j]) inversions++;
        }
    }
    const emptyRow = Math.floor(tiles.indexOf(null) / size);
    return (size % 2 !== 0) ? (inversions % 2 === 0) : ((emptyRow % 2 === 0) === (inversions % 2 !== 0));
}

function renderPuzzle() {
    puzzleContainer.innerHTML = "";
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

function moveTile(index) {
    const emptyIndex = tiles.indexOf(null);
    const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - size, emptyIndex + size];

    if (validMoves.includes(index)) {
        [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];
        renderPuzzle();
        checkWin();
    }
}

function checkWin() {
    if (tiles.slice(0, 15).every((tile, index) => tile === index + 1)) {
        message.textContent = "🎉 You Win! 🎉";
    } else {
        message.textContent = "";
    }
}

/* Show Home Screen & Update Menu */
function showHome() {
    homeScreen.style.display = "block";
    puzzleWrapper.style.display = "none";

    menuOptions.innerHTML = `<a href="#" onclick="showPuzzle()">Play 4x4 Puzzle</a>`;
}

/* Show Puzzle & Update Menu */
function showPuzzle() {
    homeScreen.style.display = "none";
    puzzleWrapper.style.display = "block";
    createPuzzle();

    menuOptions.innerHTML = `
        <a href="#" onclick="showHome()">Home</a>
        <a href="#" onclick="shuffleTiles()">Shuffle</a>
    `;
}

showHome();
