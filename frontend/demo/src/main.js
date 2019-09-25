const $ = require("jquery");
const Plot = require('cerebro3').Plot

$(document).ready(() => {
  // initialize plot
  const plot = new Plot($("#plot")[0], "/data", [
    "DenseKWinners",
    "DenseReLU",
    "SparseKWinners"
  ]);

  // load the plot
  plot.load();
})
