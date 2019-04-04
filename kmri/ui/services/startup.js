(function(){
    let layerRegistry = window.layerRegistry;
    let LayerRenderer1DMixin = window.LayerRenderer1DMixin;
    let LayerRenderer2DMixin = window.LayerRenderer2DMixin;
    let FullyConnectedEdgeRendererMixin = window.FullyConnectedEdgeRendererMixin;
    let OneToOneEdgeRendererMixin = window.OneToOneEdgeRendererMixin;
    let OnePerInputEdgeRendererMixin = window.OnePerInputEdgeRendererMixin;


    let regularLayers = [
        {
            className: 'Dense',
            componentName: 'dense-layer',
            mixins: [LayerRenderer1DMixin, FullyConnectedEdgeRendererMixin]
        },
        {
            className: 'Concatenate',
            componentName: 'concatenate-layer',
            mixins: [LayerRenderer1DMixin, OneToOneEdgeRendererMixin]
        },
        {
            className: 'MaxPooling2D',
            componentName: 'max-pooling-2d-layer',
            mixins: [LayerRenderer2DMixin, OneToOneEdgeRendererMixin]
        },
        {
            className: 'AveragePooling2D',
            componentName: 'average-pooling-2d-layer',
            mixins: [LayerRenderer2DMixin, OneToOneEdgeRendererMixin]
        },
        {
            className: 'ZeroPadding2D',
            componentName: 'zero-padding-2d-layer',
            mixins: [LayerRenderer2DMixin, OneToOneEdgeRendererMixin]
        },
        {
            className: 'BatchNormalization',
            componentName: 'batch-normalization-layer',
            mixins: [LayerRenderer2DMixin, OneToOneEdgeRendererMixin]
        },
        {
            className: 'Activation',
            componentName: 'activation-layer',
            mixins: [LayerRenderer1DMixin, LayerRenderer2DMixin, OneToOneEdgeRendererMixin]
        },
        {
            className: 'GlobalMaxPooling2D',
            componentName: 'global-max-pooling-2d-layer',
            mixins: [LayerRenderer1DMixin, OneToOneEdgeRendererMixin],
            methods: {
                getInputLayerNodePosition(inputLayer) {
                    return inputLayer.comp.getNodePositions(2);
                }
            }
        },
        {
            className: 'GlobalAveragePooling2D',
            componentName: 'global-average-pooling-2d-layer',
            mixins: [LayerRenderer1DMixin, OneToOneEdgeRendererMixin],
            methods: {
                getInputLayerNodePosition(inputLayer) {
                    return inputLayer.comp.getNodePositions(2);
                }
            }
        },
        {
            className: 'Add',
            componentName: 'add-layer',
            mixins: [LayerRenderer1DMixin, LayerRenderer2DMixin, OnePerInputEdgeRendererMixin]
        }
    ];

    regularLayers.forEach(l => layerRegistry.createComponent(l));
})();
