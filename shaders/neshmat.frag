uniform float uTime;
uniform vec2 uMouse;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

// HSL to RGB conversion
vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

void main() {
  // View direction for Fresnel
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);

  // Iridescent color based on normal + time
  float hue = 0.38 + vNormal.y * 0.15 + sin(uTime * 0.3) * 0.08;
  hue = mod(hue + uMouse.x * 0.05, 1.0);

  // Base color: dark with subtle tint
  vec3 baseColor = hsl2rgb(vec3(hue, 0.7, 0.08 + vDisplacement * 0.1));

  // Edge glow color: accent green -> blue based on angle
  float blueShift = smoothstep(0.0, 1.0, vNormal.y * 0.5 + 0.5);
  vec3 glowColor = mix(
    vec3(0.31, 1.0, 0.69),   // #4fffb0 accent
    vec3(0.31, 0.76, 1.0),   // #4fc3ff accent-blue
    blueShift
  );

  // Fresnel-driven edge glow
  vec3 color = mix(baseColor, glowColor, fresnel * 0.9);

  // Displacement brightness contribution
  color += glowColor * abs(vDisplacement) * 0.3;

  // Subtle inner surface detail
  float inner = 1.0 - fresnel;
  color += vec3(0.02, 0.08, 0.05) * inner * 0.5;

  float alpha = max(0.15, fresnel * 0.95 + abs(vDisplacement) * 0.2);

  gl_FragColor = vec4(color, alpha);
}
