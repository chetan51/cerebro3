const $ = require("jquery");
const Plot = require('cerebro3').Plot

$(document).ready(() => {
  // initialize plot
  let plot = new Plot(
    $("#plot")[0],
    $("#plotGUI")[0],
    "/data",
    [
      "DenseReLU",
      "DenseKWinners",
      "SparseKWinners"
    ],
    [
      "Input->Hidden1",
      "Hidden1->Hidden2",
      "Hidden2->Hidden3",
      "Hidden3->Output"
    ],
    2300
  );
})
