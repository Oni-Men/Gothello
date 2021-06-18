import { createShader, createProgram, createVBO, createProgramFromShaders } from "./gl";
import { clamp, toRadian } from "./math";
import { loadObj } from "./load";
import VertexShaderSource from "./shader/vertex";
import FragmentShaderSource from "./shader/fragment";
import { mat4 } from "gl-matrix";
import { downloadBlob } from "../main";
import { Picker } from "./picker";

export const models = {
  disc: null,
  board: null,
};

let picker = null;
let program = null;
const attrs = {};
const unifms = {};

const orbit = {
  rotation: [toRadian(90), 0],
  radius: 10,
  applyToCamera(camera) {
    camera.translate[0] = this.radius * Math.cos(this.rotation[1]);
    camera.translate[1] = this.radius * Math.sin(this.rotation[0]);
    camera.translate[2] = this.radius * Math.sin(this.rotation[1]);
  },
};

const camera = {
  translate: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};

const cursor = {
  vbo: null,
  x: 0,
  y: 0,
};

export async function loadModels(gl) {
  for (const key of Object.keys(models)) {
    models[key] = await loadObj(gl, key);
  }
}

/**
 * WebGLの初期化。失敗するとエラー文を返す。
 * @param {*} gl
 * @returns
 */
export function init(gl) {
  let error;
  [program, error] = createProgramFromShaders(gl, VertexShaderSource, FragmentShaderSource);

  if (error != null) {
    return error;
  }

  attrs.position = gl.getAttribLocation(program, "position");
  attrs.normal = gl.getAttribLocation(program, "a_normal");
  unifms.diffuse = gl.getUniformLocation(program, "u_diffuse");
  unifms.lightDirection = gl.getUniformLocation(program, "u_lightDirection");
  unifms.mvpMatrix = gl.getUniformLocation(program, "mvpMatrix");
  unifms.invMatrix = gl.getUniformLocation(program, "invMatrix");

  cursor.vbo = createVBO(gl, [0, 0, 0]);

  picker = new Picker(gl);

  orbit.applyToCamera(camera);
}

export function renderGlobal(gl, mouseEvents, keyboardEvents, state) {
  const board = state.game == null ? null : state.game.board;

  const { screenshot, leftClick } = processEvents(gl, mouseEvents, keyboardEvents);

  //TODO if scene was not SCENE_PLAYING, play animation that rotate around board.

  if (resizeToClientSize(gl.canvas)) {
    picker.setFrameBufferAttachmentSize(gl, gl.canvas.width, gl.canvas.height);
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.3, 0.4, 0.3, 1.0);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

  const vMatrix = mat4.create();
  const pMatrix = mat4.create();
  const pvMatrix = mat4.create();

  mat4.lookAt(vMatrix, camera.translate, [0, 0, 0], [0, 1, 0]);
  mat4.perspective(pMatrix, toRadian(60), aspect, 0.01, 100.0);
  mat4.mul(pvMatrix, pMatrix, vMatrix);

  gl.uniform3fv(unifms.lightDirection, [0.2, 1, -0.2]);

  renderBoard(gl, pvMatrix);

  if (board != null) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (board[y][x] === 0) continue;
        renderDiscAt(gl, pvMatrix, x, y, board[y][x] == 2);
      }
    }
  }

  renderCursor(gl, pvMatrix);
  if (leftClick != null) {
    const pos = picker.getPointedCell(gl, leftClick, pvMatrix);

    if (pos != null) {
      cursor.x = pos.x;
      cursor.y = pos.y;
      console.log(cursor);
    }
  }

  // picker.renderPickerObjects(gl, pvMatrix);

  gl.flush();

  if (screenshot) {
    gl.canvas.toBlob((blob) => {
      downloadBlob(blob, `gothello-${gl.canvas.width}x${gl.canvas.height}-${Date.now()}.png`);
    });
  }
}

