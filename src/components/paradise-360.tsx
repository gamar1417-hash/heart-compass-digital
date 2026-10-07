import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import p1 from "@/assets/pano-1.jpg";
import p2 from "@/assets/pano-2.jpg";
import p3 from "@/assets/pano-3.jpg";
import p4 from "@/assets/pano-4.jpg";

const SCENES = [
  { src: p1, name: "جنات ظلالها ممدودة", at: 0 },
  { src: p2, name: "أنهار الماء واللبن والعسل والخمر", at: 12 },
  { src: p3, name: "غرف من فوقها غرف وموائد الذهب", at: 40 },
  { src: p4, name: "عرضها السماوات والأرض", at: 90 },
];

function startAmbient() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last * 3.5;
  }
  const mk = (freq: number, gain: number) => {
    const s = ctx.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = gain;
    s.connect(f).connect(g).connect(ctx.destination);
    s.start();
    return g;
  };
  mk(900, 0.5); // خرير الماء
  const wind = mk(350, 0.25); // نسيم
  const lfo = ctx.createOscillator();
  const lg = ctx.createGain();
  lfo.frequency.value = 0.08;
  lg.gain.value = 0.15;
  lfo.connect(lg).connect(wind.gain);
  lfo.start();
  return ctx;
}

export default function Paradise360({ lifetime }: { lifetime: number }) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<{ setTex: (s: string) => void; zoomTo: (fov: number) => void; burst: () => void } | null>(null);
  const unlocked = SCENES.filter((s) => lifetime >= s.at).length;
  const [idx, setIdx] = useState(unlocked - 1);
  const [welcome, setWelcome] = useState(true);
  const [flash, setFlash] = useState(false);
  const [sound, setSound] = useState<AudioContext | null>(null);
  const prevUnlocked = useRef(unlocked);

  useEffect(() => {
    const el = mount.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 1000);
    const geo = new THREE.SphereGeometry(500, 64, 40);
    geo.scale(-1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    scene.add(new THREE.Mesh(geo, mat));
    const loader = new THREE.TextureLoader();
    let lon = 180, lat = 0, targetFov = 75, glow = 0;
    let dragging = false, px = 0, py = 0, moved = 0, idle = 0;
    const pts = new Map<number, { x: number; y: number }>();
    let pinch = 0;

    const down = (e: PointerEvent) => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      dragging = true; px = e.clientX; py = e.clientY; moved = 0;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) targetFov = THREE.MathUtils.clamp(targetFov - (dist - pinch) * 0.1, 30, 90);
        pinch = dist;
        return;
      }
      if (!dragging) return;
      const dx = e.clientX - px, dy = e.clientY - py;
      moved += Math.abs(dx) + Math.abs(dy);
      lon -= dx * 0.15 * (camera.fov / 75);
      lat += dy * 0.15 * (camera.fov / 75);
      px = e.clientX; py = e.clientY; idle = 0;
    };
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = 0;
      if (dragging && moved < 6) {
        // نقرة: تدنو الثمار والقطوف نحوك
        const r = el.getBoundingClientRect();
        lon += ((e.clientX - r.left) / r.width - 0.5) * camera.fov * camera.aspect;
        lat -= ((e.clientY - r.top) / r.height - 0.5) * camera.fov;
        targetFov = targetFov > 50 ? 38 : 75;
      }
      dragging = false;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      targetFov = THREE.MathUtils.clamp(targetFov + e.deltaY * 0.04, 30, 90);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    api.current = {
      setTex: (src) => loader.load(src, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        mat.map?.dispose();
        mat.map = t;
        mat.needsUpdate = true;
      }),
      zoomTo: (f) => (targetFov = f),
      burst: () => (glow = 1),
    };

    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      idle += dt;
      if (!dragging && idle > 3) lon += dt * 2;
      lat = THREE.MathUtils.clamp(lat, -85, 85);
      camera.fov += (targetFov - camera.fov) * (1 - Math.exp(-4 * dt));
      camera.updateProjectionMatrix();
      const phi = THREE.MathUtils.degToRad(90 - lat), th = THREE.MathUtils.degToRad(lon);
      camera.lookAt(500 * Math.sin(phi) * Math.cos(th), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(th));
      glow *= Math.exp(-0.6 * dt);
      const g = 1 + glow * 0.6;
      mat.color.setRGB(g, g * 0.97, g * 0.85);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => { api.current?.setTex(SCENES[idx]!.src); }, [idx]);

  const burst = () => {
    api.current?.burst();
    setFlash(true);
    setTimeout(() => setFlash(false), 2600);
  };

  useEffect(() => {
    if (unlocked > prevUnlocked.current) { setIdx(unlocked - 1); burst(); }
    prevUnlocked.current = unlocked;
  }, [unlocked]);

  useEffect(() => () => { void sound?.close(); }, [sound]);

  const toggleSound = () => {
    if (sound) { void sound.close(); setSound(null); } else setSound(startAmbient());
  };

  return (
    <div className="relative h-[75svh] min-h-[26rem] w-full overflow-hidden rounded-3xl bg-foreground/90 select-none">
      <div ref={mount} className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing" />

      {flash && <div className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_30%,hsl(45_100%_95%/0.95),hsl(42_90%_70%/0.45)_45%,transparent_75%)]" />}

      {welcome && (
        <button
          onClick={() => { setWelcome(false); burst(); }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background/30 backdrop-blur-[2px] text-center"
        >
          <span className="font-display text-4xl sm:text-5xl text-primary-foreground drop-shadow-[0_0_24px_hsl(45_100%_70%)]">ادْخُلُوهَا بِسَلَامٍ آمِنِينَ</span>
          <span className="text-sm text-primary-foreground/90 drop-shadow">الحجر ٤٦ — المس للدخول</span>
        </button>
      )}

      <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-foreground/60 to-transparent p-3 text-primary-foreground">
        <span className="text-sm font-semibold">{SCENES[idx]!.name}</span>
        <div className="flex gap-2">
          <button onClick={toggleSound} className="rounded-full bg-background/20 px-3 py-1 text-xs backdrop-blur">{sound ? "إيقاف الصوت" : "خرير ونسيم"}</button>
          <button onClick={burst} className="rounded-full bg-background/20 px-3 py-1 text-xs backdrop-blur">نور المزيد</button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-foreground/70 to-transparent p-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SCENES.map((s, i) => {
            const open = lifetime >= s.at;
            return (
              <button
                key={s.name}
                disabled={!open}
                onClick={() => setIdx(i)}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs ${i === idx ? "bg-primary text-primary-foreground" : "bg-background/25 text-primary-foreground"} disabled:opacity-50`}
              >
                {open ? s.name : `يُفتح عند ${s.at} عملاً`}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-[11px] text-primary-foreground/85">اسحب للتجول ٣٦٠°، المس لتقريب الثمار، وقرّب بإصبعين. مشهد رمزي تحفيزي، وما في الجنة لا عين رأت.</p>
      </div>
    </div>
  );
}
