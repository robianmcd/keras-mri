(function() {
    let modelStore = window.modelStore;
    let EdgeTypeEnum = window.EdgeTypeEnum;
    let LayerMixin = window.LayerMixin;

    window.OneToOneEdgeRendererMixin = {
        data: function() {
            return {
                edgeType: EdgeTypeEnum.ONE_TO_ONE
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

                inputLayers.forEach((inputLayer, layerI) => {
                    let inputNodePositions = this.getInputLayerNodePosition(inputLayer);

                    let curLayerNodePositions = this.getNodePositions()
                        .filter(nodePos => nodePos.inputLayerI === layerI);

                    let curLayerIterData = {
                        i: 0,
                        nodePositions: curLayerNodePositions
                    };

                    let inputIterData = {
                        i: 0,
                        nodePositions: inputNodePositions
                    };

                    while (curLayerIterData.i < curLayerNodePositions.length && inputIterData.i < inputNodePositions.length) {
                        let curLayerNodePos = curLayerNodePositions[curLayerIterData.i];
                        let inputNodePos = inputNodePositions[inputIterData.i];

                        if(curLayerNodePos.catchAll && inputNodePos.catchAll) {
                            let curLayerRemainingNodes = curLayerNodePositions.length - curLayerIterData.i - 1;
                            let inputRemainingNodes = inputNodePositions.length - inputIterData.i - 1;
                            if(curLayerRemainingNodes >= inputRemainingNodes) {
                                curLayerIterData.i++;
                            }
                            if (inputRemainingNodes >= curLayerRemainingNodes) {
                                inputIterData.i++;
                            }
                        } else if (curLayerNodePos.catchAll !== inputNodePos.catchAll) {
                            LayerMixin.drawEdge(inputNodePos, curLayerNodePos, this.dottedLine);

                            let catchAllIterData;
                            let normalIterData;

                            if(curLayerNodePos.catchAll) {
                                catchAllIterData = curLayerIterData;
                                normalIterData = inputIterData;
                            } else {
                                catchAllIterData = inputIterData;
                                normalIterData = curLayerIterData;
                            }

                            if(normalIterData.i  === normalIterData.nodePositions.length - 2) {
                                catchAllIterData.i++;
                            }
                            normalIterData.i++;

                        } else {
                            LayerMixin.drawEdge(inputNodePos, curLayerNodePos, this.dottedLine);

                            curLayerIterData.i++;
                            inputIterData.i++;
                        }
                    }
                });

            }
        }
    };


})();
