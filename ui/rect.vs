#version 430

uniform vec2 window_size;
uniform float animation_progress;

layout(location = 0) in vec2 vertex_pos;
layout(location = 1) in vec4 vertex_color_a;
layout(location = 2) in vec4 vertex_color_b;
//                ^ Questi devono matchare l'attribute index, ad esempio gl.EnableVertexAttribArray(u32(Vertex_Attrib.Pos)).
//                  E mi sa che devi per forza utilizzare gli attributi perché sono valori dinamici (cambiano nelle diverse iterazioni)
//                  mentre invece le uniforms come window_size sono statiche (restano uguali durante le diverse iterazioni).
flat out vec4 color_in;

void main() {
  gl_Position = vec4(vertex_pos/window_size * 2.0 - 1.0, 0.0, 1.0); // < Values in normalized device coordinate [-1, 1] (I don't know about the last two params).
  color_in = mix(vertex_color_a, vertex_color_b, clamp(animation_progress, 0.0, 1.0));
}
