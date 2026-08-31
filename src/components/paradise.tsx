/**
 * مشهد «جنة» واقعي واحد تراكمي — يتّسع ويزداد حياةً كلما تراكمت الأعمال.
 * تمثيل تحفيزي بصري فقط، لا يدّعي أجراً ولا قبولاً.
 */

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
    palms: Math.min(14, Math.floor(lifetime / 4)),
    flowers: Math.min(60, Math.floor(lifetime / 2)),
    jewels: Math.min(24, Math.floor(lifetime / 6)),
    palaces: Math.min(5, Math.floor(lifetime / 25)),
    rivers: lifetime >= 12 ? 2 : lifetime >= 3 ? 1 : 0,
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

  return (
    <div
      className={`relative w-full overflow-hidden ${tall ? "h-full min-h-[60vh]" : "aspect-[16/10] sm:aspect-[16/9]"} ${className}`}
      role="img"
      aria-label="مشهد جنة واقعي يتّسع مع تراكم الأعمال"
    >
      {STAGES.map((s, i) => (
        <img
          key={i}
          src={s.src}
          alt=""
          width={1920}
          height={1088}
          loading={i === 0 ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-out animate-slow-pan"
          style={{ opacity: i <= index ? 1 : 0, zIndex: i }}
        />
      ))}

      {/* تدرّج لطيف يمنع اختفاء التفاصيل عند الأطراف */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 55%, oklch(0.25 0.05 150 / 0.28) 100%)",
        }}
      />

      {/* وهج شمسي حيّ */}
      <div className="pointer-events-none absolute inset-0 z-20 animate-glow bg-[radial-gradient(45%_45%_at_78%_18%,oklch(0.98_0.12_92/0.35),transparent_70%)]" />

      {/* لمعان الثمار كالجواهر */}
      <div className="pointer-events-none absolute inset-0 z-30">
        {Array.from({ length: Math.min(18, c.jewels + 4) }).map((_, i) => {
          const x = (i * 137) % 96;
          const y = 28 + ((i * 53) % 58);
          return (
            <span
              key={i}
              className="absolute block rounded-full animate-twinkle"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: 6,
                height: 6,
                background:
                  "radial-gradient(circle, oklch(1 0 0 / 0.95) 0%, oklch(0.9 0.16 95 / 0.7) 45%, transparent 70%)",
                boxShadow: "0 0 10px oklch(0.95 0.14 95 / 0.85)",
                animationDelay: `${(i % 7) * 0.6}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