function processEvents(gl, mouseEvents, keyboardEvents) {
  let leftClick = null;
  let mouse;
  while ((mouse = mouseEvents.pop()) !== undefined) {
    if (mouse.button == 0 && mouse.type === "mousedown") {
      const rect = mouse.target.getBoundingClientRect();
      leftClick = {
        x: mouse.x - rect.left,
        y: mouse.y - rect.top,
      };
    }

    if (mouse.buttons == 2) {
      gl.canvas.requestPointerLock();
      orbit.rotation[0] += toRadian(mouse.movementY / 10);
      orbit.rotation[0] = clamp(orbit.rotation[0], toRadian(0), toRadian(90));
      orbit.rotation[1] += toRadian(mouse.movementX / 10);
      orbit.applyToCamera(camera);
    } else {
      document.exitPointerLock();
    }

    if (mouse.deltaY != 0) {
      if (mouse.deltaY < 0) {
        orbit.radius *= 0.8;
      }
      if (mouse.deltaY > 0) {
        orbit.radius *= 1.2;
      }
      orbit.applyToCamera(camera);
    }
  }

  let screenshot = false;

  let keyboard;
  while ((keyboard = keyboardEvents.pop()) !== undefined) {
    if (keyboard.key == "F2" && !keyboard.repeat) {
      screenshot = true;
    }
  }
  return { screenshot, leftClick };
}

function renderDiscAt(gl, pvMatrix, x, y, flip) {
  const discModel = models["disc"];
  const mMatrix = mat4.create();
  const mvpMatrix = mat4.create();
  const invMatrix = mat4.create();

  mat4.translate(mMatrix, mMatrix, [x - 3.5, 0, y - 3.5]);
  mat4.rotateX(mMatrix, mMatrix, flip ? toRadian(180) : 0);

  mat4.mul(mvpMatrix, pvMatrix, mMatrix);
  mat4.invert(invMatrix, mMatrix);

  gl.uniformMatrix4fv(unifms.mvpMatrix, false, mvpMatrix);
  gl.uniformMatrix4fv(unifms.invMatrix, false, invMatrix);

  renderModel(gl, discModel);
}

function renderModel(gl, model) {
  for (const geometory of model) {
    switch (geometory.material) {
      case "Black":
        gl.uniform4fv(unifms.diffuse, [0.2, 0.2, 0.2, 1]);
        break;
      case "White":
        gl.uniform4fv(unifms.diffuse, [0.9, 0.9, 0.9, 1]);
        break;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, geometory.vertices);
    gl.enableVertexAttribArray(attrs.position);
    gl.vertexAttribPointer(attrs.position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, geometory.normals);
    gl.enableVertexAttribArray(attrs.normal);
    gl.vertexAttribPointer(attrs.normal, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, geometory.length);
  }
}

function renderBoard(gl, pvMatrix) {
  const boardModel = models["board"];
  const mMatrix = mat4.create();
  const mvpMatrix = mat4.create();
  const invMatrix = mat4.create();

  mat4.translate(mMatrix, mMatrix, [0, -0.05, 0]);

  mat4.mul(mvpMatrix, pvMatrix, mMatrix);
  mat4.invert(invMatrix, mMatrix);

  gl.uniform4fv(unifms.diffuse, [0.2, 0.2, 0.2, 1]);
  gl.uniformMatrix4fv(unifms.mvpMatrix, false, mvpMatrix);
  gl.uniformMatrix4fv(unifms.invMatrix, false, invMatrix);

  for (const geometory of boardModel) {
    gl.bindBuffer(gl.ARRAY_BUFFER, geometory.vertices);
    gl.enableVertexAttribArray(attrs.position);
    gl.vertexAttribPointer(attrs.position, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINES, 0, geometory.length);
  }
}

function renderCursor(gl, pvMatrix) {
  const mvpMatrix = mat4.create();
  const mMatrix = mat4.create();
  mat4.translate(mMatrix, mMatrix, [cursor.x - 3.5, 0, cursor.y - 3.5]);
  // mat4.translate(mMatrix, mMatrix, [-cursor.x + 3.5, 0, cursor.y - 3.5]);
  mat4.mul(mvpMatrix, pvMatrix, mMatrix);

  gl.uniform4fv(unifms.diffuse, [0.3, 0.3, 1, 1]);
  gl.uniformMatrix4fv(unifms.mvpMatrix, false, mvpMatrix);

  gl.bindBuffer(gl.ARRAY_BUFFER, cursor.vbo);

  gl.enableVertexAttribArray(attrs.position);
  gl.vertexAttribPointer(attrs.position, 3, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.POINTS, 0, 1);
}

function resizeToClientSize(canvas) {
  if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    return true;
  }
  return false;
}
