#version 430

// Call gl.DrawArrays(gl.TRIANGLE_STRIP, 0, 4). (♥ https://github.com/tsoding/opengl-template)
out vec2 offscreen_framebuffer_texture_uv;

void main(void) {
  offscreen_framebuffer_texture_uv.x = (gl_VertexID & 1);        // Normalized in [0, 1] for texture.
  offscreen_framebuffer_texture_uv.y = ((gl_VertexID >> 1) & 1); // 
  gl_Position = vec4(offscreen_framebuffer_texture_uv * 2.0 - 1.0, 0.0, 1.0); // Then in normalized device coordinate [-1, 1] for OpenGL.
}
