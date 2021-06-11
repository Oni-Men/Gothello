import { createShader, createProgram, toRadian, initTransform } from "./gl";
import VertexShaderSource from "./shader/vertex";
import FragmentShaderSource from "./shader/fragment";
import { mat4 } from "gl-matrix";

export let program = null;

export const attrs = {};
export const unifms = {};

const translation = [0, 0, 0];
const rotation = [toRadian(30), 0, 0];
const scale = [1, 1, 1];
const color = [1, 1, 1, 0.9];

const camera = initTransform();

/**
 * WebGLの初期化。失敗するとエラー文を返す。
 * @param {*} gl
 * @returns
 */
export function init(gl) {
  let error = null;
  let vertexShader, fragmentShader;
  [vertexShader, error] = createShader(gl, gl.VERTEX_SHADER, VertexShaderSource);
  if (error != null) {
    return error;
  }

  [fragmentShader, error] = createShader(gl, gl.FRAGMENT_SHADER, FragmentShaderSource);
  if (error != null) {
    return error;
  }

  [program, error] = createProgram(gl, vertexShader, fragmentShader);

  if (error != null) {
    return error;
  }

  attrs.position = gl.getAttribLocation(program, "position");
  attrs.normal = gl.getAttribLocation(program, "a_normal");
  unifms.diffuse = gl.getUniformLocation(program, "u_diffuse");
  unifms.lightDirection = gl.getUniformLocation(program, "u_lightDirection");
  unifms.mvpMatrix = gl.getUniformLocation(program, "mvpMatrix");
  unifms.invMatrix = gl.getUniformLocation(program, "invMatrix");
}

export function renderGlobal(gl, models, mouse, keyboard) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.3, 0.4, 0.3, 1.0);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const disc = models["disc"];

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

  const mvpMatrix = mat4.create();
  const invMatrix = mat4.create();
  const tmpMatrix = mat4.create();

  const mMatrix = mat4.create();
  const vMatrix = mat4.create();
  const pMatrix = mat4.create();

  mat4.lookAt(vMatrix, [0, 0, -6], [0, 0, 0], [0, -1, 0]);
  mat4.perspective(pMatrix, toRadian(60), aspect, 0.01, 100.0);
  mat4.mul(tmpMatrix, pMatrix, vMatrix);

  rotation[0] += 0.01;

  mat4.translate(mMatrix, mMatrix, translation);
  mat4.rotateX(mMatrix, mMatrix, rotation[0]);
  mat4.rotateY(mMatrix, mMatrix, rotation[1]);
  mat4.rotateZ(mMatrix, mMatrix, rotation[2]);
  mat4.scale(mMatrix, mMatrix, scale);

  mat4.mul(mvpMatrix, tmpMatrix, mMatrix);
  mat4.invert(invMatrix, mMatrix);

  gl.useProgram(program);
  gl.uniformMatrix4fv(unifms.mvpMatrix, false, mvpMatrix);
  gl.uniformMatrix4fv(unifms.invMatrix, false, invMatrix);
  gl.uniform3fv(unifms.lightDirection, [0, -2, -5]);

  for (const geometory of disc) {
    switch (geometory.material) {
      case "Black":
        gl.uniform4fv(unifms.diffuse, [0.2, 0.2, 0.2, 1]);
        break;
      case "White":
        gl.uniform4fv(unifms.diffuse, [0.9, 0.9, 0.9, 1]);
        break;
      default:
        gl.uniform4fv(unifms.diffuse, [0.3, 0.6, 0.3, 1]);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, geometory.vertices);
    gl.enableVertexAttribArray(attrs.position);
    gl.vertexAttribPointer(attrs.position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, geometory.normals);
    gl.enableVertexAttribArray(attrs.normal);
    gl.vertexAttribPointer(attrs.normal, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, geometory.length);
  }
  gl.flush();
}
