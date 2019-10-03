# Cerebro 3

Pytorch backend for Cerebro 3 (a web-based visualization platform for Neural Networks.)

## Installation

(Any changes to the package propagate to users of the package on the local machine instantly.)

In this package's directory, run `pip install -e .`

## Usage

1. Import `Patcher`:

> from cerebro3_pytorch.patcher import Patcher

2. Patch the network (any `nn.Module`):

> patcher = Patcher("NETWORK_NAME")
> patcher.patch(module)

3. After training the network, save the visualizations data:

> patcher.save(PATH, timestep_interval=10)
