import * as THREE from "three";
import { toCanvas } from "html-to-image";

/** Compact 3D value noise (good enough for stop-motion crumple). */
function hash3(x: number, y: number, z: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function noise3(x: number, y: number, z: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const z0 = Math.floor(z);
  const fx = x - x0;
  const fy = y - y0;
  const fz = z - z0;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);

  const n000 = hash3(x0, y0, z0);
  const n100 = hash3(x0 + 1, y0, z0);
  const n010 = hash3(x0, y0 + 1, z0);
  const n110 = hash3(x0 + 1, y0 + 1, z0);
  const n001 = hash3(x0, y0, z0 + 1);
  const n101 = hash3(x0 + 1, y0, z0 + 1);
  const n011 = hash3(x0, y0 + 1, z0 + 1);
  const n111 = hash3(x0 + 1, y0 + 1, z0 + 1);

  const x00 = n000 * (1 - ux) + n100 * ux;
  const x10 = n010 * (1 - ux) + n110 * ux;
  const x01 = n001 * (1 - ux) + n101 * ux;
  const x11 = n011 * (1 - ux) + n111 * ux;
  const y0l = x00 * (1 - uy) + x10 * uy;
  const y1l = x01 * (1 - uy) + x11 * uy;
  return (y0l * (1 - uz) + y1l * uz) * 2 - 1;
}

function sn(x: number, y: number, z: number): number {
  return (
    noise3(x, y, z) * 0.55 +
    noise3(x * 2.1, y * 2.1, z * 1.3) * 0.3 +
    noise3(x * 4.3, y * 4.3, z * 1.7) * 0.15
  );
}

type SheetDims = {
  /** Half of the longer side, px. */
  halfMax: number;
  /** Final crumpled-ball radius, px (~0.2 * sqrt(area), like real paper). */
  rBall: number;
  /** Noise frequency reference, px (shorter side). */
  scale: number;
};

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * Paper crumple in three phases driven by `amount` (0..1):
 *  1. Cup: the sheet wraps onto a sphere whose radius shrinks over time, so
 *     all four edges curl inward together (isotropic in physical px, so a
 *     wide card curls the same per-cm along both axes, no "tube").
 *  2. Crease: ridge noise displaces along the local surface normal so sharp
 *     folds form and deepen progressively.
 *  3. Gather: in the last ~half, blend into a noisy ball target so the sheet
 *     finishes as an irregular wad rather than a neat sphere.
 */
function crumpleVertex(
  ox: number,
  oy: number,
  amount: number,
  time: number,
  dims: SheetDims,
): [number, number, number] {
  const { halfMax, rBall, scale } = dims;
  const t = amount;

  // Sphere radius: gentle curl early, fast collapse late.
  const R = rBall + (1.5 * halfMax - rBall) * (1 - t) * (1 - t);

  // Irregular wrap so it doesn't roll up like a perfect cylinder/sphere.
  const nA = sn(ox / scale * 1.2 + 7, oy / scale * 1.2 + 3, time);
  const nB = sn(ox / scale * 1.2 + 31, oy / scale * 1.2 + 11, time);
  const theta = ox / R + nA * t * 1.1;
  const phi = oy / R + nB * t * 1.1;

  const cp = Math.cos(phi);
  const nx = Math.sin(theta) * cp;
  const ny = Math.sin(phi);
  const nz = Math.cos(theta) * cp;

  // Keep the sheet centre anchored at z=0; edges curl toward the viewer.
  let wx = R * nx;
  let wy = R * ny;
  let wz = R * (1 - nz);

  // Ridge (1 - |noise|) gives sharp crease lines; two octaves for detail.
  const ridge1 = 1 - Math.abs(sn(ox / scale * 3, oy / scale * 3, time * 0.5));
  const ridge2 =
    1 - Math.abs(sn(ox / scale * 7 + 5, oy / scale * 7 + 9, time * 0.5));
  const crease =
    ((ridge1 - 0.5) + (ridge2 - 0.5) * 0.5) * scale * 0.16 * t;
  wx += nx * crease;
  wy += ny * crease;
  wz += nz * crease;

  // Final gather into a noisy wad.
  const g = smoothstep(0.45, 1, t);
  if (g > 0) {
    const n1 = sn(ox / scale * 1.5, oy / scale * 1.5, time * 1.1);
    const n2 = sn(ox / scale * 1.5 + 43, oy / scale * 1.5 + 17, time * 1.2);
    const n3 = sn(ox / scale * 1.5 + 12, oy / scale * 1.5 + 89, time * 1.3);
    const combined =
      sn(ox / scale * 2, oy / scale * 2, time * 0.5) +
      sn(ox / scale * 5, oy / scale * 5, time * 0.8) * 0.5;

    let dx = ox + n1 * scale * 0.5;
    let dy = oy + n2 * scale * 0.5;
    let dz = n3 * scale * 0.6 + 0.01;
    const len = Math.hypot(dx, dy, dz) || 1;
    dx /= len;
    dy /= len;
    dz /= len;

    const br = rBall * (0.75 + 0.5 * Math.abs(combined));
    wx = wx * (1 - g) + dx * br * g;
    wy = wy * (1 - g) + dy * br * g;
    wz = wz * (1 - g) + dz * br * g;
  }

  return [wx, wy, wz];
}

