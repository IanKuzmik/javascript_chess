import GameGUI  from './GameGUI.js';
import HudGUI   from './HudGUI.js';
import Trainer  from './Trainer.js';
import './stockfish-16/stockfish.js';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

class GameState {
    constructor() {
        this.ready                          = false
        this.uciok                          = false
        this.legal_moves                    = []
        this.good_moves                     = []
        this.pawn_score                     = 0
        this.player_hand                    = ''
        this.game_data                      = []
        this.fen                            = START_FEN
        this.enemy_turn                     = false
        this.enemy_moves                    = []
        this.game_finished                  =  false
        this.checkmate                      = false
        this.stalemate                      = false
        this.first_try                      = true
        this.game_start                     = false
        this.move_history                   = []
        this.taking_back                    = false
        this.engine_think_warning           = false
        this.training                       = false
        this.training_attempts              = 0
        this.training_settings_opening      = false
        this.training_settings_dificulty    = false
        this.training_first_moves           = false
        this.training_difficulty_level      = 0
        this.training_goal                  = 5

    }
};

const canvas     = document.querySelector('canvas');
let   game_state = new GameState();
const gui        = new GameGUI(canvas, game_state.fen);
const hud        = new HudGUI();
let   trainer;
const engine     = new Worker('./src/stockfish-16/stockfish.js');
let   wdl_data   = [];



/*#################*/
/*

░░░░░░░░░░░░░░      ░░░        ░░        ░░        ░░        ░░   ░░░  ░░░      ░░░░      ░░░░░░░░░░░░░░
▒▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒  ▒▒▒▒▒    ▒▒  ▒▒  ▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▓▓▓▓▓▓▓▓▓▓▓▓▓▓      ▓▓▓      ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓  ▓▓▓▓▓  ▓  ▓  ▓▓  ▓▓▓   ▓▓▓      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓
███████████████████  ██  ███████████  ████████  ████████  █████  ██    ██  ████  ████████  █████████████
██████████████      ███        █████  ████████  █████        ██  ███   ███      ████      ██████████████
                                                                                                        

*/
/*###############*/
let PLAYER_COLOR          = 'white';
let PAWN_UPGRADE          = 'q';      
let ENGINE_DEPTH_ENEMY    = '9';      // this is the difficulty. poor performance above 9
let ENGINE_DEPTH_ANALYSIS = '12';     // this is how good the engine is at determining score and predicting best move. could be considered 'accuracy'
let MULTIPV               = '10';     // this is the amount of different good moves the engine will report back
let ENEMY_CREATIVITY      = .50;      // this is the amount of different good moves the enemy will choose from. higher # = higher change of 'worse' moves. MAx value = 1




/*###########*/
/*

░░░░░░░░░░░░░        ░░       ░░░░      ░░░        ░░   ░░░  ░░        ░░   ░░░  ░░░      ░░░░░░░░░░░░░░
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒  ▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒    ▒▒  ▒▒▒▒▒  ▒▒▒▒▒    ▒▒  ▒▒  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓       ▓▓▓  ▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓▓  ▓  ▓  ▓▓▓▓▓  ▓▓▓▓▓  ▓  ▓  ▓▓  ▓▓▓   ▓▓▓▓▓▓▓▓▓▓▓▓▓
████████████████  █████  ███  ███        █████  █████  ██    █████  █████  ██    ██  ████  █████████████
████████████████  █████  ████  ██  ████  ██        ██  ███   ██        ██  ███   ███      ██████████████
                                                                                                        
*/
/*#########*/

function initializeTraining() {
    initializeEngine();
    game_state.game_start = true;
    trainer = new Trainer();

    document.getElementById('start').disabled = true;
    document.getElementById('fen').disabled   = false;

    promptTrainingSettingsOpening();
}

function promptTrainingSettingsOpening() {
    game_state.training_settings_opening = true;
    hud.writeToLog(`Training Mode`);
    hud.writeToLog(`Please select opening to play:`);
    const openings_list = trainer.getOpenings();
    for (let i = 0; i < openings_list.length; i++) {
        hud.writeToLog(`${i+1}: ${openings_list[i]}`); 
    } 
}

