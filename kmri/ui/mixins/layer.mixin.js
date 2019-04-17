(function () {
    window.LayerMixin = {
        props: ['layer', 'layerOutput'],
        created: function () {
            this.layer.comp = this;
        },
        data: function () {
            return {};
        },
        methods: {
            getNodePositions(dim) {
                dim = dim || this.getNodeDimension();
                return this[`get${dim}DNodePositions`]();
            },
            render(...params) {
                let dim = this.getNodeDimension();
                return this[`render${dim}D`](...params);
            },
            getNodeDimension() {
                return Math.max(1, this.layer.outputShape.length - 1)
            },
            getInputLayerNodePosition(inputLayer) {
                return inputLayer.comp.getNodePositions(this.getNodeDimension());
            },
            onLayerOutputChange() {
                this.render(this.layerOutput, this.$refs['node_container']);
            }
        },
        watch: {
            layerOutput: function () {
                this.onLayerOutputChange();
            }
        },

        getNumNodesByInputIndex(inputLayers, totalNodesShown) {
            //Indicies of input layers ordered but the number of nodes in the input layer (ascending)
            let layerOrder = inputLayers
                .map((layer, i) => ({layer, i}))
                .sort((l1, l2) => {
                    l1NumNodes = this.getNumLayerNodes(l1.layer);
                    l2NumNodes = this.getNumLayerNodes(l2.layer);

                    return l1NumNodes - l2NumNodes;
                })
                .map(l => l.i);

            const MIN_NODES_PER_LAYER = 2;

            let numRemainingNodes = totalNodesShown;
            if (inputLayers.length > 1) {
                //reserve at least 2 nodes for the last layer
                numRemainingNodes -= 2;
            }
            let numNodesByInputIndex = [];
            layerOrder.forEach((layerI, i) => {
                let nodesForCurLayer = Math.min(
                    Math.floor(numRemainingNodes / (inputLayers.length - i)),
                    this.getNumLayerNodes(inputLayers[layerI])
                );

                nodesForCurLayer = Math.max(nodesForCurLayer, MIN_NODES_PER_LAYER);
                //If there aren't going to be any nodes left for the last layer then skip each layer until we get to the last layer
                if (numRemainingNodes - MIN_NODES_PER_LAYER - nodesForCurLayer < 0 && i < layerOrder.length - 1) {
                    nodesForCurLayer = 0;
                }

                numNodesByInputIndex[layerI] = nodesForCurLayer;
            });

            // console.log('blarg', numNodesByInputIndex);

            return numNodesByInputIndex;
        },

        getNumLayerNodes(layer) {
            return layer.outputShape.reduce((dimension, total) => total * dimension, 1);
        },

        drawEdge(fromNodePos, toNodePos, dottedLine = false) {
            let edgeCanvas = document.getElementById("app__edge-canvas");
            let edgeCanvasRect = edgeCanvas.getBoundingClientRect();
            let ctx = edgeCanvas.getContext("2d");

            ctx.beginPath();

            let x0 = fromNodePos.x - edgeCanvasRect.left - document.documentElement.scrollLeft;
            let y0 = fromNodePos.y - edgeCanvasRect.top - document.documentElement.scrollTop;
            let x1 = toNodePos.x - edgeCanvasRect.left - document.documentElement.scrollLeft;
            let y1 = toNodePos.y - edgeCanvasRect.top - document.documentElement.scrollTop;

            if(toNodePos.catchAll) {
                let gradient = ctx.createLinearGradient(x0, y0, x1, y1);
                gradient.addColorStop(0, "#3d3d3d");
                gradient.addColorStop(0.5, "#3d3d3d");
                gradient.addColorStop(1, "#ffffff00");
                ctx.strokeStyle = gradient;
            } else if(fromNodePos.catchAll) {
                let gradient = ctx.createLinearGradient(x0, y0, x1, y1);
                gradient.addColorStop(0, "#ffffff00");
                gradient.addColorStop(0.5, "#3d3d3d");
                gradient.addColorStop(1, "#3d3d3d");
                ctx.strokeStyle = gradient;
            } else {
                ctx.strokeStyle = '#3d3d3d';
            }
            ctx.globalAlpha = 0.4;
            ctx.lineWidth = 1;

            if(dottedLine) {
                ctx.setLineDash([5, 3]);
            }

            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();

            ctx.setLineDash([1, 0]);
        }
    };

})();
