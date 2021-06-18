import { createVBO } from "./gl";

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

export async function loadObj(gl, modelName) {
  const res = await fetch(`/model/${modelName}.obj`);
  const text = await res.text();
  return new Promise(async (resolve) => {
    const obj = await parseObj(text);
    const bufferData = createBufferFromOBJ(gl, obj);
    resolve(bufferData);
  });
}

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

// export async function parseObj(text) {
//   const objPositions = [[0, 0, 0]];
//   const objTexcoords = [[0, 0]];
//   const objNormals = [[0, 0, 0]];

//   const objVertexData = [objPositions, objTexcoords, objNormals];
//   let webglVertexData = [[], [], []];

//   const materialLibs = [];
//   const geometories = [];

//   let geometory;
//   let material = "default";
//   let object = "default";

//   function newGeometory() {
//     if (geometory && geometory.data.position.length) {
//       geometory = undefined;
//     }
//   }

//   function setGeometory() {
//     if (!geometory) {
//       const position = [];
//       const texCoord = [];
//       const normal = [];
//       webglVertexData = [position, texCoord, normal];
//       geometory = {
//         object,
//         material,
//         data: {
//           position,
//           texCoord,
//           normal,
//         },
//       };
//       geometories.push(geometory);
//     }
//   }

//   function addVertex(vert) {
//     const ptn = vert.split("/");
//     ptn.forEach((objIndexStr, i) => {
//       if (!objIndexStr) {
//         return;
//       }
//       const objIndex = parseInt(objIndexStr);
//       const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
//       webglVertexData[i].push(...objVertexData[i][index]);
//     });
//   }

//   const handlers = {
//     s() {},
//     g() {},
//     o(args) {
//       object = args[0];
//       newGeometory();
//     },
//     v(args) {
//       objPositions.push(args.map(parseFloat));
//     },
//     vn(args) {
//       objNormals.push(args.map(parseFloat));
//     },
//     f(args) {
//       setGeometory();
//       const numTriangles = args.length - 1;
//       for (let tri = 0; tri < numTriangles; tri++) {
//         addVertex(args[0]);
//         addVertex(args[0 + 1]);
//         addVertex(args[0 + 2]);
//       }
//     },
//     async mtllib(args) {
//       materialLibs.push(args);
//       // const res = await fetch(`/model/${args}`);
//       // const text = await res.text();

//       // current = "";
//       // materialLib = {};
//       // text
//       //   .split("\n")
//       //   .filter((s) => s && !s.startsWith("#"))
//       //   .forEach((s) => {
//       //     if (s.startsWith("newmtl ")) {
//       //       current = s.split(" ").slice(1);
//       //       materialLib[current] = {};
//       //     } else {
//       //       const split = s.split(" ");
//       //       const key = split[0];
//       //       const args = split.slice(1);
//       //       materialLib[current][key] = args;
//       //     }
//       //   });
//     },
//     usemtl(args) {
//       material = args[0];
//       newGeometory();
//     },
//   };

//   const re = /(\w*) (.)+/;
//   const lines = text.split("\n");
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].trim();
//     if (line == "" || line.startsWith("#")) {
//       continue;
//     }
//     const m = re.exec(line);
//     if (!m) {
//       continue;
//     }
//     const split = line.split(" ");
//     const keyword = split[0];
//     const args = line.split(/\s+/).slice(1);
//     const handler = handlers[keyword];
//     if (!handler) {
//       continue;
//     }
//     await handler(args);
//   }

//   for (const geometory of geometories) {
//     geometory.data = Object.fromEntries(Object.entries(geometory.data).filter(([, array]) => array.length > 0));
//   }

//   return {
//     materialLibs,
//     geometories,
//   };
// }