function handlePTSOpeningInput(input) {
    const openings_list = trainer.getOpenings();
    if((/^\d+$/).test(input) && Number(input) <= openings_list.length && Number(input) > 0) {
        trainer.setOpening(Number(input)-1);
        game_state.training_settings_opening = false;
        promptTrainingSettingsDifficulty();
    } else {
        hud.writeToLog(`Please input a valid number:`);
    } 
};

function promptTrainingSettingsDifficulty() {
    game_state.training_settings_dificulty = true;
    hud.writeToLog(`Training Mode`);
    hud.writeToLog(`Please select difficulty:`);
    hud.writeToLog(`1: BASIC`);
    hud.writeToLog(`2: ADVANCED`);
    hud.writeToLog(`3: EXPERT`);
}

function handlePTSDifficultyInput(input) {
    if((/^\d+$/).test(input) && (1 <= Number(input) && Number(input) <= 3)) {
        game_state.training_difficulty_level        = Number(input) - 1;
        game_state.training_goal                    = Number(input) + 5;
        game_state.training_settings_dificulty      = false;
        startTrain();
    } else{
        hud.writeToLog(`Please input a valid number`);
    } 
}

function startTrain() {
    setTrainingBoard();
    hud.writeToLog(`Begin! -- ${trainer.getOpeningName()}`);
    game_state.training = true; 
    game_state.training_first_moves = true;
    startPlayerTurn();
}

function setTrainingBoard() {
    const opening = trainer.getOpening()
    const opening_fen   = opening['opening_fen'];
    game_state.fen      = opening_fen;
    PLAYER_COLOR        = opening['player_color'];
    if (
        PLAYER_COLOR === 'black' && !gui.flipped ||
        PLAYER_COLOR === 'white' && gui.flipped
    ) {
        gui.reverseBoardMap(game_state.fen);
    } else if (PLAYER_COLOR === 'black') {
        gui.updateBoard(game_state.fen);
    }

    if (opening['white_first_move']) {
        engine.postMessage('position fen ' + game_state.fen + ' moves ' + opening['white_first_move']);
    }

}

function handleTrainingFirstMoves(move) {
    if (trainer.verifyAnswer(game_state.fen, move)) {
        hud.writeToLog('Great!');
        sendPlayerMove(move);
    } else {
        hud.writeToLog(`Incorrect. Try again`);
        game_state.training_attempts++;
        return;
    }
    if (game_state.game_data.length >= 2) {
        document.getElementById('hint').disabled  = false;
        game_state.training_first_moves = false;
    }
}

function handleTrainingRegularMoves(move) {
    const move_pool = filterTrainingMovesByDifficulty();
    const valid_move = move_pool.includes(move);
    if(valid_move) {
        trainer.pushMove(move);
        hud.writeToLog('Great!');
        hud.writeToLog(`Possible moves were: ${move_pool}`);

        if (trainer.checkComplete(game_state.training_goal)) {
            sendMove(move);
            trainerWin();
            return;
        }

        sendPlayerMove(move);
    } else {
        hud.writeToLog('Incorrect! Try again');
        game_state.training_attempts++;
    }

}

function filterTrainingMovesByDifficulty() {
    const possible_moves = calculateGoodMoves(game_state.good_moves);
    let move_pool  = [];
    switch (game_state.training_difficulty_level) {
        case 0: // Basic
            move_pool  = possible_moves[2].map((x) => x[0]);
            break;
        case 1: // Advanced
            move_pool  = possible_moves[1].map((x) => x[0]);
            break;
        case 2: // Expert
            move_pool  = possible_moves[0].map((x) => x[0]);
            break;
        default:
            break;
    }
    return move_pool;
}

function giveTrainingHint() {
    const move_pool  = filterTrainingMovesByDifficulty();
    const suggestion = move_pool[Math.floor(Math.random() * move_pool.length)].substring(0,2);
    hud.writeToLog(`Look at ${suggestion}`);
}

