export default `precision mediump float;

varying vec3 v_normal;

uniform vec3 u_lightDirection;
uniform vec4 u_diffuse;

void main() {
  vec3 normal = normalize(v_normal);
  float light = dot(u_lightDirection, normal) ;
  gl_FragColor = vec4(u_diffuse.rgba);
}
`;
