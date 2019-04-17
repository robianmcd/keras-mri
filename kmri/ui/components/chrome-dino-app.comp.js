(function () {
    let api = window.api;
    let modelStore = window.modelStore;
    let d3Controller = window.d3Controller;
    let layerRegistry = window.layerRegistry;

    let template = `
<div class="chrome-dino-app">
    <sidebar 
        @next="getNextOutput({})" 
        @previous="getNextOutput({reverse: true})" 
        class="app__side-bar" 
        :loading="loading"
        :showLoadingState="showLoadingState">
    </sidebar>
    <div class="app__content-container">
        <div class="app__content" ref="appContent">
            <template v-if="rowLayout">
                <div class="app__row" v-for="(row, rowI) in rowLayout" :ref="'row-' + rowI">
                    <component 
                        class="app__layer" v-for="layer in row" :key="layer.id" :id="layer.id" :ref="'layer-' + layer.id"
                        :is="getLayerCompName(layer)" :layer="layer" :layerOutput="layerOutputs && layerOutputs[layer.id]">
                    </component>
                </div>
            </template>
            <canvas id="app__edge-canvas" class="app__edge-canvas" ref="edgeCanvas"></canvas> 
        </div>
    </div>
    <div class="app__loading-ovrelay" v-if="showLoadingState">
        <img src="loading.svg" alt="loading...">
    </div>
</div>
`;

    Vue.component('chrome-dino-app', {
        template,
        data: () => ({
            model: undefined,
            rowLayout: undefined,
            layerOutputs: undefined,
            firstUpdate: true,
            loading: false,
            showLoadingState: false
        }),
        created: function () {
            this.loading = true;
            this.showLoadingState = true;
            modelStore.load_model()
                .then(() => {
                    this.rowLayout = modelStore.rowLayout;
                })
                .then(() => {
                    this.loading = false;
                    this.getNextOutput({});
                })
        },
        methods: {
            getLayerCompName: function (layer) {
                return layerRegistry.lookupComponentName(layer['class_name']) || 'generic-layer';
            },

            getNextOutput({reverse = false}) {
                if(this.loading) {
                    return Promise.resolve();
                }

                this.loading = true;
                setTimeout(() => this.loading && (this.showLoadingState = true), 1000);
                let getNextOutputPromise = api.getLayerOutputs({reverse})
                    .then((layerOutputs => {
                        this.layerOutputs = layerOutputs;
                    }));


                if(this.firstUpdate) {
                    getNextOutputPromise = getNextOutputPromise
                        //Wait for vue to call layoutOut watch hooks which will call render for each layer.
                        .then(() => {
                            return new Promise((resolve) => {
                                setTimeout(resolve);
                            });
                        })
                        .then(() => {
                            d3Controller.applyToContainer('.app__content', '.app__layer');
                        })
                        //Let DOM update with element positions from d3
                        .then(() => {
                            return new Promise((resolve) => {
                                d3.timeout(resolve);
                            });
                        })
                        .then(() => {
                            this.resizeRows();

                            modelStore.model.layers.forEach(layer => {
                                layer.comp && layer.comp.drawEdges && layer.comp.drawEdges();
                            });

                            this.firstUpdate = false;
                        });
                }

                return getNextOutputPromise
                    .then(() => {
                        this.loading = false;
                        this.showLoadingState = false;
                    });
            },

            resizeRows: function() {
                let maxRowWidth = 0;
                modelStore.rowLayout.forEach((row, rowI) => {
                    let rowHeight = row
                        .map(layer => this.$refs['layer-' + layer.id][0].$el)
                        .reduce((maxHeight, layerElem) => Math.max(layerElem.clientHeight, maxHeight), 0);

                    let rowMargin = 20;
                    let rowWidth = rowMargin*2 + row
                        .map(layer => {
                            let layerElem = this.$refs['layer-' + layer.id][0].$el;
                            return layerElem.offsetLeft + layerElem.offsetWidth;
                        })
                        .reduce((maxRight, layerRight) => Math.max(layerRight, maxRight), 0);
                    maxRowWidth = Math.max(rowWidth, maxRowWidth);

                    this.$refs['row-' + rowI][0].style.height = rowHeight + 'px';
                });

                this.$refs['appContent'].style.width = maxRowWidth + 'px';
                let canvas = this.$refs['edgeCanvas'];
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;

            }
        }

    });
})();