function trainerWin() {
    hud.writeToLog('WIN!');
    hud.writeToLog(`Failed Attempts = ${game_state.training_attempts}`);
    game_state.training     = false;
    game_state.game_start   = false;
     
}


/*############*/
/*

░░░░░░░░░░░░░░      ░░░░      ░░░  ░░░░  ░░        ░░░░░░░░░░░░░
▒▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒  ▒▒▒▒  ▒▒   ▒▒   ▒▒  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▓▓▓▓▓▓▓▓▓▓▓▓▓  ▓▓▓   ▓▓  ▓▓▓▓  ▓▓        ▓▓      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
█████████████  ████  ██        ██  █  █  ██  ███████████████████
██████████████      ███  ████  ██  ████  ██        █████████████
                                                                

*/
/*##########*/

function startGame()  {
    initializeEngine();
    game_state.game_start = true;
    const game_buttons = document.getElementsByClassName('game-button');
    for (const x of game_buttons) { x.disabled = false; }
    document.getElementById('fen').disabled = false;
    document.getElementById('train').disabled = true;
    (PLAYER_COLOR == 'white') ? startPlayerTurn() : startEnemyTurn();
    hud.writeToLog(`Game Started`);
}

function startPlayerTurn() { 
    game_state.ready = false
    if ((game_state.game_data.length > 0)) {
        engine.postMessage('wdl');                               // get WDL data
        engine.postMessage('psq');                               // get pawn score       
    }
    engine.postMessage('legal');                                 // get legal moves
    engine.postMessage('go depth ' + ENGINE_DEPTH_ANALYSIS);     // get best moves               
}

function vetPlayerMove(move) {
    rateMove(move);
    game_state.game_data[game_state.game_data.length - 1].move = move;
    sendPlayerMove(move);
}

function sendPlayerMove(move) {
    game_state.ready        = false;
    game_state.player_hand  = '';
    game_state.legal_moves  = [];
    game_state.good_moves   = [];
    sendMove(move);
    startEnemyTurn();
}

function startEnemyTurn() {
    game_state.enemy_turn = true;
    engine.postMessage('go depth ' + ENGINE_DEPTH_ENEMY);
}

function sendEnemyMove(move_list) {
    let move = '';
    if (game_state.training) {
        move = move_list[Math.floor(Math.random() * 3)][0];
    } else {
        move = move_list[Math.floor(Math.random() * (Math.floor(ENEMY_CREATIVITY * move_list.length)))][0];
    }
    game_state.enemy_moves = [];
    sendMove(move);
    game_state.enemy_turn = false; 
    startPlayerTurn();
} 

function sendMove(move) {
    engine.postMessage('position fen ' + game_state.fen + ' moves ' + move);
    game_state.move_history.push(move);
    engine.postMessage('fen');
}


function takeBack() {
    if (game_state.move_history.length == 0) { return; }

    game_state.taking_back = true; 

    hud.writeToLog('Take back!');

    wdl_data.pop();
    wdl_data.pop();

    game_state.good_moves  = [];
    game_state.player_hand = '';

    hud.takeBackHistory();

    game_state.move_history.pop();
    game_state.move_history.pop();

    game_state.game_data.pop();
    const pop_data = game_state.game_data.pop();

    engine.postMessage('position fen ' + pop_data.fen);
    engine.postMessage('fen');
    startPlayerTurn();
}

function rateMove(move) {

    const move_count = game_state.good_moves.length;
    
    if (move_count == 0) {return;}

    const rated_moves = calculateGoodMoves(game_state.good_moves);

    if (game_state.good_moves[0][0]  == move) {
        game_state.game_data[game_state.game_data.length - 1].move_rating = 'Best';
        hud.writeToLog(`Best Move!!`);
    } else if (rated_moves[0].map((x) => x[0]).includes(move)) {
        game_state.game_data[game_state.game_data.length - 1].move_rating = 'Excellent';
        hud.writeToLog(`Excellent Move!`);
    } else if (rated_moves[1].map((x) => x[0]).includes(move)) {
        game_state.game_data[game_state.game_data.length - 1].move_rating = 'Great';
        hud.writeToLog(`Great Move.`);
    } else if (rated_moves[2].map((x) => x[0]).includes(move)) {
        game_state.game_data[game_state.game_data.length - 1].move_rating = 'Good';
        hud.writeToLog(`Good move`);
    }
    
    game_state.game_data[game_state.game_data.length - 1].best = game_state.good_moves[0][0];
}


