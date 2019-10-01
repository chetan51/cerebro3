const $ = require("jquery");
const PNGReader = require('png.js');
const dat = require('dat.gui');

class Plot {

  constructor(plotElement, guiElement, dataPath, models, layers, numTimesteps,
              timestepInterval=100, minWeight=-0.5, maxWeight=0.5) {
    // save parameters
    this.plotElement = plotElement;
    this.guiElement = guiElement;
    this.dataPath = dataPath;
    this.models = models;
    this.layers = layers;
    this.numTimesteps = numTimesteps;
    this.timestepInterval = timestepInterval;
    this.minWeight = minWeight;
    this.maxWeight = maxWeight;

    // initialize properties
    this.timestep = 0;
    this.layerIndex = 0;

    // set parameters
    this.minPlayingInterval = 10;  // milliseconds

    // init GUI
    this.initGui();

    // update plot
    this.update();
  }

  initGui() {
    // create GUI
    this.gui = new dat.GUI({autoPlace: false});
    this.guiElement.appendChild(this.gui.domElement);

    // create callback to update plot when time is changed
    let onTimeChanged = (value) => {
      // update timestep
      this.timestep = value * this.timestepInterval;

      // update plot
      this.update(false);
    }

    // create dictionary of user choices
    let layers = this.layers;
    let maxTime = Math.floor(this.numTimesteps / this.timestepInterval);
    class Choices {
      constructor() {
        this.layer = layers[0];
        this.time = 0;
        this.next = () => {
          if (this.time >= maxTime) return;

          this.time++;

          onTimeChanged(this.time);
        };
        this.prev = () => {
          if (this.time == 0) return;

          this.time--;

          onTimeChanged(this.time);
        };
        this.playing = false;
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
    let timeController = this.gui.add(userChoices, 'time', 0, maxTime).step(1).listen();

    // subscribe to events
    timeController.onFinishChange(onTimeChanged);

    // add next time button
    let nextTimeController = this.gui.add(userChoices, 'next');

    // add prev time button
    let prevTimeController = this.gui.add(userChoices, 'prev');

    // add playing toggle
    let playingController = this.gui.add(userChoices, 'playing');

    // subscribe to playing events
    playingController.onFinishChange((value) => {
      // if playing...
      if (value) {
        // on an interval, increment the timestep
        this.playingInterval = window.setInterval(() => {
          if (userChoices.time >= maxTime) return;

          userChoices.time++;

          onTimeChanged(userChoices.time);
        }, this.minPlayingInterval);
      }
      else {
        if (this.playingInterval == null) return;

        // clear the interval
        window.clearInterval(this.playingInterval);

        this.playingInterval = null;
      }
    })
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
            let pixel = data["pixels"][(i * width) + j];
            // convert from range [0, 255] to [-1, 1]
            z[i][j] = ((pixel / 255) * 2) - 1;
          }
        }

        var trace = {
          name: model,
          z: z,
          type: 'heatmap',
          zmin: this.minWeight,
          zmax: this.maxWeight,
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

        // keep plots synced when zoomed
        this.initPlotSync();
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

  // TODO: finish implementing
  initPlotSync() {
    // upon plot relayout...
    this.plotElement.on("plotly_relayout", (eventData) => {
      if (eventData["syncUpdate"] == false) return;

      console.log(eventData);
      console.log(this.plotElement.layout);

      let layoutUpdate = eventData;
      layoutUpdate["syncUpdate"] = false;

      // Plotly.relayout(this.plotElement, layoutUpdate);
    })
  }

}

module.exports = Plot;
