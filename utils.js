/* exported Utils */
class Utils {
    static loadShaders(shaders) {
        for(let i=0; i<shaders.length; i++){
            let xhr = new XMLHttpRequest();
            xhr.open('get', shaders[i], false);
            xhr.send(null);
            (()=>{
                shaders[i] = xhr.responseText;
            }).call(xhr);
        }
        return shaders;
    }

    static det3(a00, a01, a02, a10, a11, a12, a20, a21, a22) {
        return (
            a00 * (a22 * a11 - a12 * a21) +
            a01 * (-a22 * a10 + a12 * a20) +
            a02 * (a21 * a10 - a11 * a20)
        );
    }

    static det4(a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33) {
        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32;
        return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    }

    static encodeFloatsRGBA(arr) {
        return arr.map(v => Utils.encodeFloatRGBA(v)).reduce((a,b) => a.concat(b));
    }

    static encodeFloatRGBA(v) {
        v = (v+100.0)/200.0;
        let enc = [(v*256.0*256.0*256.0*255.0)%256, (v*256.0*256.0*255.0)%256, (v*256.0*255.0)%256, (v*255.0)%256];
        enc[3] = enc[3] - enc[2]/256.0;
        enc[2] = enc[2] - enc[1]/256.0;
        enc[1] = enc[1] - enc[0]/256.0;
        return enc;
    }
}

