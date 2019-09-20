import json
import numpy as np
from PIL import Image
import torch.nn as nn


class Patcher:
    def __init__(self, name):
        # save parameters
        self.name = name

        # initialize timesteps list
        self.timesteps = []
    
    # Takes a pytorch nn.module as `network`
    def patch(self, network):
        # register a hook for the backward pass
        network.register_backward_hook(self.create_backward_hook())
    
    def create_backward_hook(self):
        # create a closure for the backward hook
        def backward_hook(network, input, output):
            # create a timestep
            timestep = []

            # add info from each layer into timestep
            for layer in network.modules():
                # TODO: check for other types of layers
                if isinstance(layer, nn.Linear):
                    timestep.append({
                        "weights": layer.weight.clone().numpy()
                    })
            
            # add timestep to list of timesteps
            self.timesteps.append(timestep)

            print(len(self.timesteps))
        
        return backward_hook
    
    def save(self, path):
        for timestep_index, timestep in enumerate(self.timesteps):
            for layer_index, layer in enumerate(timestep):
                data = ((layer["weights"] + 1) / 2) * 255
                img = Image.fromarray(data).convert("L")
                img_path = "{0}/{1}/layer-{2}_timestep-{3}.png".format(path, self.name, layer_index, timestep_index)
                print(img_path)
                img.save(img_path)


# For use with json.dump
def dump_convert(obj):
    if type(obj).__module__ == np.__name__:
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return obj.item()
    raise TypeError('Unknown type:', type(obj))
