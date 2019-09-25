const $ = require("jquery");
const Plot = require('cerebro3').Plot

$(document).ready(() => {
  // initialize plot
  document.plot = new Plot($("#plot")[0], "/data", [
    "DenseReLU",
    "DenseKWinners",
    "SparseKWinners"
  ]);
})

document.nextTimestep = function() {
  document.plot.nextTimestep();
}

document.nextLayer = function() {
  document.plot.nextLayer();
}
