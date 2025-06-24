#version 430

// Manual alpha blending alert: Disable automatic alpha blending.

uniform sampler2D offscreen_framebuffer_texture;
uniform sampler2D alpha_texture;
uniform vec4 text_color_a;
uniform vec4 text_color_b;
uniform float animation_progress;

in vec2 offscreen_framebuffer_texture_uv;
in vec2 alpha_texture_uv;
out vec4 color;

void main() {
#if 1
  vec4 bg = texture(offscreen_framebuffer_texture, offscreen_framebuffer_texture_uv);
#else
  vec4 bg = vec4(0.0, 0.0, 0.0, 1.0);
#endif
  vec4 text_color_c = mix(text_color_a, text_color_b, clamp(animation_progress, 0.0, 1.0));
  vec4 fg = vec4(text_color_c.rgb, 1.0);
  vec4 ac = vec4(texture(alpha_texture, alpha_texture_uv).rgb, 1.0) * text_color_c.a;

  color = fg * ac + bg * (vec4(1.0) - ac);
  color = vec4(color.rgb, 1.0);
}
