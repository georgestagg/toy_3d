/* global Utils, glMatrix */
/* exported Portal, PortalController */

class PortalController {
    constructor(context) {
        this.context = context;
        this.portals = [
            new Portal(
                0.0, 1.0,
                [6.0,  3.0,  10],
                [1.0,  3.0, 10],
                [6.0, -3.0,  10],
                [6.0,  3.0,  10.1],
                [10.0,  3.0, -10.],
                [5.0,  3.0, -10.],
                [10.0, -3.0, -10.],
                [10.0,  3.0, -9.9]
            ),
            new Portal(
                1.0, 0.0,
                [10.0,  3.0, -10.0],
                [5.0,  3.0, -10.0],
                [10.0, -3.0, -10.0],
                [10.0,  3.0, -10.1],
                [6.0,  3.0,  10.0],
                [1.0,  3.0, 10.0],
                [6.0, -3.0,  10.0],
                [6.0,  3.0,  9.9],
            ),
            new Portal(
                0.0, 2.0,
                [-1.0,  3.0,  10],
                [-6.0,  3.0, 10],
                [-1.0, -3.0,  10],
                [-1.0,  3.0,  10.1],
                [-5.0,  3.0, -10.],
                [-10.0,  3.0, -10.],
                [-5.0, -3.0, -10.],
                [-5.0,  3.0, -9.9]
            ),
            new Portal(
                2.0, 0.0,
                [-5.0,  3.0, -10.],
                [-10.0,  3.0, -10.],
                [-5.0, -3.0, -10.],
                [-5.0,  3.0, -10.1],
                [-1.0,  3.0,  10],
                [-6.0,  3.0, 10],
                [-1.0, -3.0,  10],
                [-1.0,  3.0,  9.9]
            ),
            new Portal(
                2.0, 0.0,
                [10.0,  3.0, 10.0],
                [10.0,  3.0, 5.0],
                [10.0, -3.0, 10.0],
                [10.1,  3.0, 10.0],
                [-1.0,  3.0,  10],
                [-6.0,  3.0, 10],
                [-1.0, -3.0,  10],
                [-1.0,  3.0,  9.9]
            ),
            new Portal(
                1.0, 0.0,
                [-10.0,  3.0, 5.0],
                [-10.0,  3.0, 10.0],
                [-10.0, -3.0, 5.0],
                [-10.1,  3.0, 5.0],
                [6.0,  3.0,  10.0],
                [1.0,  3.0, 10.0],
                [6.0, -3.0,  10.0],
                [6.0,  3.0,  9.9],
            ),
        ];
    }
    buildShader(){
        let fs = '';
        for (let i=0; i<this.portals.length; i++){
            fs += this.portals[i].fragment();
        }
        return fs;
    }
}

