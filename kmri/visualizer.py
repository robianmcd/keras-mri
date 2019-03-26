import os

from keras.engine.topology import InputLayer
from keras.models import Model
from flask import Flask, jsonify, send_from_directory, request
import json
import numpy as np
import math

import sys
cli = sys.modules['flask.cli']
# Disable flask warning about using dev server https://gist.github.com/jerblack/735b9953ba1ab6234abb43174210d356
cli.show_server_banner = lambda *x: None

#inputs_batch is a numpy array if there is only one input to the model or a list of numpy arrays if there are multiple inputs
def visualize_model(model, inputs_batch):
    model._make_predict_function()
    multiple_inputs = len(model.inputs) > 1

    if multiple_inputs:
        if len(inputs_batch) != len(model.inputs):
            raise ValueError(f'Expected number of inputs in inputs_batch ({len(inputs_batch)}) to match the number of input layers in the model ({len(model.inputs)})')

        for i, input_batch in enumerate(inputs_batch):
            for dim_i, layer_dim in enumerate(model.inputs[i].shape.as_list()):
                if layer_dim is not None and (len(input_batch.shape) <= dim_i or layer_dim != input_batch.shape[dim_i]):
                    raise ValueError(f'Expected the shape of inputs_batch[{i}] {input_batch.shape} to match the shape of the corresponding input layer {model.inputs[i].shape}')
    else:
        # TODO: validate single input shape
        pass

    if multiple_inputs:
        batch_size = len(inputs_batch[0])
    else:
        batch_size = len(inputs_batch)

    #batch_i is incremented before it is used so this will cause it to wrap around to 0 the first time a prediction is made.
    batch_i = batch_size - 1

    def get_next_inputs(reverse):
        nonlocal batch_i

        if reverse:
            batch_i = (batch_i + batch_size - 1) % batch_size
        else:
            batch_i = (batch_i + 1) % batch_size

        if multiple_inputs:
            next_input = [input[batch_i:batch_i+1] for input in inputs_batch]
        else:
            next_input = inputs_batch[batch_i:batch_i + 1]

        return next_input

    layer_outputs = [layer.output for layer in model.layers if not isinstance(layer, InputLayer)]

    wrappedModel = Model(inputs=model.inputs, outputs=layer_outputs)
    wrappedModel._make_predict_function()

    static_folder = 'ui/'
    static_folder_relative_to_cwd = os.path.dirname(__file__) + '/' + static_folder

    app = Flask(__name__, static_folder=static_folder)

    # Serve UI
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(static_folder_relative_to_cwd + path):
            return send_from_directory(static_folder, path)
        else:
            return send_from_directory(static_folder, 'index.html')

    @app.route("/model")
    def get_model():
        model_config = model.get_config()

        for layer_config in model_config['layers']:
            layer = model.get_layer(layer_config['name'])
            #Need to convert everything to int as it can be np.int32 which is not json serializable
            layer_config['outputShape'] = [int(x) for x in layer.output_shape[1:]]

        return json.dumps(model_config, default = lambda o: '<not serializable>')

    @app.route("/predict")
    def predict():
        reverse = (request.args.get('reverse') == 'true')
        inputs = get_next_inputs(reverse)

        outputs = wrappedModel.predict(inputs)

        layer_outputs = {}

        inputI = 0
        outputI = 0
        for layer in model.layers:
            if isinstance(layer, InputLayer):
                if multiple_inputs:
                    layer_output = inputs[inputI][0]
                else:
                    layer_output = inputs[0]
                inputI += 1
            else:
                layer_output = outputs[outputI][0]
                outputI += 1

            if len(layer_output.shape) == 3:
                max_channels = getMax2DChannels(layer_output)
                layer_output = layer_output[:,:, :max_channels]

            layer_output = roundOutput(layer_output)

            layer_outputs[layer.name] = layer_output.tolist()

        return jsonify(layer_outputs)

    #performance hack to try to avoid sending images that won't be shown (e.g. images that wouldn't fit in 600px)
    def getMax2DChannels(output):
        return max(math.ceil(600 / output.shape[1]), 5)

    #performance hack to make the stringified numbers (and the resulting JSON) take up less space
    def roundOutput(arr):
        absolute_max = max(abs(arr.min()), abs(arr.max()))
        log_digits = math.ceil(math.log10(absolute_max))
        precision = 2
        decimals = min(log_digits - precision, 0) * -1
        # If we don't cast to float64 the numbers get rounding errors when calling tolist()
        # https://stackoverflow.com/questions/20454332/precision-of-numpy-array-lost-after-tolist
        return np.around(arr.astype(np.float64), decimals)

    app.run()
