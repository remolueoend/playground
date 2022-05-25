varying vec4 v_color;

attribute vec4 a_color;
attribute vec2 a_position;

uniform vec2 u_resolution;
uniform mat3 u_transform;

void main() {
    vec2 t_pos = (u_transform * vec3(a_position, 1)).xy;
    // convert positions from pizels to 0.0-1.0
    vec2 zeroToOne = t_pos / u_resolution;
    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
    // convert from 0->2 to -1->1
    vec2 clipSpace = zeroToTwo - 1.0;

    // make top-left corner to (0, 0)
    vec2 clipSpaceTopLeft = clipSpace * vec2(1, -1);

    gl_Position = vec4(clipSpaceTopLeft, 0, 1);

    v_color = a_color;
}