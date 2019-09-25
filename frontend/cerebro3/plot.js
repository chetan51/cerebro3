const $ = require("jquery");
const PNGReader = require('png.js');

class Plot {

  constructor(plotElement, dataPath, models, timestepInterval=100) {
    // save parameters
    this.plotElement = plotElement;
    this.dataPath = dataPath;
    this.models = models;
    this.timestepInterval = timestepInterval;

    // initialize properties
    this.timestep = 0;
    this.layerIndex = 0;
  }

  load() {
    let requests = [];
    let modelData = {};

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

              modelData[model] = png;
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

      for (let model of this.models) {
        let data = modelData[model];
        let width = data["width"];
        let height = data["height"];

        var z = [];
        
        for (var i = 0; i < height; i++) {
          z[i] = [];
          for (var j = 0; j < width; j++) {
            z[i][j] = (data["pixels"][(i * width) + j] / 255) - 0.5;
          }
        }

        var trace = {
          name: model,
          z: z,
          type: 'heatmap',
          // zmin: 0,
          // zmax: 1,
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
      }
      else {
        // convert traces to a data update
        let update = {
          z: []
        };
        for (let trace of traces) {
          update["z"].push(trace["z"]);
        }

        // update the plot's data
        Plotly.restyle(this.plotElement, update, layout);
      }
    });
  }

  nextTimestep() {
    this.timestep += this.timestepInterval;

    this.load();
  }

}

module.exports = Plot;
