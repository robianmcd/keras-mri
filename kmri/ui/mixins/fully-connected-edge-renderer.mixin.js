(function() {
    let modelStore = window.modelStore;
    let EdgeTypeEnum = window.EdgeTypeEnum;
    let LayerMixin = window.LayerMixin;

    window.FullyConnectedEdgeRendererMixin = {
        data: function() {
            return {
                edgeType: EdgeTypeEnum.FULLY_CONNECTED
            };
        },
        methods: {
            drawEdges() {
                if(!modelStore.initialized) {
                    throw new Error('modelStore should be initialized before drawing edges');
                }
                let inputName = this.layer.inboundLayerNames[0];
                let inputLayer = modelStore.layerMap.get(inputName);

                if(inputLayer.comp && inputLayer.comp.getNodePositions) {
                    let nodePositions = this.getNodePositions();

                    inputLayer.comp.getNodePositions().forEach(inputNodePos => {

                        if(inputNodePos.catchAll) {
                            return;
                        }

                        nodePositions.forEach(curLayerNodePos => {
                            if(curLayerNodePos.catchAll) {
                                return;
                            }

                            LayerMixin.drawEdge(inputNodePos, curLayerNodePos);
                        })
                    })
                }
            }
        }
    };


})();
