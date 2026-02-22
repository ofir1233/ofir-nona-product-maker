"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Inline GLSL — avoids raw-loader dependency (Turbopack compatible)
const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uIntensity;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289v4(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289v4(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289v3(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0+1.0;
    vec4 s1 = floor(b1)*2.0+1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec3 mouseDir = vec3(uMouse.x * 0.5, uMouse.y * 0.5, 0.0);
    float noise1 = snoise(position * 0.8 + uTime * 0.15);
    float noise2 = snoise(position * 1.6 + uTime * 0.22 + 10.0);
    float noise3 = snoise(position + mouseDir + uTime * 0.1);
    float displacement = noise1 * 0.4 + noise2 * 0.15 + noise3 * 0.25;
    displacement *= uIntensity;
    vDisplacement = displacement;
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0*c.z-1.0));
  }

  void main() {
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);
    float hue = 0.38 + vNormal.y * 0.15 + sin(uTime * 0.3) * 0.08;
    hue = mod(hue + uMouse.x * 0.05, 1.0);
    vec3 baseColor = hsl2rgb(vec3(hue, 0.7, 0.08 + vDisplacement * 0.1));
    float blueShift = smoothstep(0.0, 1.0, vNormal.y * 0.5 + 0.5);
    vec3 glowColor = mix(
      vec3(0.31, 1.0, 0.69),
      vec3(0.31, 0.76, 1.0),
      blueShift
    );
    vec3 color = mix(baseColor, glowColor, fresnel * 0.9);
    color += glowColor * abs(vDisplacement) * 0.3;
    float inner = 1.0 - fresnel;
    color += vec3(0.02, 0.08, 0.05) * inner * 0.5;
    float alpha = max(0.15, fresnel * 0.95 + abs(vDisplacement) * 0.2);
    gl_FragColor = vec4(color, alpha);
  }
`;

const PARTICLE_VERT = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uSize;
  attribute float aScale;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    float drift = sin(uTime * 0.3 + position.x * 2.0) * 0.05;
    pos.y += drift;
    pos.x += cos(uTime * 0.2 + position.z) * 0.03;
    vec2 mouse3d = vec2(uMouse.x * 3.0, uMouse.y * 3.0);
    float dist = distance(pos.xy, mouse3d);
    if (dist < 1.0) {
      vec2 repel = normalize(pos.xy - mouse3d) * (1.0 - dist) * 0.3;
      pos.xy += repel;
    }
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * aScale * (150.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = 0.3 + aScale * 0.5;
  }
`;

const PARTICLE_FRAG = /* glsl */ `
  varying float vAlpha;
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
    gl_FragColor = vec4(0.31, 1.0, 0.69, alpha);
  }
`;

interface NeshmatDaatProps {
  scrollProgress: number;
}

export default function NeshmatDaat({ scrollProgress }: NeshmatDaatProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const targetMouseRef = useRef(new THREE.Vector2(0, 0));

  useMemo(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetMouseRef.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      );
    };
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: 1.0 },
    }),
    []
  );

  const particleGeometry = useMemo(() => {
    const count = 2500;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.4 + (Math.random() - 0.5) * 0.8;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      scales[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    return geo;
  }, []);

  const particleUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uSize: { value: 1.5 },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    mouseRef.current.lerp(targetMouseRef.current, 0.05);
    const fadeOut = Math.max(0, 1 - scrollProgress * 3);

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.08;
      meshRef.current.rotation.x = Math.sin(t * 0.05) * 0.15;
      const breathe = 1 + Math.sin(t * 0.6) * 0.03;
      meshRef.current.scale.setScalar(breathe * fadeOut);
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = t;
      mat.uniforms.uMouse.value = mouseRef.current;
      mat.uniforms.uIntensity.value = 0.8 + Math.sin(t * 0.4) * 0.2;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.04;
      particlesRef.current.rotation.x = Math.sin(t * 0.03) * 0.08;
      particlesRef.current.scale.setScalar(fadeOut);
      const mat = particlesRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = t;
      mat.uniforms.uMouse.value = mouseRef.current;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef} castShadow>
        <icosahedronGeometry args={[2, 8]} />
        <shaderMaterial
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <points ref={particlesRef} geometry={particleGeometry}>
        <shaderMaterial
          vertexShader={PARTICLE_VERT}
          fragmentShader={PARTICLE_FRAG}
          uniforms={particleUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
