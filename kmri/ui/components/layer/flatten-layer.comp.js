(function(){
    let modelStore = window.modelStore;

    let template = `
<div class="input-layer">
    <div class="layer__info">
        <div class="layer__title">Flatten</div>
        <div class="layer__info-row">
            <div class="layer__info-label">Output Shape:</div>
            <div class="layer__info-value">{{layer.outputShape.join('x')}}</div>
        </div>
    </div>
    <div class="layer__nodes" ref="node_container"></div>
</div>
`;

    Vue.component('flatten-layer', {
        template,
        mixins: [
            window.LayerMixin,
            window.LayerRenderer1DMixin,
            window.OneToOneEdgeRendererMixin
        ],
        methods: {
            onLayerOutputChange() {
                let layerOutput;
                let inputLayer = modelStore.layerMap.get(this.layer.inboundLayerNames[0]);
                let inputShape = inputLayer.outputShape;

                if(inputShape.length === 3) {
                    layerOutput = [];
                    let inputHeight = inputShape[0];
                    let inputWidth = inputShape[1];
                    //Assumes Tensorflow channel last order
                    let numChannels = inputShape[2];

                    //Reorder the outputs so that channel comes first instead of last to improve the visualization.
                    this.layerOutput
                        .forEach((output, index) => {
                            let channel = index % numChannels;
                            index = Math.floor(index / numChannels);
                            let x = index % inputWidth;
                            index = Math.floor(index / inputWidth);
                            let y = index;

                            let sortedIndex = x + y*inputWidth + channel*inputHeight*inputWidth;

                            layerOutput[sortedIndex] = output;
                        });

                } else {
                    layerOutput = this.layerOutput;
                }

                this.render(layerOutput, this.$refs['node_container']);
            }
        }
    });

})();