class Portal {
    constructor(iw, ow, p1, p2, p3, p4, q1, q2, q3, q4) {
        this.iw = iw;
        this.ow = ow;
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.p4 = p4;
        this.u = Utils.det4(
            p1[0], p2[0], p3[0], p4[0],
            p1[1], p2[1], p3[1], p4[1],
            p1[2], p2[2], p3[2], p4[2],
            1, 1, 1, 1 );
        this.dets = [
            Utils.det3(p2[1], p3[1], p4[1], p2[2], p3[2], p4[2], 1, 1, 1),
            Utils.det3(p1[1], p3[1], p4[1], p1[2], p3[2], p4[2], 1, 1, 1),
            Utils.det3(p1[1], p2[1], p4[1], p1[2], p2[2], p4[2], 1, 1, 1),
            Utils.det3(p1[1], p2[1], p3[1], p1[2], p2[2], p3[2], 1, 1, 1),

            Utils.det3(p2[0], p3[0], p4[0], p2[2], p3[2], p4[2], 1, 1, 1),
            Utils.det3(p1[0], p3[0], p4[0], p1[2], p3[2], p4[2], 1, 1, 1),
            Utils.det3(p1[0], p2[0], p4[0], p1[2], p2[2], p4[2], 1, 1, 1),
            Utils.det3(p1[0], p2[0], p3[0], p1[2], p2[2], p3[2], 1, 1, 1),

            Utils.det3(p2[0], p3[0], p4[0], p2[1], p3[1], p4[1], 1, 1, 1),
            Utils.det3(p1[0], p3[0], p4[0], p1[1], p3[1], p4[1], 1, 1, 1),
            Utils.det3(p1[0], p2[0], p4[0], p1[1], p2[1], p4[1], 1, 1, 1),
            Utils.det3(p1[0], p2[0], p3[0], p1[1], p2[1], p3[1], 1, 1, 1),

            Utils.det3(p2[0], p3[0], p4[0], p2[1], p3[1], p4[1], p2[2], p3[2], p4[2]),
            Utils.det3(p1[0], p3[0], p4[0], p1[1], p3[1], p4[1], p1[2], p3[2], p4[2]),
            Utils.det3(p1[0], p2[0], p4[0], p1[1], p2[1], p4[1], p1[2], p2[2], p4[2]),
            Utils.det3(p1[0], p2[0], p3[0], p1[1], p2[1], p3[1], p1[2], p2[2], p3[2])
        ];
        this.vx = [
            q1[0]*this.dets[0] - q2[0]*this.dets[1] + q3[0]*this.dets[2] - q4[0]*this.dets[3],
            q1[1]*this.dets[0] - q2[1]*this.dets[1] + q3[1]*this.dets[2] - q4[1]*this.dets[3],
            q1[2]*this.dets[0] - q2[2]*this.dets[1] + q3[2]*this.dets[2] - q4[2]*this.dets[3]
        ];
        this.vy = [
            - q1[0]*this.dets[4] + q2[0]*this.dets[5] - q3[0]*this.dets[6] + q4[0]*this.dets[7],
            - q1[1]*this.dets[4] + q2[1]*this.dets[5] - q3[1]*this.dets[6] + q4[1]*this.dets[7],
            - q1[2]*this.dets[4] + q2[2]*this.dets[5] - q3[2]*this.dets[6] + q4[2]*this.dets[7]
        ];
        this.vz = [
            q1[0]*this.dets[8] - q2[0]*this.dets[9] + q3[0]*this.dets[10] - q4[0]*this.dets[11],
            q1[1]*this.dets[8] - q2[1]*this.dets[9] + q3[1]*this.dets[10] - q4[1]*this.dets[11],
            q1[2]*this.dets[8] - q2[2]*this.dets[9] + q3[2]*this.dets[10] - q4[2]*this.dets[11]
        ];
        this.w = [
            - q1[0]*this.dets[12] + q2[0]*this.dets[13] - q3[0]*this.dets[14] + q4[0]*this.dets[15],
            - q1[1]*this.dets[12] + q2[1]*this.dets[13] - q3[1]*this.dets[14] + q4[1]*this.dets[15],
            - q1[2]*this.dets[12] + q2[2]*this.dets[13] - q3[2]*this.dets[14] + q4[2]*this.dets[15]
        ];
        this.A = glMatrix.mat3.fromValues(
            this.vx[0]/this.u, this.vx[1]/this.u, this.vx[2]/this.u,
            this.vy[0]/this.u, this.vy[1]/this.u, this.vy[2]/this.u,
            this.vz[0]/this.u, this.vz[1]/this.u, this.vz[2]/this.u
        );
        let invADet = (this.vx[0]/this.u)*((this.vy[1]/this.u)*(this.vz[2]/this.u) - (this.vy[2]/this.u)*(this.vz[1]/this.u))
            +(this.vx[1]/this.u)*((this.vy[2]/this.u)*(this.vz[0]/this.u) - (this.vy[0]/this.u)*(this.vz[2]/this.u))
            +(this.vx[2]/this.u)*((this.vy[0]/this.u)*(this.vz[1]/this.u) - (this.vy[1]/this.u)*(this.vz[0]/this.u));
        this.invA = glMatrix.mat3.fromValues(
            (this.vy[1]/this.u)*(this.vz[2]/this.u)/invADet - (this.vy[2]/this.u)*(this.vz[1]/this.u)/invADet,
            (this.vx[2]/this.u)*(this.vz[1]/this.u)/invADet - (this.vx[1]/this.u)*(this.vz[2]/this.u)/invADet,
            (this.vx[1]/this.u)*(this.vy[2]/this.u)/invADet - (this.vx[2]/this.u)*(this.vy[1]/this.u)/invADet,
            (this.vy[2]/this.u)*(this.vz[0]/this.u)/invADet - (this.vy[0]/this.u)*(this.vz[2]/this.u)/invADet,
            (this.vx[0]/this.u)*(this.vz[2]/this.u)/invADet - (this.vx[2]/this.u)*(this.vz[0]/this.u)/invADet,
            (this.vx[2]/this.u)*(this.vy[0]/this.u)/invADet - (this.vx[0]/this.u)*(this.vy[2]/this.u)/invADet,
            (this.vy[0]/this.u)*(this.vz[1]/this.u)/invADet - (this.vy[1]/this.u)*(this.vz[0]/this.u)/invADet,
            (this.vx[1]/this.u)*(this.vz[0]/this.u)/invADet - (this.vx[0]/this.u)*(this.vz[1]/this.u)/invADet,
            (this.vx[0]/this.u)*(this.vy[1]/this.u)/invADet - (this.vx[1]/this.u)*(this.vy[0]/this.u)/invADet,
        );
        this.t = glMatrix.vec3.fromValues(
            this.w[0]/this.u, this.w[1]/this.u, this.w[2]/this.u
        );
    }

