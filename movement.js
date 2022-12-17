/* global glMatrix */
/* exported FreeMovement, FPSMovement */
class Movement {
    constructor(context){
        this.context = context;
        this.ro = glMatrix.vec3.fromValues(2.0, 0.25, -2.0);
        this.world = 0;
        this.dir = glMatrix.vec3.create();
        this.up = glMatrix.vec3.create();
        this.vcV = glMatrix.vec3.create();
        this.rotX = this.rotY = this.rotZ = this.thrustX = this.thrustY = this.thrustZ = 0.0;
        this.rollSpd = this.pitchSpd = this.yawSpd = 0.0;
        this.quat = glMatrix.quat.fromValues(0.0, 0.0, 0.0, 1.0);
    }

    setAsView(){
        this.context.renderer.setCameraLookAt(this.ro, this.dir, this.up);
        this.context.renderer.setWorld(this.world);
    }

    doTeleport(){
        let portals = this.context.atlas.portals;
        for (let i=0; i<portals.portals.length; i++){
            if (this.world == portals.portals[i].iw){
                if (portals.portals[i].pointInside(this.ro)){
                    // Calculate teleport
                    let tp = portals.portals[i].teleport(this.ro, this.dir);
                    this.ro = tp[0];
                    let npp = glMatrix.vec3.fromValues(tp[1][0], tp[1][2], tp[1][2]);
                    glMatrix.vec3.normalize(this.dir, npp);
                    this.world = portals.portals[i].ow;

                    // Update direction in world
                    let qRot = glMatrix.quat.create();
                    glMatrix.quat.fromMat3(qRot, portals.portals[i].A);
                    glMatrix.quat.normalize(qRot, qRot);
                    glMatrix.quat.multiply(this.quat, qRot, this.quat);
                }  
            }
           
        }
    }
}

class FreeMovement extends Movement {
    constructor(context){
        super(context);
    }

    setRotationSpeed(x, y, z){
        this.pitchSpd = x;
        this.yawSpd = y;
        this.rollSpd = z;
    }

    update(dt){
        this.rotX = (this.pitchSpd * dt);
        this.rotY = (this.yawSpd * dt);
        this.rotZ = (this.rollSpd * dt);

        // Update camera position
        let vcT = glMatrix.vec3.create();
        glMatrix.vec3.cross(vcT, this.up, this.dir);
        glMatrix.vec3.scale(vcT,vcT,this.thrustX*dt);
        glMatrix.vec3.scaleAndAdd(vcT,vcT,this.dir,this.thrustZ*dt);
        glMatrix.vec3.scaleAndAdd(vcT,vcT,this.up,this.thrustY*dt);
        glMatrix.vec3.add(this.ro,this.ro,vcT);

        // Handle teleportation
        this.doTeleport();

        // Handle frame rotation
        let qRot = glMatrix.quat.create();
        let mat = glMatrix.mat3.create();
        let f2PI = 2.*Math.PI;
        if(this.rotX > f2PI) {
            this.rotX -= f2PI;
        } else if (this.rotX < -f2PI){
            this.rotX += f2PI;
        }
        if(this.rotY > f2PI){
            this.rotY -= f2PI;
        } else if (this.rotY < -f2PI) {
            this.rotY += f2PI;
        }
        if(this.rotZ > f2PI) {
            this.rotZ -= f2PI;
        } else if (this.rotZ < -f2PI) {
            this.rotZ += f2PI;
        }

        glMatrix.quat.fromEuler(qRot,this.rotX,this.rotY,this.rotZ);
        glMatrix.quat.multiply(this.quat,this.quat,qRot);
        glMatrix.mat3.fromQuat(mat,this.quat);
        glMatrix.vec3.set(this.up,mat[3],mat[4],mat[5]);
        glMatrix.vec3.set(this.dir,mat[6],mat[7],mat[8]);
    }
}

class FPSMovement extends Movement {
    constructor(context){
        super(context);
    }

    setRotationSpeed(x, y, z){
        this.pitchSpd = x;
        this.yawSpd = y;
        this.rollSpd = z;
    }

    update(dt){
        this.rotX = (this.pitchSpd * dt);
        this.rotY = (this.yawSpd * dt);

        // Update camera position
        let vcT = glMatrix.vec3.create();
        glMatrix.vec3.cross(vcT, this.up, this.dir);
        glMatrix.vec3.scale(vcT,vcT,this.thrustX*dt);
        glMatrix.vec3.scaleAndAdd(vcT,vcT,this.dir,this.thrustZ*dt);
        glMatrix.vec3.scaleAndAdd(vcT,vcT,this.up,this.thrustY*dt);
        glMatrix.vec3.add(this.ro,this.ro,vcT);

        // Handle teleportation
        this.doTeleport();

        // Handle frame rotation
        let qRot = glMatrix.quat.create();
        let mat = glMatrix.mat3.create();
        let f2PI = 2.*Math.PI;
        if(this.rotX > f2PI) {
            this.rotX -= f2PI;
        } else if (this.rotX < -f2PI){
            this.rotX += f2PI;
        }
        if(this.rotY > f2PI){
            this.rotY -= f2PI;
        } else if (this.rotY < -f2PI) {
            this.rotY += f2PI;
        }
        glMatrix.quat.fromEuler(qRot,this.rotX, 0.0, 0.0);
        glMatrix.quat.multiply(this.quat,this.quat,qRot);
        glMatrix.quat.fromEuler(qRot, 0.0, this.rotY, 0.0);
        glMatrix.quat.multiply(this.quat, qRot, this.quat);

        glMatrix.mat3.fromQuat(mat,this.quat);
        glMatrix.vec3.set(this.up,mat[3],mat[4],mat[5]);
        glMatrix.vec3.set(this.dir,mat[6],mat[7],mat[8]);
    }
}