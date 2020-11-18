'use strict';

function RenderBoard(mat, selector) {
    var strHTML = '<table border="1"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var cellContent = ' ';
            if (cell.isMine) {
                // render mine
                // cellContent = 'mine!';
            }

            var className = `cell cell${i}-${j}`;
            strHTML += `<td class="${className}" onclick="cellClicked(${i},${j})"
             oncontextmenu="markCell(${i},${j});return false;">${cellContent} </td>`;
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    // console.log(elCell);
    // change to inner html if want to manipulate html
    elCell.innerHTML = value;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function startTimer(selector) {
    var startTime = Date.now();
    gGameInterval = setInterval(function renderTime() {
        var currTime = Date.now();
        var timePassed = currTime - startTime;
        var seconds = ((timePassed % 60000) / 1000).toFixed(3);
        document.querySelector(`${selector}`).innerText = seconds;
    }, 1);
}
