# JavaScript Chess

This is a simple chess app written in pure javascript with a focus on utilizing the Canvas element. All graphics are programmatically generated. 

I'm leveraging a Stockfish 16 engine compiled into JavaScript, specifically sourced from [this repository from nmrugg](https://github.com/nmrugg/stockfish.js). I've made superficial modifications to the C++ source code which allow the engine to accept more commands. 

I'm also utilizing [d3](https://github.com/d3/d3) for graphing Win-Draw-Loss data. 

The terminal may be used to change basic settings, such as player color and difficulty. Press the 'Help' button for commands. Any 'set' function has an equivalent 'get' function.

Hit 'Start Game' to begin a regular chess game. The engine will rate your moves as you play and display relevant statistics. Moves are rated Best, Excellent, Great, Good, and Neutral. Neutral moves may be innocuous, or may be blunders - the program does not detect mistakes (this feature may be added in a future update).

'Get Moves' will list the top ten moves deemed by the engine, along with the resulting score (if you're playing as black, you want negative score)

'Get Fen' will print the FEN representation of the current position on the board

'Take Back' will undo the last move. You can undo as many moves in a row as you want, but you cannot _redo_ moves.

Move pieces by first clicking on the piece to select it, and then clicking on the space you want to move it. Drag'n'drop is not implemented. Click a piece again to un-select if you want to select a new one. Pawn upgrades are set via the terminal - this must be set _before_ you upgrade. The default setting is Queen.   

The 'Training' mode is only used right now for practicing two openings, one for white and one for black. The player must first make the moves that define the opening, and then make moves deemed good moves by the chess engine ('Hint's available after move 2). Difficulty here determines how many turns the training lasts, as well as how strict the engine is in determining good moves. 

Increase Engine Accuracy via the terminal for more accurate rating of good moves (at the cost of processing speed). Default accuracy is 12, which does a pretty good job without being too slow. 

The layout is responsive, and this program will work on mobile, but it is not optimized for it. 

You can play it [Here](https://chess.taprootcoding.com])