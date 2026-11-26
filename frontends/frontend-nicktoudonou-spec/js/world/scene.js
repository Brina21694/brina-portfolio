/* ==========================================================================
   DATA WORLD — le monde 3D (Three.js, sans framework).

   Un seul monde continu, quatre lieux reliés par des flux de données :
     CITY     (0, 0, 0)     la place centrale, l'écran d'identité, la table-carte
     LAB      (-34, 0, -6)  hall brutaliste, un terminal par domaine de compétences
     ARCHIVE  (34, 0, -6)   centre de données, le Data Core, un cube par projet
     JOURNEY  (0, 0, -26→)  allée d'arches ivoire vers le soleil, une plaque par étape

   La caméra ne "change pas de page" : elle voyage réellement d'un lieu à l'autre.
   ========================================================================== */

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { identityTexture, terminalTexture, cubeTexture, plaqueTexture, signTexture, gridTexture } from "./textures.js";

export const ZONES = {
  city:    { num: "01", name: "The City",     accent: "#FFB36B", center: new THREE.Vector3(0, 0, 0) },
  lab:     { num: "02", name: "The Lab",      accent: "#E8262E", center: new THREE.Vector3(-34, 0, -6) },
  archive: { num: "03", name: "Data Archive", accent: "#FF7A3D", center: new THREE.Vector3(34, 0, -6) },
  journey: { num: "04", name: "The Journey",  accent: "#F2EEE5", center: new THREE.Vector3(0, 0, -40) },
};

const POSES = {
  city:    { pos: new THREE.Vector3(0, 7.5, 36),   target: new THREE.Vector3(0, 6, -8) },
  lab:     { pos: new THREE.Vector3(-34, 4.8, 5.4), target: new THREE.Vector3(-34, 4.2, -7) },
  archive: { pos: new THREE.Vector3(34, 5.4, 11),  target: new THREE.Vector3(34, 3.8, -6) },
};

const SUN_DIR = new THREE.Vector3(0.22, 0.055, -1).normalize();
const JOURNEY_START = -30;
const JOURNEY_STEP = 14;

/* petit générateur reproductible */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const glow = (hex, k) => new THREE.Color(hex).multiplyScalar(k);   // couleur > 1 = halo (bloom)

