/* global Utils, glMatrix, PortalController, LightController */
/* exported Chart, Atlas */

class Atlas {
    constructor(context) {
        this.context = context;
        this.portals = new PortalController(this);
        this.lights = new LightController(this);
        this.charts = [
            new CorridorRoom1(0),
            new CorridorRoom2(1),
            new CorridorRoom3(2),
        ];
    }
    buildIntersectionShader(){
        let fs = '';
        for (let i=0; i<this.charts.length; i++){
            fs += this.charts[i].buildIntersectionShader();
        }
        return fs;
    }
    buildSDFShader(){
        let fs = '';
        for (let i=0; i<this.charts.length; i++){
            fs += this.charts[i].buildSDFShader();
        }
        return fs;
    }
}

class Chart {
    constructor(id) {
        this.id = id;
        this.geometry = [];
    }
    buildIntersectionShader(){
        let fs = `
        if (abs(pos.w-${this.id}.)<EPS) {
        `;
        for (let i=0; i<this.geometry.length; i++){
            fs += this.geometry[i].intersectionFragment();
        }
        fs += `
            return d;
        }`;
        return fs;
    }
    buildSDFShader(){
        let fs = `
        if (abs(pos.w-${this.id}.)<EPS) {
        `;
        for (let i=0; i<this.geometry.length; i++){
            fs += this.geometry[i].sdfFragment();
        }
        fs += `
            return d;
        }`;
        return fs;
    }
}

class nonEuclideanTrickRoom extends Chart{
    constructor(id) {
        super(id);
        this.geometry = [
            new Room([0, 0, 0], [10.0, 3.0, 10.0], 0),
            new Cube([0.0, 2.99, 0.0], [1.0, 0.01, 1.0], 5),
            new Cube([0, -1, 0], [2.25, 2.25, 0.25], 0),
        ];
    }
}

class TardisRoom extends Chart{
    constructor(id) {
        super(id);
        this.geometry = [
            new Room([0, 0, 0], [10.0, 3.0, 10.0], 0),
            new Cube([0.0, 3.0, 0.0], [1.0, 0.01, 1.0], 5), // light
            new Cube([0, -1, 0], [1.5, 2.25, 1.5], 0), //tardis
        ];
    }
}
class TardisInterior extends Chart{
    constructor(id) {
        super(id);
        this.geometry = [
            new Room([0, 0, 0], [20.0, 3.0, 20.0], 0),
            new Cube([0, -3, 0], [1.5, 0.75, 1.5], 1), //console
            new Sphere([0, -2.25, 0.0], 0.75, 5), // sphere
        ];
    }
}

class SevenSidedCube extends Chart{
    constructor(id) {
        super(id);
        this.geometry = [
            new Room([0, 0, 0], [10.0, 3.0, 10.0], 0),
            new Cube([0, 0, 0], [5.0, 3.0, 5.0], 0), //center column
            new Cube([-7.5, 0, -4.0], [2.5, 3.0, 1.0], 0),
        ];
    }
}

class CorridorRoom1 extends Chart{
    constructor(id) {
        super(id);
        this.geometry = [
            new Room([0, 0, 0], [10.0, 3.0, 10.0], 0),
            new Cube([0.0, 3.0, 0.0], [1.0, 0.01, 1.0], 5), // light
        ];
    }
}

class CorridorRoom2 extends Chart{
    constructor(id) {
        super(id);
        this.geometry = [
            new Room([0, 0, 0], [10.0, 3.0, 10.0], 0),
            new Cube([-2.5, 0, -2.5], [7.5, 3.0, 7.5], 0),
            new Cube([7.5, 3.0, 7.5], [1.0, 0.01, 1.0], 5), // light
        ];
    }
}

class CorridorRoom3 extends Chart{
    constructor(id) {
        super(id);
        this.geometry = [
            new Room([0, 0, 0], [10.0, 3.0, 10.0], 0),
            new Cube([2.5, 0, -2.5], [7.5, 3.0, 7.5], 0),
            new Cube([-7.5, 3.0, 7.5], [1.0, 0.01, 1.0], 5), // light
        ];
    }
}