/*##############*/
/*


░░░░░░░░░░░░░        ░░   ░░░  ░░        ░░        ░░       ░░░        ░░░      ░░░░      ░░░        ░░░░░░░░░░░░░
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒    ▒▒  ▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒▒▒▒  ▒▒▒▒  ▒▒  ▒▒▒▒▒▒▒▒  ▒▒▒▒  ▒▒  ▒▒▒▒  ▒▒  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓  ▓  ▓  ▓▓▓▓▓  ▓▓▓▓▓      ▓▓▓▓       ▓▓▓      ▓▓▓▓  ▓▓▓▓  ▓▓  ▓▓▓▓▓▓▓▓      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
████████████████  █████  ██    █████  █████  ████████  ███  ███  ████████        ██  ████  ██  ███████████████████
█████████████        ██  ███   █████  █████        ██  ████  ██  ████████  ████  ███      ███        █████████████
                                                                                                                  

*/
/*############*/

function highlightLatestMove(){
    if (game_state.move_history.length >  0) {
        gui.highlightSpace(gui.board_map[game_state.move_history[game_state.move_history.length-1].substring(0,2)], 'rgba(0,255,255,0.5)');
        gui.highlightSpace(gui.board_map[game_state.move_history[game_state.move_history.length-1].substring(2,4)], 'rgba(0,0,255,0.5)');
    }

}

function getClickedSpace(e) {
    const xClick = e.clientX + window.scrollX;
    const yClick = e.clientY + window.scrollY;

    for ( const space in gui.board_map ) {
        let x = gui.board_map[space].x + gui.size/16;
        let y = gui.board_map[space].y;
        if ( x < xClick && xClick < x + gui.size/8 && y < yClick && yClick < y + gui.size/8 + gui.size/32 ) {
            return gui.board_map[space];
        }
    }
}

function printHelp() {
    hud.writeToLog(`~~~~HELP MENU~~~~`);
    hud.writeToLog(`Settings API:`);
    hud.writeToLog(`Enter the following commands in the input box to change settings. Some setting changes require a reset to take effect. Do not include [] in command. #note: higher accuracy = slower performance.`);
    hud.writeToLog(`/setting setPlayerColor(['white'/'black'])`);
    hud.writeToLog(`/setting setPawnUpgrade(['q','r','b','n'])`);
    hud.writeToLog(`/setting setEngineAccuracy([1-20])`);
    hud.writeToLog(`/setting setEnemyDifficulty([1-20]) `);
}

