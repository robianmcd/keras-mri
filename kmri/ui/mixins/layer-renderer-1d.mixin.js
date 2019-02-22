(function(){
    let EdgeTypeEnum = window.EdgeTypeEnum;

    let nodeWidth = 10;
    let nodeHeight = 10;
    let borderMargin = 2;
    let radiusX = (nodeWidth - borderMargin) / 2;
    let radiusY = (nodeHeight - borderMargin) / 2;
    let nodesPerElipse = 3;
    let canvasMaxWidth = 458;

    function getCanvas(nodeContainerElem) {
        let canvas = nodeContainerElem.querySelector('#layerCanvas1D');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'layerCanvas1D';
            canvas.className = 'layer__canvas-1d';
            nodeContainerElem.appendChild(canvas);
        }

        return canvas;
    }

    function getNumLayerNodes(layer) {
        return layer.outputShape.reduce((dimension, total) => total * dimension, 1);
    }

    function getNumNodesByInputIndex(inputLayers, totalNodesShown) {
        //Indicies of input layers ordered but the number of nodes in the input layer (ascending)
        let layerOrder = inputLayers
            .map((layer, i) => ({layer, i}))
            .sort((l1, l2) => {
                l1NumNodes = getNumLayerNodes(l1.layer);
                l2NumNodes = getNumLayerNodes(l2.layer);

                return l1NumNodes - l2NumNodes;
            })
            .map(l => l.i);

        let numRemainingNodes = totalNodesShown;
        let numNodesByInputIndex = [];
        layerOrder.forEach((layerI, i) => {
            numNodesByInputIndex[layerI] = Math.min(
                Math.floor(numRemainingNodes / (inputLayers.length - i)),
                getNumLayerNodes(inputLayers[layerI])
            );
        });

        return numNodesByInputIndex;
    }

    function drawNode(i, output, nodesPerRow, maxOutput, truncate, ctx, nodePositions, inputLayerI) {
        let row = Math.floor(i / nodesPerRow);
        let iInRow = i % nodesPerRow;
        let rowXOffset = row % 2 === 1 ? nodeWidth/2 : 0;

        let centerX = rowXOffset + iInRow * nodeWidth + nodeWidth / 2;
        let centerY = row * nodeHeight + nodeHeight / 2;

        if(truncate) {
            ctx.font = "24px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(`...`, centerX, centerY);
            centerX += 30;
        }

        let outputPercent = Math.round(output/Math.max(1, maxOutput) * 100);

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

        nodePositions.push({x: centerX, y: centerY, inputLayerI});
        //ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = `hsl(200,80%,${100 - outputPercent/2}%)`;
        ctx.fill();
        ctx.lineWidth = 0.7;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }

    const MAX_TRUNCATED_NODES = 40;

    window.LayerRenderer1DMixin = {
        data: function() {
            return {
                layerRenderer1DNodeCanvas: undefined,
                layerRenderer1DRelNodePositions: []
            };
        },
        methods: {
            render1D: function(outputs, nodeContainerElem, truncate=true, normalize=true) {
                let canvasWidth = Math.min(canvasMaxWidth, (outputs.length + 1) * nodeWidth);
                let nodesPerRow = Math.floor(canvasWidth / nodeWidth) - 1;
                let numRows = Math.ceil(outputs.length / nodesPerRow);

                let canvas = getCanvas(nodeContainerElem);
                this.layerRenderer1DNodeCanvas = canvas;
                let ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                canvas.width = canvasWidth;
                canvas.height = truncate ? nodeHeight : numRows*nodeHeight;

                if(normalize) {
                    let minOutput = Math.min(...outputs);
                    outputs = outputs.map(o => o - minOutput);
                }
                let maxOutput = Math.max(...outputs);

                let numNodesShown = truncate ? Math.min(MAX_TRUNCATED_NODES, outputs.length) : outputs.length;

                this.layerRenderer1DRelNodePositions = [];

                if(this.edgeType === EdgeTypeEnum.ONE_TO_ONE) {
                    let inputLayers = this.layer.inboundLayerNames
                        .map(name => modelStore.layerMap.get(name))
                        .filter(layer => layer.comp && layer.comp.getNodePositions);

                    let numNodesByInputIndex = getNumNodesByInputIndex(inputLayers, numNodesShown);

                    let layerNodeOffset = 0;
                    let nodeI = 0;

                    inputLayers.forEach((inputLayer, inputLayerI) => {
                        let numNodesForLayer = numNodesByInputIndex[inputLayerI];
                        let truncateLayer = (getNumLayerNodes(inputLayer) > numNodesForLayer);
                        if (truncateLayer) {
                            numNodesForLayer -= nodesPerElipse;
                        }


                        for (let layerNodeI = 0; layerNodeI < numNodesForLayer; layerNodeI++, nodeI++) {
                            let output = outputs[layerNodeI + layerNodeOffset];
                            let truncateNode = truncateLayer && (layerNodeI === numNodesForLayer-1);
                            drawNode(nodeI, output, nodesPerRow, maxOutput, truncateNode, ctx, this.layerRenderer1DRelNodePositions, inputLayerI);

                            if(truncateNode) {
                                nodeI += nodesPerElipse;
                            }
                        }

                        layerNodeOffset += getNumLayerNodes(inputLayer);
                    });

                } else {
                    for (let i = 0; i < numNodesShown; i++) {
                        let truncateNode = (i + 1 === MAX_TRUNCATED_NODES);
                        drawNode(i, outputs[i], nodesPerRow, maxOutput, truncateNode, ctx, this.layerRenderer1DRelNodePositions, -1);
                    }
                }
            },
            get1DNodePositions: function() {
                let canvasRect = this.layerRenderer1DNodeCanvas.getBoundingClientRect();

                return this.layerRenderer1DRelNodePositions.map(relPos => {
                    return {
                        x: relPos.x + canvasRect.left + document.documentElement.scrollLeft,
                        y: relPos.y + canvasRect.top + document.documentElement.scrollTop,
                        inputLayerI: relPos.inputLayerI
                    }
                });
            }
        }
    };


})();
