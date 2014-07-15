2014-07-04-			==	it works
2014-07-08-	10:45	==	before adding save goBoard functionality
2014-07-15- 01:10	==	still cant get the back button working
2014-07-15- 02:21	==	back button works!
							made a temp array and pushed to it strings ('emptySpot', 'black')
							using a for loop on the goBoard
							checked the colorStatus of each piece
							then pushed it as a string to the temp array
							took that temp array and pushed it into the turnHistory array
							when back button is pressed, it looks to the turnHistory array a turn ago
							uses a for loop to go through the current goBoard
							change the .colorStatus of each to the turnHistory[turn#][counter]
							counter++, turn#--, turnHistory.pop() to delete the last move from history

2014-07-15- 11:15	==	cleaned up some alerts, and took the angular.min.js and jquery.min.js files
							into the directory rather than relying on the internet for cdns
							PS. still have to do the same for bootstrap... the cdn gives me some
							bullshit when i try to browse there.