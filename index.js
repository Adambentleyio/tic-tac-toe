


//* Module for gameboard (model)
// the controller will be used to update the gameboard state
// the model will have functions and private variables that relate to the gameboard such as the board array and the gameboard size and the gameboard state and the gameboard winner and the gameboard turn


const Gameboard = (() => {

    let gameboard = [];
    let players = [];
    let currentPlayerIndex;
    let playerScores = [0, 0];

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

    function addScore(playerIndex) {
        playerScores[playerIndex]++;
    }

    function getScores() {
        return playerScores;
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

    const getCurrentGameInfo = () => {
        return {
            currentPlayer: players[currentPlayerIndex].name,
            currentMarker: players[currentPlayerIndex].marker,
            currentPlayerIndex: currentPlayerIndex,
            nextPlayerIndex: currentPlayerIndex + 1 === players.length ? 0 : currentPlayerIndex + 1,
            players: players,
            playerScores: playerScores,
        }
    }

    return {
        gameboard,
        getGameboard,
        newGameboard,
        addScore,
        getScores,
        setPlayers,
        players,
        getCurrentPlayerIndex,
        setCurrentPlayerIndex,
        addMarkerToGameboard,
        resetGameboard,
        getPlayers,
        generateGameboard,
        getCurrentGameInfo,
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

    function createPlayerScores(node, gameInfo) {

        let p1ScoreNode = document.createElement('p');
        let p2ScoreNode = document.createElement('p');

        p1ScoreNode.textContent = `P1: ${gameInfo.playerScores[0]}`;
        p2ScoreNode.textContent = `P2: ${gameInfo.playerScores[1]}`;
        node.appendChild(p1ScoreNode), node.appendChild(p2ScoreNode);
    }

    function updatePlayerScores(node, gameInfo) {
        // send scores to DOM and where to attach them
        // create element for each player score
        let [ p1Score, p2Score ] = gameInfo.playerScores;
        // insert score into first child of node
        node.children[0].textContent = `P1: ${p1Score}`;
        node.children[1].textContent = `P2: ${p2Score}`;


    }

    const updateSquareOnDisplay = (marker, square) => {
        let row, col;
        if (square.classList.contains('played')) {
            return;
        }
        if (square.dataset.row && square.dataset.col) {
          row = square.dataset.row;
          col = square.dataset.col;
          square.textContent = marker;
        }
      };

    // display the winning message div in the DOM
    const displayGameResultMessage = (winner = null, tie = false) => {
        const gameResultMessage = document.querySelector('.game-result-message');
        if (winner) {
            gameResultMessage.classList.add('show');
            gameResultMessage.querySelector('h2').textContent = `${winner} wins!`;
        }
        if (tie) {
            gameResultMessage.classList.add('show');
            gameResultMessage.querySelector('h2').textContent = `It's a tie!`;
        }
    }

    // remove class from particular element

    const removeClass = (node, className) => {
            node.classList.remove(className)
    }

    // remove a given element from the DOM

    removeDOMElement = (str) => {
        const element = document.querySelector(str);
        element.parentNode.removeChild(element);
    }

    return {
        updateSquareOnDisplay,
        createPlayerScores,
        updatePlayerScores,
        displayGameResultMessage,
        removeClass,
        removeDOMElement,
        renderGameboard,
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
    let gameInProgress = false;
    let gameStart = false;
    let playerOneMark = 'X';

    // Game play setup

    const gameSetupForm = document.querySelector('#players');
    const markerOptions = document.querySelector('.container-marker-option');
    const markerButtons = markerOptions.querySelectorAll('button');
    const gameInfo = document.querySelector('#game-info-box');
    const playerTurnDisplay = gameInfo.querySelector('#player-turn');
    const playerScoresDisplay = gameInfo.querySelector('#player-scores');

    // Game play btns setup
    const btnStart = document.querySelector('#btn-start');
    const btnResetGame = document.querySelector('#btn-reset');
    const winningReset = document.querySelector('#reset-win');
    const btnResetInGame = gameInfo.querySelector('.reset-game');

    // Changing player marker setup

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


    // Event listeners

    // Set event listener on form element for user input of gameboard size

    gameSetupForm.addEventListener('input', (event) => {
    boardSizeInput = parseInt(event.target.previousElementSibling.dataset.boardSize);
    console.log(typeof boardSizeInput)
    })

    // Start game on click.

    btnStart.addEventListener('click', (event) => {
        event.preventDefault();
        gameInProgress = true;
        Gameboard.newGameboard();
        console.log(Gameboard.getGameboard())
        GameDisplay.renderGameboard(Gameboard.getGameboard());
        addGameBoardEventListeners();
        GameDisplay.removeClass(gameInfo, 'hide');
        startGame();
    })

    // Reset game on click

    btnResetGame.addEventListener('click', (event) => {
        event.preventDefault();
        resetGameboardAndDisplay();
    })

    btnResetInGame.addEventListener('click', (event) => {
        event.preventDefault();
        resetGameboardAndDisplay();
    })

    // Reset game on click of winning message

    winningReset.addEventListener('click', (event) => {
        event.preventDefault();
        gameInProgress = true;
        resetGameboardAndDisplay();
        GameDisplay.removeClass(winningReset.parentNode, 'show');
    })

     // Start game callback that creates and sets player info in gameboard module

     const startGame = () => {
        players = [
            Player('Player 1', playerOneMark),
            Player('Player 2', playerOneMark === 'X' ? 'O' : 'X')
        ]
        Gameboard.setPlayers(players);
        Gameboard.setCurrentPlayerIndex(playerOneMark === 'X' ? 0 : 1);
        gameSetupForm.classList.add('hide');
        playerTurnDisplay.textContent = `${Gameboard.getCurrentGameInfo().currentMarker} turn`;
        GameDisplay.createPlayerScores(playerScoresDisplay, Gameboard.getCurrentGameInfo());
    }

    // Event listener for gameboard squares

    const addGameBoardEventListeners = () => {
        const squares = document.querySelectorAll('.square');
        squares.forEach((square, idx) => square.addEventListener('click', function handleClick(event) {
            square.id = idx;
            handleClickedSquare(square)
        }))
    }

    // Handle click event on gameboard squares

    const handleClickedSquare = (square) => {
        if (gameInProgress) {

            let {currentPlayer, currentMarker, nextPlayerIndex, currentPlayerIndex} = Gameboard.getCurrentGameInfo()
            let winningPlayer = currentPlayer

            if (!square.classList.contains('played')) {

                Gameboard.addMarkerToGameboard(square);
                GameDisplay.updateSquareOnDisplay(currentMarker, square);

                gameResult = checkGameBoardWin();
                console.log(gameResult)
                if (gameResult.winner) {
                    // alert(`${winningPlayer} wins!`)
                    gameInProgress = false;
                    GameDisplay.displayGameResultMessage(winningPlayer);
                    Gameboard.addScore(currentPlayerIndex);
                    GameDisplay.updatePlayerScores(playerScoresDisplay, Gameboard.getCurrentGameInfo());
                } if (gameResult.tie) {
                    gameInProgress = false;
                    GameDisplay.displayGameResultMessage(null, true);
                }

                // checkGameBoardWin() === "tie" ? alert("its a tie") : false;
                square.classList.add('played')
                Gameboard.setCurrentPlayerIndex(nextPlayerIndex);
                console.log(playerTurnDisplay)
                playerTurnDisplay.textContent = `${Gameboard.getCurrentGameInfo().currentMarker} turn`;
            }
        }
    }

      const resetGameboardAndDisplay = () => {
        if (gameInProgress === true) {
        Gameboard.resetGameboard();
        GameDisplay.renderGameboard(Gameboard.getGameboard());
        addGameBoardEventListeners();
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

          const winningFunctions = [checkRowWin, checkColumnWin, checkDiagonalWin]

          const checkAnyWin = (board) => {
            for(let winFunc of winningFunctions){
              const winner = winFunc(board)
              if (winner) {
                return {winner}
              }
           }
           const isTie = checkTieGame();
              if (isTie) {
                return {tie: true}
            }

            return {winner: null}
    }

    return checkAnyWin(board)
    }

    return {
        gameStart, handleClickedSquare,
    }
})();
