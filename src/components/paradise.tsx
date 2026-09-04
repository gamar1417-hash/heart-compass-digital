/**
 * مشهد «جنة» واقعي واحد تراكمي بعمق ثلاثي الأبعاد —
 * يتّسع ويزداد حياةً وعمقاً كلما تراكمت الأعمال.
 * تمثيل تحفيزي بصري فقط، لا يدّعي أجراً ولا قبولاً.
 */

import { useEffect, useRef, useState } from "react";
import p1 from "@/assets/paradise-1.jpg";
import p2 from "@/assets/paradise-2.jpg";
import p3 from "@/assets/paradise-3.jpg";
import p4 from "@/assets/paradise-4.jpg";

export type ParadiseCounts = {
  palms: number;
  flowers: number;
  jewels: number;
  palaces: number;
  rivers: number;
};

export function paradiseCounts(lifetime: number): ParadiseCounts {
  return {
    palms: Math.floor(lifetime / 4),
    flowers: Math.floor(lifetime / 2),
    jewels: Math.floor(lifetime / 6),
    palaces: Math.floor(lifetime / 25),
    rivers: Math.min(7, 1 + Math.floor(lifetime / 40)),
  };
}

const STAGES = [
  { src: p1, at: 0, label: "جنات تجري من تحتها الأنهار" },
  { src: p2, at: 12, label: "أنهار من ماء ولبن وعسل" },
  { src: p3, at: 40, label: "أساور من ذهب ولؤلؤ وحرير" },
  { src: p4, at: 90, label: "قصور وكنوز الفردوس" },
];

export function paradiseStage(lifetime: number) {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) if (lifetime >= STAGES[i]!.at) idx = i;
  return { index: idx, label: STAGES[idx]!.label, next: STAGES[idx + 1]?.at ?? null };
}

/** كل عمل تراكمي يوسّع المشهد قليلاً (بحدّ أعلى لطيف). */
function growth(lifetime: number) {
  return Math.min(1, Math.log10(1 + lifetime) / 3); // 0 → 1
}

export function ParadiseScene({
  lifetime,
  className = "",
  tall = false,
}: {
  lifetime: number;
  className?: string;
  tall?: boolean;
}) {
  const { index } = paradiseStage(lifetime);
  const c = paradiseCounts(lifetime);
  const g = growth(lifetime);

  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (cx: number, cy: number) => {
      const r = el.getBoundingClientRect();
      const px = (cx - r.left) / r.width - 0.5;
      const py = (cy - r.top) / r.height - 0.5;
      setTilt({ x: Math.max(-1, Math.min(1, px * 2)), y: Math.max(-1, Math.min(1, py * 2)) });
    };
    const mm = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const tm = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    const leave = () => setTilt({ x: 0, y: 0 });
    el.addEventListener("mousemove", mm);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("touchmove", tm, { passive: true });
    el.addEventListener("touchend", leave);
    return () => {
      el.removeEventListener("mousemove", mm);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("touchmove", tm);
      el.removeEventListener("touchend", leave);
    };
  }, []);

  // عمق المشهد: كل طبقة أبعد قليلاً + تكبير يزداد بتراكم الأعمال
  const layer = (depth: number) => ({
    transform: `translate3d(${tilt.x * -14 * depth}px, ${tilt.y * -9 * depth}px, ${depth * 40}px) scale(${1.06 + depth * 0.05 + g * 0.16})`,
    transition: "transform 380ms cubic-bezier(.2,.7,.2,1)",
  });

  const sparkCount = Math.min(46, 8 + c.jewels);
  const palmCount = Math.min(18, c.palms);
  const palaceCount = Math.min(6, c.palaces);

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden ${tall ? "h-full min-h-[60vh]" : "aspect-[16/10] sm:aspect-[16/9]"} ${className}`}
      style={{ perspective: "1100px", perspectiveOrigin: "50% 45%" }}
      role="img"
      aria-label="مشهد جنة ثلاثي الأبعاد يتّسع مع تراكم الأعمال"
    >
      <div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", ...layer(0) }}
      >
        {STAGES.map((s, i) => (
          <img
            key={i}
            src={s.src}
            alt=""
            width={1920}
            height={1088}
            loading={i === 0 ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-out"
            style={{
              opacity: i <= index ? 1 : 0,
              zIndex: i,
              ...layer(i * 0.35),
            }}
          />
        ))}
      </div>

      {/* ضباب العمق البعيد */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to top, transparent 55%, oklch(0.95 0.05 150 / 0.18) 100%)",
        }}
      />

      {/* نخيل أمامي يزداد عدده بتراكم الأعمال (طبقة قريبة تعطي إحساس العمق) */}
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{ transformStyle: "preserve-3d", ...layer(1.5) }}
      >
        {Array.from({ length: palmCount }).map((_, i) => {
          const left = (i * 61) % 98;
          const near = i % 3 === 0;
          return (
            <span
              key={i}
              className="absolute select-none"
              style={{
                left: `${left}%`,
                bottom: near ? "-4%" : "6%",
                fontSize: near ? `${52 + g * 26}px` : `${28 + g * 14}px`,
                filter: near
                  ? "drop-shadow(0 8px 14px rgba(0,0,0,.35))"
                  : "blur(0.6px) drop-shadow(0 4px 8px rgba(0,0,0,.25))",
                opacity: near ? 0.95 : 0.75,
              }}
            >
              🌴
            </span>
          );
        })}
      </div>

      {/* قصور بعيدة تظهر تدريجياً */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{ transformStyle: "preserve-3d", ...layer(0.6) }}
      >
        {Array.from({ length: palaceCount }).map((_, i) => (
          <span
            key={i}
            className="absolute select-none"
            style={{
              left: `${8 + i * 15}%`,
              top: `${30 + ((i * 7) % 9)}%`,
              fontSize: `${20 + g * 12}px`,
              opacity: 0.85,
              filter: "drop-shadow(0 4px 10px rgba(0,0,0,.3))",
            }}
          >
            🏰
          </span>
        ))}
      </div>

      {/* لمعان الثمار كالجواهر */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{ transformStyle: "preserve-3d", ...layer(1.1) }}
      >
        {Array.from({ length: sparkCount }).map((_, i) => {
          const x = (i * 137) % 96;
          const y = 20 + ((i * 53) % 66);
          return (
            <span
              key={i}
              className="absolute block rounded-full animate-twinkle"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: 5 + (i % 3),
                height: 5 + (i % 3),
                background:
                  "radial-gradient(circle, oklch(1 0 0 / 0.95) 0%, oklch(0.9 0.16 95 / 0.7) 45%, transparent 70%)",
                boxShadow: "0 0 10px oklch(0.95 0.14 95 / 0.85)",
                animationDelay: `${(i % 7) * 0.6}s`,
              }}
            />
          );
        })}
      </div>

      {/* إطار عمق يمنع اختفاء التفاصيل عند الأطراف */}
      <div
        className="pointer-events-none absolute inset-0 z-50"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 58%, oklch(0.25 0.05 150 / 0.3) 100%)",
        }}
      />

      {/* وهج شمسي حيّ */}
      <div className="pointer-events-none absolute inset-0 z-50 animate-glow bg-[radial-gradient(45%_45%_at_78%_18%,oklch(0.98_0.12_92/0.35),transparent_70%)]" />

      <div className="pointer-events-none absolute bottom-2 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/35 px-3 py-1 text-[11px] text-white/90 backdrop-blur">
        حرّك إصبعك على المشهد لرؤية العمق ثلاثي الأبعاد
      </div>
    </div>
  );
}
