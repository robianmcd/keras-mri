import os

from keras.engine.topology import InputLayer
from keras.models import Model
from flask import Flask, jsonify, send_from_directory

import sys
cli = sys.modules['flask.cli']
# Disable flask warning about using dev server https://gist.github.com/jerblack/735b9953ba1ab6234abb43174210d356
cli.show_server_banner = lambda *x: None

#inputs_batch is a numpy array if there is only one input to the model or a list of numpy arrays if there are multiple inputs
def visualize_model(model, inputs_batch):
    model._make_predict_function()
    batch_i = 0

    if len(inputs_batch) != len(model.inputs):
        raise ValueError(f'Expected number of inputs in inputs_batch ({len(inputs_batch)}) to match the number of input layers in the model ({len(model.inputs)})')

    for i, input_batch in enumerate(inputs_batch):


        for dim_i, layer_dim in enumerate(model.inputs[i].shape.as_list()):
            if layer_dim is not None and (len(input_batch.shape) <= dim_i or layer_dim != input_batch.shape[dim_i]):
                raise ValueError(f'Expected the shape of inputs_batch[{i}] {input_batch.shape} to match the shape of the corresponding input layer {model.inputs[i].shape}')

    if len(model.inputs) > 1:
        batch_size = len(inputs_batch[0])
    else:
        batch_size = len(inputs_batch)

    def get_next_inputs():
        nonlocal batch_i

        if len(model.inputs) > 1:
            next_input = [input[batch_i:batch_i+1] for input in inputs_batch]
        else:
            next_input = inputs_batch[batch_i:batch_i + 1]

        batch_i = (batch_i + 1) % batch_size

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

        return jsonify(model_config)

    @app.route("/predict")
    def predict():
        inputs = get_next_inputs()

        outputs = wrappedModel.predict(inputs)

        layer_outputs = {}

        inputI = 0
        outputI = 0
        for layer in model.layers:
            if isinstance(layer, InputLayer):
                layer_outputs[layer.name] = inputs[inputI].tolist()[0]
                inputI += 1
            else:
                layer_outputs[layer.name] = outputs[outputI].tolist()[0]
                outputI += 1

        return jsonify(layer_outputs)

    app.run()
