const $ = require("jquery");
const PNGReader = require('png.js');

class Plot {

  constructor(plotElement, dataPath, models) {
    // save parameters
    this.plotElement = plotElement;
    this.dataPath = dataPath;
    this.models = models;

    // initialize properties
    this.timestep = 0;
    this.layerIndex = 0;
  }

  load() {
    // load a data point
    let path = `data/layer-${this.layerIndex}_timestep-${this.timestep}.png`;
    $.ajax({
      url: path,
      xhrFields: {
        responseType: 'arraybuffer'
      },
      success: (result) => {
        // parse it as a PNG
        var reader = new PNGReader(result);
        reader.parse((err, png) => {
          if (err) throw err;

          let width = png["width"];
          let height = png["height"];

          var z = [];
          
          for (var i = 0; i < height; i++) {
            z[i] = [];
            for (var j = 0; j < width; j++) {
              z[i][j] = png["pixels"][(i * width) + j] / 255;
            }
          }

          var data = [
            {
              z: z,
              type: 'heatmap',
              zmin: 0,
              zmax: 1,
              zauto: false
            }
          ];

          if (this.timestep == 0) {
            Plotly.plot(this.plotElement, data);
          }
          else {
            // Plotly.restyle(plotElement, { z: [data["z"]] });
            Plotly.newPlot(this.plotElement, data);
          }
        });
      },
      error: (err) => {
        throw err;
      }
    });
  }

}

module.exports = Plot;
