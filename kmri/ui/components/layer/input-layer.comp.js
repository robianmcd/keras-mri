(function(){

    let template = `
<div class="input-layer">
    <div class="layer__info">
        <div class="layer__title">Input</div>
        <div class="layer__info-row">
            <div class="layer__info-label">Output Shape:</div>
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

})();
