import json
import numpy as np
import os
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
        
        return backward_hook
    
    def save(self, path, timestep_interval=1):
        # make sure folder at specified path exists
        expandedPath = os.path.expanduser(path)  # expand ~
        folder = "{0}/{1}".format(expandedPath, self.name)
        os.makedirs(folder, exist_ok=True)

        # save each timestep as a PNG to the specified path folder
        for timestep_index, timestep in enumerate(self.timesteps):
            # only keep timesteps with the specified interval
            if timestep_index % timestep_interval != 0:
                continue

            # save each layer's weights as a PNG
            for layer_index, layer in enumerate(timestep):
                # convert weights to range [0, 255]
                data = ((layer["weights"] + 1) / 2) * 255

                # create image from data
                img = Image.fromarray(data).convert("L")

                # save image to its designated path
                img_path = "{0}/layer-{1}_timestep-{2}.png".format(
                    folder, layer_index, timestep_index)
                img.save(img_path)


# For use with json.dump
def dump_convert(obj):
    if type(obj).__module__ == np.__name__:
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return obj.item()
    raise TypeError('Unknown type:', type(obj))