function callSettingsAPI(input) {
    if (input.includes('setPlayerColor')) {
        if(!game_state.training && !game_state.game_start) {
            setPlayerColor(input)
        } else {
            hud.writeToLog(`Please RESET first`);
        }
        return;
    }
    if (input.includes('getPlayerColor')) {
        hud.writeToLog(`Player Color = ${PLAYER_COLOR}`);
        return;
    }
    if (input.includes('setPawnUpgrade')) {
        let parameter = input.match(/'([qrbn])'/);
        if (parameter) {
            setPawnUpgrade(parameter[1]);
        } else {
            hud.writeToLog(`Please input valid upgrade (q,r,b,n)`);
        }
        return;
    }
    if (input.includes('getPawnUpgrade')) {
        hud.writeToLog(`Pawn Upgrade = ${PAWN_UPGRADE}`);
        return;
    }
    if (input.includes('setEngineAccuracy')) {
        const parameter       = input.match(/\((\d+)\)/);
        const invalid_message = `Please input valid number between 1-20`;
        if (parameter) {
            if (1 <= Number(parameter[1]) && Number(parameter[1]) <= 20) {
                ENGINE_DEPTH_ANALYSIS = parameter[1];
            } else {
                hud.writeToLog(invalid_message);
            }
        } else {
            hud.writeToLog(invalid_message);
        }
        hud.writeToLog(`Engine Accuracy = ${ENGINE_DEPTH_ANALYSIS}`);
        return;
    }
    if (input.includes('getEngineAccuracy')) {
        hud.writeToLog(`Engine Accuracy = ${ENGINE_DEPTH_ANALYSIS}`);
        return;
    }
    if (input.includes('setEnemyDifficulty')) {
        const parameter = input.match(/\((\d+)\)/);
        const invalid_message = `Please input valid number between 1-20`;
        if (parameter) {
            if (1 <= Number(parameter[1]) && Number(parameter[1]) <= 20) {
                ENGINE_DEPTH_ENEMY = parameter[1];
            } else {
                hud.writeToLog(invalid_message);
            }
        } else {
            hud.writeToLog(invalid_message);
        }
        hud.writeToLog(`Enemy Difficulty = ${ENGINE_DEPTH_ENEMY}`);
        return;
    }
    if (input.includes('getEnemyDifficulty')) {
        hud.writeToLog(`Enemy Difficulty = ${ENGINE_DEPTH_ENEMY}`);
        return;
    }
}

function setPlayerColor(input) {
    PLAYER_COLOR = 
        input.includes('white') ? 'white' : 
        input.includes('black') ? 'black' : 
        PLAYER_COLOR;
    hud.writeToLog(`Player Color = ${PLAYER_COLOR}`);
}

function setPawnUpgrade(upgrade) {
    PAWN_UPGRADE = upgrade; 
    hud.writeToLog(`Pawn Upgrade = ${PAWN_UPGRADE}`);
}




/*##############*/
/*

░░░░░░░░░░░░░  ░░░░  ░░░      ░░░   ░░░  ░░       ░░░  ░░░░░░░░        ░░       ░░░░      ░░░░░░░░░░░░░░
▒▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒  ▒▒  ▒▒▒▒  ▒▒    ▒▒  ▒▒  ▒▒▒▒  ▒▒  ▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒  ▒▒▒▒  ▒▒  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▓▓▓▓▓▓▓▓▓▓▓▓▓        ▓▓  ▓▓▓▓  ▓▓  ▓  ▓  ▓▓  ▓▓▓▓  ▓▓  ▓▓▓▓▓▓▓▓      ▓▓▓▓       ▓▓▓▓      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓
█████████████  ████  ██        ██  ██    ██  ████  ██  ████████  ████████  ███  █████████  █████████████
█████████████  ████  ██  ████  ██  ███   ██       ███        ██        ██  ████  ███      ██████████████
                                                                                                        

*/
/*############*/

