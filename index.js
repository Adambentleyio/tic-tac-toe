


//* Module for gameboard (model)
// the controller will be used to update the gameboard state
// the model will have functions and private variables that relate to the gameboard such as the board array and the gameboard size and the gameboard state and the gameboard winner and the gameboard turn


const Gameboard = (() => {

    let gameboard = [];

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
            Gameboard.gameboard[i][j] = null;
          }
        }
    }

    // Controller will call function after creating players to set the players in the gameboard module
    function setPlayers(playerArr) {
        players = playerArr;
    }

    function getPlayers() {
        return players;
    }

    // add marker to gameboard array
    const addMarkerToGameboard = (square, currentPlayerIndex) => {
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

        squares.forEach((square, idx) => square.addEventListener('click', (event) => {
            square.id = idx;
            console.log('square ' + square.id + ' clicked');
            GameController.handleClickedSquare(square)
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
    let currentPlayerIndex;
    let gameOver;
    let gameStart = false;

    console.log(gameStart)

    // Game setup form. 1. set object to hold form elements. 2. add event listener to form
    // 3. set object with form inputs and values. 4. submit handler to update gameboard state.

    const gameSetupForm = document.querySelector('#players');
    // set event listener on each form element
    gameSetupForm.addEventListener('input', (event) => {
        // event.preventDefault();
        // console.log(event.target.value)
        // console.log sibling elements data attribute "board-size"
        console.log(event.target.previousElementSibling.dataset.boardSize)
        boardSizeInput = parseInt(event.target.previousElementSibling.dataset.boardSize);
        console.log(typeof boardSizeInput)
    })

    console.log(gameSetupForm)


    // Game btns setup
    const btnStart = document.querySelector('#btn-start');
    const btnResetGame = document.querySelector('#btn-reset');

    // const btnGenerateBoard = document.querySelector('#generate-board');
    // // Render board on click
    // btnGenerateBoard.addEventListener('click', (event) => {
    //     event.preventDefault();
    //     // if board is already rendered, remove it and add new one
    //     updateGameboardAndDisplay();
    // })

    // Start game on click.
    btnStart.addEventListener('click', (event) => {
        event.preventDefault();
        gameStart = true;
        // gameStart ? GameDisplay.removeDOMElement('#players') : '';
        updateGameboardAndDisplay(boardSizeInput);
        startGame();
    })

    // Reset game on click
    btnResetGame.addEventListener('click', (event) => {
        event.preventDefault();
        gameStart = false;
        updateGameboardAndDisplay("reset");
    })

    // Start game and create players

    const startGame = () => {
        players = [
            Player(document.querySelector('#player1-name').value || 'Player 1', 'X'),
            Player(document.querySelector('#player2-name').value || 'Player 2', 'O')
        ]

        Gameboard.setPlayers(players);

        currentPlayerIndex = 0;
        gameOver = false;
    }

    // Handle click event on gameboard squares
    const handleClickedSquare = (square) => {
        if (gameStart && !gameOver) {
            let isWinner = false;
            // call function to add marker to gameboard array
            Gameboard.addMarkerToGameboard(square, currentPlayerIndex);
            // callback to update the gameboard array in the DOM from the controller
            updateGameboardAndDisplay(Gameboard.getGameboard());
            // if there is a winner, display the winner
            isWinner = checkGameBoardWin() === true ? true : false;
            if (isWinner) {
                alert(`${players[currentPlayerIndex].name} wins!`)
                // updateGameboardAndDisplay("reset");
            }
            // if there is a tie, display the tie
            checkGameBoardWin() === "tie" ? alert("its a tie") : false;
            currentPlayerIndex === 0 ? currentPlayerIndex = 1 : currentPlayerIndex = 0;
        }
    }

    const updateGameboardAndDisplay = (action = 3) => {
        console.log({action})
        // update the gameboard array in the DOM
        if (action === "reset") {

            console.log("resetting gameboard")

            Gameboard.resetGameboard();
            GameDisplay.renderGameboard(Gameboard.getGameboard());
            if (gameStart === true) {
                GameDisplay.addGameBoardEventListeners();
                }
            }

        if (typeof action === "number") {
            console.log("action is a number")
            Gameboard.newGameboard(action);
            console.log(Gameboard.getGameboard())
            GameDisplay.renderGameboard(Gameboard.getGameboard());
            GameDisplay.addGameBoardEventListeners();
        }

        GameDisplay.renderGameboard(Gameboard.getGameboard());

        if (gameStart === true) {
            console.log("game has started. Setting event listeners")
            GameDisplay.addGameBoardEventListeners();
        }
    }

    // Check for winning move OR tie

    const checkGameBoardWin = () => {
        // Define functions for checking rows, columns ad diagonals for a winner

        let board = Gameboard.getGameboard();
        let howManyInARow = 3;

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

        // check for tie game

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



    return {
        gameStart, handleClickedSquare, updateGameboardAndDisplay
    }
})();