class ChartRoom1 extends Chart{
    constructor(id) {
        super(id);
        this.geometry = [
            new Room([0, 0, 0], [10.0, 3.0, 10.0], 0),
            new Cube([0.0, 2.99, 0.0], [1.0, 0.01, 1.0], 5),
            new Sphere([0, 1.5, 2.5], 0.25, 1),
            /*new Cube([9.4, 0.0, 6.5], [0.6, 3.0, 3.5], this.id),
            new Cube([9.4, 0.0, -6.5], [0.6, 3.0, 3.5], this.id),
            new Cube([9.4, 2.0, 0.0], [0.6, 1.0, 3.0], this.id),
            new Cube([-9.4, 0.0, 6.5], [0.6, 3.0, 3.5], this.id),
            new Cube([-9.4, 0.0, -6.5], [0.6, 3.0, 3.5], this.id),
            new Cube([-9.4, 2.0, 0.0], [0.6, 1.0, 3.0], this.id),
            new Cube([6.5, 0.0, 9.4], [3.5, 3.0, 0.6], this.id),
            new Cube([-6.5, 0.0, 9.4], [3.5, 3.0, 0.6], this.id),
            new Cube([0.0, 2.0, 9.4], [3.5, 1.0, 0.6], this.id),
            new Cube([6.5, 0.0, -9.4], [3.5, 3.0, 0.6], this.id),
            new Cube([-6.5, 0.0, -9.4], [3.5, 3.0, 0.6], this.id),
            new Cube([0.0, 2.0, -9.4], [3.5, 1.0, 0.6], this.id),
            */
        ];
    }
}

class Corridor1 extends Chart{
    constructor(id) {
        super(id);
        this.geometry = [
            new Room([0, -1, 0], [3.0, 2.0, 10.0], 0),
        ];
    }
}

class Room {
    constructor(center, size, material){
        this.center = center;
        this.size = size;
        this.material = material;
    }
    sdf(pos){
        let d = [Math.abs(pos[0]) - this.size[0], Math.abs(pos[1]) - this.size[1], Math.abs(pos[2]) - this.size[2]];
        let f = [Math.max(d[0], 0.0), Math.max(d[1], 0.0), Math.max(d[2], 0.0)];
        return -Math.min(Math.max(d[0], Math.max(d[1], d[2])), 0.0) + Math.sqrt(f[0]*f[0] + f[1]*f[1] + f[2]*f[2]);
    }
    intersectionFragment(){
        return `
            f = roomIntersect(pos.xyz, rd,
                    vec3(${this.center[0]}, ${this.center[1]}, ${this.center[2]}),
                    vec3(${this.size[0]}, ${this.size[1]}, ${this.size[2]}),
                    nor, stmp).y;
            if ( ss < 0.0 || materials[${this.material}].t != -2){
                ss = min(ss, stmp);
                d = U(d, fMat(f, nor, materials[${this.material}]));
            }
        `;
    }
    sdfFragment(){
        return `
            d = min(d, -boxSDF(vec3(${this.center[0]}, ${this.center[1]}, ${this.center[2]}),
                                vec3(${this.size[0]}, ${this.size[1]}, ${this.size[2]})));
        `;
    }
}

class Sphere {
    constructor(center, size, material){
        this.center = center;
        this.size = size;
        this.material = material;
    }
    sdf(pos){
        return Math.sqrt(pos[0]*pos[0] + pos[1]*pos[1] + pos[2]*pos[2])-self.size;
    }
    intersectionFragment(){
        return `
            f = sphIntersect(pos.xyz, rd,
                vec3(${this.center[0]}, ${this.center[1]}, ${this.center[2]}),
                ${this.size}, nor, stmp);
            if ( ss < 0.0 || materials[${this.material}].t != -2){
                ss = min(ss, stmp);
                d = U(d, fMat(f, nor, materials[${this.material}]));
            }
        `;
    }
    sdfFragment(){
        return `
            d = min(d, spfSDF(vec3(${this.center[0]}, ${this.center[1]}, ${this.center[2]}),
                                ${this.size}));
        `;
    }
}

class Cube {
    constructor(center, size, material){
        this.center = center;
        this.size = size;
        this.material = material;
    }
    sdf(pos){
        let d = [Math.abs(pos[0]) - this.size[0], Math.abs(pos[1]) - this.size[1], Math.abs(pos[2]) - this.size[2]];
        let f = [Math.max(d[0], 0.0), Math.max(d[1], 0.0), Math.max(d[2], 0.0)];
        return Math.min(Math.max(d[0], Math.max(d[1], d[2])), 0.0) + Math.sqrt(f[0]*f[0]+f[1]*f[1]+f[2]*f[2]);
    }
    intersectionFragment(){
        return `
            f = boxIntersect(pos.xyz, rd,
                    vec3(${this.center[0]}, ${this.center[1]}, ${this.center[2]}),
                    vec3(${this.size[0]}, ${this.size[1]}, ${this.size[2]}),
                    nor, stmp).x;
            if ( ss < 0.0 || materials[${this.material}].t != -2){
                ss = min(ss, stmp);
                d = U(d, fMat(f, nor, materials[${this.material}]));
            }
        `;
    }
    sdfFragment(){
        return `
            d = min(d, boxSDF(vec3(${this.center[0]}, ${this.center[1]}, ${this.center[2]}),
                                vec3(${this.size[0]}, ${this.size[1]}, ${this.size[2]})));
        `;
    }
}
