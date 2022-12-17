/* exported InputController */
class InputController {
    constructor(context){
        this.context = context;
        document.addEventListener('keydown', this.keyDown.bind(this), false);
        document.addEventListener('keyup', this.keyUp.bind(this), false);

        let canvas = this.canvas = context.renderer.canvas;
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
        canvas.onclick = function() {
            canvas.requestPointerLock();
        };

        this.mouseMoveCB = this.mouseMove.bind(this);
        document.addEventListener('pointerlockchange', this.lockChangeAlert.bind(this), false);
        document.addEventListener('mozpointerlockchange', this.lockChangeAlert.bind(this), false);
    }

    lockChangeAlert(){
        if (document.pointerLockElement === this.canvas || document.mozPointerLockElement === this.canvas) {
            document.addEventListener('mousemove', this.mouseMoveCB);
        } else {
            document.removeEventListener('mousemove', this.mouseMoveCB);
        }
    }

    keyDown(event){
        if (event.key == 'w') {
            this.context.camera.thrustZ = 0.005;
        }
        if (event.key == 'a') {
            this.context.camera.thrustX = 0.005;
        }
        if (event.key == 's') {
            this.context.camera.thrustZ = -0.005;
        }
        if (event.key == 'd') {
            this.context.camera.thrustX = -0.005;
        }
        if (event.key == 'q') {
            this.context.camera.rollSpd = -0.5;
        }
        if (event.key == 'e') {
            this.context.camera.rollSpd = 0.5;
        }
        if (event.keyCode == 32) {
            this.context.camera.thrustY = 0.005;
        }
        event.preventDefault();
    }

    keyUp(event){
        if (event.key == 'w' || event.key == 's') {
            this.context.camera.thrustZ = 0;
        }
        if (event.key == 'a' || event.key == 'd') {
            this.context.camera.thrustX = 0;
        }
        if (event.keyCode == 32) {
            this.context.camera.thrustY = 0;
        }
        if (event.key == 'q' |event.key == 'e' ) {
            this.context.camera.rollSpd = 0;
        }
    }

    mouseMove(event){
        let scale = 30;
        this.context.camera.pitchSpd = event.movementY/scale;
        this.context.camera.yawSpd =-event.movementX/scale;
    }
}