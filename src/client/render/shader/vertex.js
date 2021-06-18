export default `
attribute vec4 position;
attribute vec3 a_normal;

uniform vec4 u_diffuse;
uniform vec3 u_lightDirection;

uniform mat4 mvpMatrix;
uniform mat4 invMatrix;

varying vec4 v_color;

void main() {
  vec3 invLight = normalize(invMatrix * vec4(u_lightDirection, 0.0)).xyz;
  float light = clamp(dot(a_normal, invLight), 0.5, 1.0);
  v_color =  vec4(u_diffuse.rgb * light, u_diffuse.a);
  gl_Position = mvpMatrix * position;
  gl_PointSize = 25.0;
}`;
