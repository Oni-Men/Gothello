export default `
attribute vec4 position;
attribute vec3 a_normal;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec3 v_normal;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * position;
  v_normal = a_normal;
}`;
