#version 430

uniform sampler2D offscreen_framebuffer_texture;

in vec2 offscreen_framebuffer_texture_uv;
out vec4 color;

vec4 gamma(vec4 color) {
  return pow(color, vec4(1/1.8));
}

void main() {
  color = gamma(texture(offscreen_framebuffer_texture, offscreen_framebuffer_texture_uv));
}
