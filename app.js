var twoPlayers =false;
var Player1Color;
var Player2Color;
var firstTime = true;
var board = [['0','0','0'],
			 ['0','0','0'],
			 ['0','0','0']];
var colors = ['#5484ed', '#a4bdfc', '#7ae7bf', '#ff887c', '#dbadff'];
var currentPlayerColor;
var numValid = 0;

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
		//the first time is player1
		//the second time is Player 2
		if (firstTime) {
			Player1Color = $('select[name="colorpicker-shortlist"]').val();
			console.log('player1', Player1Color);

			var style1 = $('<style>.clicked1 { background-color: ' + Player1Color + ';}</style>');
			$('html > head').append(style1);
			
			if (twoPlayers) {
				firstTime = false;
				$('#text').text('Player2, please select your color');
			} else {
				//one player game against a robot
				$('#ok').hide();

				//MAKE SURE THAT THE COLOR IS DIFFERENT FROM THE COLOR THAT THE USER
				while (true) {
					var randomNum = Math.ceil(Math.random() * 4);
					Player2Color = colors[randomNum];
					if (Player2Color !== Player1Color) {
						break;
					}
				}
				

				console.log(Player2Color);

				var style2 = $('<style>.clicked2 { background-color: ' + Player2Color + ';}</style>');
				$('html > head').append(style2);

				$('#text').text('Would you like to start first?');
				$('body').on('keyup', keyUpHandler);
			}
		} else {
			Player2Color = $('select[name="colorpicker-shortlist"]').val();
			// currentPlayerColor = Player1Color;
			$('#ok').hide();
			

			var style2 = $('<style>.clicked2 { background-color: ' + Player2Color + ';}</style>');
			$('html > head').append(style2);

			//Who wants to go first? Player1 or Player2?
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

/************* RESET****************/
function reset() {
	numValid = 0;
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
		$('#text').text('Do you want to go first?');
	}
	
	$('body').on('keyup', keyUpHandler);
}

function colClicked() {
	//if it's a two player or one player game.
	var notOccupied = ($(this).css("background-color") == "rgb(255, 255, 255)");
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

function checkWin(PlayerNum, boardIndex, bool) {
	if (checkDiagonal(PlayerNum) || checkColumn(boardIndex, PlayerNum) || checkRow(boardIndex, PlayerNum)) {
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

function computerMove() {
	//disable clicks
	$('.col').off('click');
	console.log('computerMove called');
	numValid++;
	var move = moveHelper(); 
	var PlayerNum = getPlayerNumber(currentPlayerColor);
    board[move[0]][move[1]] = String(PlayerNum);

    updateCSS(move); 
    if (!checkWin(PlayerNum, move, true)) {
    	//if didn't win yet, want the user to be able to click
    	currentPlayerColor = Player1Color;
    	$('.col').on('click', colClicked);
    }
}

// comes up with a index [,] of where in the array it will go to
function moveHelper() {
	//choose random number between 0 - 8.
	var boardIndex = getBoardIndex(Math.floor(Math.random() * 8 + 1));
	while(board[boardIndex[0]][boardIndex[1]] !== '0') {
		boardIndex = getBoardIndex(Math.floor(Math.random() * 8 + 1));
	}
	return boardIndex;
}

// given the board index, must find the corresponding col and set it's background color to Player2Color.
function updateCSS(boardIndex) {
	console.log('updateCSS called');
	var num = getColNum(boardIndex);
	var chosenCol = $(".col[data-num='" + num + "']").addClass('clicked2');
}

function getColNum(boardIndex) {
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

//MAKE THIS CLEANER LATER
function keyUpHandler(e) {
	$('body').off('keyup', keyUpHandler);
    if (e.which == 49) {
        //1
        $('#text').text('Player1, please start the game!');
		currentPlayerColor = Player1Color;
    	$('.col').hover(handlerIN, handlerOUT);
    	$('.col').on('click', colClicked);
    } else if (e.which == 50) {
    	//2
    	$('#text').text('Player2, please start the game!');
		currentPlayerColor = Player2Color;
    	$('.col').hover(handlerIN, handlerOUT);
    	$('.col').on('click', colClicked);
    } else if (e.which == 89) {
    	// Y
    	$('#text').text('Ok, Player please start~');
    	$('.col').hover(handlerIN, handlerOUT);
    	currentPlayerColor = Player1Color;
    	$('.col').on('click', colClicked);
    } else if (e.which == 78) {
    	// N
    	$('#text').text('lets start!!!');
    	currentPlayerColor = Player2Color;
    	computerMove();
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

function checkDiagonal(PlayerNum) {
	var rightDiagonal = true;
	var leftDiagonal = true;
	for (var i = 0; i < 3; i++) {
		if (board[i][i] !== String(PlayerNum)) {
			rightDiagonal = false && rightDiagonal;
		}

		if (board[i][2 - i] !== String(PlayerNum)) {
			leftDiagonal = false && leftDiagonal;
		}
		if (rightDiagonal === false && leftDiagonal === false) {
			break;
		}
	}
	return leftDiagonal || rightDiagonal;
}

 function checkRow(boardIndex, PlayerNum) {
 	//[0, 1]
 	var row = boardIndex[0];
 	for (var i = 0; i < 3; i++) {
 		if (board[row][i] !== String(PlayerNum)) {
 			return false;
 		}
 	}
 	return true;
 }

 function checkColumn(boardIndex, PlayerNum) {
 	var col = boardIndex[1];
 	for (var i = 0; i < 3; i++) {
 		if (board[i][col] !== String(PlayerNum)) {
 			return false;
 		}
 	}
 	return true;
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
