import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

/**
 * AuroraBackground — GPU-rendered aurora effect via Three.js ShaderMaterial
 * Runs on a dedicated WebGL canvas behind all hero content.
 * Respects prefers-reduced-motion by disabling animation loop.
 */
export default function AuroraBackground({ reduced = false }) {
  const mountRef = useRef(null)

  // Vertex shader — simple fullscreen quad
  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `

  // Fragment shader — layered aurora with bokeh
  const fragmentShader = /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uResolution;

    // ── Hash / noise helpers ─────────────────────────────────────────
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = p * 2.1 + vec2(1.7, 9.2);
        a *= 0.5;
      }
      return v;
    }

    // ── Aurora layer ─────────────────────────────────────────────────
    vec3 aurora(vec2 uv, float t) {
      // Distort UV with fbm noise
      float n = fbm(uv * 2.0 + t * 0.08);
      float n2 = fbm(uv * 3.5 - t * 0.05 + 2.1);

      // Band shape: horizontal stripe that ripples
      float band = uv.y - 0.55;
      float wave = sin(uv.x * 4.0 + t * 0.4 + n * 3.0) * 0.12
                 + sin(uv.x * 7.0 - t * 0.25 + n2 * 2.0) * 0.07;
      float mask = exp(-((band - wave) * (band - wave)) * 18.0);

      // Amber/gold aurora color
      vec3 colorA = vec3(0.98, 0.65, 0.15) * mask * 0.55;   // amber
      // Deep teal accent
      vec3 colorB = vec3(0.05, 0.55, 0.85) * exp(-((band - wave + 0.08) * (band - wave + 0.08)) * 25.0) * 0.25;

      return colorA + colorB;
    }

    // ── Bokeh orbs ───────────────────────────────────────────────────
    float orb(vec2 uv, vec2 pos, float r, float softness) {
      float d = length(uv - pos);
      return smoothstep(r, r - softness, d);
    }

    void main() {
      vec2 uv = vUv;
      float t = uTime;

      // ── Base gradient (navy deep) ─────────────────────────────────
      vec3 col = mix(
        vec3(0.04, 0.09, 0.18),   // deep navy bottom
        vec3(0.06, 0.13, 0.26),   // slightly lighter top
        uv.y
      );

      // ── Aurora layers ─────────────────────────────────────────────
      col += aurora(uv, t);
      col += aurora(uv * 1.3 + 0.4, t * 0.7) * 0.5;

      // ── Subtle bokeh glows ────────────────────────────────────────
      float slow = t * 0.06;
      vec3 bokehCol = vec3(0.95, 0.70, 0.20);  // amber bokeh
      // Animated orb positions
      col += bokehCol * orb(uv,
        vec2(0.75 + sin(slow) * 0.05, 0.35 + cos(slow * 0.7) * 0.04),
        0.18, 0.18) * 0.18;
      col += bokehCol * orb(uv,
        vec2(0.20 + cos(slow * 0.8) * 0.04, 0.55 + sin(slow * 1.1) * 0.05),
        0.14, 0.14) * 0.12;
      col += vec3(0.1, 0.4, 0.9) * orb(uv,
        vec2(0.90 + sin(slow * 0.6) * 0.03, 0.70 + cos(slow) * 0.04),
        0.10, 0.10) * 0.15;

      // ── Vignette ─────────────────────────────────────────────────
      vec2 vig = uv * 2.0 - 1.0;
      float vignette = 1.0 - dot(vig * vec2(0.5, 0.7), vig * vec2(0.5, 0.7));
      col *= smoothstep(0.0, 0.8, vignette);

      // ── Tone mapping ─────────────────────────────────────────────
      col = col / (col + 0.8);  // simple Reinhard
      col = pow(col, vec3(0.85)); // gamma

      gl_FragColor = vec4(col, 1.0);
    }
  `

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // ── Scene setup ────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas: el,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // Fullscreen quad
    const geo = new THREE.PlaneGeometry(2, 2)
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
    }
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthWrite: false,
    })
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    // ── Resize ─────────────────────────────────────────────────────
    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h, false)
      uniforms.uResolution.value.set(w, h)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    // ── Animation ──────────────────────────────────────────────────
    let raf
    let startTime = performance.now()

    const tick = () => {
      if (!reduced) {
        uniforms.uTime.value = (performance.now() - startTime) / 1000
      }
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      mat.dispose()
      geo.dispose()
    }
  }, [reduced])

  return (
    <canvas
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        willChange: 'transform', // GPU compositor layer hint
      }}
      aria-hidden="true"
    />
  )
}
