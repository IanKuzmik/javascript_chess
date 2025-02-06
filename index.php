<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <title>Chess</title>
</head>
<body>
    <div id="game" style="display: flex;">
        <canvas></canvas>  
        <div style="color: white;" id="hud">

            <p>POINTS: <span id="hud-points"></span></p>
            <p>TURN: <span id="hud-turn"></span></p>
            <p>MOVE: <span id="hud-move"></span></p>
            <p>BEST: <span id="hud-best"></span></p>
            <p>W: <span id="hud-w"></span></p>
            <p>PSQ: <span id="hud-psq"></span></p>
            <div>
                <button                     id="start"               >start game</button>
                <button class='game-button' id="best-moves" disabled >get moves</button>
                <button                     id="fen"        disabled >get fen</button>
                <button class='game-button' id="take-back"  disabled >take back</button>
                <button                     id="train"               >train</button>
            </div>
            <div>
                <button id="reset">reset</button>
                <button id="hint" disabled>hint</button>
                <button id="flip">flip</button>
                <button id="clear">clear</button>
                <button id="help">help</button>
            </div>

            <div id="game-log-container">
                <textarea id = "game-log" rows="20" cols="50" readonly></textarea> 
            </div>
            <input id="input-box" type="text">
            <button id="input-box-btn">submit</button>

        </div>
    </div>
</body>
<script type="module" src="src/main.js"></script> 
</html>