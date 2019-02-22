(function(){
    let template = `
<div class="input-layer">
    <div class="layer__info">
        <div class="layer__title">Dense</div>
        <div class="layer__info-row">
            <div class="layer__info-label">Activation:</div>
            <div class="layer__info-value">{{layer.config.activation}}</div>
        </div>
        <div class="layer__info-row">
            <div class="layer__info-label">Output Shape:</div>
            <div class="layer__info-value">{{layer.outputShape.join('x')}}</div>
        </div>
    </div>
    <div class="layer__nodes" ref="node_container"></div>
</div>
`;

    Vue.component('dense-layer', {
        template,
        mixins: [
            window.LayerMixin,
            window.LayerRenderer1DMixin,
            window.FullyConnectedEdgeRendererMixin
        ],
        methods: {

        }
    });

})();
