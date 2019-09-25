const $ = require("jquery");
const PNGReader = require('png.js');
const dat = require('dat.gui');

class Plot {

  constructor(plotElement, guiElement, dataPath, models, layers, numTimesteps, timestepInterval=100) {
    // save parameters
    this.plotElement = plotElement;
    this.guiElement = guiElement;
    this.dataPath = dataPath;
    this.models = models;
    this.layers = layers;
    this.numTimesteps = numTimesteps;
    this.timestepInterval = timestepInterval;

    // initialize properties
    this.timestep = 0;
    this.layerIndex = 0;

    // init GUI
    this.initGui();

    // update plot
    this.update();
  }

  initGui() {
    // create GUI
    this.gui = new dat.GUI({autoPlace: false});
    this.guiElement.appendChild(this.gui.domElement);

    // create dictionary of user choices
    let layers = this.layers;
    class Choices {
      constructor() {
        this.layer = layers[0];
        this.time = 0;
        this.next = () => {};
        this.prev = () => {};
      }
    }
    let userChoices = new Choices();

    // add layers dropdown
    let layerController = this.gui.add(userChoices, 'layer', this.layers);

    // subscribe to events
    layerController.onFinishChange((value) => {
      // update layer
      this.layerIndex = this.layers.indexOf(value);

      // update plot
      this.update(true);
    });

    // add time slider
    let maxTime = Math.floor(this.numTimesteps / this.timestepInterval);
    let timeController = this.gui.add(userChoices, 'time', 0, maxTime).step(1);

    let onTimeChanged = (value) => {
      // update timestep
      this.timestep = value * this.timestepInterval;

      // update plot
      this.update(false);
    }

    // subscribe to events
    timeController.onFinishChange(onTimeChanged);

    // add next time button
    let nextTimeController = this.gui.add(userChoices, 'next');
    // subscribe to events
    nextTimeController.onChange((value) => {
      // update UI
      timeController.setValue(userChoices.time + 1);

      // trigger event
      onTimeChanged(userChoices.time);
    });

    // add prev time button
    let prevTimeController = this.gui.add(userChoices, 'prev');
    // subscribe to events
    prevTimeController.onChange((value) => {
      // update UI
      timeController.setValue(userChoices.time - 1);

      // trigger event
      onTimeChanged(userChoices.time);
    });
  }

  update(newPlot=true) {
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

      let title = this.models.join(" vs. ");
      var layout = {
        title: title,
        height: 900,
        grid: {
          rows: this.models.length,
          columns: 1,
          pattern: 'independent',
        },
      };

      if (newPlot) {
        Plotly.newPlot(this.plotElement, traces, layout);
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

}

module.exports = Plot;
