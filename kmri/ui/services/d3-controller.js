(function() {
    let modelStore = window.modelStore;

    class D3Controller {
        constructor() {

        }

        applyToContainer(containerSelector, layerSelector) {
            if(!modelStore.initialized) {
                throw new Error('modelStore should be initialized before applying the d3 layout');
            }

            modelStore.model.layers.forEach(layer => {
                layer.x = 0;
                layer.vx = 0;
            });

            let nodes = modelStore.model.layers;

            let d3ContainerSelector = d3.select(containerSelector);
            let simulation = d3.forceSimulation(nodes)
                .force('customForce', this._getCustomForce(nodes));

            //space out nodes so they are not initially overlapping
            modelStore.rowLayout.forEach(row => {
                let rowOffset = 0;
                row.forEach(n => {
                    n.x = rowOffset;
                    rowOffset += n.comp.$el.clientWidth;
                });
            });

            let d3NodeSelector = d3ContainerSelector.selectAll(layerSelector)
                .data(nodes, function(d) {return d ? d.id : this.id})
                .style("left", function(d) { return d.x + "px"; });

            simulation.on("tick", () => {
                //Align leftmost node with the left side of the container and move all other notes the same amount.
                let minX = nodes.reduce((min, node) => Math.min(min, node.x), nodes[0].x);
                nodes.forEach(node => node.x += minX * -1);

                d3NodeSelector.style("left", d => d.x + 'px');
            });

            // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
            for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
                simulation.tick();
            }
        }

        //Examples of this force:
        // https://codepen.io/robianmcd/pen/VgjryL
        // https://codepen.io/robianmcd/pen/ErybXr
        // https://codepen.io/robianmcd/pen/xMVyNm
        // https://codepen.io/robianmcd/pen/qgZJmy
        _getCustomForce(nodes) {
            return (alpha) => {
                nodes.forEach(node => {
                    let linkedNodes = [...node.inboundLayerNames, ...node.outboundLayerNames]
                        .map(name => modelStore.layerMap.get(name));


                    let totalSquaredOffset = linkedNodes
                        .reduce((offsetAgg, linkedNode) => {
                            let horizDist = (linkedNode.x + this._nodeWidth(linkedNode)/2) - (node.x + this._nodeWidth(node)/2);

                            return offsetAgg + horizDist * Math.abs(horizDist);
                        }, 0);

                    let directionMult = totalSquaredOffset > 0 ? 1 : -1;
                    node.vx += Math.sqrt(Math.abs(totalSquaredOffset)) * directionMult * alpha;
                });

                nodes.forEach((node, i) => {
                    nodes
                        .filter(n => n.row === node.row && n.id !== node.id)
                        .forEach((sameRowNode) => {
                            let sameRowNextX = sameRowNode.x + sameRowNode.vx;
                            let nextX = node.x + node.vx;

                            if (sameRowNextX === nextX) {
                                let directionMult = (i < sameRowNode.index) ? -1 : 1;
                                node.vx = this._nodeWidth(node) / 2 * directionMult * alpha;
                            } else if(sameRowNextX > nextX && sameRowNextX < nextX + this._nodeWidth(node) ||
                                nextX > sameRowNextX && nextX < sameRowNextX + this._nodeWidth(sameRowNode))
                            {
                                let nodeVx = node.vx;
                                node.vx = sameRowNode.vx / 10;
                                sameRowNode.vx = nodeVx / 10;

                                if (nextX < sameRowNextX) {
                                    let midPoint = (sameRowNextX + nextX + this._nodeWidth(node)) / 2;
                                    node.x = midPoint - this._nodeWidth(node);
                                    sameRowNode.x = midPoint;
                                } else {
                                    let midPoint = (nextX + sameRowNextX + this._nodeWidth(sameRowNode)) / 2;
                                    node.x = midPoint;
                                    sameRowNode.x = midPoint - this._nodeWidth(sameRowNode);
                                }
                            }
                        });

                });

            };
        }

        _nodeWidth(node) {
            let padding = 10;
            return node.comp.$el.clientWidth + padding;
        }
    }

    window.d3Controller = new D3Controller();
})();

