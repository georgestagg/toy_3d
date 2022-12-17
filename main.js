/* global Stats, Render, FPSMovement, FreeMovement, InputController, Atlas */
/* exported rs */
class RS {
    constructor() {
        this.time = 0.0;
        this.renderer = new Render(this);
        this.atlas = new Atlas(this);
        this.camera = new FPSMovement(this);
        this.input = new InputController(this);
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);

        this.renderer.setupGL();
        //this.renderer.setupTextures();
        this.animate(0);
    }
    animate(time) {
        this.stats.begin();
        var dt = time-this.time;
        this.time = time;
        this.camera.update(dt);
        this.camera.setAsView();
        this.renderer.draw(time);
        this.camera.setRotationSpeed(0., 0., 0.);
        this.stats.end();
        window.requestAnimationFrame(this.animate.bind(this));
    }
}

var rs = new RS();

