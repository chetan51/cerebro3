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
    this.currentModelData = {};
  }

  load() {
    let requests = [];

    // create requests 
    for (let model of this.models) {
      let path = `data/${model}/layer-${this.layerIndex}_timestep-${this.timestep}.png`;
      requests.push(
        $.ajax({
          url: path,
          xhrFields: {
            responseType: 'arraybuffer'
          },
          success: (result) => {
            // parse it as a PNG
            var reader = new PNGReader(result);
            return reader.parse((err, png) => {
              if (err) throw err;

              this.currentModelData[model] = png;
            });
          },
          error: (err) => {
            throw err;
          }
        })
      );
    }

    // load the current timestep for each model
    $.when(
      ...requests
    ).then(() => {
      let traces = [];
      let modelIndex = 0;

      for (let [model, data] of Object.entries(this.currentModelData)) {
        let width = data["width"];
        let height = data["height"];

        var z = [];
        
        for (var i = 0; i < height; i++) {
          z[i] = [];
          for (var j = 0; j < width; j++) {
            z[i][j] = data["pixels"][(i * width) + j] / 255;
          }
        }

        var trace = {
          z: z,
          type: 'heatmap',
          zmin: 0,
          zmax: 1,
          zauto: false,
          xaxis: `x${modelIndex+1}`,
          yaxis: `y${modelIndex+1}`,
        };

        traces.push(trace);

        modelIndex++;
      };

      var layout = {
        height: 900,
        grid: {
          rows: this.models.length,
          columns: 1,
          pattern: 'independent',
        },
      };

      if (this.timestep == 0) {
        Plotly.plot(this.plotElement, traces, layout);
        // Plotly.plot(this.plotElement, [traces[0]]);
      }
      else {
        // Plotly.restyle(plotElement, { z: [data["z"]] });
        Plotly.newPlot(this.plotElement, traces, layout);
      }
    });
  }

}

module.exports = Plot;
