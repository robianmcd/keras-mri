class Api {
    getModel() {
        return fetch('/model')
            .then(r => r.json())
            //Adds additional fields to each layer
            //  - inboundLayerNames
            //  - outboundLayerNames
            //  - id
            //  - shape
            .then(model => {
                let layerMap = new Map();
                model.layers.forEach(layer => {
                    layer.id = layer.name;
                    layerMap.set(layer.name, layer);
                });

                model.layers.forEach(layer => {
                    layer.outboundLayerNames = layer.outboundLayerNames || [];

                    if(layer['inbound_nodes'].length > 0) {
                        //TODO: Why is inbound_nodes a 3D array?
                        layer.inboundLayerNames = layer['inbound_nodes'][0].map(node => {
                            let inboundLayerName = node[0];

                            let inboundLayer = layerMap.get(inboundLayerName);
                            inboundLayer.outboundLayerNames = inboundLayer.outboundLayerNames || [];
                            inboundLayer.outboundLayerNames.push(layer.name);

                            return inboundLayerName;
                        })
                    } else {
                        layer.inboundLayerNames = [];
                    }
                });

                return model;
            })
    }

    getLayerOutputs() {
        return fetch('/predict')
            .then(r => r.json());
    }
}

window.api = new Api();
