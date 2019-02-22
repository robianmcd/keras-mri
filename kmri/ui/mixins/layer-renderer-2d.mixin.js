(function(){
    let nodeSpacing = 10;
    let ellipseWidth = 21;
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

    function imageBuffersFromChannelArray(channelArray, pointSize, nodeScaleFactor, pixelPositions) {
        let pointArea = pointSize**2;
        let height = channelArray.length;
        let width = channelArray[0].length;
        let numChannels = channelArray[0][0].length;

        let imgBuffers = [];

        for(let channel = 0; channel < numChannels; channel++) {
            let buffer = new Uint8ClampedArray(width * height * pointArea * 4);

            //Based on https://stackoverflow.com/questions/22823752/creating-image-from-array-in-javascript-and-html5
            for(let y = 0; y < height; y++) {
                for(let x = 0; x < width; x++) {
                    pixelPositions.push({
                        x: x*pointSize*nodeScaleFactor,
                        y: y*pointSize*nodeScaleFactor,
                        channel,
                        pointSize
                    });

                    for (let innerPointXOffset = 0; innerPointXOffset < pointSize; innerPointXOffset++) {
                        for (let innerPointYOffset = 0; innerPointYOffset < pointSize; innerPointYOffset++) {
                            let pixelRow = y * pointSize + innerPointYOffset;
                            let pixelCol = x * pointSize + innerPointXOffset;
                            let pixelOffset = (pixelRow * width * pointSize + pixelCol) * 4;
                            let greyscaleValue = channelArray[y][x][channel] * 255;

                            buffer[pixelOffset] = greyscaleValue; // Red
                            buffer[pixelOffset + 1] = greyscaleValue; // Green
                            buffer[pixelOffset + 2] = greyscaleValue; // Blue
                            buffer[pixelOffset + 3] = 255; // Alpha
                        }
                    }

                }
            }

            imgBuffers.push(buffer)
        }

        return imgBuffers
    }

    window.LayerRenderer2DMixin = {
        data: function() {
            return {
                layerRenderer2DPixelPositions: [],
                layerRenderer2DNodeElems: []
            };
        },
        methods: {
            render2D: function (outputs, nodeContainerElem) {
                this.layerRenderer2DNodeElems = [];
                this.layerRenderer2DPixelPositions = [];

                //This results in a 650px wide layer. Info panel is 170px and layer border is 2px which leave 478px for
                // the layer nodes.
                nodeContainerElem.style.width = '478px';

                let containerComputedStyle = getComputedStyle(nodeContainerElem);
                let containerPadding = parseFloat(containerComputedStyle.paddingLeft) + parseFloat(containerComputedStyle.paddingRight);
                let containerWidth = nodeContainerElem.clientWidth - containerPadding;

                let height = outputs.length;
                let width = outputs[0].length;
                let totalChannels = outputs[0][0].length;

                let minChannels = Math.min(4, totalChannels);

                let showEllipse = minChannels < totalChannels;
                let effectiveEllipseWidth = showEllipse ? ellipseWidth : 0;

                let nodeRawWidth = width * pointSize;
                let nodeRawHeight = height * pointSize;
                let nodeWithSpacingRawWidth = nodeRawWidth + nodeSpacing;
                let layerRawWidth = nodeWithSpacingRawWidth * minChannels + effectiveEllipseWidth;

                let nodeWidth, nodeHeight, numChannels, nodeScaleFactor;

                //Scale down nodes to fit in container
                if(layerRawWidth > containerWidth) {
                    numChannels = minChannels;
                    nodeWidth = (containerWidth - (nodeSpacing * numChannels) - effectiveEllipseWidth) / numChannels;
                    nodeScaleFactor = nodeWidth / (width*pointSize);
                    nodeHeight =  (height*pointSize) * nodeScaleFactor;

                //Add more nodes and scale up to fill container
                } else {
                    numChannels = Math.floor((containerWidth - effectiveEllipseWidth) / nodeWithSpacingRawWidth);

                    showEllipse = numChannels < totalChannels;
                    effectiveEllipseWidth = showEllipse ? ellipseWidth : 0;

                    nodeScaleFactor = (containerWidth - (nodeSpacing * numChannels) - effectiveEllipseWidth) / (numChannels * nodeRawWidth);
                    nodeScaleFactor = Math.min(1.5, nodeScaleFactor);
                    nodeWidth = nodeRawWidth * nodeScaleFactor;
                    nodeHeight = nodeRawHeight * nodeScaleFactor;
                }


                let buffers = imageBuffersFromChannelArray(outputs, pointSize, nodeScaleFactor, this.layerRenderer2DPixelPositions);

                for(let channel = 0; channel < numChannels; channel++) {

                    if(showEllipse && channel === numChannels - 1) {
                        channel = totalChannels - 1;

                        let ellipseElem = nodeContainerElem.querySelector('.layer__ellipse-2d');
                        if (!ellipseElem) {
                            ellipseElem = document.createElement('div');
                            ellipseElem.className = 'layer__ellipse-2d';
                            ellipseElem.textContent = '...';
                            Object.assign(ellipseElem.style, {
                                font: '24px Arial',
                                position: 'relative',
                                top: '-8px',
                                width: ellipseWidth + 'px'

                            });
                            nodeContainerElem.appendChild(ellipseElem);
                        }

                    }

                    // create off-screen canvas element
                    let canvas = getCanvasByName(nodeContainerElem, 'canvas-' + channel);
                    Object.assign(canvas.style, {
                        border: '1px solid #838383',
                        width: nodeWidth + 'px',
                        height: nodeHeight + 'px'
                    });
                    let ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    canvas.width = width * pointSize;
                    canvas.height = height * pointSize;

                    // create imageData object
                    var imageData = ctx.createImageData(width * pointSize, height * pointSize);

                    // set our buffer as source
                    imageData.data.set(buffers[channel]);

                    // update canvas with new data
                    ctx.imageSmoothingEnabled = false;
                    ctx.putImageData(imageData, 0, 0);

                    this.layerRenderer2DNodeElems.push(canvas);

                }
            },
            get2DNodePositions: function() {
                return this.layerRenderer2DNodeElems.map(nodeCanvas => {
                    let canvasRect = nodeCanvas.getBoundingClientRect();
                    return {
                        x: canvasRect.left + document.documentElement.scrollLeft + canvasRect.width/2,
                        y: canvasRect.top + document.documentElement.scrollTop + canvasRect.height/2
                    };
                });

            },
            get1DNodePositions: function() {
                return this.layerRenderer2DPixelPositions
                    .filter(pixelPos => pixelPos.channel < this.layerRenderer2DNodeElems.length)
                    .map(pixelPos => {
                        let canvasRect = this.layerRenderer2DNodeElems[pixelPos.channel].getBoundingClientRect();
                        return {
                            x: canvasRect.left + pixelPos.x + document.documentElement.scrollLeft + pixelPos.pointSize/2,
                            y: canvasRect.top + pixelPos.y + document.documentElement.scrollTop + pixelPos.pointSize/2
                        };
                    });
            }
        }
    };

})();
