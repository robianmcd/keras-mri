(function () {
    let template = `
<div class="sidebar">
    <h1 class="sidebar__header">keras-mri</h1>
    <div class="sidebar__section">
        <h2 class="sidebar__section-title">Input</h2>
        <div class="sidebar__section-content sidebar__button-group">
            <div @click="getNextInput({reverse: true})">
                <i class="fa fa-step-backward"></i>        
            </div>
            <div @click="togglePlay()" v-if="!isPlaying">
                <i class="fa fa-play"></i>
            </div>
            <div @click="togglePlay()" v-if="isPlaying">
                <i class="fa fa-pause"></i>
            </div>
            <div @click="getNextInput({})">
                <i class="fa fa-step-forward"></i> 
            </div>
        </div>
    </div>
</div>
`;

    Vue.component('sidebar', {
        template,
        data: () => ({
            isPlaying: false
        }),
        created: function () {

        },
        methods: {
            togglePlay() {
                this.isPlaying = !this.isPlaying;

                this.isPlaying && this.getNextInput({whilePlaying: true});
            },
            getNextInput({reverse = false, whilePlaying = false}) {
                if (this.isPlaying || !whilePlaying) {
                    this.$emit(reverse ? 'previous' : 'next');
                }

                if (this.isPlaying && whilePlaying) {
                    setTimeout(() => this.getNextInput({whilePlaying: true}), 150);
                }
            }

        }

    });
})();
