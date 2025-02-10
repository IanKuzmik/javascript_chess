
const QUEENS_GAMBIT_OPENING_MOVES = {
    /* -- First Move  -- */
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'          : ['d2d4'],
    /* -- Second Move -- */
    'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'      : ['c2c4'], // d5
    'rnbqkbnr/pppppp1p/6p1/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'      : ['c2c4'], // g6
    'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2'      : ['c2c4'], // Nf6
    'rnbqkbnr/ppp1pppp/3p4/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'      : ['c2c4'], // d6
    'rnbqkbnr/pppp1ppp/4p3/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'      : ['c2c4'], // e6
    'rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'      : ['c2c4'], // f5
    'rnbqkbnr/pp1ppppp/2p5/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'      : ['c2c4'], // f6
    'rnbqkbnr/1ppppppp/p7/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'       : ['c2c4'], // a6
    'rnbqkbnr/pp1ppppp/8/2p5/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'      : ['d4d5'], // c5
    'rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'      : ['d4e5'], // e5
    'r1bqkbnr/pppppppp/2n5/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2'      : ['d5d5'], // Nc6
}

const CARO_KANN_OPENING_MOVES = {
    /* -- First Move  -- */
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'       : ['c7c6'], // e4
    /* -- Second Move -- */
    'rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2'      : ['d7d5'], // d4
    'rnbqkbnr/pp1ppppp/2p5/8/2P1P3/8/PP1P1PPP/RNBQKBNR b KQkq - 0 2'    : ['d7d5'], // c4
    'rnbqkbnr/pp1ppppp/2p5/8/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2'    : ['d7d5'], // Nc3
    'rnbqkbnr/pp1ppppp/2p5/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2'    : ['d7d5'], // Nf6
    'rnbqkbnr/pp1ppppp/2p5/8/4P3/3P4/PPP2PPP/RNBQKBNR b KQkq - 0 2'     : ['d7d5'], // d3
    'rnbqkbnr/pp1ppppp/2p5/8/4P3/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 2'    : ['d7d5'], // c3
    'rnbqkbnr/pp1ppppp/2p5/8/4P3/6P1/PPPP1P1P/RNBQKBNR b KQkq - 0 2'    : ['d7d5'], // g3
    'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPPQPPP/RNB1KBNR b KQkq - 1 2'      : ['d7d5'], // Qe2
    'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPPBPPP/RNBQK1NR b KQkq - 1 2'      : ['d7d5'], // Be2
    'rnbqkbnr/pp1ppppp/2p5/8/4P3/5P2/PPPP2PP/RNBQKBNR b KQkq - 0 2'     : ['d7d5'], // f3
    'rnbqkbnr/pp1ppppp/2p5/8/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2'      : ['d7d5'], // f4
}

const OPENINGS = {
    'QUEENS GAMBIT' : {
        'name'              : `Queen's Gambit`,
        'fen_dict'          : QUEENS_GAMBIT_OPENING_MOVES,
        'opening_fen'       : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        'player_color'      : 'white',
        'white_first_move'  : null,
    },
    'CARO-KANN' : {
        'name'              : `Caro-Kann`,
        'fen_dict'          : CARO_KANN_OPENING_MOVES,
        'opening_fen'       : 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        'player_color'      : 'black',
        'white_first_move'  : 'e2e4',
    }
}


class Trainer {

    constructor() {
        this.opening_index  = null;
        this.openings       = OPENINGS;
        this.line           = [];
        this.fen_dict       = {};
    }

    verifyAnswer(fen, move) { 
        if (this.fen_dict[fen].includes(move)) {
            this.pushMove(move);
            return true;
        }
        return false;
    }

    pushMove(move) {
        this.line.push(move);
    }

    checkFen(fen) { 
        return Object.keys(this.fen_dict).includes(fen); 
    }

    checkComplete(turns) { 
        return this.line.length >= turns; 
    }

    getOpenings() {
        return Object.keys(this.openings);
    }

    getOpening() {
        return this.openings[Object.keys(this.openings)[this.opening_index]];
    }

    getOpeningName() {
        return this.openings[Object.keys(this.openings)[this.opening_index]]['name'];
    }

    setOpening(opening) {
        this.opening_index = opening;
        this.fen_dict      = this.openings[Object.keys(this.openings)[this.opening_index]]['fen_dict'];
    }

}

export default Trainer;