function handleMessage(event) {

    /* Verify UCI */
    if (event.data == 'uciok') {
        game_state.uciok = true;
    }

    /* Game Finished */
    else if (event.data == 'bestmove (none)') { 
        game_state.game_finished = true;
        engine.postMessage('d');
    }

    /* Stalemate/Checkmate */
    else if (event.data.match('Checkers:') && game_state.game_finished == true) {
        if (/Checkers:\s*\S/.test(event.data)) {
            game_state.checkmate = true;
            const message = (!game_state.enemy_turn)  ? 'you\'ve lost' : 'You Win!'; //this line is not intuitive. it works
            hud.writeToLog(message);
        } else  {
            game_state.stalemate = true;
            const message = 'It\'s a Draw!'; 
            hud.writeToLog(message);
        }
    }

    /* Legal Moves */
    else if (event.data.match('legal moves:')) {
        game_state.legal_moves = event.data.substring(event.data.search(":")+2).trim().split(' ');

        if (game_state.game_data.length > 0 && !game_state.training) {
            const hud_data = game_state.game_data[game_state.game_data.length-1];
            hud.updateHudData(hud_data);
        }

        game_state.game_data.push({
            "turn"        : game_state.game_data.length + 1,
            "move_rating" : 'Neutral',
            "move"        : '',
            "best"        : '', 
            "psq"         : 0,
            "w"           : 0,
            "fen"         : game_state.fen
        }); 
    }

    /* Player Moves - normal circumstances */
    else if (event.data.match('info depth ' + ENGINE_DEPTH_ANALYSIS) && !game_state.enemy_turn) {
        if (event.data.match(' cp ')) {
            pushGoodMove(game_state.good_moves, event.data);
            if (game_state.good_moves.length == MULTIPV) {
                checkEngineThinkWarning();
                game_state.ready = true;
            }
        }
        if (event.data.match(' score mate ')) {
            pushMateMove(game_state.good_moves, event.data);
            if (game_state.good_moves.length == MULTIPV) {
                checkEngineThinkWarning();
                game_state.ready = true;
            }
        }
        
    }

    /* Player Moves - limited amount of possible moves */
    else if (event.data.match('bestmove') && game_state.good_moves.length > 0 && !game_state.enemy_turn && game_state.good_moves.length < MULTIPV) {
        checkEngineThinkWarning();
        game_state.ready = true;
    }

    /* Enemy Moves - normal circumstances */
    else if (event.data.match('info depth ' + ENGINE_DEPTH_ENEMY) && game_state.enemy_turn) {
        if(event.data.match(' cp ')) {
            pushGoodMove(game_state.enemy_moves, event.data);
            if (game_state.enemy_moves.length == MULTIPV) {
                sendEnemyMove(game_state.enemy_moves);
            }
        }
        if(event.data.match(' score mate ')) {
            pushMateMove(game_state.enemy_moves, event.data);
            if (game_state.enemy_moves.length == MULTIPV) {
                sendEnemyMove(game_state.enemy_moves);
            }
        }
    }

    /* Enemy Moves - limited amount of possible moves */
    else if (event.data.match('bestmove') && game_state.enemy_turn && game_state.enemy_moves.length < MULTIPV) {
        sendEnemyMove(game_state.enemy_moves);
    }

    /* Fen */
    else if (event.data.match('fen')) {
        game_state.fen = event.data.substring(5);
        gui.updateBoard(game_state.fen);
        highlightLatestMove();
    }

    /* WDL */
    else if (event.data.match('wdl')) {
        const wdl = event.data.match(/^wdl (\d+) (\d+) (\d+)?/);

        game_state.game_data[game_state.game_data.length - 1].w = wdl[1]

        wdl_data.push({
            "turn": wdl_data.length + 1,
            "Win":  wdl[1],
            "Draw": wdl[2],
            "Loss": wdl[3],
        });
        hud.updateGraph(wdl_data);
    }

    /* PSQ */
    else if (event.data.match(/^-?\d+$/)) { 
        const score = parseInt(event.data)
        game_state.pawn_score = score;
        game_state.game_data[game_state.game_data.length - 1].psq = score;
    }

    /* Default */
    else {
        //  console.log(event.data);
    }
}

function handleClick(e) {
    game_state.taking_back = false;

    if (game_state.training_settings_opening || game_state.training_settings_dificulty) { 
        hud.writeToLog('Please type a number into the input box and press submit');
        return;
    }

    if (game_state.checkmate) { 
        hud.writeToLog('The game is over, mate');
        return;
    }

    if (game_state.stalemate) { 
        hud.writeToLog('The game is over, stalemate');
        return;
    }

    if (!game_state.game_start) { 
        hud.writeToLog('Game not started yet!');
        return;
    }

    if (!game_state.ready) { 
        game_state.engine_think_warning = true;
        hud.writeToLog('The Engine is Thinking!');
        return;
    }

    const clicked_space = getClickedSpace(e);

    if (game_state.player_hand.length == 0) { // no piece in hand
        if (!clicked_space.piece) return;
        const enemy_piece = (PLAYER_COLOR == 'white') ? (clicked_space.piece == clicked_space.piece.toLowerCase()) : (clicked_space.piece == clicked_space.piece.toUpperCase());
        if (enemy_piece) return;
        game_state.player_hand = clicked_space.name;
        gui.highlightSpace(clicked_space);
    }
    else if (game_state.player_hand.length == 2) { // piece in hand
        if (clicked_space.name == game_state.player_hand) {
            gui.updateBoard(game_state.fen); // unhighlight space
            highlightLatestMove()
            game_state.player_hand = '';
        } 
        else {
            const move = game_state.player_hand + clicked_space.name;
            if (game_state.legal_moves.includes(move) || game_state.legal_moves.includes(move + PAWN_UPGRADE)) {

                // Training
                if(game_state.training) {
                    if(game_state.training_first_moves) {
                        handleTrainingFirstMoves(move);
                        return;
                    }
                    handleTrainingRegularMoves(move);
                    return;
                }

                // send player move
                if (game_state.legal_moves.includes(game_state.player_hand + clicked_space.name)) {
                    vetPlayerMove(move);
                } 
                else if (game_state.legal_moves.includes(game_state.player_hand + clicked_space.name + PAWN_UPGRADE)) {
                    vetPlayerMove(move + PAWN_UPGRADE);
                }
            }

            else {
                hud.writeToLog('Illegal Move!');
            }
        }
    }
}

