/**
 * シェーダーを作成、コンパイルする。失敗するとエラー文を返す。
 * @param {*} gl
 * @param {*} type
 * @param {*} source
 * @returns
 */
export function createShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return [shader, null];
  }

  const error = gl.getShaderInfoLog(shader);
  gl.deleteShader(shader);
  return [null, error];
}

/**
 * プログラムを作成、コンパイルする。失敗するとエラー文を返す。
 * @param {*} gl
 * @param {*} vertexShader
 * @param {*} fragmentShader
 * @returns
 */
export function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return [program, null];
  }

  const error = gl.getShaderInfoLog(shader);
  gl.deleteProgram(program);
  return [null, error];
}

/**
 * VBOを作成する。バインドは解除される
 * @param {*} gl
 * @param {*} data
 * @returns
 */
export function createVBO(gl, data) {
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vbo;
}

export function createIBO(gl, data) {
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return ibo;
}

export function toRadian(deg) {
  return deg * (Math.PI / 180);
}

export function toDegree(rad) {
  return rad * (180 / Math.PI);
}

export function initTransform() {
  return {
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  };
}
