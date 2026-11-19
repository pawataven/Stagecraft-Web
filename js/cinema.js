// STAGECRAFT — cinematic photo tour. Each scene is a real event photo; moving to the next scene pushes the camera
// into the current photo (zoom blur toward its focus point, a warm light leak) and lands in the next one.
// Between moves the shot drifts slowly forward and follows the pointer a little, with film grain and a vignette.
// API: createStage(canvas, { reducedMotion, onLoaded }) -> { goTo(i) -> ms, setScreen(), pause(bool), dispose() }
import * as THREE from 'three';
import { SCENES, img } from './data.js';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uA, uB;
  uniform float uAspA, uAspB, uScreen, uP, uKA, uKB, uTime, uBlur;
  uniform vec2 uFocA, uFocB, uPtr;
  varying vec2 vUv;

  // Map screen uv to image uv like object-fit: cover, keeping the focus point in frame.
  vec2 cover(vec2 uv, float asp, vec2 focus) {
    vec2 s = vec2(1.0);
    if (uScreen > asp) s.y = asp / uScreen; else s.x = uScreen / asp;
    vec2 off = clamp(focus - s * 0.5, vec2(0.0), vec2(1.0) - s);
    return off + uv * s;
  }

  vec3 shot(sampler2D t, float asp, vec2 focus, float zoom, float blur) {
    vec2 uv = cover(vUv, asp, focus);
    uv = focus + (uv - focus) / zoom + uPtr * 0.006 / zoom;
    vec3 c = vec3(0.0);
    float total = 0.0;
    for (int i = 0; i < 14; i++) {
      float k = float(i) / 13.0;
      vec2 p = uv + (focus - uv) * blur * 0.16 * k;
      float w = 1.0 - k * 0.6;
      // A touch of chromatic split while moving.
      vec2 ca = (uv - focus) * blur * 0.012;
      c.r += texture2D(t, p + ca).r * w;
      c.g += texture2D(t, p).g * w;
      c.b += texture2D(t, p - ca).b * w;
      total += w;
    }
    return c / total;
  }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    float p = uP;
    float base = 1.08;
    vec3 a = shot(uA, uAspA, uFocA, base + uKA + p * p * 1.1, p * uBlur);
    vec3 b = shot(uB, uAspB, uFocB, 1.0 + p * (base - 1.0) + uKB, (1.0 - p) * 0.55 * uBlur);
    vec3 col = mix(a, b, smoothstep(0.32, 0.72, p));
    // Warm light leak at the middle of the move, brightest at the focus point.
    float leak = pow(sin(p * 3.14159), 3.0);
    float d = length((vUv - 0.5) * vec2(uScreen, 1.0));
    col += vec3(1.0, 0.72, 0.38) * leak * 0.22 * uBlur * (1.0 - smoothstep(0.0, 1.1, d));
    // Vignette + grain.
    col *= 1.0 - smoothstep(0.55, 1.35, d) * 0.55;
    col += (hash(vUv * 900.0 + fract(uTime * 7.0) * 100.0) - 0.5) * 0.045;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createStage(canvas, { reducedMotion = false, onLoaded } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // pass photo colours straight through
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const blank = new THREE.DataTexture(new Uint8Array([5, 5, 6, 255]), 1, 1);
  blank.needsUpdate = true;
  const uniforms = {
    uA: { value: blank },
    uB: { value: blank },
    uAspA: { value: 1.5 },
    uAspB: { value: 1.5 },
    uScreen: { value: 1.6 },
    uP: { value: 0 },
    uKA: { value: 0 },
    uKB: { value: 0 },
    uTime: { value: 0 },
    uBlur: { value: reducedMotion ? 0 : 1 },
    uFocA: { value: new THREE.Vector2(0.5, 0.5) },
    uFocB: { value: new THREE.Vector2(0.5, 0.5) },
    uPtr: { value: new THREE.Vector2() },
  };
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ uniforms, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader }),
  );
  scene.add(quad);

  // Load every scene photo; the first one ends the loader.
  const loader = new THREE.TextureLoader();
  const textures = SCENES.map(() => null);
  const ready = SCENES.map((s, i) =>
    new Promise((resolve) => {
      loader.load(img(s.photo), (t) => {
        t.colorSpace = THREE.NoColorSpace;
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        textures[i] = t;
        resolve(t);
      }, undefined, () => resolve(null));
    }),
  );
  // Focus points are written top-down (like CSS); the shader's uv is bottom-up.
  const focus = (s) => new THREE.Vector2(s.focus[0], 1 - s.focus[1]);
  const aspectOf = (t) => (t?.image ? t.image.width / t.image.height : 1.5);

  let current = 0;
  let arrived = performance.now();
  let flight = null;

  const setA = (i) => {
    uniforms.uA.value = textures[i] || blank;
    uniforms.uAspA.value = aspectOf(textures[i]);
    uniforms.uFocA.value.copy(focus(SCENES[i]));
  };
  ready[0].then(() => {
    setA(current);
    onLoaded?.();
  });

  function goTo(index) {
    if (!SCENES[index] || index === current) return 0;
    const from = current;
    current = index;
    const duration = reducedMotion ? 650 : 1500;
    const kb = kenBurns();
    ready[index].then(() => {
      setA(from);
      uniforms.uB.value = textures[index] || blank;
      uniforms.uAspB.value = aspectOf(textures[index]);
      uniforms.uFocB.value.copy(focus(SCENES[index]));
      uniforms.uKA.value = kb;
      flight = { start: performance.now(), duration, to: index };
    });
    return duration;
  }

  // Slow forward drift while a scene is on screen.
  const kenBurns = () => (reducedMotion ? 0 : Math.min(0.09, ((performance.now() - arrived) / 1000) * 0.006));

  const pointer = { x: 0, y: 0 };
  const onPointer = (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / innerHeight) * 2 - 1);
  };
  if (!reducedMotion) addEventListener('pointermove', onPointer, { passive: true });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    uniforms.uScreen.value = w / h;
  }
  resize();
  addEventListener('resize', resize);

  let running = true;
  const t0 = performance.now();
  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);
    const now = performance.now();
    uniforms.uTime.value = (now - t0) / 1000;
    uniforms.uPtr.value.x += (pointer.x - uniforms.uPtr.value.x) * 0.05;
    uniforms.uPtr.value.y += (pointer.y - uniforms.uPtr.value.y) * 0.05;
    if (flight) {
      const k = Math.min(1, (now - flight.start) / flight.duration);
      uniforms.uP.value = ease(k);
      if (k >= 1) {
        // Landed: the next scene becomes the resting shot.
        setA(flight.to);
        uniforms.uP.value = 0;
        uniforms.uKA.value = 0;
        arrived = now;
        flight = null;
      }
    } else {
      uniforms.uKA.value = kenBurns();
    }
    renderer.render(scene, camera);
  }
  tick();

  return {
    goTo,
    get current() {
      return current;
    },
    setScreen() {},
    pause(v) {
      running = !v;
      if (running) tick();
    },
    dispose() {
      running = false;
      removeEventListener('pointermove', onPointer);
      removeEventListener('resize', resize);
      renderer.dispose();
    },
  };
}
