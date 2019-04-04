(function(){
    let classNameToComponentName = new Map();
    let defaultTemplate = `
<div class="simple-layer">
    <div class="layer__info">
        <div class="layer__title">{{layer.name}}</div>
        <div v-if="layer.config.activation" class="layer__info-row">
            <div class="layer__info-label">Activation:</div>
            <div class="layer__info-value">{{layer.config.activation}}</div>
        </div>
        <div class="layer__info-row">
            <div class="layer__info-label">Shape:</div>
            <div class="layer__info-value">{{layer.outputShape.join('x')}}</div>
        </div>
    </div>
    <div class="layer__nodes" ref="node_container"></div>
</div>
`;

    function createComponent({className, componentName, mixins = [], methods = {}}) {
        Vue.component(componentName, {
            template: defaultTemplate,
            mixins: [ window.LayerMixin, ...mixins ],
            methods
        });

        register(className, componentName);
    }

    function register(className, componentName) {
        classNameToComponentName.set(className, componentName);
    }

    function lookupComponentName(className) {
        return classNameToComponentName.get(className);
    }

    window.layerRegistry = { register, lookupComponentName, createComponent };
})();
