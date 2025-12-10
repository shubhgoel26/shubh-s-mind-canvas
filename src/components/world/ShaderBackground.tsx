import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useWorld, WorldTheme } from "@/contexts/WorldContext";

const themeColors: Record<WorldTheme, { primary: number[]; secondary: number[]; accent: number[] }> = {
  "warm-dreamy": {
    primary: [0.96, 0.90, 0.83],
    secondary: [0.91, 0.83, 0.72],
    accent: [0.83, 0.77, 0.66],
  },
  "violet-mist": {
    primary: [0.91, 0.88, 0.94],
    secondary: [0.85, 0.78, 0.91],
    accent: [0.78, 0.72, 0.85],
  },
  "sepia-memory": {
    primary: [0.91, 0.85, 0.78],
    secondary: [0.85, 0.75, 0.66],
    accent: [0.78, 0.66, 0.53],
  },
  "nightside-lake": {
    primary: [0.10, 0.16, 0.23],
    secondary: [0.05, 0.10, 0.16],
    accent: [0.20, 0.35, 0.50],
  },
};

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_intensity;
  
  varying vec2 vUv;
  
  // Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  // FBM (Fractal Brownian Motion) for more organic noise
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for(int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
  
  void main() {
    vec2 uv = vUv;
    float time = u_time * 0.15;
    
    // Paint swirl effect
    vec2 swirl = vec2(
      fbm(uv * 2.0 + time * 0.3),
      fbm(uv * 2.0 + time * 0.3 + 100.0)
    );
    
    // Watercolor diffusion
    float diffusion = fbm(uv * 3.0 + swirl * 0.5 + time * 0.1);
    
    // Pulsing ink blotches
    float blotch1 = smoothstep(0.3, 0.7, snoise(uv * 4.0 + time * 0.2));
    float blotch2 = smoothstep(0.4, 0.6, snoise(uv * 3.0 - time * 0.15 + 50.0));
    float blotches = (blotch1 + blotch2) * 0.5;
    
    // Cloudy strokes
    float clouds = fbm(uv * 1.5 + swirl * 0.3 - time * 0.05);
    clouds = smoothstep(-0.3, 0.6, clouds);
    
    // Mouse reactivity - subtle glow near cursor
    float mouseDist = length(uv - u_mouse);
    float mouseInfluence = smoothstep(0.4, 0.0, mouseDist) * 0.15;
    
    // Combine all effects
    float mixFactor1 = (diffusion + 1.0) * 0.5;
    float mixFactor2 = clouds;
    
    // Color mixing with painterly blending
    vec3 color = mix(u_color1, u_color2, mixFactor1);
    color = mix(color, u_color3, blotches * 0.3);
    color = mix(color, u_color2, mixFactor2 * 0.4);
    
    // Add subtle brightness variation
    float brightness = 1.0 + (diffusion * 0.1) + mouseInfluence;
    color *= brightness;
    
    // Subtle vignette
    float vignette = 1.0 - smoothstep(0.4, 1.2, length(uv - 0.5) * 1.3);
    color *= mix(0.9, 1.0, vignette);
    
    // Apply intensity
    color = mix(u_color1, color, u_intensity);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const ShaderPlane = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { settings } = useWorld();
  const { size, viewport } = useThree();
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const colors = themeColors[settings.theme];

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(size.width, size.height) },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
        u_color1: { value: new THREE.Vector3(...colors.primary) },
        u_color2: { value: new THREE.Vector3(...colors.secondary) },
        u_color3: { value: new THREE.Vector3(...colors.accent) },
        u_intensity: { value: settings.shaderIntensity },
      },
    });
  }, []);

  // Update uniforms when theme changes
  useEffect(() => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.u_color1.value.set(...colors.primary);
      shaderMaterial.uniforms.u_color2.value.set(...colors.secondary);
      shaderMaterial.uniforms.u_color3.value.set(...colors.accent);
      shaderMaterial.uniforms.u_intensity.value = settings.shaderIntensity;
    }
  }, [settings.theme, settings.shaderIntensity, colors, shaderMaterial]);

  useFrame((state) => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.u_time.value = state.clock.elapsedTime;
      shaderMaterial.uniforms.u_resolution.value.set(size.width, size.height);
      
      // Smooth mouse interpolation
      const targetX = (state.pointer.x + 1) / 2;
      const targetY = (state.pointer.y + 1) / 2;
      mouseRef.current.x += (targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetY - mouseRef.current.y) * 0.05;
      shaderMaterial.uniforms.u_mouse.value.set(mouseRef.current.x, mouseRef.current.y);
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]} material={shaderMaterial}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
};

export const ShaderBackground = () => {
  const { settings } = useWorld();

  if (!settings.shaderBackgroundEnabled) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        gl={{ antialias: false, alpha: false, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 1] }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        frameloop="always"
        style={{ position: "absolute", inset: 0 }}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
};
