#version 430

uniform vec2 window_size;
uniform vec2 rect_size;
uniform vec2 rect_offset_from_window_origin;

layout(location = 0) in vec2 vertex_pos;
out vec2 offscreen_framebuffer_texture_uv;
out vec2 alpha_texture_uv;

void main() {
  vec2 vertex_pos_bl = vec2(
    vertex_pos.x,
    window_size.y - vertex_pos.y
  );
  
  gl_Position = vec4(vertex_pos_bl/window_size * 2.0 - 1.0, 0.0, 1.0);
  offscreen_framebuffer_texture_uv = vertex_pos_bl/window_size;
  alpha_texture_uv = (vertex_pos - rect_offset_from_window_origin)/rect_size;
}
