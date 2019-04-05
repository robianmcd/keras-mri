(function(){
    let layerRegistry = window.layerRegistry;

    let template = `
<div class="input-layer">
    <div class="layer__info">
        <div class="layer__title">
            <div>Input</div>
            <div class="layer__title-subtext">({{layer.name}})</div>
        </div>
        <div class="layer__info-row">
            <div class="layer__info-label">Shape:</div>
            <div class="layer__info-value">{{layer.outputShape.join('x')}}</div>
        </div>
    </div>
    <div class="layer__nodes" ref="node_container"></div>
</div>
`;

    Vue.component('input-layer', {
        template,
        mixins: [
            window.LayerMixin,
            window.LayerRenderer2DMixin,
            window.LayerRenderer1DMixin
        ],
        methods: {

        }
    });
    layerRegistry.register('InputLayer', 'input-layer');

})();
