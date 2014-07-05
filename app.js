var app = angular.module('app', []);

app.controller('GoBoardController', function($scope){

//GLOBAL VARIABLES
	$scope.globalVar = {
		boardLength: 9,			//GLOBAL set boardLength
		turnNumber: 1,			//turn counter(used to switch player)
		turnColor: 'black',
		oppositeTurnColor: 'white',
		colorStatus: '',
		allEmptyFlag: false,
		anyEmptyFlag: false,
		enemySurroundFlag: false,
		tookEnemyFlag: false,
		anyEmptyCounter: 0
	}

	$scope.pass = function () {
		$scope.globalVar.turnColor = $scope.globalVar.turnColor == 'white' ? 'black' : 'white';
		$scope.globalVar.turnNumber++;}

//MOUSE UP EVENT
	$scope.mouseUpFunction = function(cell, row, col){
		if(cell.colorStatus == 'emptySpot'){
			$scope.globalVar.allEmptyFlag = false;			//reset the allEmptyFlag
			$scope.globalVar.anyEmptyFlag = false;			//reset the anyEmptyFlag
			$scope.globalVar.enemySurroundFlag = false;		//reset the enemySurroundFlag
			$scope.globalVar.tookEnemyFlag = false;			//reset the tookEnemyFlag
			$scope.globalVar.anyEmptyCounter = 0;			//reset the anyEmptyCounter

			resetCheckedStatus($scope.goBoard);
			resetToTakeStatus($scope.goBoard);

			$scope.globalVar.turnColor = getTurnColor($scope.globalVar.turnNumber, cell, $scope.globalVar.turnColor);
			
			checkNeighbours(cell, row, col, $scope.globalVar.boardLength, $scope.goBoard);

			checkSingleIllegal(cell);
			checkMultipleIllegal(cell);

			$scope.globalVar.turnNumber++;
		}
	}

		//IF THE anyEmptyFlag is false.  YOU MUST CHECK SURROUNDING FRIENDLY PIECES USING RECURSION
		//IF YOU FIND NO EMPTY SPOTS, IT'S AN ILLEGAL MOVE

//CHECK anyEmptyCounter TO SEE IF YOU SHOULD TAKE ANY PIECES
	function checkAnyEmptyCounter(anyEmptyCounter, goBoard){
		alert('anyEmptyCounter = ' + anyEmptyCounter + '================================');
		if(anyEmptyCounter == 0){
			alert('YOU MUST DELETE SOME PIECES!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
			$scope.globalVar.tookEnemyFlag = true;
			for(var i = 0; i < goBoard.length; i++){
				for(var j = 0; j < goBoard[i].length; j++){
					if(goBoard[i][j].toTakeStatus == true){
						goBoard[i][j].toTakeStatus = false;
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

//CHECK ENEMIES  -----  the 'cell' is an object like 'goBoard[row][col]'
	function checkEnemies(cell, boardLength, goBoard){
		alert('checkEnemies().cell = ' + cell + '\n' +
			'checkEnemies().cell.colorStatus = ' + cell.colorStatus + '\n' +
			'checkEnemies().cell.checkedStatus = ' + cell.checkedStatus + '\n' +
			'checkEnemies().cell.idNum = ' + cell.idNum);
		if(cell.checkedStatus == false){
			cell.checkedStatus = true;

			if(cell.cellRow > 1){
				alert('checkEnemies checkUp' + '\n' +
					cell.cellRow + '-' + cell.cellCol + ' -> ' + (cell.cellRow-1) + '-' + cell.cellCol);
				var focusPiece = goBoard[(cell.cellRow-2)][cell.cellCol-1];
				ifCheckRecursion(focusPiece, cell);
			}
			if(cell.cellCol > 1){
				alert('checkEnemies checkLeft' + '\n' +
					cell.cellRow + '-' + cell.cellCol + ' -> ' + cell.cellRow + '-' + (cell.cellCol-1));
				var focusPiece = goBoard[(cell.cellRow-1)][cell.cellCol-2];
				ifCheckRecursion(focusPiece, cell);
			}
			if(cell.cellCol < boardLength){
				alert('checkEnemies checkRight' + '\n' +
					cell.cellRow + '-' + cell.cellCol + ' -> ' + cell.cellRow + '-' + (cell.cellCol+1));
				var focusPiece = goBoard[(cell.cellRow-1)][cell.cellCol];
				ifCheckRecursion(focusPiece, cell);
			}
			if(cell.cellRow < boardLength){
				alert('checkEnemies checkDown' + '\n' +
					cell.cellRow + '-' + cell.cellCol + ' -> ' + (cell.cellRow+1) + '-' + cell.cellCol);
				var focusPiece = goBoard[(cell.cellRow)][cell.cellCol-1];
				ifCheckRecursion(focusPiece, cell);
			}
		}
	}

//CONTINUE CHECK IF STATEMENTS
	function ifCheckRecursion(focusPiece, cell){
		if(focusPiece.checkedStatus == false){
			if(cell.colorStatus == focusPiece.colorStatus){
				alert('triggering checkEnemies() for id#' + focusPiece.idNum);
				focusPiece.toTakeStatus = true;
				checkEnemies(focusPiece, $scope.globalVar.boardLength, $scope.goBoard);
			}else if(focusPiece.colorStatus != 'emptySpot' && focusPiece.colorStatus != cell.colorStatus){
				alert('found opposite here: ' + focusPiece.idNum);
			}else if(focusPiece.colorStatus == 'emptySpot'){
				alert('found empty.  moving on');
				focusPiece.checkedStatus = true;
				$scope.globalVar.anyEmptyCounter++;
			}else{
				alert('this should never have popped up');
			}
		}else{
			alert('already checked this piece');
		}
	}

//CHECK NEIGHBOURS
	function checkNeighbours(cell, row, col, boardLength, goBoard){
		var immediateEmptyCount = 0;
		var immediateEnemyCount = 0;
		var immediateFriendlyCount = 0;
		var spotsChecked = 0;

		alert('looking at'+'\n'+'row: '+(row+1)+'\n'+'col: '+(col+1));

		if(row > 0){						//check up
			var checkUp = goBoard[row-1][col];
			if(checkUp.colorStatus == 'emptySpot'){
				immediateEmptyCount++;
				alert('checkUp found emptySpot');
			}
			if(checkUp.colorStatus == cell.colorStatus){
				immediateFriendlyCount++;
				alert('checkUp found friendly');
			}
			if(checkUp.colorStatus == oppositeTurnColor(cell.colorStatus)){
				immediateEnemyCount++;
				alert('checkUp found enemy');
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
				alert('checkLeft found emptySpot');
				checkLeft.checkedStatus = true;
			}
			if(checkLeft.colorStatus == cell.colorStatus){
				immediateFriendlyCount++;
				alert('checkLeft found friendly');
			}
			if(checkLeft.colorStatus == oppositeTurnColor(cell.colorStatus)){
				immediateEnemyCount++;
				alert('checkLeft found enemy');
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
				alert('checkRight found emptySpot');
				checkRight.checkedStatus = true;
			}
			if(checkRight.colorStatus == cell.colorStatus){
				immediateFriendlyCount++;
				alert('checkRight found friendly');
			}
			if(checkRight.colorStatus == oppositeTurnColor(cell.colorStatus)){
				immediateEnemyCount++;
				alert('checkRight found enemy');
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
				alert('checkDown found emptySpot');
				checkDown.checkedStatus = true;
			}
			if(checkDown.colorStatus == cell.colorStatus){
				immediateFriendlyCount++;
				alert('checkDown found friendly');
			}
			if(checkDown.colorStatus == oppositeTurnColor(cell.colorStatus)){
				immediateEnemyCount++;
				alert('checkDown found enemy');
				checkDown.toTakeStatus = true;
				checkEnemies(checkDown, boardLength, goBoard);
				checkAnyEmptyCounter($scope.globalVar.anyEmptyCounter, $scope.goBoard);
			}
			spotsChecked++;
		}
		resetToTakeStatus($scope.goBoard);
		resetCheckedStatus($scope.goBoard);

		alert('the spots beside this one are: '+'\n'+
			'empty- '+immediateEmptyCount+'\n'+
			'friendly- '+immediateFriendlyCount+'\n'+
			'enemy- '+immediateEnemyCount);

		if(immediateEnemyCount == spotsChecked){
			$scope.globalVar.enemySurroundFlag = true;
		}
		if(immediateEmptyCount == spotsChecked){
			$scope.globalVar.allEmptyFlag = true;
		}
		if(immediateEmptyCount > 0){
			$scope.globalVar.anyEmptyFlag = true;
		}
		alert('allEmptyFlag is - ' + $scope.globalVar.allEmptyFlag+'\n'+
			'anyEmptyFlag is - ' + $scope.globalVar.anyEmptyFlag+'\n'+
			'enemySurroundFlag is - ' + $scope.globalVar.enemySurroundFlag+'\n'+
			'tookEnemyFlag is - ' + $scope.globalVar.tookEnemyFlag);
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
			alert('potential illegal move' + '\n' + 'check friendlies for empty spaces'
				+ '\n' + 'NOT YET IMPLEMENTED');
			//DO WHAT IT SAYS	check friendly pieces recursively for an empty spot
			//					if none are found, then it's an illegal move
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