var Player1Color;
var Player2Color;
var choice;
var currentPlayerColor;
var firstTime = true;
var twoPlayers =false;
var hard = false;
var medium = false;
var easy = false;
var levelPicked = false;

var numValid = 0;
var board = [['0','0','0'],
			 ['0','0','0'],
			 ['0','0','0']];
var colors = ['#5484ed', '#a4bdfc', '#7ae7bf', '#ff887c', '#dbadff'];

$(document).ready(function() {
	$('.circleCont').on('click', function() {
		var numPlayers = $(this).find('p').text();
		if (numPlayers ==='1') {
			$('.gameSelectorCont').hide();
			$('.BoardWrapper').show();
			$('#text').text('Player, please select your color');
			$('#ok').show();
			$('select[name="colorpicker-shortlist"]').simplecolorpicker();
			

		} else {
			console.log('two players');
			twoPlayers = true;
			$('.gameSelectorCont').hide();
			$('.BoardWrapper').show();
			$('#ok').show();
		
			$('#text').text('Player1, please select your color');
			$('select[name="colorpicker-shortlist"]').simplecolorpicker();
		}
	});

	$('#ok').click(function() {
		//first time is true for player1
		if (firstTime) {
			Player1Color = $('select[name="colorpicker-shortlist"]').val();
			var style1 = $('<style>.clicked1 { background-color: ' + Player1Color + ';}</style>');
			$('html > head').append(style1);
			
			if (twoPlayers) {
				firstTime = false;
				$('#text').text('Player2, please select your color');
			} else {
				//one player game against a robot
				$('#ok').hide();
				//robot must chose a color that's different from user.
				while (true) {
					var randomNum = Math.ceil(Math.random() * 4);
					Player2Color = colors[randomNum];
					if (Player2Color !== Player1Color) {
						break;
					}
				}
				var style2 = $('<style>.clicked2 { background-color: ' + Player2Color + ';}</style>');
				$('html > head').append(style2);;
				$('#text').text('Pick skill level: easy, medium, hard?');
				$('body').on('keyup', keyUpHandler);
			}
		} else {
			Player2Color = $('select[name="colorpicker-shortlist"]').val();
			$('#ok').hide();
			var style2 = $('<style>.clicked2 { background-color: ' + Player2Color + ';}</style>');
			$('html > head').append(style2);
			$('#text').text('Who wants to go first? Enter 1 or 2 on keyboard.');
			$('body').on('keyup', keyUpHandler);
		}
	});
	
	$('#replay').on('click', reset);
	$('#home').on('click', function() {
		$('.BoardWrapper').hide();
		$('.gameSelectorCont').show();
		firstTime = true;
		twoPlayers = false;
		reset();
		$('head').find('style').remove();

	});
});

/* Resets the board. */
function reset() {
	numValid = 0;
	hard = false;
	medium = false;
	easy = false;
	$('.col').each(function() {
		if ($(this).hasClass('clicked1')) {
			$(this).removeClass('clicked1');
		} else if ($(this).hasClass('clicked2')) {
			$(this).removeClass('clicked2');
		}
	});
	resetBoard();
	if (twoPlayers) {
		$('#text').text('Who wants to go first? Enter 1 or 2 on keyboard.');
	} else {
		$('#text').text('Robot skills: easy, medium, hard?');
	}
	$('body').on('keyup', keyUpHandler);
}

function colClicked() {
	var notOccupied = ($(this).css("background-color") == "rgb(255, 255, 255)");
	//only allow the user to click on boxes that are not occupied
	if (notOccupied) {
		numValid++;
		if (currentPlayerColor === Player1Color) {
			$(this).addClass('clicked1');
		} else {
			$(this).addClass('clicked2');
		}
		var position = $(this).data('num');
		var boardIndex = getBoardIndex(position);
		var PlayerNum = getPlayerNumber(currentPlayerColor);

		board[boardIndex[0]][boardIndex[1]] = String(PlayerNum);
		if (!checkWin(PlayerNum, boardIndex, false)) {
			//if didn't win or tie yet,
			if (currentPlayerColor === Player1Color) {
				currentPlayerColor = Player2Color;
			} else {
				currentPlayerColor = Player1Color;
			}
			if (!twoPlayers) {
				computerMove();
			}
		} 
		
	}	
}

/** Check if the current player won. bool is false when it's a TwoPlayer game. 
True when it's a one player game against a robot. **/
function checkWin(PlayerNum, boardIndex, bool) {
	if (checkDiagonal(PlayerNum, board) || checkColumn(boardIndex, PlayerNum) || checkRow(boardIndex, PlayerNum)) {
		if (bool) {
			$('#text').text('The Computer WON!');
		} else {
			if (twoPlayers) {
				$('#text').text('Player ' + PlayerNum + ' WON!');
			} else {
				$('#text').text('YOU WON!');
			}
			
		}
		$('.col').off('click');
		return true;
	} else if (numValid === 9) {
		$('#text').text("It's a TIE !!!");
		$('.col').off('click');
		return true;
	}
	return false;
}
 
