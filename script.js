const difficulties = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 }
};

let board = [];
let revealed = [];
let flagged = [];
let gameOver = false;
let timeElapsed = 0;
let timerInterval;
let minesLeft;

const gameContainer = document.getElementById('game');
const difficultySelect = document.getElementById('difficulty');
const newGameButton = document.getElementById('new-game');
const timerDisplay = document.getElementById('timer');
const flagsDisplay = document.getElementById('flags');
const gameOverContainer = document.getElementById('game-over');
const gameOverMessage = document.getElementById('game-over-message');
const restartButton = document.getElementById('restart');

function createBoard() {
    const { rows, cols, mines } = difficulties[difficultySelect.value];
    minesLeft = mines;
    board = [];
    revealed = [];
    flagged = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        revealed[i] = [];
        flagged[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i][j] = 0;
            revealed[i][j] = false;
            flagged[i][j] = false;
        }
    }

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        if (board[row][col] !== -1) {
            board[row][col] = -1;
            minesPlaced++;
        }
    }

    // Calculate numbers
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j] !== -1) {
                board[i][j] = countAdjacentMines(i, j);
            }
        }
    }
}

function countAdjacentMines(row, col) {
    const { rows, cols } = difficulties[difficultySelect.value];
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                if (board[newRow][newCol] === -1) {
                    count++;
                }
            }
        }
    }
    return count;
}

function revealCell(row, col) {
    const { rows, cols } = difficulties[difficultySelect.value];
    if (row < 0 || row >= rows || col < 0 || col >= cols || revealed[row][col] || flagged[row][col]) {
        return;
    }

    revealed[row][col] = true;
    const cell = document.getElementById(`cell-${row}-${col}`);
    cell.classList.add('revealed');

    if (board[row][col] === -1) {
        cell.textContent = '💣';
        cell.classList.add('mine');
        endGame(false);
    } else if (board[row][col] === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                revealCell(row + i, col + j);
            }
        }
    } else {
        cell.textContent = board[row][col];
    }

    checkWin();
}

function flagCell(row, col) {
    if (revealed[row][col] || gameOver) return;

    const cell = document.getElementById(`cell-${row}-${col}`);
    if (flagged[row][col]) {
        flagged[row][col] = false;
        cell.classList.remove('flagged');
        cell.textContent = '';
        minesLeft++;
    } else {
        flagged[row][col] = true;
        cell.classList.add('flagged');
        cell.textContent = '🚩';
        minesLeft--;
    }

    updateFlagsDisplay();
}

function updateFlagsDisplay() {
    const { mines } = difficulties[difficultySelect.value];
    flagsDisplay.textContent = `Flags: ${mines - minesLeft}/${mines}`;
}

function endGame(won) {
    gameOver = true;
    clearInterval(timerInterval);

    const { rows, cols } = difficulties[difficultySelect.value];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            cell.removeEventListener('click', cellClickHandler);
            cell.removeEventListener('contextmenu', cellContextMenuHandler);
            if (board[i][j] === -1) {
                cell.textContent = '💣';
                if (!won) cell.classList.add('mine');
            }
        }
    }

    gameOverMessage.textContent = won ? 'Congratulations! You won!' : 'Game Over! You hit a mine.';
    gameOverContainer.style.display = 'block';
}

function checkWin() {
    const { rows, cols, mines } = difficulties[difficultySelect.value];
    let revealedCount = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (revealed[i][j]) revealedCount++;
        }
    }
    if (revealedCount === rows * cols - mines) {
        endGame(true);
    }
}

function cellClickHandler() {
    const [row, col] = this.id.split('-').slice(1).map(Number);
    revealCell(row, col);
}

function cellContextMenuHandler(e) {
    e.preventDefault();
    const [row, col] = this.id.split('-').slice(1).map(Number);
    flagCell(row, col);
}

function initGame() {
    gameOver = false;
    timeElapsed = 0;
    clearInterval(timerInterval);
    timerDisplay.textContent = 'Time: 0s';
    gameOverContainer.style.display = 'none';

    const { rows, cols } = difficulties[difficultySelect.value];
    gameContainer.innerHTML = '';
    gameContainer.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    createBoard();
    updateFlagsDisplay();

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `cell-${i}-${j}`;
            cell.addEventListener('click', cellClickHandler);
            cell.addEventListener('contextmenu', cellContextMenuHandler);
            gameContainer.appendChild(cell);
        }
    }

    timerInterval = setInterval(() => {
        timeElapsed++;
        timerDisplay.textContent = `Time: ${timeElapsed}s`;
    }, 1000);
}

newGameButton.addEventListener('click', initGame);
difficultySelect.addEventListener('change', initGame);
restartButton.addEventListener('click', initGame);

initGame();