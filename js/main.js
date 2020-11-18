'use strict';

const MINE = '&#128163;';
const FLAG = '&#128681';
const WIN_EMOJI = '&#128526';
const LOSE_EMOJI = '&#128534;';
const NORMAL_EMOJI = '&#128522;';

var gGameInterval;
var gGameBoard;
var gLevel = {
    size: 4,
    mines: 2,
    lives: 3,
};
var gGame = {
    firstPlay: true,
    isOn: true,
};

// initializes all game params, called when page loads
function initGame() {
    removeBlackClass();
    gLevel.lives = 3;
    gGame.isOn = true;
    gGame.firstPlay = true;
    if (gGameInterval) clearInterval(gGameInterval);
    gGameBoard = buildBoard();
    // placeMines(gGameBoard);
    // setMinesCount(gGameBoard);
    RenderBoard(gGameBoard, '.game-board');
    document.querySelector('.game-screen span').innerHTML = NORMAL_EMOJI;
}

// creates a 2d array containing objects 'cell'
function buildBoard() {
    var mat = [];
    for (var i = 0; i < gLevel.size; i++) {
        mat[i] = [];
        for (var j = 0; j < gLevel.size; j++) {
            mat[i][j] = createCell();
        }
    }
    return mat;
}

function setGameSize(size, mines) {
    gLevel.size = size;
    gLevel.mines = mines;
    initGame();
}

// place mines at the game board
function placeMines(board, pos) {
    for (var i = 0; i < gLevel.mines; i++) {
        var emptyCell = getEmptyCell(board, pos);
        board[emptyCell.i][emptyCell.j].isMine = true;
        board[emptyCell.i][emptyCell.j].isShown = true;
    }
}
function getEmptyCell(board, startPos) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (i === startPos.i && j === startPos.j) continue;
            if (!board[i][j].isMine && !board[i][j].isShown) {
                emptyCells.push({ i, j });
            }
        }
    }
    var randIdx = getRandomInt(0, emptyCells.length);
    return emptyCells[randIdx];
}

// create a cell object
function createCell() {
    var cell = {
        minesAround: 0,
        isMine: false,
        isMarked: false,
        isShown: false,
    };
    return cell;
}

// loops through 2d array, if cell is mine - call increaseCelsMineCount()
function setMinesCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) {
                var coord = { i, j };
                // console.log(coord, 'mine');
                increaseCelsMineCount(coord);
            }
        }
    }
}

// gets coord of cell clicked and checks if its a mine
// if mine - game over
// if has bombs near - show number
// if has no bombs near - expand until number
// if already revealed do nothing
function cellClicked(i, j) {
    var pos = { i, j };
    if (gGame.firstPlay && !gGameBoard[i][j].isMine) {
        placeMines(gGameBoard, pos);
        setMinesCount(gGameBoard);
        RenderBoard(gGameBoard, '.game-board');
        startTimer('.time-display span');
        gGame.firstPlay = false;
    }

    if (!gGame.isOn) return;

    if (gGameBoard[i][j].isMarked) return;

    // if (!gGameBoard[i][j].isMine && gGame.firstPlay) {
    //     startTimer('.time-display span');
    //     gGame.firstPlay = false;
    // }
    if (gGameBoard[i][j].isMine) {
        // cell clicked is a mine
        // console.log('boom');
        document.querySelector(`.cell${i}-${j}`).classList.add('exploded');
        setTimeout(function () {
            document
                .querySelector(`.cell${i}-${j}`)
                .classList.remove('exploded');
        }, 500);
        decreaseLife();
        // gameOver();
    } else if (gGameBoard[i][j].isShown) {
        // cell clicked already
        return;
    } else if (gGameBoard[i][j].minesAround && !gGameBoard[i][j].isShown) {
        // if it has mines around and not clicked
        revealCell(pos);
        checkWin(gGameBoard);
    } else if (!gGameBoard[i][j].isShown) {
        //has no mines around
        expandEmptyCellsRec(pos);
        checkWin(gGameBoard);
    }
}

// render cell by its value
function revealCell(pos) {
    gGameBoard[pos.i][pos.j].isShown = true;
    document.querySelector(`.cell${pos.i}-${pos.j}`).classList.add('clicked');
    renderCell(pos, gGameBoard[pos.i][pos.j].minesAround);
}

