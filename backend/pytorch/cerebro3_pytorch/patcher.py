# torch imports
import torch.nn as nn


class Patcher:
    def __init__(self):
        pass
    
    # Takes a pytorch nn.module as `network`
    def patch(self, network, name=None):
        # set name if it's not set
        if name is None:
            name = network.__class__.__name__

        # register a hook for the backward pass
        network.register_backward_hook(self.create_backward_hook(name))
    
    def create_backward_hook(self, name):
        # create a closure that wraps the name
        def backward_hook(network, input, output):
            print(name)
            # print weights of layers
            for layer in network.modules():
                if isinstance(layer, nn.Linear):
                    print(layer.weight.norm())
            print("----------")
        
        return backward_hook
