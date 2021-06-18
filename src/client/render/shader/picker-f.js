export default `precision mediump float;

uniform vec3 u_id;

void main() {
  gl_FragColor = vec4(u_id, 1);
}
`;
