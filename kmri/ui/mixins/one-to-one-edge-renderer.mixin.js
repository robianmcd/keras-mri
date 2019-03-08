(function() {
    let modelStore = window.modelStore;
    let EdgeTypeEnum = window.EdgeTypeEnum;

    function linkNodes(fromNodePos, toNodePos) {
        // let curLayerNodePos = curLayerNodePositions[curLayerNodeI];

        // if(!curLayerNodePos) {
        //     return;
        // }

        let edgeCanvas = document.getElementById("app__edge-canvas");
        let edgeCanvasRect = edgeCanvas.getBoundingClientRect();
        let ctx = edgeCanvas.getContext("2d");

        //TODO: move edge drawing into shared location
        // let elipseOffset = pointToElipse ? 20 : 0;
        ctx.beginPath();

        let x0 = fromNodePos.x - edgeCanvasRect.left - document.documentElement.scrollLeft;
        let y0 = fromNodePos.y - edgeCanvasRect.top - document.documentElement.scrollTop;
        let x1 = toNodePos.x - edgeCanvasRect.left - document.documentElement.scrollLeft;
        let y1 = toNodePos.y - edgeCanvasRect.top - document.documentElement.scrollTop;

        if(toNodePos.catchAll) {
            let gradient = ctx.createLinearGradient(x0, y0, x1, y1);
            gradient.addColorStop("0", "#3d3d3d");
            gradient.addColorStop("0.5", "#3d3d3d");
            gradient.addColorStop("1.0", "white");
            ctx.strokeStyle = gradient;
        } else if(fromNodePos.catchAll) {
            let gradient = ctx.createLinearGradient(x0, y0, x1, y1);
            gradient.addColorStop("0", "white");
            gradient.addColorStop("0.5", "#3d3d3d");
            gradient.addColorStop("1.0", "#3d3d3d");
            ctx.strokeStyle = gradient;
        } else {
            ctx.strokeStyle = '#3d3d3d';
        }
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 1;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        // if(curLayerNodeI < curLayerNodePositions.length - 2 || inputNodeI + 1 === inputNodePositions.length - 1) {
        //     curLayerNodeI++;
        //     pointToElipse = false;
        // } else {
        //     pointToElipse = true;
        // }
    }

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
                    let inputNodePositions = inputLayer.comp.getNodePositions(this.getNodeDimension());

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
                            linkNodes(inputNodePos, curLayerNodePos);

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
                            linkNodes(inputNodePos, curLayerNodePos);

                            curLayerIterData.i++;
                            inputIterData.i++;
                        }
                    }
                });

            }
        }
    };


})();
