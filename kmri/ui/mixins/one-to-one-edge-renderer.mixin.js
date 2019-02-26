(function() {
    let modelStore = window.modelStore;
    let EdgeTypeEnum = window.EdgeTypeEnum;

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

                let edgeCanvas = document.getElementById("app__edge-canvas");
                let edgeCanvasRect = edgeCanvas.getBoundingClientRect();
                let ctx = edgeCanvas.getContext("2d");

                let inputLayers = this.layer.inboundLayerNames
                    .map(name => modelStore.layerMap.get(name))
                    .filter(layer => layer.comp);

                inputLayers.forEach((inputLayer, layerI) => {
                    let inputNodePositions = inputLayer.comp.getNodePositions(this.getNodeDimension());

                    let curLayerNodePositions = this.getNodePositions()
                        .filter(nodePos => nodePos.inputLayerI === layerI);

                    curLayerNodeI = 0;
                    pointToElipse = false;
                    inputNodePositions
                        .forEach((inputNodePos, inputNodeI) => {
                            let curLayerNodePos = curLayerNodePositions[curLayerNodeI];

                            //TODO: move edge drawing into shared location
                            let elipseOffset = pointToElipse ? 20 : 0;
                            ctx.beginPath();

                            let x0 = inputNodePos.x - edgeCanvasRect.left - document.documentElement.scrollLeft;
                            let y0 = inputNodePos.y - edgeCanvasRect.top - document.documentElement.scrollTop;
                            let x1 = curLayerNodePos.x - edgeCanvasRect.left + elipseOffset - document.documentElement.scrollLeft;
                            let y1 = curLayerNodePos.y - edgeCanvasRect.top - document.documentElement.scrollTop;

                            if(pointToElipse) {
                                let gradient = ctx.createLinearGradient(x0, y0, x1, y1);

                                gradient.addColorStop("0", "#3d3d3d");
                                gradient.addColorStop("0.5" ,"#3d3d3d");
                                gradient.addColorStop("1.0", "white");
                                ctx.strokeStyle = gradient;
                            } else {
                                ctx.strokeStyle = '#3d3d3d';
                            }
                            ctx.globalAlpha = 0.4;
                            ctx.lineWidth = 1;
                            ctx.moveTo(x0, y0);
                            ctx.lineTo(x1, y1);
                            ctx.stroke();

                            if(curLayerNodeI < curLayerNodePositions.length - 2 || inputNodeI + 1 === inputNodePositions.length - 1) {
                                curLayerNodeI++;
                                pointToElipse = false;
                            } else {
                                pointToElipse = true;
                            }
                        });
                });

            }
        }
    };


})();