function applyCrumple(
  geometry: THREE.BufferGeometry,
  originals: Float32Array,
  amount: number,
  time: number,
  dims: SheetDims,
) {
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  for (let i = 0; i < originals.length; i += 3) {
    const [x, y, z] = crumpleVertex(
      originals[i]!,
      originals[i + 1]!,
      amount,
      time,
      dims,
    );
    arr[i] = x;
    arr[i + 1] = y;
    arr[i + 2] = z;
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

/** Resolve the painted card surface color (handles CSS vars / transparent computed bg). */
function resolveCardPaperColor(el: HTMLElement): THREE.Color {
  const tryParse = (value: string | null | undefined): THREE.Color | null => {
    if (!value) return null;
    const v = value.trim();
    if (!v || v === "transparent") return null;
    if (/^rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)$/i.test(v)) return null;
    try {
      return new THREE.Color(v);
    } catch {
      return null;
    }
  };

  const fromEl =
    tryParse(getComputedStyle(el).backgroundColor) ??
    tryParse(getComputedStyle(el).getPropertyValue("background-color"));
  if (fromEl) return fromEl;

  const root = document.documentElement;
  const fromVar =
    tryParse(getComputedStyle(root).getPropertyValue("--card")) ??
    tryParse(getComputedStyle(root).getPropertyValue("--color-card"));
  if (fromVar) return fromVar;

  // Light/dark fallback matching app theme tokens.
  const dark = root.classList.contains("dark");
  return new THREE.Color(dark ? "#121c19" : "#ffffff");
}

function colorToCss(c: THREE.Color): string {
  return `#${c.getHexString()}`;
}

/**
 * Build an opaque paper texture: solid card color + optional DOM snapshot on top.
 * Never leaves transparent pixels (those read as black in WebGL).
 */
function buildPaperCanvas(
  paperColor: THREE.Color,
  width: number,
  height: number,
  snapshot: HTMLCanvasElement | null,
): HTMLCanvasElement {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(2, Math.round(width * dpr));
  canvas.height = Math.max(2, Math.round(height * dpr));
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return canvas;

  ctx.fillStyle = colorToCss(paperColor);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (snapshot && snapshot.width > 0 && snapshot.height > 0) {
    ctx.drawImage(snapshot, 0, 0, canvas.width, canvas.height);
    // Re-seal any residual transparency with paper color underneath by
    // compositing: already drew fill first, drawImage blends on top.
  }

  return canvas;
}

export type CrumplePaperOptions = {
  onComplete?: () => void;
  maxSteps?: number;
  stepMs?: number;
  pad?: number;
};

/**
 * Snapshot a DOM node and play a stop-motion paper-crumple animation over it.
 * Uses MeshBasicMaterial + CPU crumple so the card color/texture is preserved.
 */
export async function playCrumplePaper(
  source: HTMLElement,
  options: CrumplePaperOptions = {},
): Promise<void> {
  const {
    onComplete,
    maxSteps = 5,
    stepMs = 160,
    pad = 96,
  } = options;

  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    onComplete?.();
    return;
  }

  const rect = source.getBoundingClientRect();
  if (rect.width < 4 || rect.height < 4) {
    onComplete?.();
    return;
  }

  const paperColor = resolveCardPaperColor(source);
  const paperCss = colorToCss(paperColor);

  let snapshot: HTMLCanvasElement | null = null;
  try {
    snapshot = await toCanvas(source, {
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      cacheBust: true,
      backgroundColor: paperCss,
      style: {
        backgroundColor: paperCss,
      },
    });
  } catch {
    snapshot = null;
  }

  const paperCanvas = buildPaperCanvas(
    paperColor,
    rect.width,
    rect.height,
    snapshot,
  );

  const prevVisibility = source.style.visibility;
  source.style.visibility = "hidden";

  const W = Math.ceil(rect.width + pad * 2);
  const H = Math.ceil(rect.height + pad * 2);

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, {
    position: "fixed",
    left: `${rect.left - pad}px`,
    top: `${rect.top - pad}px`,
    width: `${W}px`,
    height: `${H}px`,
    zIndex: "9999",
    pointerEvents: "none",
    overflow: "visible",
  });
  document.body.appendChild(host);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -W / 2,
    W / 2,
    H / 2,
    -H / 2,
    0.1,
    4000,
  );
  camera.position.z = 800;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const tex = new THREE.CanvasTexture(paperCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  tex.needsUpdate = true;

  // Lit paper: card texture as albedo, matte like paper, flat shading so
  // creases read as sharp facets. Lights below are tuned so a flat, unlit
  // sheet renders at ~1.0x its texture color (no gray washout).
  const material = new THREE.MeshStandardMaterial({
    map: tex,
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0,
    flatShading: true,
    side: THREE.DoubleSide,
    toneMapped: false,
  });

  // Ambient keeps the card color visible in shadowed folds; the key light
  // from the top-right gives creases their highlight/shadow contrast.
  // three.js lights are physically based (Lambert BRDF divides by PI), so a
  // flat sheet needs ~PI total irradiance to render at its texture color.
  // Ambient 1.25 (~0.40) + key 2.2 * NdotL 0.77 (~0.54) + fill (~0.10) ≈ 1.0.
  scene.add(new THREE.AmbientLight(0xffffff, 1.25));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(0.45, 0.65, 1).normalize().multiplyScalar(600);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.4);
  fill.position.set(-0.6, -0.3, 0.8).normalize().multiplyScalar(600);
  scene.add(fill);

  const segs = Math.min(
    80,
    Math.max(24, Math.round(Math.max(rect.width, rect.height) / 5)),
  );
  const geometry = new THREE.PlaneGeometry(rect.width, rect.height, segs, segs);
  const originals = new Float32Array(
    (geometry.attributes.position as THREE.BufferAttribute).array as Float32Array,
  );
  const dims: SheetDims = {
    halfMax: Math.max(rect.width, rect.height) / 2,
    rBall: 0.2 * Math.sqrt(rect.width * rect.height),
    scale: Math.min(rect.width, rect.height),
  };

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -0.08;
  mesh.rotation.y = 0.08;
  scene.add(mesh);

  let raf = 0;
  const render = () => {
    raf = requestAnimationFrame(render);
    renderer.render(scene, camera);
  };
  render();

  await new Promise<void>((resolve) => {
    let step = 0;
    const interval = window.setInterval(() => {
      step += 1;
      const amount = step / maxSteps;
      // Smaller time jumps so creases evolve between frames instead of
      // re-randomising completely.
      const time = step * 0.7;
      applyCrumple(geometry, originals, amount, time, dims);

      // Tumble grows with the crumple: barely tilts while it's still a
      // sheet, tumbles in the hand once it's a wad.
      const spin = 0.25 + 1.3 * amount;
      mesh.rotation.x += (Math.random() - 0.5) * spin;
      mesh.rotation.y += (Math.random() - 0.5) * spin;
      mesh.rotation.z += (Math.random() - 0.5) * spin;
      mesh.position.x += (Math.random() - 0.5) * 8 * amount;
      mesh.position.y += (Math.random() - 0.5) * 8 * amount;

      if (step >= maxSteps) {
        window.clearInterval(interval);
        resolve();
      }
    }, stepMs);
  });

  onComplete?.();

  host.style.transition = "opacity 180ms ease-out";
  host.style.opacity = "0";
  await new Promise((r) => window.setTimeout(r, 200));

  cancelAnimationFrame(raf);
  geometry.dispose();
  material.dispose();
  tex.dispose();
  renderer.dispose();
  host.remove();

  if (source.isConnected) {
    source.style.visibility = prevVisibility;
  }
}
