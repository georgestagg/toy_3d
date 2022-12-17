/* global Utils */
/* exported Render */

class Render {
    constructor(context) {
        this.context = context;
        this.canvas = document.getElementById('canvas');
        this.gl = this.canvas.getContext('experimental-webgl');
        this.textures = [
            this.gl.createTexture(),
            this.gl.createTexture(),
            this.gl.createTexture(),
        ];
    }

    setCameraLookAt(ro, dir, cp) {
        this.gl.uniform3fv(this.shaderProgram.ro, ro);
        this.gl.uniform3fv(this.shaderProgram.dir, dir);
        this.gl.uniform3fv(this.shaderProgram.cp, cp);
    }

    setWorld(world) {
        this.gl.uniform1f(this.shaderProgram.world, world);
    }

    setupTextures(){
        let gl = this.gl;
        gl.activeTexture(gl.TEXTURE0);
        this.loadTexture('tex/0.jpg', this.textures[0]);
        gl.uniform1i(this.shaderProgram.tex0, 0);
        gl.activeTexture(gl.TEXTURE1);
        this.loadTexture('tex/0n.jpg', this.textures[1]);
        gl.uniform1i(this.shaderProgram.tex0n, 1);
        gl.activeTexture(gl.TEXTURE2);
        this.loadTexture('tex/0o.jpg', this.textures[2]);
        gl.uniform1i(this.shaderProgram.tex0o, 2);
    }

    loadTexture(url, texture) {
        let gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

        const image = new Image();
        image.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
        };
        image.src = url;
        return texture;
    }

    setupGL(){
        let gl = this.gl;
        gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
        let shaders = Utils.loadShaders(['passthrough.vert', 'main.frag']);

        let vertices = new Float32Array([
            -1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0, -1.0, -1.0,-1.0
        ]);

        let vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        let vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, shaders[0]);
        gl.compileShader(vertShader);

        let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        let atlas = this.context.atlas;
        gl.shaderSource(fragShader, shaders[1]
            .replace('#define TELEPORT 0.0', atlas.portals.buildShader())
            .replace('#define LIGHTING 0.0', atlas.lights.buildShader())
            .replace('#define ATLAS_INTERSECT 0.0', atlas.buildIntersectionShader())
            .replace('#define ATLAS_SDF 0.0', atlas.buildSDFShader())
        );
        gl.compileShader(fragShader);

        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vertShader);
        gl.attachShader(this.shaderProgram, fragShader);
        gl.linkProgram(this.shaderProgram);

        if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS))
            console.log(gl.getShaderInfoLog(vertShader));
        if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS))
            console.log(gl.getShaderInfoLog(fragShader));
        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS))
            console.log(gl.getProgramInfoLog(this.shaderProgram));

        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        let position = gl.getAttribLocation(this.shaderProgram, 'position');
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0) ;
        gl.enableVertexAttribArray(position);
        gl.useProgram(this.shaderProgram);

        this.shaderProgram.iResolution = gl.getUniformLocation(this.shaderProgram, 'iResolution');
        gl.uniform2fv(this.shaderProgram.iResolution, [this.canvas.width, this.canvas.height]);
        this.shaderProgram.ro = this.gl.getUniformLocation(this.shaderProgram, 'ro');
        this.shaderProgram.world = this.gl.getUniformLocation(this.shaderProgram, 'world');
        this.shaderProgram.dir = this.gl.getUniformLocation(this.shaderProgram, 'dir');
        this.shaderProgram.cp = this.gl.getUniformLocation(this.shaderProgram, 'cp');
        this.shaderProgram.tex0 = this.gl.getUniformLocation(this.shaderProgram, 'tex0');
        this.shaderProgram.tex0n = this.gl.getUniformLocation(this.shaderProgram, 'tex0n');
        this.shaderProgram.tex0o = this.gl.getUniformLocation(this.shaderProgram, 'tex0o');
        this.shaderProgram.time = this.gl.getUniformLocation(this.shaderProgram, 'time');
    }

    draw(time) {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        this.gl.uniform1f(this.shaderProgram.time, time);
    }
}