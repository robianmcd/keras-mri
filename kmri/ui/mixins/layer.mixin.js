(function() {
    window.LayerMixin = {
        props: ['layer', 'layerOutput'],
        created: function() {
            this.layer.comp = this;
        },
        data: function() {
            return {

            };
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
            onLayerOutputChange() {
                this.render(this.layerOutput, this.$refs['node_container']);
            }
        },
        watch: {
            layerOutput: function() {
                this.onLayerOutputChange();
            }
        }
    };

})();
