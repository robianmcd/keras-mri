(function() {

    class ModelStore {
        constructor() {
            this.model = undefined;
            this.layerMap = new Map();
            this.initialized = false;
            this.rowLayout = [];
        }

        load_model() {
            return api.getModel().then((model) => {
                this.model = model;
                this.initialized = true;
                model.layers.forEach(layer => this.layerMap.set(layer.name, layer));

                //Puts each layer on it's own row. In the future layers may share rows
                // model.layers.forEach(layer => {
                //     this.rowLayout.push([layer]);
                // });

                this._walk_network(model.layers[0]);

                this.rowLayout.forEach((row, rowI) => {
                    row.forEach(layer => {
                        layer.row = rowI + 1;
                    });
                });

                console.log('Model loaded', this.model);
            });
        }

        _walk_network(curLayer, curRowI=0, visitedLayers=new Set()) {
            this.rowLayout[curRowI] = this.rowLayout[curRowI] || [];
            this.rowLayout[curRowI].push(curLayer);
            visitedLayers.add(curLayer.name);

            let rowsPrepended = 0;

            curLayer.inboundLayerNames.forEach(layerName => {
                if(curRowI === 0) {
                    this.rowLayout.shift([]);
                    curRowI++;
                    rowsPrepended++;
                }

                if(visitedLayers.has(layerName) === false) {
                    let curRowsPrepended = this._walk_network(this.layerMap.get(layerName), curRowI - 1, visitedLayers);
                    rowsPrepended += curRowsPrepended;
                    curRowI += curRowsPrepended;
                }

            });

            curLayer.outboundLayerNames.forEach(layerName => {
                if(visitedLayers.has(layerName) === false) {
                    let curRowsPrepended = this._walk_network(this.layerMap.get(layerName), curRowI + 1, visitedLayers);
                    rowsPrepended += curRowsPrepended;
                    curRowI += curRowsPrepended;
                }
            });

            return rowsPrepended;
        }
    }

    window.modelStore = new ModelStore();


})();
