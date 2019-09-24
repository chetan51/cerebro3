# Cerebro 3

Pytorch backend for Cerebro 3 (a web-based visualization platform for Neural Networks.)

## Installation

### From pip

Run `pip install cerebro3_pytorch`

### During development

(Any changes to the package propagate to users of the package instantly.)

Run `pip install -e .`

## Usage

1. Import `Patcher`:

> from cerebro3_pytorch.patcher import Patcher

2. Patch the network (any `nn.Module`):

> patcher = Patcher("DenseReLU")
> patcher.patch(module)

3. After training the network, save the visualizations data:

> patcher.save(path, timestep_interval=100)
