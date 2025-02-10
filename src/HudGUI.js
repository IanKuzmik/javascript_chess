
import WDLGraph from './WDLGraph.js';
import GameLog from './GameLog.js';

class HudGUI {

    constructor() {
        this.points     = 0;
        this.graph      = new WDLGraph('#hud');
        this.log        = new GameLog();
        this.points_ele = document.getElementById("hud-points");
        this.turn_ele   = document.getElementById("hud-turn");
        this.move_ele   = document.getElementById("hud-move");
        this.best_ele   = document.getElementById("hud-best");
        this.w_ele      = document.getElementById("hud-w");
        this.psq_ele    = document.getElementById("hud-psq");

        this.hist_points = [0];
        this.hist_w      = [0];
        this.hist_psq    = [0];

    }

    updateHudData(data) {
        
        const w_delta      = (parseInt(data.w)   > this.hist_w.at(-1))   ? 'Increase' : (parseInt(data.w) == this.hist_w.at(-1))     ? 'No Change' : 'Decrease';
        const psq_delta    = (parseInt(data.psq) > this.hist_psq.at(-1)) ? 'Increase' : (parseInt(data.psq) == this.hist_psq.at(-1)) ? 'No Change' : 'Decrease';

        this.log.lineBreak();
        this.log.writeLine(`Move: ${data.move}`            , data.turn);
        this.log.writeLine(`Rating: ${data.move_rating}`   , data.turn);
        this.log.writeLine(`Best Move: ${data.best}`       , data.turn);
        this.log.writeLine(`WDL ${w_delta}: ${data.w}`     , data.turn);
        this.log.writeLine(`PSQ ${psq_delta}: ${data.psq}` , data.turn);
        this.log.lineBreak();

        this.hist_w.push(parseInt(data.w));
        this.hist_psq.push(parseInt(data.psq));

    }

    updateGraph(wdl_data) {
        this.graph.updateGraph(wdl_data);
    }

    writeToLog(data, turn = null) {
        this.log.writeLine(data, turn);
    }

    clearLog() {
        this.log.clear();
    }

    takeBackHistory() {
        if (this.points > 0) {
            this.hist_points = [0];
            this.points = 0;
        }
        this.hist_w.pop();
        this.hist_psq.pop();
    }
}

export default HudGUI;
