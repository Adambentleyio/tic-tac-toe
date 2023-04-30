


//* Module for gameboard (model)
// the controller will be used to update the gameboard state
// the model will have functions and private variables that relate to the gameboard such as the board array and the gameboard size and the gameboard state and the gameboard winner and the gameboard turn


const Gameboard = (() => {

    let gameboard = [];
    let players = [];

    function generateGameboard(boardSize) {
        let newGameboard = [];
        for (let i = 0; i < boardSize; i++) {
            newGameboard.push(new Array(boardSize).fill(null));
        }
        return newGameboard;
    }

    function newGameboard(boardSize = 3) {
        console.log('new gameboard created')
        gameboard = generateGameboard(boardSize);
    }

    function getGameboard() {
        return gameboard;
    }


    const resetGameboard = () => {
        for (let i = 0; i <  gameboard.length; i++) {
          for (let j = 0; j < gameboard[i].length; j++) {
            gameboard[i][j] = null;
          }
        }
    }

    // Controller will call function after creating players to set the players in the gameboard module
    function setPlayers(playerArr) {
        console.log("Setting players")
        console.log(playerArr)
        players = playerArr
        }

    function getPlayers() {
        return players;
    }

    let currentPlayerIndex;

    const getCurrentPlayerIndex = () => currentPlayerIndex;

    const setCurrentPlayerIndex = (index) => {
        currentPlayerIndex = index;
    }

    // add marker to gameboard array
    const addMarkerToGameboard = (square) => {
        const row = square.dataset.row;
        const col = square.dataset.col;
        gameboard[row][col] = players[currentPlayerIndex].marker;
    }

    return {
        gameboard,
        getGameboard,
        newGameboard,
        setPlayers,
        players,
        getCurrentPlayerIndex,
        setCurrentPlayerIndex,
        addMarkerToGameboard,
        resetGameboard,
        getPlayers,
        generateGameboard
    }
})();



//* Module for game display (view)
// the view will be used to display the gameboard in the DOM and display the gameboard state


const GameDisplay = (() => {

    // render the game board based on the gameboard array

    const renderGameboard = (boardArr) => {
        console.log('rendering gameboard')
        const gameboard = document.querySelector('#gameboard');
        // if gameboard is already rendered, remove it and add new one
        gameboard.innerHTML = '';
        // update css variable --board-size to match the board size
        gameboard.style.setProperty('--board-size', boardArr.length);

        for (let row = 0; row < boardArr.length; row++) {
            for (let col = 0; col < boardArr[row].length; col++) {
                const cell = document.createElement('div');
                cell.classList.add('square')
                cell.dataset.row= row;
                cell.dataset.col= col;
                cell.textContent = boardArr[row][col];
                gameboard.appendChild(cell);
            }
        }
    }

    // add event listeners to the gameboard squares

    const addGameBoardEventListeners = () => {

        const squares = document.querySelectorAll('.square');

        squares.forEach((square, idx) => square.addEventListener('click', function handleClick(event) {
            square.id = idx;
            console.log('square ' + square.id + ' clicked');
            GameController.handleClickedSquare(square)
            // square.removeEventListener('click', handleClick)
        }))
    }

    // display each sub array in the gameboard array in the DOM
    const displayGameDataArray = (boardArray) => {

        const boardArr = document.getElementById('board-arr');
        boardArray.length === 0 ? boardArr.innerHTML = `<p>No moves played</p>` : boardArray.forEach((row) => boardArr.innerHTML += `<p>${row}</p>`)
    }

    // remove a given element from the DOM

    removeDOMElement = (str) => {
        const element = document.querySelector(str);
        element.parentNode.removeChild(element);
    }

    return {
        displayGameDataArray,
        removeDOMElement,
        renderGameboard,
        addGameBoardEventListeners
    }

})();



//* Factory patten for creating players
// the player factory will be used to create player objects
// the player objects will be stored in the gameboard module (model)


const Player = (screenName, marker) => {

    (function getName() {
        return screenName;
    })()


    return {
        name: screenName,
        marker: marker
    }
}

//* Module for game controller in MVC pattern
// the controller will be used to update the gameboard state
// the controller does not hold the data for the gameboard.
// The controller processes user inputs and updates the gameboard in the model
// The controller will also check for a winner or tie, and be used to update the view


