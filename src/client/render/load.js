import { createVBO } from "./gl";

/**
 * パースされたJavascriptオブジェクトからWebGLバッファを作成する。
 * こちらがレンダリングに直接用いられる
 * @param {WebGLRenderingContext} gl
 * @param {*} obj
 * @returns
 */
function createBufferFromOBJ(gl, obj) {
  const bufferInfo = [];

  for (let i = 0; i < obj.geometories.length; i++) {
    const geometory = obj.geometories[i];
    const vertices = createVBO(gl, geometory.vertices);
    const normals = createVBO(gl, geometory.normals);
    bufferInfo.push({
      material: geometory.material,
      vertices,
      normals,
      length: geometory.vertices.length / 3,
    });
  }
  return bufferInfo;
}

/**
 * モデル名からobjファイルを読み込み、WebGLバッファを作成する。
 * @param {WebGLRenderingContext} gl
 * @param {string} modelName 拡張子はいらない
 * @returns
 */
export async function loadObj(gl, modelName) {
  const res = await fetch(`/model/${modelName}.obj`);
  const text = await res.text();
  return new Promise(async (resolve) => {
    const obj = await parseObj(text);
    const bufferData = createBufferFromOBJ(gl, obj);
    resolve(bufferData);
  });
}

/**
 * objファイルをパースして、Javascriptのオブジェクトに変換する。
 * かなり参考にさせてもらった https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html
 * @param {*} text
 * @returns
 */
export async function parseObj(text) {
  const vertPositions = [];
  const texCoords = [];
  const faceNormals = [];

  const materials = [];
  const geometories = [];
  let geometory;

  function addVertex(vert) {
    const indices = vert.split("/");
    let index = 0;
    if (!indices[0]) return;
    index = parseInt(indices[0]) - 1;
    geometory.vertices.push(...vertPositions[index]);

    if (!indices[2]) return;
    index = parseInt(indices[2]) - 1;
    geometory.normals.push(...faceNormals[index]);
  }

  function addGeometory(material) {
    geometory = {
      material,
      vertices: [],
      normals: [],
    };
    geometories.push(geometory);
  }

  const handlers = {
    v(args) {
      vertPositions.push(args.map(parseFloat));
    },
    vt(args) {
      texCoords.push(args.map(parseFloat));
    },
    vn(args) {
      faceNormals.push(args.map(parseFloat));
    },
    f(args) {
      if (geometory === undefined) {
        addGeometory();
      }
      for (let i = 0; i < args.length - 2; i++) {
        addVertex(args[0]);
        addVertex(args[i + 1]);
        addVertex(args[i + 2]);
      }
    },
    l(args) {
      if (geometory === undefined) {
        addGeometory();
      }
      if (args[0]) {
        geometory.vertices.push(...vertPositions[parseInt(args[0]) - 1]);
      }

      if (args[1]) {
        geometory.vertices.push(...vertPositions[parseInt(args[1]) - 1]);
      }
    },
    usemtl(args) {
      addGeometory(args[0]);
    },
    mtllib(args) {},
  };

  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;

    const split = line.split(" ");
    if (split.length <= 1) continue;

    const keyword = split[0];
    const args = split.slice(1);

    const handler = handlers[keyword];
    if (handler) {
      handler(args);
    }
  }

  return {
    materials,
    geometories,
  };
}
