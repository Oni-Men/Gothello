import { createIBO, createProgramFromShaders, createVBO } from "./gl";
import PickerShaderSourceV from "./shader/picker-v";
import PickerShaderSourceF from "./shader/picker-f";
import { mat4 } from "gl-matrix";

export class Picker {
  constructor(gl) {
    let error = null;
    [this.program, error] = createProgramFromShaders(gl, PickerShaderSourceV, PickerShaderSourceF);

    if (error) {
      console.log(error);
    }

    this.attrs = {
      position: gl.getAttribLocation(this.program, "position"),
    };

    this.unifms = {
      id: gl.getUniformLocation(this.program, "u_id"),
      mvpMatrix: gl.getUniformLocation(this.program, "mvpMatrix"),
    };

    //prettier-ignore
    const vertices = [
     -1.0,  0.0, -1.0,
      1.0,  0.0, -1.0,
     -1.0,  0.0,  1.0,
      1.0,  0.0,  1.0
    ];

    //prettier-ignore
    const indices = [
      2, 1, 0,
      1, 2, 3,
    ];

    this.buffer = {
      vbo: createVBO(gl, vertices),
      ibo: createIBO(gl, indices),
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.vbo);

    this.targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.targetTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);

    this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.targetTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  setFrameBufferAttachmentSize(gl, w, h) {
    gl.bindTexture(gl.TEXTURE_2D, this.targetTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
  }

  renderPickerObjects(gl, pvMatrix) {
    gl.useProgram(this.program);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.ibo);

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const mMatrix = mat4.create();
        const mvpMatrix = mat4.create();
        mat4.translate(mMatrix, mMatrix, [x - 3.5, -0.05, y - 3.5]);
        mat4.scale(mMatrix, mMatrix, [0.5, 0.5, 0.5]);
        mat4.mul(mvpMatrix, pvMatrix, mMatrix);

        //prettier-ignore
        gl.uniform3fv(this.unifms.id, [
          x / 255,
          y / 255,
          0.5
        ]);
        gl.uniformMatrix4fv(this.unifms.mvpMatrix, false, mvpMatrix);

        gl.enableVertexAttribArray(this.attrs.position);
        gl.vertexAttribPointer(this.attrs.position, 3, gl.FLOAT, false, 0, 0);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      }
    }
  }

  getPointedCell(gl, mouse, pvMatrix) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    this.renderPickerObjects(gl, pvMatrix);

    const px = mouse.x * (gl.canvas.width / gl.canvas.clientWidth);
    const py = (gl.canvas.height - mouse.y) * (gl.canvas.height / gl.canvas.clientHeight) - 1;
    const data = new Uint8Array(4);

    gl.readPixels(px, py, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);

    const x = data[0];
    const y = data[1];

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //prettier-ignore
    return data.every(i => i == 0) ? null : { x, y };
  }
}
