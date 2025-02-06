import Piece from './Piece.js'

/* order of array items matches FEN notation */
const SPACE_MAP = ['a8','b8','c8','d8','e8','f8','g8','h8','a7','b7','c7','d7','e7','f7','g7','h7','a6','b6','c6','d6','e6','f6','g6','h6','a5','b5','c5','d5','e5','f5','g5','h5','a4','b4','c4','d4','e4','f4','g4','h4','a3','b3','c3','d3','e3','f3','g3','h3','a2','b2','c2','d2','e2','f2','g2','h2','a1','b1','c1','d1','e1','f1','g1','h1']


class GameGUI {

    constructor( canvas, start_fen, size = 600, color1 = '#CC9900', color2 = '#663300') {
        canvas.width     = size;                                   // set width of board
        canvas.height    = size;                                   // set height of board
        this.size        = size;                                   // save board size; we'll use it to measure just about everything else
        this.color1      = color1;                                 // save color1 for redrawing purposes   
        this.color2      = color2;                                 // save color2 for redrawing purposes 
        this.ctx         = canvas.getContext('2d');                // set up context
        this.canvas      = canvas;

        this.board_map   = this.buildBoardMap();                   // get (Object) mapping of chessboard
        this.flipped     = false;

        this.updateBoard(start_fen);
    }


    /* 
    (Void) get a mapping of chess space coordinates (a1, b1, c1...) to x,y coordinates on the canvas. also including the name and color of each square 
    */
    buildBoardMap() {
        const letters = ['a','b','c','d','e','f','g','h'];
        const numbers = ['8','7','6','5','4','3','2','1'];
        let board_map = {};
        for (let i=0;i<8;i++) {
            for (let j=0;j<8;j++) {
                board_map[letters[i] + numbers[j]] = {
                    name:   letters[i] + numbers[j],
                    x:      (i * (this.size/8) ) + (this.size/32), 
                    y:      (j * (this.size/8) ) + (this.size/32), 
                    color:  ((i+j)%2 == 0) ? this.color1 : this.color2,
                    piece:  '' // in fen notation
                };
            }
        }
        return board_map;
    }

    reverseBoardMap(fen) {
        this.board_map = Object.fromEntries(
            Object.entries(this.board_map)
            .reverse()
            .map(([_, value], index) => {
                return [
                    Object.values(this.board_map)[index].name, 
                    { ...value, name: Object.values(this.board_map)[index].name }
                ];
            })
        );
        this.flipped = this.flipped ? false : true; 
        this.updateBoard(fen);
    }

    /* 
    (Void) fill our chess board (ctx) in with correctly sized, alternating in color squares 
    */
    drawPattern() {
        for (let space in this.board_map) {
            space = this.board_map[space];
            this.ctx.fillStyle = space.color;
            this.ctx.fillRect( space.x-this.size/32, space.y-this.size/32, this.size/8, this.size/8 );
        }
    }

    /* 
    Populate board_map pieces with a given FEN.
    Input: (String) a valid fen
    Output: (Void) update class property this.board_map
    */
    importFen(fen) {
        let space_index = 0;
        for(let i = 0; i < fen.length; i++) {
            if (fen[i] == ' ') break;
            if (fen[i] == '/') continue;
            if (/[rnbqkp]/i.test(fen[i])) {
                this.board_map[SPACE_MAP[space_index]].piece = fen[i];
                space_index++;
            }
            if (/[1-8]/.test(fen[i])) {
                for (let j = 0; j < fen[i]; j++) {
                    this.board_map[SPACE_MAP[space_index]].piece = null;
                    space_index++;
                }  
            }
        }
    }

    /*
    (Void) add piece objects to board based on board_map
    */
    addPieces() {
        for (const key of Object.keys(this.board_map)) {
            if (this.board_map[key].piece == null) {continue;}
            const color = (this.board_map[key].piece === this.board_map[key].piece.toUpperCase()) ? 'white' : 'black';
            new Piece(this.board_map[key].piece, this.ctx, color, this.size/16, this.board_map[key]);           
        }
    }

    updateBoard(fen) {
        this.drawPattern();
        this.importFen(fen);
        this.addPieces();
    }

    /* 
    Input: (Object) board_map space, (String) highlight color
    Output: (Void) highlight the given space 
    */
    highlightSpace(space, color = 'rgba(0,255,0,0.5)') {
        this.ctx.beginPath(); // needed to reset ctx buffer before new stroke
        this.ctx.rect( space.x-this.size/32, space.y-this.size/32, this.size/8, this.size/8 );
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 5;
        this.ctx.stroke();
        this.ctx.closePath();
    }

}

export default GameGUI;