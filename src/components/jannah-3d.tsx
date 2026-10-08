import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/** عتبات مراحل المشهد التحفيزي — قابلة للتعديل من مكان واحد */
export const JANNAH_STATES = [0, 12, 40, 90, 200];
export function jannahState(lifetime: number) {
  let s = 0;
  JANNAH_STATES.forEach((t, i) => { if (lifetime >= t) s = i; });
  return s; // 0..4
}

// مولّد عشوائي ثابت حتى يبقى العالم نفسه ويتسع فقط
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function inscription(text: string) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 160;
  const g = c.getContext("2d")!;
  g.fillStyle = "#efe4c8"; g.fillRect(0, 0, 1024, 160);
  g.strokeStyle = "#b8923a"; g.lineWidth = 6; g.strokeRect(8, 8, 1008, 144);
  g.fillStyle = "#7a5a1c"; g.font = "bold 64px 'Amiri', 'Noto Naskh Arabic', serif";
  g.textAlign = "center"; g.textBaseline = "middle"; g.direction = "rtl";
  g.fillText(text, 512, 84);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function grassTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#2c5a26"; g.fillRect(0, 0, 256, 256);
  const r = rng(7);
  for (let i = 0; i < 5000; i++) {
    const v = 30 + r() * 60;
    g.fillStyle = `rgb(${v * 0.5},${v + 30},${v * 0.35})`;
    g.fillRect(r() * 256, r() * 256, 1.5, 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40, 40); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const groundH = (x: number, z: number) =>
  Math.sin(x * 0.05) * 1.2 + Math.cos(z * 0.06) * 1.0 + Math.sin((x + z) * 0.11) * 0.4 - riverDip(x, z);
const riverX = (z: number) => Math.sin(z * 0.06) * 8 + 14;
function riverDip(x: number, z: number) {
  const d = Math.abs(x - riverX(z));
  return d < 6 ? (1 - d / 6) * 2.2 : 0;
}

export default function Jannah3D({ lifetime }: { lifetime: number }) {
  const mount = useRef<HTMLDivElement>(null);
  const setLevel = useRef<(n: number) => void>(() => {});

  useEffect(() => {
    const el = mount.current!;
    const weak = window.innerWidth < 640 || (navigator.hardwareConcurrency ?? 8) <= 4;
    const renderer = new THREE.WebGLRenderer({ antialias: !weak });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, weak ? 1.5 : 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const sky = new THREE.Color("#f3c98b");
    scene.background = sky;
    scene.fog = new THREE.Fog(sky, 40, 170);

    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.5, 400);
    camera.position.set(-26, 14, 34);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 3, 0);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.minDistance = 8; controls.maxDistance = 90;
    controls.autoRotate = true; controls.autoRotateSpeed = 0.35;
    controls.addEventListener("start", () => (controls.autoRotate = false));

    // ضوء العصر الذهبي
    scene.add(new THREE.HemisphereLight("#ffe9c4", "#3b5a2a", 0.9));
    const sun = new THREE.DirectionalLight("#ffc77a", 2.4);
    sun.position.set(-60, 45, -30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(weak ? 1024 : 2048, weak ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, far: 200 });
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    // سماء متدرجة
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {},
      vertexShader: "varying vec3 p; void main(){p=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: "varying vec3 p; void main(){float h=max(p.y,0.);vec3 c=mix(vec3(1.,.78,.5),vec3(.45,.62,.85),pow(h,.6));float s=pow(max(dot(p,normalize(vec3(-.8,.25,-.4))),0.),40.);gl_FragColor=vec4(c+vec3(1.,.85,.6)*s,1.);}",
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), skyMat));

    // الأرض
    const groundGeo = new THREE.PlaneGeometry(320, 320, 160, 160);
    groundGeo.rotateX(-Math.PI / 2);
    const pos = groundGeo.attributes["position"] as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, groundH(pos.getX(i), pos.getZ(i)));
    groundGeo.computeVertexNormals();
    const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ map: grassTexture(), roughness: 0.95 }));
    ground.receiveShadow = true;
    scene.add(ground);

    // النهر
    const riverGeo = new THREE.PlaneGeometry(9, 320, 8, 200);
    riverGeo.rotateX(-Math.PI / 2);
    const rp = riverGeo.attributes["position"] as THREE.BufferAttribute;
    for (let i = 0; i < rp.count; i++) rp.setX(i, rp.getX(i) + riverX(rp.getZ(i)));
    const riverMat = new THREE.MeshStandardMaterial({ color: "#5fa7b8", roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.85 });
    const water = { t: { value: 0 } };
    riverMat.onBeforeCompile = (s) => {
      s.uniforms["uT"] = water.t;
      s.vertexShader = "uniform float uT;\n" + s.vertexShader.replace("#include <begin_vertex>",
        "#include <begin_vertex>\ntransformed.y += sin(position.z*.8+uT*2.)*.06+sin(position.x*2.+uT*3.)*.03;");
    };
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.position.y = -0.6;
    scene.add(river);

    // مواد
    const mat = {
      marble: new THREE.MeshStandardMaterial({ color: "#f1ebdd", roughness: 0.35 }),
      gold: new THREE.MeshStandardMaterial({ color: "#d4a945", metalness: 0.9, roughness: 0.28 }),
      silver: new THREE.MeshStandardMaterial({ color: "#e6e9ee", metalness: 0.7, roughness: 0.3 }),
      trunk: new THREE.MeshStandardMaterial({ color: "#7a5a34", roughness: 0.9 }),
      palmLeaf: new THREE.MeshStandardMaterial({ color: "#3d7a2e", roughness: 0.8, side: THREE.DoubleSide }),
      canopy: new THREE.MeshStandardMaterial({ color: "#2f6a2a", roughness: 0.85, flatShading: true }),
      silk: new THREE.MeshStandardMaterial({ color: "#1f5a3a", roughness: 0.6 }),
      path: new THREE.MeshStandardMaterial({ color: "#d9c7a0", roughness: 0.9 }),
    };

    const levels: THREE.Group[] = [0, 1, 2, 3, 4].map(() => { const g = new THREE.Group(); scene.add(g); return g; });
    const swaying: { obj: THREE.Object3D; ph: number }[] = [];
    const shadow = (o: THREE.Object3D) => o.traverse((c) => { if ((c as THREE.Mesh).isMesh) { c.castShadow = true; c.receiveShadow = true; } });

    function palm(x: number, z: number, h: number) {
      const g = new THREE.Group();
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.4, h * 0.5, 0.2), new THREE.Vector3(0.9, h, 0)]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.28, 6), mat.trunk));
      const crown = new THREE.Group(); crown.position.set(0.9, h, 0);
      for (let i = 0; i < 9; i++) {
        const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 4.2, 1, 4), mat.palmLeaf);
        const lp = leaf.geometry.attributes["position"] as THREE.BufferAttribute;
        for (let k = 0; k < lp.count; k++) { const y = lp.getY(k) + 2.1; lp.setZ(k, -y * y * 0.07); lp.setY(k, y); }
        leaf.geometry.computeVertexNormals();
        leaf.rotation.set(-0.9, (i / 9) * Math.PI * 2, 0, "YXZ");
        crown.add(leaf);
      }
      for (let i = 0; i < 4; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 4), mat.gold); d.position.set(Math.cos(i) * 0.4, -0.4, Math.sin(i) * 0.4); crown.add(d); }
      g.add(crown); swaying.push({ obj: crown, ph: x + z });
      g.position.set(x, groundH(x, z) - 0.1, z); shadow(g); return g;
    }

    function tree(x: number, z: number, s: number, fruit: string) {
      const g = new THREE.Group();
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * s, 0.45 * s, 3 * s, 7), mat.trunk); tr.position.y = 1.5 * s; g.add(tr);
      const crown = new THREE.Group(); crown.position.y = 3.4 * s;
      const fm = new THREE.MeshStandardMaterial({ color: fruit, roughness: 0.4 });
      for (let i = 0; i < 5; i++) {
        const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4 * s, 1), mat.canopy);
        b.position.set(Math.cos(i * 1.3) * 1.1 * s, Math.sin(i * 2.1) * 0.6 * s, Math.sin(i * 1.3) * 1.1 * s); crown.add(b);
      }
      for (let i = 0; i < 10; i++) {
        const f = new THREE.Mesh(new THREE.SphereGeometry(0.17 * s, 8, 6), fm);
        const a = i * 0.63; f.position.set(Math.cos(a) * 2 * s, -0.8 * s + (i % 3) * 0.4 * s, Math.sin(a) * 2 * s); crown.add(f);
      }
      g.add(crown); swaying.push({ obj: crown, ph: x * 0.3 + z });
      g.position.set(x, groundH(x, z) - 0.1, z); shadow(g); return g;
    }

    function flowers(group: THREE.Group, n: number, seed: number, radius: number) {
      const r = rng(seed);
      const colors = ["#f4e9d8", "#e9b44c", "#d98fb0", "#ffffff", "#c9a0dc"];
      colors.forEach((c, ci) => {
        const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 6, 4), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }), n);
        const d = new THREE.Object3D();
        for (let i = 0; i < n; i++) {
          let x = 0, z = 0;
          do { const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * radius; x = Math.cos(a) * rr; z = Math.sin(a) * rr; } while (Math.abs(x - riverX(z)) < 5 || (Math.abs(x) < 9 && Math.abs(z) < 9));
          d.position.set(x, groundH(x, z) + 0.15 + ci * 0.01, z); d.scale.setScalar(0.6 + r() * 0.8); d.updateMatrix(); m.setMatrixAt(i, d.matrix);
        }
        group.add(m);
      });
    }

    function pavilion(x: number, z: number, s: number, text?: string) {
      const g = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(8 * s, 0.8, 8 * s), mat.marble); base.position.y = 0.2; g.add(base);
      for (const [cx, cz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * s, 0.32 * s, 4 * s, 12), mat.marble);
        col.position.set(cx! * 3.3 * s, 0.6 + 2 * s, cz! * 3.3 * s); g.add(col);
      }
      const roof = new THREE.Mesh(new THREE.BoxGeometry(8 * s, 0.6 * s, 8 * s), mat.marble); roof.position.y = 0.6 + 4.2 * s; g.add(roof);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(2.8 * s, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat.gold); dome.position.y = 0.9 + 4.4 * s; g.add(dome);
      // مجلس: سرر مرفوعة وفرش سندس
      for (const sx of [-1.6, 1.6]) {
        const bed = new THREE.Mesh(new THREE.BoxGeometry(1.4 * s, 0.6, 4 * s), mat.silver); bed.position.set(sx * s, 0.9, 0); g.add(bed);
        const cush = new THREE.Mesh(new THREE.BoxGeometry(1.3 * s, 0.35, 3.8 * s), mat.silk); cush.position.set(sx * s, 1.35, 0); g.add(cush);
      }
      if (text) {
        const plate = new THREE.Mesh(new THREE.PlaneGeometry(7.6 * s, 1.2 * s), new THREE.MeshStandardMaterial({ map: inscription(text), roughness: 0.5 }));
        plate.position.set(0, 0.6 + 4.2 * s, 4.01 * s); g.add(plate);
      }
      g.position.set(x, groundH(x, z) - 0.2, z); shadow(g); return g;
    }

    function palace(x: number, z: number) {
      const g = new THREE.Group();
      const terrace = new THREE.Mesh(new THREE.BoxGeometry(26, 1.6, 20), mat.marble); terrace.position.y = 0.4; g.add(terrace);
      // غرف من فوقها غرف
      const tiers = [[20, 6, 14], [14, 5, 10], [8, 4, 6]];
      let y = 1.2;
      tiers.forEach(([w, h, d], i) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(w!, h!, d!), i % 2 ? mat.silver : mat.marble); b.position.y = y + h! / 2; g.add(b);
        const band = new THREE.Mesh(new THREE.BoxGeometry(w! + 0.3, 0.35, d! + 0.3), mat.gold); band.position.y = y + h!; g.add(band);
        for (let k = 0; k < Math.floor(w! / 3); k++) {
          const arch = new THREE.Mesh(new THREE.BoxGeometry(1.2, h! * 0.55, 0.2), new THREE.MeshStandardMaterial({ color: "#3a2a14", roughness: 0.6 }));
          arch.position.set(-w! / 2 + 1.5 + k * 3, y + h! * 0.4, d! / 2 + 0.05); g.add(arch);
        }
        y += h!;
      });
      const dome = new THREE.Mesh(new THREE.SphereGeometry(3.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat.gold); dome.position.y = y; g.add(dome);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 16, 12), mat.marble); tw.position.set(sx * 11, 8.8, sz * 8); g.add(tw);
        const cap = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.6, 12), mat.gold); cap.position.set(sx * 11, 18.1, sz * 8); g.add(cap);
      }
      const door = new THREE.Mesh(new THREE.BoxGeometry(3, 4.5, 0.3), mat.gold); door.position.set(0, 3.45, 7.1); g.add(door);
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.6), new THREE.MeshStandardMaterial({ map: inscription("سَلَامٌ عَلَيْكُمْ بِمَا صَبَرْتُمْ ۖ فَنِعْمَ عُقْبَى الدَّارِ"), roughness: 0.5 }));
      plate.position.set(0, 6.6, 7.06); g.add(plate);
      g.position.set(x, groundH(x, z) - 0.6, z); g.rotation.y = 0.15; shadow(g); return g;
    }

    function pathTo(group: THREE.Group, x1: number, z1: number, x2: number, z2: number) {
      const n = 30;
      const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 8), mat.path, n);
      const d = new THREE.Object3D();
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1), x = x1 + (x2 - x1) * t, z = z1 + (z2 - z1) * t;
        d.position.set(x, groundH(x, z) + 0.04, z); d.updateMatrix(); m.setMatrixAt(i, d.matrix);
      }
      m.receiveShadow = true; group.add(m);
    }

    function fountain(x: number, z: number) {
      const g = new THREE.Group();
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.7, 24), mat.marble); basin.position.y = 0.35; g.add(basin);
      const w = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.05, 24), riverMat); w.position.y = 0.66; g.add(w);
      const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.25, 2.4, 8), new THREE.MeshStandardMaterial({ color: "#cfeaf2", transparent: true, opacity: 0.6, roughness: 0.1 }));
      jet.position.y = 1.8; g.add(jet);
      g.position.set(x, groundH(x, z) - 0.1, z); shadow(g); return g;
    }

    // ===== المرحلة ١: بستان بسيط =====
    const r = rng(42);
    levels[0]!.add(pavilion(0, 0, 1, "سَلَامًا سَلَامًا"));
    [[-10, 6], [8, -9], [-7, -11]].forEach(([x, z]) => levels[0]!.add(palm(x!, z!, 7)));
    levels[0]!.add(tree(-14, -3, 1, "#c0392b"));
    flowers(levels[0]!, 60, 1, 18);
    // ===== المرحلة ٢: خضرة أوسع ومسارات ونافورة =====
    for (let i = 0; i < 10; i++) { const a = r() * 6.28, d = 18 + r() * 14, x = Math.cos(a) * d, z = Math.sin(a) * d; if (Math.abs(x - riverX(z)) > 6) levels[1]!.add(palm(x, z, 6 + r() * 4)); }
    flowers(levels[1]!, 140, 2, 32);
    pathTo(levels[1]!, 0, 5, 0, 22); levels[1]!.add(fountain(0, 24));
    // ===== المرحلة ٣: بساتين ثمار وجسر ومجالس =====
    for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = 22 + r() * 25, x = Math.cos(a) * d, z = Math.sin(a) * d; if (Math.abs(x - riverX(z)) > 6) levels[2]!.add(tree(x, z, 0.9 + r() * 0.6, ["#c0392b", "#e6a23c", "#8e44ad"][i % 3]!)); }
    levels[2]!.add(pavilion(-22, 14, 0.8)); levels[2]!.add(pavilion(28, 20, 0.8));
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(12, 0.6, 3.4), mat.marble);
    bridge.position.set(riverX(0), 0.4, 0); bridge.castShadow = true; levels[2]!.add(bridge);
    pathTo(levels[2]!, 5, 0, riverX(0) - 6, 0);
    // ===== المرحلة ٤: القصر ذو الطبقات =====
    levels[3]!.add(palace(-4, -36));
    pathTo(levels[3]!, 0, -5, -3, -27);
    flowers(levels[3]!, 200, 4, 55);
    // ===== المرحلة ٥: قصور بعيدة وغابات نخيل =====
    for (let i = 0; i < 26; i++) { const a = r() * 6.28, d = 50 + r() * 50, x = Math.cos(a) * d, z = Math.sin(a) * d; if (Math.abs(x - riverX(z)) > 6) levels[4]!.add(i % 2 ? palm(x, z, 8 + r() * 5) : tree(x, z, 1.3, "#e6a23c")); }
    const far1 = palace(-60, -70); far1.scale.setScalar(0.8); levels[4]!.add(far1);
    const far2 = palace(55, -60); far2.scale.setScalar(0.7); levels[4]!.add(far2);

    // ذرات نور طافية
    const pCount = weak ? 300 : 700;
    const pGeo = new THREE.BufferGeometry();
    const pArr = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) { pArr[i * 3] = (r() - 0.5) * 120; pArr[i * 3 + 1] = r() * 18; pArr[i * 3 + 2] = (r() - 0.5) * 120; }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pArr, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: "#ffe2a0", size: 0.18, transparent: true, opacity: 0.8, depthWrite: false }));
    scene.add(particles);

    // انتقال ناعم بين المراحل: كل مستوى ينمو من الأرض
    const target = [1, 0, 0, 0, 0], cur = [1, 0, 0, 0, 0];
    levels.forEach((g, i) => { g.scale.y = cur[i]!; g.visible = cur[i]! > 0.01; });
    setLevel.current = (n) => { for (let i = 0; i < 5; i++) target[i] = i <= n ? 1 : 0; };

    const ro = new ResizeObserver(() => {
      camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    });
    ro.observe(el);

    const clock = new THREE.Clock();
    let raf = 0;
    const loop = () => {
      const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
      water.t.value = t;
      swaying.forEach(({ obj, ph }) => { obj.rotation.z = Math.sin(t * 0.9 + ph) * 0.04; obj.rotation.x = Math.cos(t * 0.7 + ph) * 0.03; });
      for (let i = 0; i < 5; i++) {
        cur[i]! += (target[i]! - cur[i]!) * (1 - Math.exp(-1.6 * dt));
        levels[i]!.scale.y = Math.max(cur[i]!, 0.001); levels[i]!.visible = cur[i]! > 0.01;
      }
      const pa = pGeo.attributes["position"] as THREE.BufferAttribute;
      for (let i = 0; i < pCount; i++) { let y = pa.getY(i) + dt * 0.4; if (y > 18) y = 0; pa.setY(i, y); }
      pa.needsUpdate = true;
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => { setLevel.current(jannahState(lifetime)); }, [lifetime]);

  const st = jannahState(lifetime);
  const next = JANNAH_STATES[st + 1];
  return (
    <div className="relative h-[75svh] min-h-[26rem] w-full overflow-hidden rounded-3xl bg-muted select-none">
      <div ref={mount} className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-foreground/55 to-transparent p-3 text-primary-foreground">
        <span className="text-sm font-semibold">تقدّم مشهدك التحفيزي: المرحلة {st + 1} من ٥</span>
        <span className="text-xs">{next ? `التالية عند ${next} عملاً` : "اكتمل المشهد ويستمر"}</span>
      </div>
      <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/65 to-transparent p-3 text-[11px] text-primary-foreground">
        اسحب لتدور حول الجنة، وقرّب بإصبعين أو بعجلة الفأرة. مشهد رمزي تحفيزي لا يحسب الأجر، وما في الجنة ما لا عين رأت.
      </p>
    </div>
  );
}
