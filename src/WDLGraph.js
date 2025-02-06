import './d3/d3.min.js';

// set the dimensions and MARGINs of the graph
const MARGIN = {top: 60, right: 230, bottom: 50, left: 50},
      WIDTH  = 660 - MARGIN.left - MARGIN.right,
      HEIGHT = 400 - MARGIN.top  - MARGIN.bottom

class WDLGraph {

    constructor(id) {

        this.keys = ['Win','Draw','Loss']

        // Set Color Pallet
        this.color = d3.scaleOrdinal()
            .domain(this.keys)
            .range(d3.schemeCategory10);

        this.svg = d3.select(id)
        .append("svg")
            .attr("width", WIDTH + MARGIN.left + MARGIN.right)
            .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)
        .append("g")
            .attr("transform",
                `translate(${MARGIN.left}, ${MARGIN.top})`)

        this.y = d3.scaleLinear()
            .domain([0, 1000])
            .range([HEIGHT, 0])

        this.buildAxis()
        this.areaChart = this.buildChart()
        this.buildLegend(this.keys, this.color)
    }
    
    /// Helper Functions
    getX(data=[]) {
        const x = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.turn; }))
            .range([ 0, WIDTH ])
        return x
    }

    /// Update Functions
    updateGraph(data=[]) {
        this.updateAxis(data)
        this.updateChart(data)
    }

    updateAxis(data) {
        const x = this.getX(data)
        const ticks =   ((data.length-1) % 6 == 0) ? 6 : 
                        ((data.length-1) % 5 == 0) ? 5 : 
                        ((data.length-1) % 4 == 0) ? 4 : 3
        d3.select('#x-axis')
            .call(d3.axisBottom(x).ticks(ticks))
    }
    
    updateChart(data) {
        // TODO: Remove the variable declarations at the top here?
        //      not sure why they are necessary, but they are
        //      pass as parameters
        
        const x     = this.getX(data)
        const y     = this.y
        const color = this.color

        d3.select('#graph-container').selectChildren("path").remove()
       
        const stackedData = d3.stack()
            .keys(this.keys)
            (data)

        // Area generator
        const area = d3.area()
            .x(function(d)  { return x(d.data.turn); })
            .y0(function(d) { return y(d[0]); })
            .y1(function(d) { return y(d[1]); })

        // Show the areas
        this.areaChart
            .selectAll("mylayers")
            .data(stackedData)
            .join("path")
                .attr("class", function(d) { return "myArea " + d.key })
                .style("fill", function(d) { return color(d.key); }) 
                .attr("d", area)
    }

    /// Build Functions
    buildChart() {
        this.svg.append("defs").append("svg:clipPath")
            .append("svg:rect")
            .attr("width", WIDTH )
            .attr("height", HEIGHT )
            .attr("x", 0)
            .attr("y", 0);
        
        const areaChart = this.svg.append('g')
            .attr("id", "graph-container")
            .attr("clip-path", "url(#clip)")
        
        return areaChart
        
    }

    buildAxis(data=[]) {

        // Add X axis
        const x = this.getX(data)
        this.svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", `translate(0, ${HEIGHT})`)
            .style("color","white")
            .call(d3.axisBottom(x).ticks(data.length-1))
            // .call(d3.axisBottom(x).ticks(5)) 

        // Add Y axis
        this.svg.append("g")
            .attr("id", "y-axis")
            .style("color","white")
            .call(d3.axisLeft(this.y).ticks(5))

        // Add X axis label:
        this.svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", WIDTH)
            .attr("y", HEIGHT+40)
            // .style("color","white")
            .text("Turn");

        // Add Y axis label:
        this.svg.append("text")
            .attr("text-anchor", "start")
            .attr("x", 0)
            .attr("y", -20)
            // .style("color","white")
            .text("WDL")
    }

    buildLegend(keys, color) {
        // TODO: The legend is upsidedown kind of, but correct

        // What to do when one group is hovered
        const highlight = function(event,d){
            // reduce opacity of all groups
            d3.selectAll(".myArea").style("opacity", .1)
            // expect the one that is hovered
            d3.select("."+d).style("opacity", 1)
        }
    
        // And when it is not hovered anymore
        const noHighlight = function(event,d){
            d3.selectAll(".myArea").style("opacity", 1)
        }
      
        const size = 20
        this.svg.selectAll("myrect")
            .data(keys)
            .join("rect")
                .attr("x", 400)
                .attr("y", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("width", size)
                .attr("height", size)
                .style("fill", function(d){ return color(d)})
                .on("mouseover", highlight)
                .on("mouseleave", noHighlight)

        this.svg.selectAll("mylabels")
            .data(keys)
            .join("text")
                .attr("x", 400 + size*1.2)
                .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", function(d){ return color(d)})
                .text(function(d){ return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .on("mouseover", highlight)
                .on("mouseleave", noHighlight)
    }

}

export default WDLGraph;