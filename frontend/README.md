# Cerebro 3

JavaScript frontend for Cerebro 3 (a web-based visualization platform for Neural Networks).

## Demo

1. Enter demo directory: `cd demo`
2. Start server (with Python 3): `python -m http.server`
3. Open page: `http://localhost:8000`.

## Installation

(Any changes to the package propagate to users of the package on the local machine instantly.)

In the target project, run `npm link cerebro3`.

## Usage

Start by generating data using the backend package, and place the data in a directory on the frontend (such as `/data`).

In HTML:

1. Create a container for the plot: `<div id="plot"></div>`.
1. Create a container for the plot's GUI controls: `<div id="plotGUI"></div>`.

In JavaScript:

1. Import package: `const Plot = require('cerebro3').Plot`.
2. Initialize plot (using jQuery to get the containers' DOM elements):

```
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
    2300,
    timestepInterval=10,
    minWeight=-0.3,
    maxWeight=0.3,
    weightDeltaScale=0.05
  );
})
```

## API

Parameters for the initialized Plot:

```
new Plot(
  plotElement,
  guiElement,
  dataPath,
  models,
  layers,
  numTimesteps,
  timestepInterval=100,
  minWeight=-0.5,
  maxWeight=0.5,
  weightDeltaScale=0.1
)
```