function handleInputBox() {
    const input = document.getElementById("input-box").value;
    document.getElementById("input-box").value  = '';

    if (input === 'test') {
        engine.postMessage('d');
        return;
    }

    if (input.startsWith('/setting')) {
        callSettingsAPI(input);
        return;
    }

    if (input === 'getLegalMoves()') {
        if(game_state.legal_moves.length > 0) {
            hud.writeToLog(`Legal Moves = ${game_state.legal_moves}`);
        } else {
            hud.writeToLog(`no legal moves`);
        }
        return;
    }

    if (game_state.training_settings_opening) {
        handlePTSOpeningInput(input);
        return;
    }

    if (game_state.training_settings_dificulty) {
        handlePTSDifficultyInput(input);
        return;
    }
        
}



/*###########*/
/*

░░░░░░░░░░░░░░      ░░░  ░░░░  ░░░      ░░░        ░░        ░░  ░░░░  ░░░░░░░░░░░░░
▒▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒▒  ▒▒  ▒▒▒  ▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒▒▒▒   ▒▒   ▒▒▒▒▒▒▒▒▒▒▒▒▒
▓▓▓▓▓▓▓▓▓▓▓▓▓▓      ▓▓▓▓▓    ▓▓▓▓▓      ▓▓▓▓▓▓  ▓▓▓▓▓      ▓▓▓▓        ▓▓▓▓▓▓▓▓▓▓▓▓▓
███████████████████  █████  ███████████  █████  █████  ████████  █  █  █████████████
██████████████      ██████  ██████      ██████  █████        ██  ████  █████████████
                                                                                    

*/
/*#########*/

function init() {
    setButtonListeners();
    engine.onmessage = event => {handleMessage(event)};
    canvas.addEventListener('click', e => {handleClick(e)});
}

function setButtonListeners() {

    const get_moves_btn =  document.getElementById("best-moves");
    get_moves_btn.addEventListener("click", () => {hud.writeToLog(`Good Moves: ${game_state.good_moves}`)});

    const get_fen_button = document.getElementById("fen");
    get_fen_button.addEventListener("click", () => {hud.writeToLog(`Current Fen: ${game_state.fen}`)});

    const start_button = document.getElementById("start");
    start_button.addEventListener("click", () => {startGame()});

    const train_button = document.getElementById("train");
    train_button.addEventListener("click", () => {initializeTraining()});

    const input_box_button = document.getElementById("input-box-btn");
    input_box_button.addEventListener("click", () => {handleInputBox()});

    const take_back_button = document.getElementById("take-back");
    take_back_button.addEventListener("click", () => {takeBack()});

    const reset_button = document.getElementById("reset");
    reset_button.addEventListener("click", () => {resetAll()});

    const hint_button = document.getElementById("hint");
    hint_button.addEventListener("click", () => {giveTrainingHint()});

    const flip_button = document.getElementById("flip");
    flip_button.addEventListener("click", () => {gui.reverseBoardMap(game_state.fen); highlightLatestMove();});

    const clear_button = document.getElementById("clear");
    clear_button.addEventListener("click", () => {hud.clearLog()});

    const help_button = document.getElementById("help");
    help_button.addEventListener("click", () => {printHelp()});
}

