// <!-- 01SEP2017 keithpjolley@gmail.com Squalor Heights, CA. MIT License -->

'use strict';

let N = 3, // number of datasets to show
    sliders = ["x", "p"];

var svg = d3.select("#thesvg"),
    margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    color = d3.scaleOrdinal(d3.schemeCategory10),
    x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    n = [],
    p = [],
    data = [];

let rad = 5; // dot radius

var tooltip = d3.select("#plotdiv").append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

var tipover = function(d) {
  var html = "x: " + d.n + "<br>p: " + d.val.toFixed(5);
  tooltip.html(html)
    .style("left", (d3.event.pageX + 15) + "px")
    .style("top",  (d3.event.pageY - 28) + "px")
    .style("border-color", color(d.set))
    .transition().duration(200).style("opacity", 1);
};

var tipout = function(d) {
  tooltip.transition().duration(200).style("opacity", 0);
};

function make_y_gridlines() {
  return d3.axisLeft(y).ticks(5);
};

function createdata(n, p) {
  let data = [];
  function fact(n) { return n<=1 ? 1 : n*fact(n-1); }
  for(let i=0; i<N; i++) {
    for(let k=0; k<=n[i]; k++) {
      let nk = fact(n[i])/(fact(k)*fact(n[i]-k));
      data.push({set: i, n: k, val: nk*Math.pow(p[i],k)*Math.pow(1-p[i],n[i]-k)});
    }
  }
  return data;
};

d3.select("#thetitle").text("Binomial PDF");

// create controls - an "n" and a "p" sliders
for(let i=0; i<N; i++) {
  let control = d3.select("#thecontrols")
                  .append("div")
                  .attr("class", "controls")
                  .attr("id", "control" + i);
  sliders.forEach(function(d) {
    let div = control.append("div")
        .attr("class", d + "slide slider-wrapper");
    div.append("input")
        .attr("type", "range")
        .attr("min",  "0")
        .attr("max",   d==="x" ? "170" : "1")
        .attr("value", d==="x" ? Math.floor((i+1)*100/(N+1))  : "0.5")
        .attr("step",  d==="x" ? "1"   : "0.001");
  });
};


// call this each time the sliders are moved
function draw() {

  // get the state of the sliders
  for(let i=0; i<N; i++) {
    n[i] = +d3.select("#control" + i + " .xslide input").node().value
    p[i] = +d3.select("#control" + i + " .pslide input").node().value;
  };
  data = createdata(n, p);

  // cleanse the palette
  svg.selectAll('.refresh').remove();
  
  x.domain([-0.5, d3.max(n)+0.5])
  y.domain([0, Math.max.apply(Math, data.map(function(d){return d.val}))]);

  let g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "refresh");

  g.append("g")
      .attr("class", "axis")// axis--x")
      .attr("transform", "translate(" + 0 + "," + height + ")")
      .call(d3.axisBottom(x))
    .append("text")
      .attr("x", x(d3.max(n)))
      .attr("y", 0)
      .attr("dy", "2.71em")
      .style("fill", "black")
      .text("x");

  g.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + (-1.5*rad) + ",0)")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .style("fill", "black")
      .text("probability mass");

  g.append("g")
      .attr("class", "grid")
      .call(make_y_gridlines().tickSize(-width).tickFormat(""));

  var marker = g.selectAll(".marker")
        .data(data)
      .enter().append("g")
        .attr("class", "marker")
        .on("mouseover", tipover)
        .on("mouseout",  tipout);
//        .attr("id", function(d) { return "marker_" + d.set + "_" + d.n; });

      marker.append("line")
        .attr("class", "line")
        .attr("x1", function(d) { return x(d.n); })
        .attr("y1", function(d) { return y(0); })
        .attr("x2", function(d) { return x(d.n); })
        .attr("y2", function(d) { return y(d.val); })
        .attr("stroke", function(d) { return color(d.set); }); 

      marker.append("circle")
        .attr("class", "dot")
        .attr("r",  function(d) { return rad;  })
        .attr("cx", function(d) { return x(d.n); })
        .attr("cy", function(d) { return y(d.val); })
        .attr("fill", function(d) { return color(d.set); })
        .attr("stroke", function(d) { return color(d.set); }); 
};

document.addEventListener('DOMContentLoaded', function() {
  draw();
  d3.selectAll(".xslide a" ).text("n")
  d3.selectAll(".pslide a" ).text("p")
  for(let i=0; i<N; i++) {
    d3.selectAll("#control"+i +" .ui-slider-track").style("background-color", color(i))
  }
}, false);