    teleport(ro, rd){
        return [
            [
                ro[0]*this.A[0] + ro[1]*this.A[3] + ro[2]*this.A[6] + this.t[0],
                ro[0]*this.A[1] + ro[1]*this.A[4] + ro[2]*this.A[7] + this.t[1],
                ro[0]*this.A[2] + ro[1]*this.A[5] + ro[2]*this.A[8] + this.t[2]
            ],
            [
                rd[0]*this.A[0] + rd[1]*this.A[3] + rd[2]*this.A[6],
                rd[0]*this.A[1] + rd[1]*this.A[4] + rd[2]*this.A[7],
                rd[0]*this.A[2] + rd[1]*this.A[5] + rd[2]*this.A[8]
            ]
        ];
    }

    pointInside(ro){
        let ro_bc = [
            (ro[0]*this.dets[0] - ro[1]*this.dets[4] + ro[2]*this.dets[8] - this.dets[12])/this.u,
            (-ro[0]*this.dets[1] + ro[1]*this.dets[5] - ro[2]*this.dets[9] + this.dets[13])/this.u,
            (ro[0]*this.dets[2] - ro[1]*this.dets[6] + ro[2]*this.dets[10] - this.dets[14])/this.u,
            (-ro[0]*this.dets[3] + ro[1]*this.dets[7] - ro[2]*this.dets[11] + this.dets[15])/this.u
        ];
        return ro_bc[0] < 1.0 && ro_bc[1] < 1.0 && ro_bc[2] < 1.0 && ro_bc[3] < 1.0 && ro_bc[3] > 0.0 && ro_bc[2] > 0.0 && ro_bc[1] > 0.0;
    }

    fragment(){
        return `
        p1 = vec3(${this.p1[0]}, ${this.p1[1]}, ${this.p1[2]});
        p2 = vec3(${this.p2[0]}, ${this.p2[1]}, ${this.p2[2]});
        p3 = vec3(${this.p3[0]}, ${this.p3[1]}, ${this.p3[2]});
        p4 = vec3(${this.p4[0]}, ${this.p4[1]}, ${this.p4[2]});
        if(abs(pos.w-${this.iw}.0) < EPS && rayRectIntersect(pos,p1,p2,p3,p4)){
            mat3 A = mat3(
                        ${this.A[0]}, ${this.A[1]},  ${this.A[2]},
                        ${this.A[3]}, ${this.A[4]},  ${this.A[5]},
                        ${this.A[6]}, ${this.A[7]},  ${this.A[8]}
                        );
            vec3 t = vec3(
                        ${this.t[0]}, ${this.t[1]}, ${this.t[2]}
                        );
            vec3 np = A*pos.xyz + t;
            rd = normalize(A*rd);
            np = np + EPS*rd;
            pos.xyz = np;
            pos.w = ${this.ow.toFixed(2)};
            return true;
        }
        `;
    }

}