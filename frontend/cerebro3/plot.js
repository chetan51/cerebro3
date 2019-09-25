const PNGReader = require('png.js');

class Plot {

  constructor(plotElement, dataPath, models) {
    this.plotElement = plotElement;
    this.dataPath = dataPath;
    this.models = models;
  }

  load() {
    alert(this.dataPath);
  }

}

module.exports = Plot;