/** The computer moves. **/
function computerMove() {
	$('.col').off('click');
	numValid++;
	var move;
	if (hard || medium) {
		minmax(deepCopyBoard(board), 0, 2);
		move = choice;
	} else if (easy) {
		move = moveHelper();
	}
	var PlayerNum = getPlayerNumber(currentPlayerColor);
    board[move[0]][move[1]] = String(PlayerNum);
    updateCSS(move); 

    if (!checkWin(PlayerNum, move, true)) {
    	//if didn't win yet, want the user to be able to click
    	currentPlayerColor = Player1Color;
    	$('.col').on('click', colClicked);
    }
}

//Novice robot moves
function moveHelper() {
	var boardIndex = getBoardIndex(Math.floor(Math.random() * 8 + 1));
	while(board[boardIndex[0]][boardIndex[1]] !== '0') {
		boardIndex = getBoardIndex(Math.floor(Math.random() * 8 + 1));
	}
	return boardIndex;
}

//Master robot moves
function minmax(state, depth, playerNum) {
	if (gameOver(state)) {
		var result = score(state, depth);
		return result;
	} 
	var opposingPlayer;
	var scores = [];
	var moves = [];
	if (hard) {
		depth += 1;
	}
	if (playerNum === 2) {
		opposingPlayer = 1;
	} else {
		opposingPlayer = 2;
	}
	var AvailableMoves = getAvailableMoves(state);

	for (var i = 0; i < AvailableMoves.length; i++) {
		var newState = getBoardState(state, AvailableMoves[i], playerNum);
		scores.push(minmax(newState, depth, opposingPlayer));
		if (AvailableMoves.length === 5) {
			console.log(scores);
		}
		moves.push(AvailableMoves[i]);
 	}
	
	if (playerNum === 2) {
		var maxIndex = indexOfMax(scores);
		choice = moves[maxIndex];
		return scores[maxIndex];
	} else {
		var minIndex = indexOfMin(scores);
		choice = moves[minIndex];
		return scores[minIndex];
	}
}

/** Returns true if either player wins or ties. **/
function gameOver(state) {
	//if anyone won, or if it's a tie.
	var CompWin = checkDiagonal(2, state) || checkRows(state, 2) || checkColumns(state, 2);
	var PlayerWin = checkDiagonal(1, state) || checkRows(state, 1) || checkColumns(state, 1);
	var tie = getAvailableMoves(state).length === 0;
	if (CompWin || PlayerWin || tie) {
		return true;
	} else {
		return false;
	}
}

/** Calculates the score for MINMAX **/
function score(state, depth) {
	var CompWin = checkDiagonal(2, state) || checkRows(state, 2) || checkColumns(state, 2);
	if (CompWin) {
		return 10 - depth;
	}
	var PlayerWin = checkDiagonal(1, state) || checkRows(state, 1) || checkColumns(state, 1);
	if (PlayerWin) {
		return -10 + depth;
	} 
	if (getAvailableMoves(state).length === 0) {
		return 0;
	}
}

/** Given the state, find all the available moves a user can make. **/
function getAvailableMoves(state) {
	var moves = [];
	state.forEach(function(row, r, array) {
		row.forEach(function(val, c, arr) {
			if (val === '0') {
				moves.push([r,c]);
			}
		});
	});
	return moves;
}

/** Returns a newState, given an old state and a move. Marks the spot with playerNum. **/
function getBoardState(state, move, playerNum) {
	var newstate = deepCopyBoard(state);
	newstate[move[0]][move[1]] = String(playerNum);
	return newstate;
}

/** Copies 2D arrays. **/
function deepCopyBoard(arr) {
	var newarr = [];
	arr.forEach(function(row, r, array) {
		newarr.push(row.slice());
	});
	return newarr;
}

/** Finds the index of the maximum element in an array. **/
function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }
    var max = arr[0];
    var maxIndex = 0;
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }
    return maxIndex;
}

/** Finds the index of the minimum element in an array. **/
function indexOfMin(arr) {
    if (arr.length === 0) {
        return -1;
    }
    var min = arr[0];
    var minIndex = 0;
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < min) {
            minIndex = i;
            min = arr[i];
        }
    }
    return minIndex;
}

/** FOR MINMAX ALGORITHM: checkRows gets the state and the playerNum and returns true
if player won in a row. **/
function checkRows(state, playerNum) {
	var result = false;
	state.forEach(function(item, index, array) {
		var rowWin = true;
		for (var i = 0; i < item.length; i++) {
			if (item[i] !== String(playerNum)) {
				rowWin = false;
			}
		}
		result = result || rowWin;
	});
	return result;
}

