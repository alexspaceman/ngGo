var app = angular.module('app', []);

app.controller('GoBoardController', function($scope){

//GLOBAL VARIABLES
	$scope.globalVar = {
		boardLength: 6,				//GLOBAL set boardLength
		turnNumber: 1,				//turn counter(used to switch player)
		turnColor: 'black',
		oppositeTurnColor: 'white',
		colorStatus: '',
		allEmptyFlag: false,
		anyEmptyFlag: false,
		enemySurroundFlag: false,
		tookEnemyFlag: false,
		anyEmptyCounter: 0,
		blackScore: 0,
		whiteScore: 0,
		passCounter: 0,
		piecesTakenThisTurn: 0,
		idsTakenThisTurn: [],
		turnHistory: []				//chaches goBoard every turn
	}

//PASS EVENT
	$scope.pass = function () {
		$scope.globalVar.turnColor = oppositeTurnColor($scope.globalVar.turnColor);
		$scope.globalVar.turnNumber++;
		$scope.globalVar.passCounter++;

		$scope.globalVar.turnHistory = saveBoardState($scope.goBoard, $scope.globalVar.turnHistory);

		if($scope.globalVar.passCounter == 2){
			alert('BOTH PLAYERS PASS' + '\n' + 'count your territory and add it to your score'+ '\n' +
				'autoCounter NOT YET IMPLEMENTED!');
		}
	}

//goBoard GAME HISTORY
	function saveBoardState(goBoard, turnHistory){
		//alert('turnNumber : ' + $scope.globalVar.turnNumber + '\n' +
		//	'turnHistory.length : ' + turnHistory.length);
		var currentTurn = [];

		if($scope.globalVar.turnNumber - 2 <= turnHistory.length){
			for(var i = 0; i < $scope.goBoard.length; i++){
				for(var j = 0; j < $scope.goBoard[i].length; j++){
					if($scope.goBoard[i][j].colorStatus == 'emptySpot'){
						currentTurn.push('emptySpot');
					}else if($scope.goBoard[i][j].colorStatus == 'black'){
						currentTurn.push('black');
					}else if($scope.goBoard[i][j].colorStatus == 'white'){
						currentTurn.push('white');
					}
				}
			}
			//alert(currentTurn);
			turnHistory.push(currentTurn);
			//alert(turnHistory);
		}else{
			alert('turns out of whack!');
		}
		return turnHistory;
	}

//goBack EVENT
	$scope.goBack = function(){
		if($scope.globalVar.turnHistory.length == 1){
			$scope.resetBoard();		//first turn
		}else if($scope.globalVar.turnHistory.length == 0){
			alert('already at the beginning');
		}else{
			alert('NEED TO CHANGE THE BOARD!');
			var gridSize = $scope.globalVar.boardLength * $scope.globalVar.boardLength;
			var targetTurn = $scope.globalVar.turnHistory.length - 2;
			//alert('gridSize: ' + gridSize + '\n' + 'targetTurn: ' + targetTurn);

			var targetBoard = [];
			var boardIdNum = 0;
			for(var i = 0; i < gridSize; i++){
				//alert($scope.globalVar.turnHistory[targetTurn][boardIdNum]);
				targetBoard.push($scope.globalVar.turnHistory[targetTurn][boardIdNum]);
				boardIdNum++;
			}

			boardIdNum = 0;

			for(var i = 0; i < $scope.goBoard.length; i++){
				for(var j = 0; j < $scope.goBoard[i].length; j++){
					$scope.goBoard[i][j].colorStatus = targetBoard[boardIdNum];
					boardIdNum++;
				}
			}

			$scope.globalVar.turnNumber--;
			$scope.globalVar.turnColor = oppositeTurnColor($scope.globalVar.turnColor);
			$scope.globalVar.turnHistory.pop();
		}
	}

//resetBoard EVENT
	$scope.resetBoard = function(){
		for(var i = 0; i < $scope.goBoard.length; i++){
			for(var j = 0; j < $scope.goBoard[i].length; j++){
				$scope.goBoard[i][j].colorStatus = 'emptySpot';
			}
		}
		$scope.globalVar.turnNumber = 1;
		$scope.globalVar.whiteScore = 0;
		$scope.globalVar.blackScore = 0;
		$scope.globalVar.turnColor = 'black';
		$scope.globalVar.turnHistory = [];
		alert('board reset');
	}

//HAVE TO SAVE ALL DEPENDENCIES AS FILES IN THE FOLDER (no more CDN bullshit)


//HAVE TO MAKE A COUNTING MODE...

//GETS TRIGGERED IN THE BOTH PLAYERS PASS if()
//NOW THE RECURSION CHECKS THE WHOLE goBoard FOR 'emptySpot's
//IF IT FINDS BOTH BLACK AND WHITE PIECES ATTACHED TO STRINGS OF 'emptySpot's
//DOES NOTHING
//IF IT FINDS ONLY ONE COLOR
//IT ADDS THE NUMBER OF 'emptySpot's IN THAT CHAIN TO THAT COLORS SCORE

//FOR NOW THE PLAYERS MUST HAVE NO ENEMY PIECES IN THEIR TERRITORY FOR THIS TO WORK


//HAVE TO MAKE AN AFTER GAME DELETION MODE...

//BUT I CAN INCLUDE AN AFTER GAME DELETION MODE WHERE PLAYERS HIGHLIGHT OFFENDING
//PIECES TO BE DELETED FROM THEIR TERRITORY
//IF BOTH PLAYERS PRESS AN ACCEPT BUTTON
//THOSE HIGHLIGHTED PIECES GET DELETED AND ADDED TO THE APPROPRIATE SCORE COUNTERS
//NOW THE AUTO COUNTER WILL WORK JUST FINE



//MOUSE UP EVENT
	$scope.mouseUpFunction = function(cell, row, col){
		if(cell.colorStatus == 'emptySpot'){
			$scope.globalVar.allEmptyFlag = false;			//reset the allEmptyFlag
			$scope.globalVar.anyEmptyFlag = false;			//reset the anyEmptyFlag
			$scope.globalVar.enemySurroundFlag = false;		//reset the enemySurroundFlag
			$scope.globalVar.tookEnemyFlag = false;			//reset the tookEnemyFlag
			$scope.globalVar.anyEmptyCounter = 0;			//reset the anyEmptyCounter
			$scope.globalVar.piecesTakenThisTurn = 0;		//reset the piecesTakenThisTurn

			if($scope.globalVar.idsTakenThisTurn[0] == cell.idNum){
				alert('illegal move, play again');
				cell.colorStatus = 'emptySpot';
				$scope.globalVar.turnNumber--;
			}else{
				$scope.globalVar.idsTakenThisTurn = [];			//reset the idsTakenThisTurn
				resetCheckedStatus($scope.goBoard);
				resetToTakeStatus($scope.goBoard);

				$scope.globalVar.turnColor = getTurnColor($scope.globalVar.turnNumber, cell, $scope.globalVar.turnColor);
				
				checkNeighbours(cell, row, col, $scope.globalVar.boardLength, $scope.goBoard);

				checkSingleIllegal(cell);
				checkMultipleIllegal(cell);
				illegalRepeatMove(cell);
			}

			$scope.globalVar.turnNumber++;
			$scope.globalVar.passCounter = 0;
			$scope.globalVar.piecesTakenThisTurn = 0;

			$scope.globalVar.turnHistory = saveBoardState($scope.goBoard, $scope.globalVar.turnHistory);
		}
	}

//CHECK FOR REPEAT MOVES
	function illegalRepeatMove(cell){
		if($scope.globalVar.piecesTakenThisTurn == 1){
			//alert('you cant play on id#' + $scope.globalVar.idsTakenThisTurn[0]);
		}else{
			$scope.globalVar.idsTakenThisTurn = [];
		}
	}

//CHECK anyEmptyCounter TO SEE IF YOU SHOULD TAKE ANY PIECES
	function checkAnyEmptyCounter(anyEmptyCounter, goBoard){
		//alert('anyEmptyCounter = ' + anyEmptyCounter);
		if(anyEmptyCounter == 0){
			//alert('Youve taken some pieces');
			$scope.globalVar.tookEnemyFlag = true;
			for(var i = 0; i < goBoard.length; i++){
				for(var j = 0; j < goBoard[i].length; j++){
					if(goBoard[i][j].toTakeStatus == true){
						goBoard[i][j].toTakeStatus = false;
						if(goBoard[i][j].colorStatus == 'black'){
							$scope.globalVar.whiteScore++;
						}else{
							$scope.globalVar.blackScore++;
						}
						$scope.globalVar.piecesTakenThisTurn++;
						($scope.globalVar.idsTakenThisTurn).push(goBoard[i][j].idNum);
						goBoard[i][j].colorStatus = 'emptySpot';
					}
				}
			}
		}
		$scope.globalVar.anyEmptyCounter = 0;
	}

//RESET THE checkedStatus BOOLEAN
	function resetCheckedStatus(goBoard){
		for(var i = 0; i < goBoard.length; i++){
			for(var j = 0; j < goBoard[i].length; j++){
				goBoard[i][j].checkedStatus = false;
			}
		}
	}

//RESET THE toTakeStatus BOOLEAN
	function resetToTakeStatus(goBoard){
		for(var i = 0; i < goBoard.length; i++){
			for(var j = 0; j < goBoard[i].length; j++){
				goBoard[i][j].toTakeStatus = false;
			}
		}
	}

//CHECK FRIENDLIES FOR POTENTIAL ILLEGAL MOVE
	function checkIllegalFriendly(cell, boardLength, goBoard){
		resetCheckedStatus($scope.goBoard);
		resetToTakeStatus($scope.goBoard);
		$scope.globalVar.anyEmptyCounter = 0;

		checkEnemies(cell, boardLength, goBoard);

		if($scope.globalVar.anyEmptyCounter == 0){
			alert('illegal move, play again');
			cell.colorStatus = 'emptySpot';
			$scope.globalVar.turnNumber--;
			$scope.globalVar.turnColor = oppositeTurnColor($scope.globalVar.turnColor);
		}

		$scope.globalVar.anyEmptyCounter = 0;
	}

//CHECK ENEMIES  -----  the 'cell' is an object like 'goBoard[row][col]'
	function checkEnemies(cell, boardLength, goBoard){
		//alert('checkEnemies().cell = ' + cell + '\n' +
		//	'checkEnemies().cell.colorStatus = ' + cell.colorStatus + '\n' +
		//	'checkEnemies().cell.checkedStatus = ' + cell.checkedStatus + '\n' +
		//	'checkEnemies().cell.idNum = ' + cell.idNum);
		if(cell.checkedStatus == false){
			cell.checkedStatus = true;

			if(cell.cellRow > 1){
				//alert('checkEnemies checkUp' + '\n' +
				//	cell.cellRow + '-' + cell.cellCol + ' -> ' + (cell.cellRow-1) + '-' + cell.cellCol);
				var focusPiece = goBoard[(cell.cellRow-2)][cell.cellCol-1];
				ifCheckRecursion(focusPiece, cell);
			}
			if(cell.cellCol > 1){
				//alert('checkEnemies checkLeft' + '\n' +
				//	cell.cellRow + '-' + cell.cellCol + ' -> ' + cell.cellRow + '-' + (cell.cellCol-1));
				var focusPiece = goBoard[(cell.cellRow-1)][cell.cellCol-2];
				ifCheckRecursion(focusPiece, cell);
			}
			if(cell.cellCol < boardLength){
				//alert('checkEnemies checkRight' + '\n' +
				//	cell.cellRow + '-' + cell.cellCol + ' -> ' + cell.cellRow + '-' + (cell.cellCol+1));
				var focusPiece = goBoard[(cell.cellRow-1)][cell.cellCol];
				ifCheckRecursion(focusPiece, cell);
			}
			if(cell.cellRow < boardLength){
				//alert('checkEnemies checkDown' + '\n' +
				//	cell.cellRow + '-' + cell.cellCol + ' -> ' + (cell.cellRow+1) + '-' + cell.cellCol);
				var focusPiece = goBoard[(cell.cellRow)][cell.cellCol-1];
				ifCheckRecursion(focusPiece, cell);
			}
		}
	}

//CONTINUE CHECK IF STATEMENTS
	function ifCheckRecursion(focusPiece, cell){
		if(focusPiece.checkedStatus == false){
			if(cell.colorStatus == focusPiece.colorStatus){
				//alert('triggering checkEnemies() for id#' + focusPiece.idNum);
				focusPiece.toTakeStatus = true;
				checkEnemies(focusPiece, $scope.globalVar.boardLength, $scope.goBoard);
			}else if(focusPiece.colorStatus != 'emptySpot' && focusPiece.colorStatus != cell.colorStatus){
				//alert('found opposite here: ' + focusPiece.idNum);
			}else if(focusPiece.colorStatus == 'emptySpot'){
				//alert('found empty.  moving on');
				focusPiece.checkedStatus = true;
				$scope.globalVar.anyEmptyCounter++;
			}else{
				alert('this should never have popped up');
			}
		}else{
			//alert('already checked this piece');
		}
	}

//CHECK NEIGHBOURS
	function checkNeighbours(cell, row, col, boardLength, goBoard){
		var immediateEmptyCount = 0;
		var immediateEnemyCount = 0;
		var immediateFriendlyCount = 0;
		var spotsChecked = 0;

		//alert('looking at'+'\n'+'row: '+(row+1)+'\n'+'col: '+(col+1));

		if(row > 0){						//check up
			var checkUp = goBoard[row-1][col];
			if(checkUp.colorStatus == 'emptySpot'){
				immediateEmptyCount++;
				//alert('checkUp found emptySpot');
			}
			if(checkUp.colorStatus == cell.colorStatus){
				immediateFriendlyCount++;
				//alert('checkUp found friendly');
			}
			if(checkUp.colorStatus == oppositeTurnColor(cell.colorStatus)){
				immediateEnemyCount++;
				//alert('checkUp found enemy');
				checkUp.toTakeStatus = true;
				checkEnemies(checkUp, boardLength, goBoard);
				checkAnyEmptyCounter($scope.globalVar.anyEmptyCounter, $scope.goBoard);
			}
			spotsChecked++;
		}
		resetToTakeStatus($scope.goBoard);
		resetCheckedStatus($scope.goBoard);

		if(col > 0){						//check left
			var checkLeft = goBoard[row][col-1];
			if(checkLeft.colorStatus == 'emptySpot'){
				immediateEmptyCount++;
				//alert('checkLeft found emptySpot');
				checkLeft.checkedStatus = true;
			}
			if(checkLeft.colorStatus == cell.colorStatus){
				immediateFriendlyCount++;
				//alert('checkLeft found friendly');
			}
			if(checkLeft.colorStatus == oppositeTurnColor(cell.colorStatus)){
				immediateEnemyCount++;
				//alert('checkLeft found enemy');
				checkLeft.toTakeStatus = true;
				checkEnemies(checkLeft, boardLength, goBoard);
				checkAnyEmptyCounter($scope.globalVar.anyEmptyCounter, $scope.goBoard);
			}
			spotsChecked++;
		}
		resetToTakeStatus($scope.goBoard);
		resetCheckedStatus($scope.goBoard);

		if(col < boardLength-1){			//check right
			var checkRight = goBoard[row][col+1];
			if(checkRight.colorStatus == 'emptySpot'){
				immediateEmptyCount++;
				//alert('checkRight found emptySpot');
				checkRight.checkedStatus = true;
			}
			if(checkRight.colorStatus == cell.colorStatus){
				immediateFriendlyCount++;
				//alert('checkRight found friendly');
			}
			if(checkRight.colorStatus == oppositeTurnColor(cell.colorStatus)){
				immediateEnemyCount++;
				//alert('checkRight found enemy');
				checkRight.toTakeStatus = true;
				checkEnemies(checkRight, boardLength, goBoard);
				checkAnyEmptyCounter($scope.globalVar.anyEmptyCounter, $scope.goBoard);
			}
			spotsChecked++;
		}
		resetToTakeStatus($scope.goBoard);
		resetCheckedStatus($scope.goBoard);

		if(row < boardLength-1){			//check down
			var checkDown = goBoard[row+1][col];
			if(checkDown.colorStatus == 'emptySpot'){
				immediateEmptyCount++;
				//alert('checkDown found emptySpot');
				checkDown.checkedStatus = true;
			}
			if(checkDown.colorStatus == cell.colorStatus){
				immediateFriendlyCount++;
				//alert('checkDown found friendly');
			}
			if(checkDown.colorStatus == oppositeTurnColor(cell.colorStatus)){
				immediateEnemyCount++;
				//alert('checkDown found enemy');
				checkDown.toTakeStatus = true;
				checkEnemies(checkDown, boardLength, goBoard);
				checkAnyEmptyCounter($scope.globalVar.anyEmptyCounter, $scope.goBoard);
			}
			spotsChecked++;
		}
		resetToTakeStatus($scope.goBoard);
		resetCheckedStatus($scope.goBoard);

		//alert('the spots beside this one are: '+'\n'+
		//	'empty- '+immediateEmptyCount+'\n'+
		//	'friendly- '+immediateFriendlyCount+'\n'+
		//	'enemy- '+immediateEnemyCount);

		if(immediateEnemyCount == spotsChecked){
			$scope.globalVar.enemySurroundFlag = true;
		}
		if(immediateEmptyCount == spotsChecked){
			$scope.globalVar.allEmptyFlag = true;
		}
		if(immediateEmptyCount > 0){
			$scope.globalVar.anyEmptyFlag = true;
		}
		//alert('allEmptyFlag is - ' + $scope.globalVar.allEmptyFlag+'\n'+
		//	'anyEmptyFlag is - ' + $scope.globalVar.anyEmptyFlag+'\n'+
		//	'enemySurroundFlag is - ' + $scope.globalVar.enemySurroundFlag+'\n'+
		//	'tookEnemyFlag is - ' + $scope.globalVar.tookEnemyFlag);
	}

//CHECK FOR ILLEGALS
	function checkSingleIllegal(cell){
		if($scope.globalVar.enemySurroundFlag == true && $scope.globalVar.tookEnemyFlag == false){
			alert('illegal move, play again');
			cell.colorStatus = 'emptySpot';
			$scope.globalVar.turnNumber--;
			$scope.globalVar.turnColor = oppositeTurnColor($scope.globalVar.turnColor);
		}
	}

	function checkMultipleIllegal(cell){
		if($scope.globalVar.anyEmptyFlag == false && $scope.globalVar.tookEnemyFlag == false &&
			$scope.globalVar.enemySurroundFlag == false){
			//alert('potential illegal move' + '\n' + 'check friendlies for empty spaces');
			checkIllegalFriendly(cell, $scope.globalVar.boardLength, $scope.goBoard);
		}
	}

//MAKING THE BOARD
	$scope.goBoard = goBoardSetup($scope.globalVar.boardLength);

	function goBoardSetup(boardLength){
		var boardArray = [];
		var idNum = 1;

		for(var row=1; row < boardLength+1; row++){
			boardArray.push([]);
			for(var col=1; col < boardLength+1; col++){
				boardArray[row-1][col-1] = {
					idNum:idNum,
					cellRow:row,
					cellCol:col,
					colorStatus:'emptySpot',
					boardCornerSide:boardCornerSide(row, col, boardLength),
					mouseOverStatus: '',
					checkedStatus: false,
					toTakeStatus: false
				};
				idNum++;
			}
		}
		return boardArray;
	}

	function boardCornerSide(row, col, boardLength){
		if(row == 1 || row == boardLength || col == 1 || col == boardLength){
			if(row + col == 2 || row + col == boardLength + 1 || row + col == boardLength * 2){
				return 'corner';
			}else{
				return 'side';
			}
		}else{
			return 'normal';
		}
	}

//GET TURN COLOR
	function getTurnColor(turnNumber, cell, turnColor){
		if(turnNumber % 2 == 1){
			cell.colorStatus = 'black';
			turnColor = 'white';
		}else{
			cell.colorStatus = 'white';
			turnColor = 'black';
		}
		return turnColor;
	}

//OPPOSITE TURN COLOR
	function oppositeTurnColor(turnColor){
		if(turnColor == 'black'){
			turnColor = 'white';
			return turnColor;
		}else{
			turnColor = 'black';
			return turnColor;
		}
	}

//end of CONTROLLER
});