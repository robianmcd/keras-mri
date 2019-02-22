(function(){

    let template = `
<div class="generic-layer">
    <div class="layer__info">
        <div class="layer__title">{{layer.name}}</div>
        <div class="layer__info-row">
            <div class="layer__info-label">Output Shape:</div>
            <div class="layer__info-value">{{layer.outputShape.join('x')}}</div>
        </div>
    </div>
    <div class="layer__nodes" ref="node_container"></div>
</div>
`;

    Vue.component('generic-layer', {
        template,
        mixins: [
            window.LayerMixin,
            window.LayerRenderer1DMixin,
            window.LayerRenderer2DMixin
        ],
        methods: {

        }
    });

})();
