import os

from keras.engine.topology import InputLayer
from keras.models import Model
from flask import Flask, jsonify, send_from_directory

import sys
cli = sys.modules['flask.cli']
# Disable flask warning about using dev server https://gist.github.com/jerblack/735b9953ba1ab6234abb43174210d356
cli.show_server_banner = lambda *x: None

def visualize_model(model, get_next_input):
    model._make_predict_function()

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
        inputs = get_next_input()

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
