(function(){
    let nodeSpacing = 10;
    let ellipsisWidth = 21;
    let pointSize = 3;


    function getCanvasByName(nodeContainerElem, name) {
        let canvas = nodeContainerElem.querySelector('#' + name);
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = name;
            canvas.className = 'layer__canvas-2d';
            nodeContainerElem.appendChild(canvas);
        }

        return canvas;
    }

    function imageBuffersFromChannelArray(channelArray, pointSize) {
        let pointArea = Math.pow(pointSize, 2);
        let height = channelArray.length;
        let width = channelArray[0].length;
        let numChannels = channelArray[0][0].length;

        let imgBuffers = [];

        let maxValue = nestedArrayReducer(channelArray, -Infinity, Math.max);
        let minValue = nestedArrayReducer(channelArray, Infinity, Math.min);

        for(let channel = 0; channel < numChannels; channel++) {
            let buffer = new Uint8ClampedArray(width * height * pointArea * 4);

            //Based on https://stackoverflow.com/questions/22823752/creating-image-from-array-in-javascript-and-html5
            for(let y = 0; y < height; y++) {
                for(let x = 0; x < width; x++) {

                    for (let innerPointXOffset = 0; innerPointXOffset < pointSize; innerPointXOffset++) {
                        for (let innerPointYOffset = 0; innerPointYOffset < pointSize; innerPointYOffset++) {
                            let pixelRow = y * pointSize + innerPointYOffset;
                            let pixelCol = x * pointSize + innerPointXOffset;
                            let pixelOffset = (pixelRow * width * pointSize + pixelCol) * 4;
                            let greyscaleValue = (channelArray[y][x][channel] - minValue) / (maxValue - minValue) * 255;

                            buffer[pixelOffset] = greyscaleValue; // Red
                            buffer[pixelOffset + 1] = greyscaleValue; // Green
                            buffer[pixelOffset + 2] = greyscaleValue; // Blue
                            buffer[pixelOffset + 3] = 255; // Alpha
                        }
                    }

                }
            }

            imgBuffers.push(buffer);
        }

        return imgBuffers
    }

    function nestedArrayReducer(arr, initialValue, reducer) {
        return arr.reduce((acc, cur) => {
            if (Array.isArray(cur)) {
                cur = nestedArrayReducer(cur, initialValue, reducer);
            }
            return reducer(acc, cur);
        }, initialValue)
    }

    function drawEllipsis(nodeContainerElem) {
        let ellipsisElem = nodeContainerElem.querySelector('.layer__ellipse-2d');
        if (!ellipsisElem) {
            ellipsisElem = document.createElement('div');
            ellipsisElem.className = 'layer__ellipse-2d';
            ellipsisElem.textContent = '...';
            Object.assign(ellipsisElem.style, {
                font: '24px Arial',
                position: 'relative',
                'padding-bottom': '11px',
                width: ellipsisWidth + 'px'

            });
            nodeContainerElem.appendChild(ellipsisElem);
        }

        return ellipsisElem;
    }

    function drawNode(nodeContainerElem, externalWidth, externalHeight, imgWidth, imgHeight, pointSize, imgBuffer, channel) {
        // create off-screen canvas element
        let canvas = getCanvasByName(nodeContainerElem, 'canvas-' + channel);
        Object.assign(canvas.style, {
            border: '1px solid #838383',
            width: externalWidth + 'px',
            height: externalHeight + 'px'
        });
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = imgWidth * pointSize;
        canvas.height = imgHeight * pointSize;

        // create imageData object
        var imageData = ctx.createImageData(imgWidth * pointSize, imgHeight * pointSize);

        // set our buffer as source
        imageData.data.set(imgBuffer);

        // update canvas with new data
        ctx.imageSmoothingEnabled = false;
        ctx.putImageData(imageData, 0, 0);

        return canvas;
    }

    function getNodeScale(imgWidth, imgHeight, totalChannels, containerWidth) {
        let minChannels = Math.min(4, totalChannels);

        let showEllipsis = minChannels < totalChannels;
        let effectiveEllipseWidth = showEllipsis ? ellipsisWidth : 0;

        let nodeInternalWidth = imgWidth * pointSize;
        let nodeInternalHeight = imgHeight * pointSize;
        let nodeWithSpacingInternalWidth = nodeInternalWidth + nodeSpacing;
        let layerInternalWidth = nodeWithSpacingInternalWidth * minChannels + effectiveEllipseWidth;

        let nodeExternalWidth, nodeExternalHeight, numChannels, nodeScaleFactor;

        //Scale down nodes to fit in container
        if(layerInternalWidth > containerWidth) {
            numChannels = minChannels;
            nodeExternalWidth = (containerWidth - (nodeSpacing * numChannels) - effectiveEllipseWidth) / numChannels;
            nodeScaleFactor = nodeExternalWidth / (imgWidth*pointSize);
            nodeExternalHeight =  (imgHeight*pointSize) * nodeScaleFactor;

            //Add more nodes and scale up to fill container
        } else {
            numChannels = Math.floor((containerWidth - effectiveEllipseWidth) / nodeWithSpacingInternalWidth);

            showEllipsis = numChannels < totalChannels;
            effectiveEllipseWidth = showEllipsis ? ellipsisWidth : 0;

            nodeScaleFactor = (containerWidth - (nodeSpacing * numChannels) - effectiveEllipseWidth) / (numChannels * nodeInternalWidth);
            nodeScaleFactor = Math.min(1.5, nodeScaleFactor);
            nodeExternalWidth = nodeInternalWidth * nodeScaleFactor;
            nodeExternalHeight = nodeInternalHeight * nodeScaleFactor;
        }

        return {nodeExternalWidth, nodeExternalHeight, nodeScaleFactor, numChannels, showEllipsis}
    }

    window.LayerRenderer2DMixin = {
        created: function() {
            this.layerRenderer2DPixelPositions = [];
            this.layerRenderer2DNodePositions = [];
        },
        methods: {
            render2D: function (outputs, nodeContainerElem) {
                this.layerRenderer2DNodePositions = [];
                this.layerRenderer2DPixelPositions = [];

                //This results in a 650px wide layer. Info panel is 170px and layer border is 2px which leave 478px for
                // the layer nodes.
                nodeContainerElem.style.width = '478px';

                let containerComputedStyle = getComputedStyle(nodeContainerElem);
                let containerPadding = parseFloat(containerComputedStyle.paddingLeft) + parseFloat(containerComputedStyle.paddingRight);
                let containerWidth = nodeContainerElem.clientWidth - containerPadding;

                let inputImgHeight = outputs.length;
                let inputImgWidth = outputs[0].length;
                let totalChannels = outputs[0][0].length;

                let {nodeExternalWidth, nodeExternalHeight, nodeScaleFactor, numChannels, showEllipsis} =
                    getNodeScale(inputImgWidth, inputImgHeight, totalChannels, containerWidth);

                let buffers = imageBuffersFromChannelArray(outputs, pointSize);

                for(let channel = 0; channel < numChannels; channel++) {

                    if(showEllipsis && channel === numChannels - 1) {
                        channel = totalChannels - 1;

                        let ellipsisElem = drawEllipsis(nodeContainerElem);
                        let elipseRect = ellipsisElem.getBoundingClientRect();

                        this.layerRenderer2DNodePositions.push({elem: ellipsisElem, inputLayerI: 0, catchAll: true});
                        this.layerRenderer2DPixelPositions.push({
                            x: elipseRect.width/2,
                            y: elipseRect.height/2,
                            inputLayerI: 0,
                            elem: ellipsisElem,
                            catchAll: true
                        });
                    }

                    let nodeElem = drawNode(
                        nodeContainerElem,
                        nodeExternalWidth, nodeExternalHeight,
                        inputImgWidth, inputImgHeight,
                        pointSize,
                        buffers[channel],
                        channel
                    );
                    this.layerRenderer2DNodePositions.push({elem: nodeElem, inputLayerI: 0, catchAll: false});

                    for(let y = 0; y < inputImgHeight; y++) {
                        for(let x = 0; x < inputImgWidth; x++) {
                            this.layerRenderer2DPixelPositions.push({
                                x: x*pointSize*nodeScaleFactor,
                                y: y*pointSize*nodeScaleFactor,
                                inputLayerI: 0,
                                elem: nodeElem,
                                catchAll: false
                            });
                        }
                    }

                }
            },
            get2DNodePositions: function() {
                return this.layerRenderer2DNodePositions.map(nodePos => {
                    let elemRect = nodePos.elem.getBoundingClientRect();
                    return {
                        x: elemRect.left + document.documentElement.scrollLeft + elemRect.width/2,
                        y: elemRect.top + document.documentElement.scrollTop + elemRect.height/2,
                        inputLayerI: nodePos.inputLayerI,
                        catchAll: nodePos.catchAll

                    };
                });

            },
            get1DNodePositions: function() {
                return this.layerRenderer2DPixelPositions
                    .map(pixelPos => {
                        let elemRect = pixelPos.elem.getBoundingClientRect();
                        return {
                            x: pixelPos.x + document.documentElement.scrollLeft + elemRect.left,
                            y: pixelPos.y + document.documentElement.scrollTop + elemRect.top,
                            inputLayerI: pixelPos.inputLayerI,
                            catchAll: pixelPos.catchAll
                        };
                    });
            }
        }
    };

})();
