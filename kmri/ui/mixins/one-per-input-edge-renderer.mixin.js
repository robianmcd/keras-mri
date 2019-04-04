(function() {
    let modelStore = window.modelStore;
    let EdgeTypeEnum = window.EdgeTypeEnum;
    let LayerMixin = window.LayerMixin;


    window.OnePerInputEdgeRendererMixin = {
        data: function() {
            return {
                edgeType: EdgeTypeEnum.ONE_PER_INPUT_T0_ONE
            };
        },
        methods: {
            drawEdges() {
                if(!modelStore.initialized) {
                    throw new Error('modelStore should be initialized before drawing edges');
                }

                let inputLayers = this.layer.inboundLayerNames
                    .map(name => modelStore.layerMap.get(name))
                    .filter(layer => layer.comp);

                let curLayerNodePositions = this.getNodePositions();

                inputLayers.forEach((inputLayer, layerI) => {
                    let inputNodePositions = this.getInputLayerNodePosition(inputLayer);

                    for (var i = 0; i < curLayerNodePositions.length; i++) {
                        let curLayerNodePos = curLayerNodePositions[i];
                        let inputNodePos = inputNodePositions[i];

                        if(!curLayerNodePos.catchAll) {
                            LayerMixin.drawEdge(inputNodePos, curLayerNodePos);
                        }
                    }


                });

            }
        }
    };


})();