function initializeEngine() {
    game_state.ready = false;
    engine.postMessage('uci');
    engine.postMessage('setoption name multipv value ' + MULTIPV); 
    engine.postMessage('position fen ' + game_state.fen);
}

function resetButtonDisabled() {
    const game_buttons = document.getElementsByClassName('game-button');
    for (const x of game_buttons) { x.disabled = true; }
    document.getElementById('hint').disabled = true;
    document.getElementById('fen').disabled = true;
    document.getElementById('train').disabled = false;
    document.getElementById('start').disabled = false;
}

function resetAll() {
    game_state = new GameState();
    trainer    = new Trainer();
    wdl_data   = [];
    hud.updateGraph(wdl_data);
    resetButtonDisabled();
    engine.postMessage('position fen ' + game_state.fen);
    engine.postMessage('fen');
    hud.writeToLog('\nRESET\n');

}


function pushGoodMove(array, data) {
    const move_index    = data.search(' pv ') + 4;
    const score_index   = data.search(' cp ') + 4;
    const move          = ['q','r','b','n'].includes(data.substring(move_index+4, move_index+5)) ? data.substring(move_index,move_index + 5) : data.substring(move_index,move_index + 4);
    const score         = data.substring(score_index,score_index + 5).match(/-?\d+/)[0];  // capture up to 4 signed digits for score, should be more than enough
    const move_item     = [move, score]
    
    if(detectDuplicateMove(array, move_item)) { return; }

    array.push(move_item);
}

function pushMateMove(array, data) {
    const move_index    = data.search(' pv ') + 4;
    const score_index   = data.search(' mate ') + 6;
    const move          = ['q','r','b','n'].includes(data.substring(move_index+4, move_index+5)) ? data.substring(move_index,move_index + 5) : data.substring(move_index,move_index + 4);
    const score         = 'M' + data.substring(score_index,score_index + 5).match(/-?\d+/)[0];  // capture up to 4 signed digits for score, should be more than enough
    const move_item     = [move, score]
    
    if(detectDuplicateMove(array, move_item)) { return; }

    array.push(move_item);
}

function detectDuplicateMove(array, move_item) {
    const string_array     = array.map(JSON.stringify)
    const string_move_item = JSON.stringify(move_item)
    return string_array.includes(string_move_item);
}

function calculateGoodMoves(move_list) {
    let excellent_moves     = [];      
    let great_moves         = [];     
    let acceptable_moves    = [];

    if (move_list[0][1].includes('M')) {
        const mate_score        = move_list[0][1].substring(1,2);
        const non_mate_moves    = move_list.filter((move) =>!move[1].includes('M'));
        const best_move_score   = (non_mate_moves.length > 0) ? non_mate_moves[0][1] : 99999;
              excellent_moves   = move_list.filter((move) => Number(move[1].substring(1,2)) <= (Number(mate_score) + 2));
              great_moves       = move_list.filter((move) => Number(move[1].substring(1,2)) <= (Number(mate_score) + 4) || move[1] >= (best_move_score - 10));
              acceptable_moves  = move_list.filter((move) => move[1].includes('M')                                      || move[1] >= (best_move_score - 15));

    } else {
        const best_move_score   = move_list[0][1];
              excellent_moves   = move_list.filter((move) => move[1] >= (best_move_score - 5));
              great_moves       = move_list.filter((move) => move[1] >= (best_move_score - 10));
              acceptable_moves  = move_list.filter((move) => move[1] >= (best_move_score - 15));
    }

    return [excellent_moves, great_moves, acceptable_moves];
}

function checkEngineThinkWarning() {
    if (game_state.engine_think_warning) {
        game_state.engine_think_warning = false;
        hud.writeToLog(`Engine is ready!`);
    }
}

document.addEventListener("DOMContentLoaded", init);