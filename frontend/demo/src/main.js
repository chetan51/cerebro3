const $ = require("jquery");
const Plot = require('cerebro3').Plot

$(document).ready(() => {
  const plot = new Plot($("#plot"));
  plot.show();
})