export class DataWorld {
  constructor(canvas, { mobile = false, reduced = false, onHover, onSelect, onTravel, onZone } = {}) {
    this.canvas = canvas;
    this.mobile = mobile;
    this.reduced = reduced;
    this.cb = { onHover, onSelect, onTravel, onZone };
    this.items = [];
    this.anim = [];          // fonctions appelées à chaque image (t, dt)
    this.zone = "city";
    this.journey = [];       // stations du parcours
    this.jIndex = 0;
    this.look = { yaw: 0, pitch: 0, ty: 0, tp: 0, sx: 0, sy: 0, tsx: 0, tsy: 0 };
    this.clock = new THREE.Clock();
    this.time = 0;
    this.hover = null;
    this.pointer = new THREE.Vector2(9, 9);
    this.raycaster = new THREE.Raycaster();
    this.attract = false;

    this.initRenderer();
    this.initScene();
    this.buildSky();
    this.buildGround();
    this.buildCity();
    this.buildHub();
    this.buildLab();
    this.buildArchive();
    this.buildJourneyPath();
    this.buildAtmosphere();
    this.buildStreams();
    this.bind();

    this.base = { pos: POSES.city.pos.clone(), target: POSES.city.target.clone() };
    this.applyCamera(0);
    this.resize();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  /* ======================================================================
     MOTEUR
     ====================================================================== */

  initRenderer() {
    const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, powerPreference: "high-performance" });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.mobile ? 1.25 : 1.6));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 0.95;
    r.shadowMap.enabled = !this.mobile;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer = r;

    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1400);
    this.baseFov = 48;
  }

  initScene() {
    const s = new THREE.Scene();
    s.fog = new THREE.FogExp2(new THREE.Color("#3A1733"), 0.0058);
    this.scene = s;

    s.add(new THREE.HemisphereLight(new THREE.Color("#8A6BD0"), new THREE.Color("#1A0C12"), 0.75));
    const sun = new THREE.DirectionalLight(new THREE.Color("#FFB27A"), 2.0);
    sun.position.copy(SUN_DIR).multiplyScalar(120);
    sun.castShadow = !this.mobile;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 10, far: 300 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.04;
    s.add(sun, sun.target);
    this.sun = sun;

    const size = new THREE.Vector2();
    this.renderer.getSize(size);
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: this.mobile ? 0 : 4 });
    this.composer = new EffectComposer(this.renderer, rt);
    this.composer.addPass(new RenderPass(s, this.camera));
    // Garde-fou : un pixel invalide (NaN / infini) ferait "baver" un carré noir dans le bloom
    this.composer.addPass(new ShaderPass({
      uniforms: { tDiffuse: { value: null } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
        void main(){ vec4 c = texture2D(tDiffuse, vUv);
          if (!(c.r == c.r) || !(c.g == c.g) || !(c.b == c.b)) c = vec4(0.0, 0.0, 0.0, 1.0);
          gl_FragColor = vec4(clamp(c.rgb, 0.0, 48.0), 1.0); }`,
    }));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.7, 0.5, 0.9);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
  }

  resize() {
    const w = this.canvas.clientWidth || innerWidth;
    const h = this.canvas.clientHeight || innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.bloom.resolution.set(w / 2, h / 2);
    this.camera.aspect = w / h;
    this.baseFov = w / h < 0.8 ? 66 : w / h < 1.2 ? 56 : 48;
    this.camera.fov = this.baseFov;
    this.camera.updateProjectionMatrix();
  }

  /* ======================================================================
     DÉCOR
     ====================================================================== */

  buildSky() {
    const uniforms = {
      sunDir: { value: SUN_DIR },
      cTop: { value: new THREE.Color("#07050D") },
      cMid: { value: new THREE.Color("#24103A") },
      cLow: { value: new THREE.Color("#6B1D3E") },
      cHor: { value: new THREE.Color("#F0784A") },
      cSun: { value: new THREE.Color("#FFC488") },
      cGround: { value: new THREE.Color("#0B070D") },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 sunDir, cTop, cMid, cLow, cHor, cSun, cGround;
        varying vec3 vDir;
        float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }
        void main(){
          vec3 d = normalize(vDir);
          float h = d.y;
          float s = max(dot(d, sunDir), 0.0);
          float side = pow(max(dot(normalize(vec3(d.x,0.,d.z)), normalize(vec3(sunDir.x,0.,sunDir.z))),0.0), 3.0);
          vec3 hor = mix(cLow*1.2, cHor, side);
          vec3 col = mix(hor, cLow, smoothstep(0.0, 0.16, h));
          col = mix(col, cMid, smoothstep(0.1, 0.38, h));
          col = mix(col, cTop, smoothstep(0.32, 0.95, h));
          col = mix(col, cGround, smoothstep(0.0, -0.12, h));
          col += cSun * (pow(s, 5.0) * 0.45 + pow(s, 48.0) * 0.9);
          col += cSun * smoothstep(0.99935, 0.99965, s) * 7.0;
          float band = sin(h * 150.0 + sin(d.x * 4.0 + d.z * 2.0) * 3.0) * 0.5 + 0.5;
          col *= 1.0 - 0.12 * band * smoothstep(0.03, 0.12, h) * smoothstep(0.32, 0.14, h);
          vec3 q = floor(d * 420.0);
          col += vec3(1.0, 0.92, 0.85) * step(0.9988, hash(q)) * smoothstep(0.28, 0.7, h) * 0.9;
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), mat);
    this.sky.renderOrder = -1;
    this.scene.add(this.sky);

    // reflets : on "photographie" le ciel pour éclairer les matériaux métalliques
    const pm = new THREE.PMREMGenerator(this.renderer);
    const skyScene = new THREE.Scene();
    skyScene.add(new THREE.Mesh(this.sky.geometry, mat));
    this.envRT = pm.fromScene(skyScene, 0, 0.1, 1000);
    this.scene.environment = this.envRT.texture;
    this.scene.environmentIntensity = 0.55;
    pm.dispose();
  }

  buildGround() {
    const tex = gridTexture(this.renderer);
    tex.repeat.set(150, 150);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1200, 1200),
      new THREE.MeshStandardMaterial({ color: "#2A2230", map: tex, roughness: 0.62, metalness: 0.4 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  /* Skyline : des centaines d'immeubles en UN seul objet (InstancedMesh).
     Les fenêtres sont calculées par le GPU à partir de la position. */
  buildCity() {
    const r = rng(2077);
    const count = this.mobile ? 260 : 520;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({ color: "#1C1424", roughness: 0.6, metalness: 0.5 });
    const shared = { uTime: { value: 0 } };
    this.cityUniforms = shared;
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = shared.uTime;
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWPos; varying vec3 vWNor;")
        .replace("#include <project_vertex>", `#include <project_vertex>
          vec4 wp = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
          vWPos = wp.xyz; vWNor = normalize(mat3(modelMatrix * instanceMatrix) * objectNormal);`);
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", `#include <common>
          varying vec3 vWPos; varying vec3 vWNor; uniform float uTime;
          float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`)
        .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
          {
            vec3 an = abs(vWNor);
            float side = step(an.y, 0.5);
            vec2 c = an.x > an.z ? vec2(vWPos.z, vWPos.y) : vec2(vWPos.x, vWPos.y);
            vec2 g = c / vec2(1.7, 2.6);
            vec2 id = floor(g); vec2 f = fract(g);
            float win = step(0.2, f.x) * step(f.x, 0.8) * step(0.28, f.y) * step(f.y, 0.72);
            float seed = h21(id + floor(vWPos.xz / 9.0) * 17.0);
            float lit = step(0.74, h21(id * 1.3 + floor(uTime * 0.05 + seed * 30.0))) * side * step(2.0, vWPos.y);
            vec3 wc = mix(vec3(1.0, 0.6, 0.28), vec3(1.0, 0.85, 0.65), h21(id * 2.1));
            wc = mix(wc, vec3(0.55, 0.8, 1.0), step(0.95, h21(id * 3.7)));
            totalEmissiveRadiance += wc * win * lit * (0.9 + 1.4 * seed);
            // liseré de coucher de soleil en haut des tours
            totalEmissiveRadiance += vec3(0.9, 0.35, 0.2) * 0.12 * smoothstep(0.0, 1.0, vWPos.y / 90.0) * side;
          }`);
    };

    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const tops = [];
    let i = 0;
    let guard = 0;
    while (i < count && guard < count * 6) {
      guard += 1;
      const ang = r() * Math.PI * 2;
      const rad = 62 + Math.pow(r(), 0.7) * 190;
      const x = Math.sin(ang) * rad;
      const z = Math.cos(ang) * rad - 10;
      // garder dégagés : le couloir du soleil (journey) et les abords des zones
      const toSun = Math.abs(Math.atan2(x, -z) - Math.atan2(SUN_DIR.x, -SUN_DIR.z));
      if (z < -40 && Math.abs(x) < 26 + (-z - 40) * 0.18) continue;
      const far = rad > 130;
      let hgt = 8 + Math.pow(r(), 2.2) * (far ? 120 : 70);
      if (toSun < 0.16) hgt *= 0.35;
      const w = 5 + r() * 9;
      const d = 5 + r() * 9;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.round(r() * 3) * (Math.PI / 2) + (r() < 0.2 ? r() * 0.4 : 0));
      m.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(w, hgt, d));
      mesh.setMatrixAt(i, m);
      if (hgt > 55) tops.push(new THREE.Vector3(x, hgt + 1.5, z));
      i += 1;
    }
    mesh.count = i;
    this.scene.add(mesh);

    // feux rouges clignotants au sommet des tours
    const tg = new THREE.BufferGeometry().setFromPoints(tops);
    const seeds = new Float32Array(tops.length).map(() => r());
    tg.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
    const beacons = new THREE.Points(tg, new THREE.ShaderMaterial({
      uniforms: { uTime: shared.uTime, uScale: { value: this.renderer.getPixelRatio() } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float seed; uniform float uTime, uScale; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv;
          vA = step(0.55, fract(uTime * 0.6 + seed)); gl_PointSize = 260.0 * uScale / -mv.z; }`,
      fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(3.0,0.3,0.25) * smoothstep(0.5, 0.0, d) * vA, 1.0); }`,
    }));
    this.scene.add(beacons);
  }

  /* Place centrale : plateforme, écran d'identité, table-carte, monolithes guides */
  buildHub() {
    const plaza = new THREE.Mesh(
      new THREE.CylinderGeometry(16, 16.4, 0.4, 96),
      new THREE.MeshStandardMaterial({ color: "#16121C", roughness: 0.55, metalness: 0.6 }),
    );
    plaza.position.y = 0.2;
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    for (const [rad, k] of [[15.6, 2.2], [9, 0.9]]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(rad - 0.06, rad, 128), new THREE.MeshBasicMaterial({ color: glow("#FFB36B", k), side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.42;
      this.scene.add(ring);
    }

    // écran géant d'identité (rempli par setData)
    const frame = new THREE.Group();
    frame.position.set(13, 0, -16);
    frame.rotation.y = -0.32;
    const steel = new THREE.MeshStandardMaterial({ color: "#1A1620", roughness: 0.6, metalness: 0.6 });
    for (const x of [-9.6, 9.6]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 15, 0.7), steel);
      leg.position.set(x, 7.5, -0.3);
      leg.castShadow = true;
      frame.add(leg);
    }
    const back = new THREE.Mesh(new THREE.BoxGeometry(19.8, 9.2, 0.5), steel);
    back.position.set(0, 10, -0.45);
    back.castShadow = true;
    frame.add(back);
    this.idScreen = new THREE.Mesh(new THREE.PlaneGeometry(19, 8.35), new THREE.MeshBasicMaterial({ color: glow("#ffffff", 1.0), fog: false }));
    this.idScreen.position.set(0, 10, -0.18);
    frame.add(this.idScreen);
    this.scene.add(frame);
    this.register({
      id: "identity", zone: "city", kind: "identity", label: "Écran d'identité", sub: "Qui je suis", tagY: 4.8,
      hit: this.idScreen, focus: { obj: this.idScreen, dist: 20 },
    });

    // table-carte holographique
    const table = new THREE.Group();
    table.position.set(0, 0, 18);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.7, 1.1, 48), steel);
    ped.position.y = 0.95;
    ped.castShadow = true;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.1, 0.12, 64), new THREE.MeshStandardMaterial({ color: "#100C16", roughness: 0.4, metalness: 0.7 }));
    top.position.y = 1.56;
    const disc = new THREE.Mesh(new THREE.RingGeometry(2.9, 3.0, 96), new THREE.MeshBasicMaterial({ color: glow("#FFB36B", 2.5) }));
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 1.63;
    table.add(ped, top, disc);
    const scale = 2.6 / 100;
    const holo = new THREE.Group();
    holo.position.y = 1.64;
    table.add(holo);
    this.mapMarkers = [];
    for (const [key, z] of Object.entries(ZONES)) {
      const p = key === "journey" ? new THREE.Vector3(0, 0, -62) : z.center.clone();
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), new THREE.MeshBasicMaterial({ color: glow(z.accent, 2.4), transparent: true, opacity: 0.85 }));
      beam.position.set(p.x * scale, 0.55, (p.z + 18) * scale - 0.2);
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), new THREE.MeshBasicMaterial({ color: glow(z.accent, 3) }));
      gem.position.set(beam.position.x, 1.2, beam.position.z);
      holo.add(beam, gem);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.copy(gem.position);
      holo.add(hit);
      this.mapMarkers.push(gem);
      this.register({ id: `map-${key}`, zone: "city", kind: "travel", target: key, label: `Carte → ${z.name}`, sub: `World ${z.num}`, hit, apply: (h) => gem.scale.setScalar(1 + h * 0.8) });
    }
    this.anim.push((t) => { holo.rotation.y = Math.sin(t * 0.15) * 0.08; this.mapMarkers.forEach((g, i) => { g.rotation.y = t * 1.2 + i; g.position.y = 1.2 + Math.sin(t * 2 + i) * 0.06; }); });
    this.scene.add(table);

    // enseignes et portails vers les zones
    for (const [key, z] of Object.entries(ZONES)) {
      if (key === "city") continue;
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.25), new THREE.MeshBasicMaterial({ map: signTexture(z.num, z.name, z.accent, this.renderer), transparent: true, color: glow("#ffffff", 1.25), depthWrite: false, fog: false }));
      const pos = key === "journey" ? new THREE.Vector3(0, 12.5, JOURNEY_START + 2) : z.center.clone().add(new THREE.Vector3(0, 13.8, 2));
      sign.position.copy(pos);
      sign.lookAt(POSES.city.pos.x * 0.4, pos.y - 1, POSES.city.pos.z);
      this.scene.add(sign);
    }
  }

  /* LAB : hall brutaliste, lumière rouge, pyramide suspendue */
  buildLab() {
    const c = ZONES.lab.center;
    const g = new THREE.Group();
    g.position.copy(c);
    const concrete = new THREE.MeshStandardMaterial({ color: "#3A3638", roughness: 0.92, metalness: 0.05 });
    const add = (geo, x, y, z, mat = concrete) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
    add(new THREE.BoxGeometry(26, 0.5, 15), 0, 0.25, -6);
    add(new THREE.BoxGeometry(26, 11, 1), 0, 5.5, -13.5);
    add(new THREE.BoxGeometry(28, 1.4, 17), 0, 11.6, -6);
    for (const x of [-12.2, 12.2]) add(new THREE.BoxGeometry(1.8, 11, 1.8), x, 5.5, 1.2);
    for (const x of [-9, -3, 3, 9]) add(new THREE.BoxGeometry(0.5, 10.9, 2.4), x, 5.5, -12.6);
    const red = new THREE.MeshBasicMaterial({ color: glow("#E8262E", 4) });
    add(new THREE.BoxGeometry(24, 0.08, 0.08), 0, 10.85, 2.4, red);
    add(new THREE.BoxGeometry(24, 0.06, 0.06), 0, 0.55, 1.6, red);
    add(new THREE.BoxGeometry(0.06, 9.5, 0.06), -11.2, 5.5, -12.9, red);
    add(new THREE.BoxGeometry(0.06, 9.5, 0.06), 11.2, 5.5, -12.9, red);

    const pyr = new THREE.Mesh(new THREE.ConeGeometry(2.6, 3.6, 4), new THREE.MeshStandardMaterial({ color: "#09080A", roughness: 0.25, metalness: 0.9 }));
    pyr.rotation.x = Math.PI;
    pyr.position.set(0, 9.2, -11.4);
    pyr.castShadow = true;
    g.add(pyr);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(4.2, 7.6, 4, 1, true), new THREE.ShaderMaterial({
      uniforms: { uTime: this.cityUniforms.uTime },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: `uniform float uTime; varying vec2 vUv;
        void main(){ float a = pow(vUv.y, 1.5) * 0.26 * (0.85 + 0.15 * sin(uTime * 3.0 + vUv.y * 20.0));
          gl_FragColor = vec4(vec3(1.6, 0.18, 0.15) * a, 1.0); }`,
    }));
    cone.position.set(0, 4.9, -11.4);
    g.add(cone);
    this.anim.push((t) => { cone.rotation.y = t * 0.18; });
    this.anim.push((t) => { pyr.rotation.y = t * 0.18; pyr.position.y = 9.2 + Math.sin(t * 0.7) * 0.12; });

    const light = new THREE.PointLight(new THREE.Color("#FF2A30"), 160, 34, 1.6);
    light.position.set(0, 7, -3);
    g.add(light);
    this.labGroup = g;
    this.scene.add(g);

    const hit = new THREE.Mesh(new THREE.BoxGeometry(28, 12, 16), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(c.x, 6, c.z - 6);
    this.scene.add(hit);
    this.register({ id: "portal-lab", zone: "*", kind: "travel", target: "lab", label: "The Lab", sub: "Compétences", hit, anchor: new THREE.Vector3(-21, 8.5, -2) });
  }

  /* ARCHIVE : baies de serveurs, LED, Data Core (les cubes viennent avec les données) */
  buildArchive() {
    const c = ZONES.archive.center;
    const r = rng(42);
    const g = new THREE.Group();
    g.position.copy(c);

    const floor = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 0.3, 96), new THREE.MeshStandardMaterial({ color: "#121017", roughness: 0.4, metalness: 0.75 }));
    floor.position.y = 0.15;
    floor.receiveShadow = true;
    g.add(floor);
    const ring = new THREE.Mesh(new THREE.RingGeometry(14.7, 14.85, 128), new THREE.MeshBasicMaterial({ color: glow("#FF7A3D", 2.4), side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.32;
    g.add(ring);

    // baies de serveurs en arc derrière le noyau
    const rackGeo = new THREE.BoxGeometry(1.6, 7, 1.2);
    rackGeo.translate(0, 3.5, 0);
    const racks = new THREE.InstancedMesh(rackGeo, new THREE.MeshStandardMaterial({ color: "#17151C", roughness: 0.35, metalness: 0.85 }), 40);
    racks.castShadow = true;
    const leds = [];
    const ledSeed = [];
    const m = new THREE.Matrix4();
    let n = 0;
    for (const [rad, from, to, step] of [[11, 0.62, 2.52, 0.13], [14, 0.7, 2.44, 0.12]]) {
      for (let a = from; a <= to && n < 40; a += step) {
        const ang = a + Math.PI;           // arc derrière (z négatif)
        const x = Math.cos(ang) * rad;
        const z = Math.sin(ang) * rad;
        const rot = Math.atan2(-x, -z);
        m.compose(new THREE.Vector3(x, 0.3, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot), new THREE.Vector3(1, 0.8 + r() * 0.5, 1));
        racks.setMatrixAt(n, m);
        const fx = Math.sin(rot), fz = Math.cos(rot);
        for (let k = 0; k < 26; k += 1) {
          leds.push(x + fx * 0.62 + Math.cos(rot) * (r() - 0.5) * 1.3, 0.8 + r() * 5.5, z + fz * 0.62 - Math.sin(rot) * (r() - 0.5) * 1.3);
          ledSeed.push(r());
        }
        n += 1;
      }
    }
    racks.count = n;
    g.add(racks);
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.Float32BufferAttribute(leds, 3));
    lg.setAttribute("seed", new THREE.Float32BufferAttribute(ledSeed, 1));
    const ledMat = new THREE.ShaderMaterial({
      uniforms: { uTime: this.cityUniforms.uTime, uScale: { value: this.renderer.getPixelRatio() } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float seed; uniform float uTime, uScale; varying float vS; varying float vOn;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv;
          vS = seed; vOn = step(0.35, fract(sin(floor(uTime * (2.0 + seed * 6.0)) * 91.7 + seed * 311.0) * 43758.5));
          gl_PointSize = 70.0 * uScale / -mv.z; }`,
      fragmentShader: `varying float vS; varying float vOn;
        void main(){ float d = length(gl_PointCoord - 0.5); vec3 c = vS > 0.8 ? vec3(0.4,1.6,2.4) : vec3(2.6,1.0,0.35);
          gl_FragColor = vec4(c * smoothstep(0.5, 0.1, d) * vOn, 1.0); }`,
    });
    g.add(new THREE.Points(lg, ledMat));

    // Data Core
    const core = new THREE.Group();
    core.position.set(0, 4.4, 0);
    const heart = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 2), new THREE.MeshStandardMaterial({ color: "#1a0a04", emissive: new THREE.Color("#FF6A2A"), emissiveIntensity: 2.6, roughness: 0.3, metalness: 0.2, flatShading: true }));
    const shell = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.9, 1)), new THREE.LineBasicMaterial({ color: glow("#FFB36B", 2.2) }));
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.025, 8, 128), new THREE.MeshBasicMaterial({ color: glow("#FF7A3D", 3) }));
    const ringB = ringA.clone();
    ringA.rotation.x = Math.PI / 2.4;
    ringB.rotation.y = Math.PI / 2.2;
    core.add(heart, shell, ringA, ringB);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 60, 8, 1, true), new THREE.MeshBasicMaterial({ color: glow("#FF7A3D", 2.2), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    beam.position.y = 30;
    g.add(core, beam);
    const coreLight = new THREE.PointLight(new THREE.Color("#FF7A3D"), 120, 30, 1.6);
    coreLight.position.set(0, 4.4, 0);
    g.add(coreLight);
    this.anim.push((t) => {
      heart.rotation.y = t * 0.4; heart.rotation.x = t * 0.23;
      shell.rotation.y = -t * 0.15;
      ringA.rotation.z = t * 0.5; ringB.rotation.x = t * 0.35;
      heart.material.emissiveIntensity = 2.4 + Math.sin(t * 2.2) * 0.5;
    });
    this.core = core;

    // vitrine de verre + socle : le noyau est "exposé" comme une pièce d'archive
    const glass = new THREE.Mesh(new THREE.BoxGeometry(5, 6.4, 5), new THREE.MeshStandardMaterial({
      color: "#FFE2C8", transparent: true, opacity: 0.07, roughness: 0.05, metalness: 0.3, depthWrite: false, side: THREE.FrontSide,
    }));
    glass.position.y = 4.1;
    const glassEdges = new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), new THREE.LineBasicMaterial({ color: glow("#FFB36B", 1.6), transparent: true, opacity: 0.7 }));
    glassEdges.position.copy(glass.position);
    const socle = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.8, 5.6), new THREE.MeshStandardMaterial({ color: "#0F0C12", roughness: 0.85, metalness: 0.1 }));
    socle.position.y = 0.7;
    socle.castShadow = true;
    const socleLine = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5.62, 0.02, 5.62)), new THREE.LineBasicMaterial({ color: glow("#FF7A3D", 3) }));
    socleLine.position.y = 1.08;
    g.add(glass, glassEdges, socle, socleLine);

    // rubans de lumière : la donnée qui circule autour du noyau
    const ribbonMat = (color, phase) => new THREE.ShaderMaterial({
      uniforms: { uTime: this.cityUniforms.uTime, uColor: { value: glow(color, 1) }, uPhase: { value: phase } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: `uniform float uTime, uPhase; uniform vec3 uColor; varying vec2 vUv;
        void main(){ float f = fract(vUv.x * 3.0 - uTime * 0.35 + uPhase);
          float a = smoothstep(0.0, 0.7, f) * smoothstep(1.0, 0.85, f);
          float edge = 1.0 - abs(vUv.y - 0.5) * 2.0;
          gl_FragColor = vec4(uColor * (0.6 + 2.6 * f * f) * a * edge, 1.0); }`,
    });
    [["#FFB36B", 0], ["#FF5A2A", 0.33], ["#FFE6C8", 0.66], ["#E8262E", 0.15]].forEach(([col, ph], k) => {
      const pts = [];
      for (let i = 0; i <= 80; i += 1) {
        const u = i / 80;
        const a = u * Math.PI * (3 + k) + k * 1.7;
        const rad = 1.5 + Math.sin(u * Math.PI) * (0.6 + k * 0.15);
        pts.push(new THREE.Vector3(Math.cos(a) * rad, 1.3 + u * 5.6, Math.sin(a) * rad));
      }
      const ribbon = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.035 + k * 0.01, 6), ribbonMat(col, ph));
      g.add(ribbon);
      this.anim.push((t) => { ribbon.rotation.y = t * (0.12 + k * 0.05) * (k % 2 ? -1 : 1); });
    });
    this.archiveGroup = g;
    this.scene.add(g);

    const coreHit = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12), new THREE.MeshBasicMaterial({ visible: false }));
    coreHit.position.set(c.x, 4.4, c.z);
    this.scene.add(coreHit);
    this.register({ id: "core", zone: "archive", kind: "core", label: "Data Core", sub: "Tous les projets", tagY: 3.9, hit: coreHit, focus: { obj: coreHit, dist: 11 }, apply: (h) => core.scale.setScalar(1 + h * 0.12) });

    const hit = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 12, 24), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(c.x, 6, c.z);
    this.scene.add(hit);
    this.register({ id: "portal-archive", zone: "*", kind: "travel", target: "archive", label: "Data Archive", sub: "Projets", hit, anchor: new THREE.Vector3(21, 8.5, -2) });

    this.cubes = new THREE.Group();
    this.cubes.position.set(c.x, 0, c.z);
    this.scene.add(this.cubes);
  }

  /* JOURNEY : chemin lumineux vers le soleil (arches ajoutées avec les données) */
  buildJourneyPath() {
    const len = 120;
    const path = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, len), new THREE.MeshStandardMaterial({ color: "#E9E2D2", roughness: 0.55, metalness: 0.1, emissive: new THREE.Color("#FFB36B"), emissiveIntensity: 0.06 }));
    path.position.set(0, 0.05, JOURNEY_START - len / 2 + 14);
    path.receiveShadow = true;
    this.scene.add(path);
    const markGeo = new THREE.BoxGeometry(3.2, 0.03, 0.08);
    const markMat = new THREE.MeshBasicMaterial({ color: glow("#FFB36B", 2) });
    const marks = new THREE.InstancedMesh(markGeo, markMat, 40);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 40; i += 1) { m.makeTranslation(0, 0.1, JOURNEY_START + 12 - i * 3); marks.setMatrixAt(i, m); }
    this.scene.add(marks);
    this.journeyGroup = new THREE.Group();
    this.scene.add(this.journeyGroup);
    const hit = new THREE.Mesh(new THREE.BoxGeometry(12, 10, 60), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(0, 5, JOURNEY_START - 26);
    this.scene.add(hit);
    this.register({ id: "portal-journey", zone: "*", kind: "travel", target: "journey", label: "The Journey", sub: "Parcours", hit, tagY: 3 });
  }

  /* Poussière lumineuse et circulation aérienne : le monde respire */
  buildAtmosphere() {
    const r = rng(7);
    const n = this.mobile ? 700 : 1600;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i += 1) { pos[i * 3] = (r() - 0.5) * 150; pos[i * 3 + 1] = r() * 30; pos[i * 3 + 2] = (r() - 0.5) * 150 - 20; }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(dg, new THREE.ShaderMaterial({
      uniforms: { uTime: this.cityUniforms.uTime, uScale: { value: this.renderer.getPixelRatio() } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `uniform float uTime, uScale; varying float vA;
        void main(){ vec3 p = position; p.y = mod(p.y + uTime * 0.25, 30.0); p.x += sin(uTime * 0.2 + position.z) * 0.6;
          vec4 mv = modelViewMatrix * vec4(p,1.0); gl_Position = projectionMatrix * mv;
          vA = smoothstep(0.0, 4.0, p.y) * smoothstep(30.0, 22.0, p.y); gl_PointSize = 40.0 * uScale / -mv.z; }`,
      fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(1.0,0.7,0.45) * smoothstep(0.5,0.0,d) * vA * 0.55, 1.0); }`,
    }));
    this.scene.add(dust);

    // véhicules volants : des points qui tournent au-dessus de la ville
    const lanes = 9;
    const per = this.mobile ? 10 : 18;
    const vp = new Float32Array(lanes * per * 3);
    const vs = new Float32Array(lanes * per * 4);
    for (let l = 0; l < lanes; l += 1) {
      const rad = 75 + l * 13, y = 22 + r() * 30, speed = (0.012 + r() * 0.02) * (l % 2 ? 1 : -1);
      for (let k = 0; k < per; k += 1) {
        const i = l * per + k;
        vp[i * 3 + 1] = y;
        vs.set([rad, speed, r() * Math.PI * 2, l % 3 === 0 ? 1 : 0], i * 4);
      }
    }
    const vg = new THREE.BufferGeometry();
    vg.setAttribute("position", new THREE.BufferAttribute(vp, 3));
    vg.setAttribute("lane", new THREE.BufferAttribute(vs, 4));
    this.scene.add(new THREE.Points(vg, new THREE.ShaderMaterial({
      uniforms: { uTime: this.cityUniforms.uTime, uScale: { value: this.renderer.getPixelRatio() } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec4 lane; uniform float uTime, uScale; varying float vC;
        void main(){ float a = lane.z + uTime * lane.y * 6.0; vec3 p = vec3(cos(a) * lane.x, position.y, sin(a) * lane.x - 10.0);
          vec4 mv = modelViewMatrix * vec4(p,1.0); gl_Position = projectionMatrix * mv; vC = lane.w; gl_PointSize = 220.0 * uScale / -mv.z; }`,
      fragmentShader: `varying float vC; void main(){ float d = length(gl_PointCoord - 0.5); vec3 c = vC > 0.5 ? vec3(2.6,0.5,0.35) : vec3(2.4,1.9,1.4);
        gl_FragColor = vec4(c * smoothstep(0.5,0.0,d), 1.0); }`,
    })));
  }

  /* Flux de données au sol : des paquets lumineux voyagent entre les zones */
  buildStreams() {
    const routes = [
      ["lab", [new THREE.Vector3(-4, 0.5, 2), new THREE.Vector3(-18, 0.5, 4), new THREE.Vector3(-30, 0.5, 1)]],
      ["archive", [new THREE.Vector3(4, 0.5, 2), new THREE.Vector3(18, 0.5, 4), new THREE.Vector3(30, 0.5, 1)]],
      ["journey", [new THREE.Vector3(0, 0.5, -10), new THREE.Vector3(0, 0.5, -20), new THREE.Vector3(0, 0.5, JOURNEY_START - 60)]],
      ["city", [new THREE.Vector3(0, 0.5, 15), new THREE.Vector3(2, 0.5, 8), new THREE.Vector3(0, 0.5, 0)]],
    ];
    const per = this.mobile ? 10 : 18;
    const geo = new THREE.BoxGeometry(0.16, 0.06, 0.9);
    for (const [key, pts] of routes) {
      const curve = new THREE.CatmullRomCurve3(pts);
      const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.025, 6), new THREE.MeshBasicMaterial({ color: glow(ZONES[key].accent, 0.9) }));
      this.scene.add(line);
      const packets = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: glow(ZONES[key].accent, 3.2) }), per);
      this.scene.add(packets);
      const offs = Array.from({ length: per }, (_, i) => i / per + Math.random() * 0.03);
      const m = new THREE.Matrix4(), p = new THREE.Vector3(), tan = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
      const speed = key === "journey" ? 0.018 : 0.045;
      this.anim.push((t) => {
        for (let i = 0; i < per; i += 1) {
          const u = (offs[i] + t * speed) % 1;
          curve.getPointAt(u, p);
          curve.getTangentAt(u, tan);
          m.lookAt(p, p.clone().add(tan), up);
          m.setPosition(p.x, p.y - 0.4, p.z);
          packets.setMatrixAt(i, m);
        }
        packets.instanceMatrix.needsUpdate = true;
      });
    }
  }

  /* ======================================================================
     DONNÉES → OBJETS
     ====================================================================== */

  setData({ profil, domains = [], projets = [], parcours = [] }) {
    this.idScreen.material.map = identityTexture(profil, this.renderer);
    this.idScreen.material.color = glow("#ffffff", 1.1);
    this.idScreen.material.needsUpdate = true;
    this.buildTerminals(domains);
    this.buildCubes(projets);
    this.buildArches(parcours);
  }

  buildTerminals(domains) {
    const list = domains.slice(0, 6);
    const desk = new THREE.MeshStandardMaterial({ color: "#1B191C", roughness: 0.7, metalness: 0.35 });
    // Salle de contrôle : 2 rangées de 3 postes, la 2e sur une estrade (comme un amphithéâtre)
    const perRow = list.length > 3 ? Math.ceil(list.length / 2) : list.length;
    const spacing = 5.0;
    if (list.length > 3) {
      const riser = new THREE.Mesh(new THREE.BoxGeometry(perRow * spacing + 1.5, 2.5, 3.6),
        new THREE.MeshStandardMaterial({ color: "#2E2A2C", roughness: 0.9, metalness: 0.05 }));
      riser.position.set(0, 1.75, -9.6);
      riser.castShadow = riser.receiveShadow = true;
      const edge = new THREE.Mesh(new THREE.BoxGeometry(perRow * spacing + 1.5, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: glow("#E8262E", 3) }));
      edge.position.set(0, 3.02, -7.78);
      this.labGroup.add(riser, edge);
    }
    list.forEach((d, i) => {
      const row = Math.floor(i / perRow);
      const inRow = row === 0 ? Math.min(perRow, list.length) : list.length - perRow;
      const col = i % perRow;
      const x = (col - (inRow - 1) / 2) * spacing;
      const t = new THREE.Group();
      t.position.set(x, row ? 3.0 : 0.5, row ? -9.8 : -4.2);
      t.rotation.y = -x * 0.04;           // les postes se tournent légèrement vers le visiteur
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 1.1), desk);
      base.position.y = 0.5; base.castShadow = true;
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), desk);
      stand.position.set(0, 1.5, -0.3);
      const screenMat = new THREE.MeshBasicMaterial({ map: terminalTexture(d, i, this.renderer), color: glow("#ffffff", 0.95), fog: false });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 2.31), screenMat);
      screen.position.set(0, 3.0, -0.25);
      screen.rotation.x = -0.12;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(3.86, 2.46, 0.08), desk);
      frame.position.set(0, 3.0, -0.31); frame.rotation.x = -0.12; frame.castShadow = true;
      const glowStrip = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: glow("#E8262E", 3) }));
      glowStrip.position.set(0, 1.02, 0.56);
      t.add(base, stand, frame, screen, glowStrip);
      this.labGroup.add(t);
      this.register({
        id: `domain-${d.slug}`, zone: "lab", kind: "domain", tagY: 1.25, label: d.label, sub: `${d.skills.length} compétence${d.skills.length > 1 ? "s" : ""}`,
        data: d, hit: screen, focus: { obj: screen, dist: 6.2 },
        apply: (h) => { screenMat.color.copy(glow("#ffffff", 0.95 + h * 0.35)); t.position.y = (row ? 3.0 : 0.5) + h * 0.1; },
      });
    });
  }

  buildCubes(projets) {
    const list = projets.length ? projets : [null, null, null];
    const accents = ["#FFB36B", "#FF7A3D", "#E8262E", "#F2EEE5", "#FF3C6E", "#FFD08A"];
    this.cubeList = [];
    list.forEach((p, i) => {
      const accent = accents[i % accents.length];
      const tex = cubeTexture(p, i, accent, this.renderer);
      const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.32, roughness: 0.6, metalness: 0.2, fog: false });
      const cube = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.7, 1.7), mat);
      cube.castShadow = true;
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry), new THREE.LineBasicMaterial({ color: glow(accent, 2.6) }));
      cube.add(edges);
      const holder = new THREE.Group();
      holder.add(cube);
      this.cubes.add(holder);
      const entry = { holder, cube, phase: (i / list.length) * Math.PI * 2, hover: 0 };
      this.cubeList.push(entry);
      if (!p) { mat.emissiveIntensity = 0.12; return; }
      this.register({
        id: `projet-${p.slug}`, zone: "archive", kind: "projet", tagY: 1.35, label: p.titre, sub: `P.${String(i + 1).padStart(2, "0")} · ${p.annee ?? "—"}`,
        data: p, hit: cube, focus: { obj: cube, dist: 7.5 },
        apply: (h) => { mat.emissiveIntensity = 0.32 + h * 0.3; entry.hover = h; },
      });
    });
    this.orbit = 0;
    this.anim.push((t, dt) => {
      if (!this.focused || this.focused.kind !== "projet") this.orbit += dt * 0.12;
      const n = this.cubeList.length;
      this.cubeList.forEach((e, i) => {
        const a = e.phase + this.orbit;
        const rad = n > 5 ? 6.4 : 5.6;
        e.holder.position.set(Math.cos(a) * rad, 4.2 + Math.sin(t * 0.9 + i) * 0.25, Math.sin(a) * rad);
        e.cube.rotation.y = t * 0.35 + i;
        e.cube.rotation.x = Math.sin(t * 0.4 + i) * 0.15;
        e.holder.scale.setScalar(1 + e.hover * 0.15);
      });
    });
  }

  buildArches(parcours) {
    const ivory = new THREE.MeshStandardMaterial({ color: "#E7DFCD", roughness: 0.78, metalness: 0.02 });
    this.journey = [];
    const steps = parcours.length ? parcours : [];
    steps.forEach((s, i) => {
      const z = JOURNEY_START - i * JOURNEY_STEP;
      const arch = new THREE.Group();
      arch.position.set(0, 0, z);
      const h = 7.5 + (i % 2) * 1.2;
      for (const x of [-4.3, 4.3]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(1, h, 1), ivory);
        leg.position.set(x, h / 2, 0); leg.castShadow = true; leg.receiveShadow = true;
        arch.add(leg);
      }
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(9.6, 1, 1), ivory);
      lintel.position.y = h + 0.5; lintel.castShadow = true;
      const line = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: glow(s.type === "formation" ? "#C0305A" : "#FFB36B", 3) }));
      line.position.set(0, h - 0.1, 0.52);
      arch.add(lintel, line);

      const side = i % 2 === 0 ? 1 : -1;
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 0.6), ivory);
      plinth.position.set(side * 2.6, 0.45, 3.2);
      plinth.castShadow = true;
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.2), new THREE.MeshStandardMaterial({ map: plaqueTexture(s, this.renderer), roughness: 0.8, emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.22, fog: false }));
      plaque.material.emissiveMap = plaque.material.map;
      plaque.position.set(side * 2.6, 2.6, 3.35);
      plaque.rotation.y = -side * 0.32;
      arch.add(plinth, plaque);
      this.journeyGroup.add(arch);

      const wp = new THREE.Vector3(side * 2.6, 2.6, z + 3.35);
      this.journey.push({ pos: new THREE.Vector3(side * 0.6, 3.1, z + 11.5), target: wp.clone().add(new THREE.Vector3(-side * 0.6, -0.1, 0)) });
      this.register({
        id: `step-${i}`, zone: "journey", kind: "step", tagY: 1.9, label: s.titre, sub: `${s.annee} · ${s.org}`, data: s, index: i,
        hit: plaque, focus: { obj: plaque, dist: 5.2 },
        apply: (hv) => { plaque.material.emissiveIntensity = 0.18 + hv * 0.35; },
      });
    });
    if (!this.journey.length) {
      this.journey.push({ pos: new THREE.Vector3(0, 3.4, JOURNEY_START + 14), target: new THREE.Vector3(0, 3, JOURNEY_START - 10) });
    }
  }

  /* ======================================================================
     OBJETS INTERACTIFS
     ====================================================================== */

  register(item) {
    item.h = 0;
    item.hit.userData.item = item;
    this.items.push(item);
  }

  activeItems() {
    if (this.attract) return [];
    return this.items.filter((it) =>
      (it.zone === this.zone) || (it.zone === "*" && it.target !== this.zone));
  }

  /* liste des objets d'une zone (pour le menu accessible) */
  listFor(zone) {
    return this.items.filter((it) => it.zone === zone && it.kind !== "travel");
  }

  pick() {
    const list = this.activeItems().map((it) => it.hit);
    if (!list.length) return null;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(list, false);
    if (!hits.length) return null;
    // on préfère un objet de la zone à un portail
    const own = hits.find((h) => h.object.userData.item.zone !== "*");
    return (own ?? hits[0]).object.userData.item;
  }

  bind() {
    const c = this.canvas;
    let down = null;
    this.onDown = (e) => { down = { x: e.clientX, y: e.clientY, yaw: this.look.ty, pitch: this.look.tp, moved: false }; c.setPointerCapture?.(e.pointerId); };
    this.onMove = (e) => {
      const rect = c.getBoundingClientRect();
      this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      this.look.tsx = this.pointer.x;
      this.look.tsy = this.pointer.y;
      this.pointerPx = { x: e.clientX, y: e.clientY };
      if (down) {
        const dx = e.clientX - down.x, dy = e.clientY - down.y;
        if (Math.hypot(dx, dy) > 5) down.moved = true;
        if (down.moved && !this.tw) {
          this.look.ty = THREE.MathUtils.clamp(down.yaw - dx * 0.0035, -0.75, 0.75);
          this.look.tp = THREE.MathUtils.clamp(down.pitch - dy * 0.0025, -0.22, 0.3);
        }
      }
      this.needPick = true;
    };
    this.onUp = (e) => {
      if (down && !down.moved && !this.tw) {
        this.onMove(e);
        const it = this.pick();
        if (it) this.cb.onSelect?.(it);
      }
      down = null;
    };
    this.onLeave = () => { this.pointer.set(9, 9); this.needPick = true; };
    c.addEventListener("pointerdown", this.onDown);
    c.addEventListener("pointermove", this.onMove);
    c.addEventListener("pointerup", this.onUp);
    c.addEventListener("pointerleave", this.onLeave);
    this.onResize = () => this.resize();
    addEventListener("resize", this.onResize);
    this.onVis = () => { if (!document.hidden && !this.raf) { this.clock.getDelta(); this.raf = requestAnimationFrame(this.loop); } };
    document.addEventListener("visibilitychange", this.onVis);
  }

  /* ======================================================================
     CAMÉRA : stations, voyages, focus
     ====================================================================== */

  poseOf(zone) {
    if (zone === "journey") return this.journey[this.jIndex] ?? this.journey[0];
    return POSES[zone] ?? POSES.city;
  }

  /* voyage de caméra : arc au-dessus de la ville, zoom optique au milieu */
  fly(to, { duration = 2.4, lift = null, onEnd } = {}) {
    const from = { pos: this.camera.position.clone(), target: this.currentTarget.clone() };
    const dist = from.pos.distanceTo(to.pos);
    if (this.reduced || duration === 0) {
      this.base = { pos: to.pos.clone(), target: to.target.clone() };
      this.look.ty = this.look.tp = 0;
      onEnd?.();
      return;
    }
    this.tw = {
      from, to, t0: performance.now(), dur: duration * 1000,
      lift: lift ?? THREE.MathUtils.clamp(dist * 0.24, 2, 16), onEnd,
      ctrl: from.pos.clone().lerp(to.pos, 0.5),
    };
    this.tw.ctrl.y += this.tw.lift;
    this.look.ty = this.look.tp = 0;
  }

  go(zone, { instant = false } = {}) {
    if (!ZONES[zone]) zone = "city";
    this.focused = null;
    const prev = this.zone;
    this.zone = zone;
    this.attract = false;
    if (zone === "journey" && prev !== "journey") this.jIndex = 0;
    this.cb.onZone?.(zone);
    const pose = this.poseOf(zone);
    if (instant || prev === zone) {
      this.fly(pose, { duration: instant ? 0 : 1.2, lift: 1 });
      return;
    }
    this.cb.onTravel?.("start", zone);
    this.fly(pose, {
      duration: 1.7,
      onEnd: () => this.cb.onTravel?.("end", zone),
    });
  }

  journeyStep(dir) {
    if (this.zone !== "journey" || this.tw) return false;
    const next = THREE.MathUtils.clamp(this.jIndex + dir, 0, this.journey.length - 1);
    if (next === this.jIndex) return false;
    this.jIndex = next;
    this.focused = null;
    this.fly(this.journey[next], { duration: 1.5, lift: 0.6 });
    return true;
  }

  /* se rapprocher d'un objet (sans changer de zone) */
  focus(item) {
    if (!item.focus) return;
    if (item.kind === "step" && item.index !== this.jIndex) this.jIndex = item.index;
    this.focused = item;
    const target = new THREE.Vector3();
    item.focus.obj.getWorldPosition(target);
    const dir = new THREE.Vector3().subVectors(this.poseOf(this.zone).pos, target).setY(0).normalize();
    if (item.kind === "projet") dir.copy(new THREE.Vector3(0, 0, 1));
    const pos = target.clone().add(dir.multiplyScalar(item.focus.dist)).add(new THREE.Vector3(0, item.kind === "projet" ? 1.2 : 0.4, 0));
    // panoramique vers la droite : l'objet se place à gauche, le panneau occupe la droite
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
    const shift = innerWidth > 900 ? item.focus.dist * 0.3 : 0;
    const pan = right.multiplyScalar(shift);
    this.fly({ pos: pos.add(pan), target: target.clone().add(pan) }, { duration: 1.4, lift: 0.8 });
  }

  release() {
    if (!this.focused) return;
    this.focused = null;
    this.fly(this.poseOf(this.zone), { duration: 1.3, lift: 0.8 });
  }

  setAttract(on) {
    this.attract = on;
  }

  applyCamera(dt) {
    const L = this.look;
    const k = 1 - Math.pow(0.0015, dt);
    L.yaw += (L.ty - L.yaw) * k;
    L.pitch += (L.tp - L.pitch) * k;
    const sway = this.reduced ? 0 : 1;
    L.sx += (L.tsx * 0.05 * sway - L.sx) * k * 0.6;
    L.sy += (L.tsy * 0.03 * sway - L.sy) * k * 0.6;

    let pos, target, fovKick = 0;
    if (this.tw) {
      const t = Math.min(1, (performance.now() - this.tw.t0) / this.tw.dur);
      const e = ease(t);
      const a = this.tw.from.pos, b = this.tw.to.pos, c = this.tw.ctrl;
      pos = new THREE.Vector3(
        (1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * c.x + e * e * b.x,
        (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * c.y + e * e * b.y,
        (1 - e) * (1 - e) * a.z + 2 * (1 - e) * e * c.z + e * e * b.z,
      );
      target = this.tw.from.target.clone().lerp(this.tw.to.target, easeSine(t));
      fovKick = Math.sin(Math.PI * t) * Math.min(10, this.tw.lift * 0.6);
      if (t >= 1) {
        const end = this.tw.onEnd;
        this.base = { pos: this.tw.to.pos.clone(), target: this.tw.to.target.clone() };
        this.tw = null;
        end?.();
      }
    } else if (this.attract) {
      const a = this.time * 0.05;
      pos = new THREE.Vector3(Math.sin(a) * 44, 15 + Math.sin(this.time * 0.1) * 3, Math.cos(a) * 44 - 4);
      target = new THREE.Vector3(0, 5, -8);
      this.base = { pos: pos.clone(), target: target.clone() };
    } else {
      const off = new THREE.Vector3().subVectors(this.base.pos, this.base.target);
      const sph = new THREE.Spherical().setFromVector3(off);
      sph.theta += L.yaw - L.sx;
      sph.phi = THREE.MathUtils.clamp(sph.phi - L.pitch + L.sy, 0.35, 1.62);
      pos = new THREE.Vector3().setFromSpherical(sph).add(this.base.target);
      target = this.base.target;
    }
    this.camera.position.copy(pos);
    this.currentTarget = target.clone();
    this.camera.lookAt(target);
    const fov = this.baseFov + fovKick;
    if (Math.abs(this.camera.fov - fov) > 0.01) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); }
    this.sky.position.copy(this.camera.position);
  }

  travelProgress() {
    if (!this.tw) return null;
    return Math.min(1, (performance.now() - this.tw.t0) / this.tw.dur);
  }

  /* position pour la mini-carte */
  where() {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    return { x: this.camera.position.x, z: this.camera.position.z, a: Math.atan2(dir.x, -dir.z) };
  }

  /* projection d'un objet à l'écran (étiquettes) */
  screenOf(item) {
    const v = new THREE.Vector3();
    if (item.anchor) v.copy(item.anchor);
    else { item.hit.getWorldPosition(v); v.y += item.tagY ?? 0; }
    v.project(this.camera);
    return { x: (v.x + 1) / 2 * this.canvas.clientWidth, y: (1 - v.y) / 2 * this.canvas.clientHeight, visible: v.z < 1 };
  }

  /* ======================================================================
     BOUCLE
     ====================================================================== */

  loop() {
    this.raf = 0;
    if (document.hidden || this.dead) return;
    const dt = Math.min(0.05, this.clock.getDelta());
    this.time += this.reduced ? dt * 0.15 : dt;
    this.cityUniforms.uTime.value = this.time;
    for (const fn of this.anim) fn(this.time, this.reduced ? dt * 0.15 : dt);

    this.applyCamera(dt);

    if (this.needPick && !this.tw) {
      this.needPick = false;
      const it = this.pick();
      if (it !== this.hover) {
        this.hover = it;
        this.canvas.style.cursor = it ? "pointer" : "";
        this.cb.onHover?.(it, this.pointerPx);
      } else if (it) this.cb.onHover?.(it, this.pointerPx);
    }
    for (const it of this.items) {
      const goal = it === this.hover || it === this.focused ? 1 : 0;
      if (it.h !== goal) {
        it.h += (goal - it.h) * Math.min(1, dt * 10);
        if (Math.abs(goal - it.h) < 0.002) it.h = goal;
        it.apply?.(it.h);
      }
    }

    this.composer.render(dt);
    this.raf = requestAnimationFrame(this.loop);
  }

  dispose() {
    this.dead = true;
    cancelAnimationFrame(this.raf);
    const c = this.canvas;
    c.removeEventListener("pointerdown", this.onDown);
    c.removeEventListener("pointermove", this.onMove);
    c.removeEventListener("pointerup", this.onUp);
    c.removeEventListener("pointerleave", this.onLeave);
    removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVis);
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      mats.forEach((m) => { m.map?.dispose?.(); m.dispose?.(); });
    });
    this.envRT?.dispose();
    this.composer.dispose?.();
    this.renderer.dispose();
  }
}
