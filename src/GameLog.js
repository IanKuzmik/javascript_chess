class GameLog {

    constructor() {
        this.text_area_ele = document.getElementById('game-log');
    }

    writeLine(data, turn = null) {
        if (turn) { 
            data = '[' + (turn > 99 ? '' : '0') + (turn > 9 ? '' : '0') + turn + '] ' + data;
        }
        this.text_area_ele.innerHTML = this.text_area_ele.innerHTML + data + '\n';
        this.text_area_ele.scrollTop = this.text_area_ele.scrollHeight;
    }

    lineBreak() {
        this.text_area_ele.innerHTML = this.text_area_ele.innerHTML + '\n';
        this.text_area_ele.scrollTop = this.text_area_ele.scrollHeight;
    }

    clear() {
        this.text_area_ele.innerHTML = "";
    }
}

export default GameLog;
