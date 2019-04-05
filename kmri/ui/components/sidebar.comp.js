(function () {
    let modelStore = window.modelStore;

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
    <div class="sidebar__section">
        <h2 class="sidebar__section-title">Export</h2>
        <div class="sidebar__section-content">
            <button @click="saveAsPng()">Save as Png</button>
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
            },
            saveAsPng() {
                let config = {
                    imageTimeout: 0
                };

                let container = document.querySelector('.app__content');
                let containerRect = container.getBoundingClientRect();

                html2canvas(document.querySelector('.app__content'), config).then(screenshotCanvas => {
                    let screentShotCtx = screenshotCanvas.getContext('2d');

                    //The canvases don't always get drawn properly with html2canvas so this redraws them all. ¯\_(ツ)_/¯
                    modelStore.model.layers.forEach(layer => {
                        let canvasList = layer.comp.$el.querySelectorAll('canvas');
                        canvasList.forEach(canvas => {
                            let canvasRect = canvas.getBoundingClientRect();
                            screentShotCtx.drawImage(
                                canvas,
                                canvasRect.left - containerRect.left,
                                canvasRect.top - containerRect.top,
                                canvasRect.width,
                                canvasRect.height
                            );
                        });
                    });

                    screenshotCanvas.toBlob(function(blob) {
                        saveAs(blob, "network.png");
                    });

                    //this.download(canvas,'network.png');
                });
            },

            //Taken from https://codepen.io/joseluisq/pen/mnkLu
            download(canvas, filename) {
                /// create an "off-screen" anchor tag
                var lnk = document.createElement('a'), e;

                /// the key here is to set the download attribute of the a tag
                lnk.download = filename;

                /// convert canvas content to data-uri for link. When download
                /// attribute is set the content pointed to by link will be
                /// pushed as "download" in HTML5 capable browsers
                lnk.href = canvas.toDataURL("image/png;base64");

                /// create a "fake" click-event to trigger the download
                if (document.createEvent) {
                    e = document.createEvent("MouseEvents");
                    e.initMouseEvent("click", true, true, window,
                        0, 0, 0, 0, 0, false, false, false,
                        false, 0, null);

                    lnk.dispatchEvent(e);
                } else if (lnk.fireEvent) {
                    lnk.fireEvent("onclick");
                }
            }

        }

    });
})();
