/* global Utils, glMatrix */
/* exported Light, LightController */

class LightController {
    constructor(context) {
        this.context = context;
        this.lights = [
            new PointLight(1.0, 1.0, 1.0, 0.001, 0.005, [1.0, 1.0, 1.0], [0.0, 2.8, 0.0], 0),
            new PointLight(1.0, 1.0, 1.0, 0.001, 0.005, [0.0, 1.0, 1.0], [7.5, 2.8, 7.5], 1),
            new PointLight(1.0, 1.0, 1.0, 0.001, 0.005, [1.0, 0.0, 0.0], [-7.5, 2.8, 7.5], 2),
        ];
    }
    buildShader(){
        let fs = '';
        for (let i=0; i < this.lights.length; i++){
            fs += this.lights[i].localFragment();
        }
        for (let w=0; w < this.context.charts.length; w++){
            for (let p=0; p < this.context.portals.portals.length; p++){
                let portal = this.context.portals.portals[p];
                if (portal.ow == w) {
                    for (let i=0; i < this.lights.length; i++){
                        if (this.lights[i].w == portal.iw) {
                            fs += this.lights[i].remoteFragment(w, portal);
                        }
                    }
                }
            }
        }
        return fs;
    }
}

class PointLight {
    constructor(id, is, ia, iattl, iattq, color, pos, w) {
        this.id = id;
        this.is = is;
        this.ia = ia;
        this.iattl = iattl;
        this.iattq = iattq;
        this.color = color;
        this.pos = pos;
        this.w = w;
    }

    lightFragment(){
        return `
        pointLight light = pointLight(
            ${this.id.toFixed(2)}, ${this.is.toFixed(2)}, ${this.ia.toFixed(2)},
            ${this.iattl.toFixed(2)}, ${this.iattq.toFixed(2)},
            vec3(${this.color[0].toFixed(2)}, ${this.color[1].toFixed(2)}, ${this.color[2].toFixed(2)}),
            vec4(${this.pos[0].toFixed(2)}, ${this.pos[1].toFixed(2)}, ${this.pos[2].toFixed(2)}, ${this.w.toFixed(2)})
        );
        `
    }

    localFragment(){
        return `
        if (abs(pos.w-${this.w.toFixed(2)}) < EPS) {
            ${this.lightFragment()}
            col += mat_col*pointLightPhong(pos, pos.xyz, n, v, light, mat);
        }
        `;
    }

    remoteFragment(world, portal) {
        return `
        if (abs(pos.w-${world.toFixed(2)}) < EPS) {
            mat3 A = mat3(
                ${portal.invA[0]}, ${portal.invA[1]},  ${portal.invA[2]},
                ${portal.invA[3]}, ${portal.invA[4]},  ${portal.invA[5]},
                ${portal.invA[6]}, ${portal.invA[7]},  ${portal.invA[8]}
            );
            vec3 t = vec3(${portal.t[0]}, ${portal.t[1]},  ${portal.t[2]});
            ${this.lightFragment()}
            col += mat_col*pointLightPhong(pos, A*pos.xyz - t, normalize(A*n), normalize(A*v), light, mat);
        }
        `;
    }
}