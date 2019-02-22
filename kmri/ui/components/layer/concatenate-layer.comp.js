(function(){

    let template = `
<div class="concatenate-layer">
    <div class="layer__info">
        <div class="layer__title">Concatenate</div>
        <div class="layer__info-row">
            <div class="layer__info-label">Output Shape:</div>
            <div class="layer__info-value">{{layer.outputShape.join('x')}}</div>
        </div>
    </div>
    <div class="layer__nodes" ref="node_container"></div>
</div>
`;

    Vue.component('concatenate-layer', {
        template,
        mixins: [
            window.LayerMixin,
            window.LayerRenderer1DMixin,
            window.OneToOneEdgeRendererMixin
        ],
        methods: {

        }
    });

})();