const GameController = (() => {

    let boardSizeInput;
    let players = []
    let gameOver;
    let gameStart = false;
    let playerOneMark = 'X';

    const gameSetupForm = document.querySelector('#players');
    const markerOptions = document.querySelector('.container-marker-option');
    const markerButtons = markerOptions.querySelectorAll('button');

    for (let i = 0; i < markerButtons.length; i++) {
        markerButtons[i].addEventListener('click', function() {
            toggleActiveButton(this.id);
        })
    }

    function toggleActiveButton(buttonId) {
        for (let i = 0; i < markerButtons.length; i++) {
            if (markerButtons[i].id === buttonId) {
                markerButtons[i].classList.add('active');
                playerOneMark = markerButtons[i].textContent.trim();
            } else {
                markerButtons[i].classList.remove('active')
            }
        }
    }

    // set event listener on each form element
    gameSetupForm.addEventListener('input', (event) => {

    console.log(event.target.previousElementSibling.dataset.boardSize)
    boardSizeInput = parseInt(event.target.previousElementSibling.dataset.boardSize);
    console.log(typeof boardSizeInput)
    })

    // Game btns setup
    const btnStart = document.querySelector('#btn-start');
    const btnResetGame = document.querySelector('#btn-reset');

    // Start game on click.
    btnStart.addEventListener('click', (event) => {
        event.preventDefault();
        gameStart = true;
        // gameStart ? GameDisplay.removeDOMElement('#players') : '';
        Gameboard.newGameboard();
        console.log(Gameboard.getGameboard())
        GameDisplay.renderGameboard(Gameboard.getGameboard());
        GameDisplay.addGameBoardEventListeners();
        startGame();
    })

    // Reset game on click
    btnResetGame.addEventListener('click', (event) => {
        event.preventDefault();
        resetGameboardAndDisplay();
    })

    // Start game and create players

    const startGame = () => {
        players = [
            Player('Player 1', playerOneMark),
            Player('Player 2', playerOneMark === 'X' ? 'O' : 'X')
        ]
        Gameboard.setPlayers(players);
        Gameboard.setCurrentPlayerIndex(playerOneMark === 'X' ? 0 : 1);
        gameOver = false;
    }

    // Handle click event on gameboard squares
    const handleClickedSquare = (square) => {
        if (gameStart && !gameOver) {
            let isWinner = false;
            let currentPlayerIndex = Gameboard.getCurrentPlayerIndex();
            let players = Gameboard.getPlayers();
            let winningPlayer = players[currentPlayerIndex].name

            if (!square.classList.contains('played')) {

            Gameboard.addMarkerToGameboard(square);
            updateSquareOnDisplay(Gameboard.getGameboard(), square);
            square.classList.add('played')
            isWinner = checkGameBoardWin()
            if (isWinner) {
                alert(`${winningPlayer} wins!`)
            }
            checkGameBoardWin() === "tie" ? alert("its a tie") : false;
            Gameboard.setCurrentPlayerIndex(Gameboard.getCurrentPlayerIndex() === 0 ? 1 : 0);
            }
        }
    }

    const updateSquareOnDisplay = (gameboard, square) => {
        let row, col;
        if (square.classList.contains('played')) {
            return;
        }
        if (square.dataset.row && square.dataset.col) {
          row = square.dataset.row;
          col = square.dataset.col;
          let marker = gameboard[row][col];
          square.textContent = marker;
        }
      };

      const resetGameboardAndDisplay = () => {
        Gameboard.resetGameboard();
        GameDisplay.renderGameboard(Gameboard.getGameboard());
        console.log(gameStart)
        if (gameStart === true) {
            GameDisplay.addGameBoardEventListeners();
        }
    }

    // Check for winning move OR tie

    const checkGameBoardWin = () => {
        // Define functions for checking rows, columns ad diagonals for a winner

        let board = Gameboard.getGameboard();
        let howManyInARow = 3;

        function checkRowWin(){
            console.log("checking rows")

            // Check for a winner in the rows
            for (let i = 0; i < board.length; i++) {
                if (board[i].every(elem => elem !== null)) {
                    for (let j = 0; j < board[i].length - (howManyInARow - 1); j++) {
                        if (board[i][j] === board[i][j + 1] && board[i][j + 1] === board[i][j + 2]) {
                          // Winner is in row
                          return true;
                        }
                      }
                }
            }
        }


        function checkColumnWin() {
            console.log("checking columns")

            // check each nth array element in each sub array (e.g vertical column) for a winner
            let winningColumn;

            // Check for a winner in the columns
            for (let i = 0; i < board.length; i++) {
                let column = board.map(row => row[i])
                if (column.every(elem => elem !== null)) {
                    for (let j = 0; j < board[i].length - (howManyInARow - 1); j++) {
                    if (board[j][i] === board[j + 1][i] && board[j + 1][i] === board[j + 2][i]) {
                        // Winner is in column
                        return true;
                    }
                    }
                }
            }
        }

        function checkDiagonalWin() {
            // check for a winner in diagonals TOP LEFT to BOTTOM RIGHT
            console.log("checking diagonals")
            let diagonalWin1 = true;
            for (let i = 0; i < board.length; i++) {
                if (board[i][i] === null) {
                    diagonalWin1 = false;
                    break;
                } else if (board[i][i] !== board[0][0]) {
                    diagonalWin1 = false;
                    break;
                }
            }
            console.log({diagonalWin1})
            if (diagonalWin1) {
              return true;
            }

            // check for a winner in diagonals TOP RIGHT to BOTTOM LEFT
            let diagonalWin2 = true;
            for (let i = 0; i < board.length; i++) {
                if (board[i][board.length - 1 - i] === null) {
                    diagonalWin2 = false;
                    break;
                } else if (board[i][board.length - 1 - i] !== board[0][board.length - 1]) {
                    diagonalWin2 = false;
                    break;
                }
            }
            console.log({diagonalWin2})
            if (diagonalWin2) {
              return true;
            }

            if (diagonalWin1 || diagonalWin2) {
              return true;
            }
        }

        // check for tie game

        function checkTieGame() {
            let isTie = true;
            for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === null) {
                    isTie = false;
                    break;
                }
                }
                if (!isTie) {
                break;
                }
            }
            if (isTie) {
                return "tie";
            }

            return false;
          };

          const winningFunctions = [checkRowWin, checkColumnWin, checkDiagonalWin, checkTieGame]

          const checkAnyWin = (board) => {
            for(let winFunc of winningFunctions){
              if (winFunc(board)) {
                return true
              }
           }
        }

        return checkAnyWin(board)
    }


    return {
        gameStart, handleClickedSquare,
    }
})();