// goes and checks adjecent cells if they have bombs around and marks accordinly
function expandEmptyCells(pos) {
    gGameBoard[pos.i][pos.j].isShown = true;
    document.querySelector(`.cell${pos.i}-${pos.j}`).classList.add('clicked');
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0) continue;
        if (i >= gGameBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0) continue;
            if (j >= gGameBoard[0].length) continue;
            if (i === pos.i && j === pos.j) continue;

            if (gGameBoard[i][j].minesAround && !gGameBoard[i][j].isMine) {
                var coord = { i, j };
                revealCell(coord);
            } else if (
                !gGameBoard[i][j].minesAround &&
                !gGameBoard[i][j].isMine
            ) {
                var coord = { i, j };
                gGameBoard[i][j].isShown = true;
                document
                    .querySelector(`.cell${coord.i}-${coord.j}`)
                    .classList.add('clicked');
                // return expandEmptyCells(coord);
            }
        }
    }
}

// with recursion
function expandEmptyCellsRec(pos) {
    // debugger;
    if (gGameBoard[pos.i][pos.j].isShown) return;
    gGameBoard[pos.i][pos.j].isShown = true;
    document.querySelector(`.cell${pos.i}-${pos.j}`).classList.add('clicked');
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0) continue;
        if (i >= gGameBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0) continue;
            if (j >= gGameBoard[0].length) continue;
            if (i === pos.i && j === pos.j) continue;

            if (!gGameBoard[i][j].isMine && !gGameBoard[i][j].minesAround) {
                gGameBoard[pos.i][pos.j].isShown = true;
                document
                    .querySelector(`.cell${i}-${j}`)
                    .classList.add('clicked');
                var currPos = { i, j };
                expandEmptyCellsRec(currPos);
            } else if (gGameBoard[i][j].isMine) continue;
            else if (
                gGameBoard[i][j].minesAround &&
                !gGameBoard[i][j].isShown
            ) {
                var currPos = { i, j };
                revealCell(currPos);
            }
        }
    }
}

function markCell(i, j) {
    if (!gGame.isOn) return;
    if (gGameBoard[i][j].isShown && !gGameBoard[i][j].isMine) return;
    var pos = { i, j };
    // console.log('right click', i, j);
    if (gGameBoard[i][j].isMarked) {
        gGameBoard[i][j].isMarked = false;
        renderCell(pos, ' ');
    } else {
        gGameBoard[i][j].isMarked = true;
        renderCell(pos, FLAG);
        document.querySelector(`.cell${i}-${j}`).classList.remove('exploded');
    }
    checkWin(gGameBoard);
    return false;
}

// loops through all ajecent cells and increase mine count by 1
function increaseCelsMineCount(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0) continue;
        if (i >= gGameBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0) continue;
            if (j >= gGameBoard[0].length) continue;
            if (i === pos.i && j === pos.j) continue;

            if (!gGameBoard[i][j].isMine) {
                gGameBoard[i][j].minesAround++;
            }
        }
    }
}

// add black class to heart and dec life
function decreaseLife() {
    gLevel.lives--;
    // console.log('lives: ', gLevel.lives);
    document
        .querySelector(`h3:nth-child(${gLevel.lives + 2})`)
        .classList.add('black');
    if (gLevel.lives === 0) {
        // lose
        document.querySelector('.game-screen span').innerHTML = LOSE_EMOJI;
        // console.log('you lost!');
        gameOver();
    }
}

function gameOver() {
    gGame.isOn = false;
    revealMines(gGameBoard);
    clearInterval(gGameInterval);
}

// if not all cells are shown - didnt win
// if a cell is marked and its not a bomb - also didnt win
function checkWin(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isShown) {
                return false;
            }
            if (board[i][j].isMarked && !board[i][j].isMine) {
                return false;
            }
            if (board[i][j].isMine && !board[i][j].isMarked) {
                return false;
            }
        }
    }
    document.querySelector('.game-screen span').innerHTML = WIN_EMOJI;
    // console.log('you won!!!');
    gameOver();
    return true;
}

function revealMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) {
                var pos = { i, j };
                renderCell(pos, MINE);
            }
        }
    }
}

// remove black color from hearts on init
function removeBlackClass() {
    var hearts = document.querySelectorAll('.life-display h3');
    for (var heart of hearts) {
        heart.classList.remove('black');
    }
}
