(function() {
    let modelStore = window.modelStore;
    let EdgeTypeEnum = window.EdgeTypeEnum;

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
                    let edgeCanvas = document.getElementById("app__edge-canvas");
                    let edgeCanvasRect = edgeCanvas.getBoundingClientRect();
                    let ctx = edgeCanvas.getContext("2d");

                    let nodePositions = this.getNodePositions();

                    inputLayer.comp.getNodePositions().forEach(inputNodePos => {
                        nodePositions.forEach(curLayerNodePos => {
                            ctx.beginPath();

                            let x0 = inputNodePos.x - edgeCanvasRect.left - document.documentElement.scrollLeft;
                            let y0 = inputNodePos.y - edgeCanvasRect.top - document.documentElement.scrollTop;
                            let x1 = curLayerNodePos.x - edgeCanvasRect.left - document.documentElement.scrollLeft;
                            let y1 = curLayerNodePos.y - edgeCanvasRect.top - document.documentElement.scrollTop;

                            ctx.strokeStyle = '#3d3d3d';
                            ctx.globalAlpha = 0.4;
                            ctx.lineWidth = 1;
                            ctx.moveTo(x0, y0);
                            ctx.lineTo(x1, y1);
                            ctx.stroke();
                        })
                    })
                }
            }
        }
    };


})();