/** FOR MINMAX ALGORITHM: checkColumns gets the state and the playerNum and returns true
if player won in a column. **/
function checkColumns(state, playerNum) {
	var result = false
	for (var c = 0; c < 3; c++) {
		var colWin = true;
		for (var r = 0; r < 3; r++) {
			if (state[r][c] !== String(playerNum)) {
				colWin = false;
				break;
			}
		}
		result = result || colWin;
	}
	return result;
}
/** Checks Rows and determines if the PlayerNum has won **/
function checkRow(boardIndex, PlayerNum) {
 	var row = boardIndex[0];
 	for (var i = 0; i < 3; i++) {
 		if (board[row][i] !== String(PlayerNum)) {
 			return false;
 		}
 	}
 	return true;
 }

/** Checks Columns and determines if the PlayerNum has won **/
function checkColumn(boardIndex, PlayerNum) {
 	var col = boardIndex[1];
 	for (var i = 0; i < 3; i++) {
 		if (board[i][col] !== String(PlayerNum)) {
 			return false;
 		}
 	}
 	return true;
}

function checkDiagonal(PlayerNum, board) {
	var rightDiagonal = true;
	var leftDiagonal = true;
	for (var i = 0; i < 3; i++) {
		if (board[i][i] !== String(PlayerNum)) {
			rightDiagonal = false;
		}

		if (board[i][2 - i] !== String(PlayerNum)) {
			leftDiagonal = false;
		}
		if (rightDiagonal === false && leftDiagonal === false) {
			return false;
		}
	}
	return leftDiagonal || rightDiagonal;
}

function getBoardIndex(position) {
	// 0 - 8
	var result = [];
	if (position < 3) {
		result.push(0);
		result.push(position);
	} else if (position > 2 && position < 6) {
		result.push(1);
		result.push(position - 3);
	} else {
		result.push(2);
		result.push(position - 6);
	}
	return result;
}

function getBoxNum(boardIndex) {
	var row = boardIndex[0];
	var column = boardIndex[1];
	if (row === 0) {
		// 0, 1, 2
		result = row + column;
	} else if (row === 1) {
		//3,4,5
		result = column + 3;
	} else {
		//6,7,8
		result = column + 6;
	}
	return result;
}

function getPlayerNumber(playerColor) {
	if (playerColor === Player1Color) {
		return 1;
	} else {
		return 2;
	}
}



function resetBoard() {
	board = [['0','0','0'],
			 ['0','0','0'],
			 ['0','0','0']];
}






//Updates the board CSS.
function updateCSS(boardIndex) {
	console.log('updateCSS called');
	var num = getBoxNum(boardIndex);
	var chosenCol = $(".col[data-num='" + num + "']").addClass('clicked2');
}

//MAKE THIS CLEANER LATER
function keyUpHandler(e) {
	if (twoPlayers) {
		if (e.which == 49 ) {
	        //1
	        $('body').off('keyup', keyUpHandler);
	        $('#text').text('Player1, please start the game!');
			currentPlayerColor = Player1Color;
	    	$('.col').hover(handlerIN, handlerOUT);
	    	$('.col').on('click', colClicked);
    	} else if (e.which == 50 ) {
	    	//2
	    	$('body').off('keyup', keyUpHandler);
	    	$('#text').text('Player2, please start the game!');
			currentPlayerColor = Player2Color;
	    	$('.col').hover(handlerIN, handlerOUT);
	    	$('.col').on('click', colClicked);
	    }
	} else {
		  if (e.which == 89 && levelPicked) {
	    	// Y
	    	$('body').off('keyup', keyUpHandler);
	    	$('#text').text('Ok, Player please start~');
	    	$('.col').hover(handlerIN, handlerOUT);
	    	$('.col').on('click', colClicked);
	    	currentPlayerColor = Player1Color;
	    } else if (e.which == 78 && levelPicked) {
	    	// N
	    	$('body').off('keyup', keyUpHandler);
	    	$('#text').text('lets start!!!');
	    	$('.col').hover(handlerIN, handlerOUT);
	    	$('.col').on('click', colClicked);
	    	currentPlayerColor = Player2Color;
	    	//chose random for first play.
	    	computerMove();
	    } else if (e.which === 69) {
	    	//easy
	    	easy = true;
	    	$('body').off('keyup', keyUpHandler);
	    	levelPicked = true;
	    	$('#text').text('Do you want to go first?');
	    	$('body').on('keyup', keyUpHandler);

	    } else if (e.which === 77 || e.which === 72) {
	    	//medium and hard
	    	medium = e.which === 77;
	    	hard = e.which === 72;
	    	$('body').off('keyup', keyUpHandler);
	    	levelPicked = true;
	    	$('#text').text('Do you want to go first?');
	    	$('body').on('keyup', keyUpHandler);
	    }
	}
}

function handlerIN() {
	//if the background color is still white, 
	var notOccupied = ($(this).css("background-color") === "rgb(255, 255, 255)");
	if (notOccupied) {
		$(this).css({'box-shadow': '0px 0px 4px 10px ' + currentPlayerColor + ' inset'});
	}
}

function handlerOUT() {
	$(this).css({'box-shadow': 'none'});
}