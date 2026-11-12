import { useRef, useState } from "react";

import { useDayLog } from "@/lib/store";
import garden from "@/assets/paradise-1.jpg";
import rivers from "@/assets/paradise-2.jpg";
import palaces from "@/assets/paradise-3.jpg";
import city from "@/assets/paradise-4.jpg";

export interface ParadiseProps {
  /**
   * المجموع التراكمي الذي يُبنى عليه المشهد.
   * إن لم يُمَرَّر يُقرأ تلقائياً من `useDayLog().lifetimeTotal`.
   */
  lifetime?: number;
  className?: string;
  /** عرضٌ طويل يملأ الشاشة (يُستعمل في «عرض واسع»). */
  tall?: boolean;
}

/** مراحل الجنة: كل مرحلة تُفتح عند حدٍّ تراكمي، والعالم نفسه يتّسع. */
export const STAGES = [
  {
    at: 0,
    label: "جناتٌ خضر",
    hint: "خضرةٌ وارفة وظلالٌ ممدودة ونخيلٌ ونهرٌ يجري",
    image: garden,
  },
  {
    at: 12,
    label: "أنهارٌ وأسِرّة",
    hint: "أنهارٌ تجري وأسِرّةٌ مرفوعة وثمارٌ دانية القطوف",
    image: rivers,
  },
  {
    at: 40,
    label: "قصورٌ ولؤلؤ",
    hint: "قصورٌ من رخامٍ وذهبٍ ولؤلؤٍ وحرير",
    image: palaces,
  },
  {
    at: 90,
    label: "حاضرةُ الفردوس",
    hint: "مدينةٌ عامرةٌ تمتدّ على مدّ البصر",
    image: city,
  },
] as const;

export interface ParadiseStage {
  index: number;
  at: number;
  label: string;
  hint: string;
  image: string;
  /** عتبة المرحلة التالية، أو null إذا بلغتَ آخر مرحلة. */
  next: number | null;
}

/** المرحلة الحالية للتراكمي مع عتبة المرحلة التالية. */
export function paradiseStage(lifetime: number = 0): ParadiseStage {
  const total = Math.max(0, Number(lifetime) || 0);
  let index = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (total >= STAGES[i]!.at) index = i;
  }
  const stage = STAGES[index]!;
  return {
    index,
    at: stage.at,
    label: stage.label,
    hint: stage.hint,
    image: stage.image,
    next: STAGES[index + 1]?.at ?? null,
  };
}

/** عدّادات المشهد: نخيلٌ وزهورٌ وثمارٌ وقصورٌ وأنهار. */
export function paradiseCounts(lifetime: number = 0) {
  const total = Math.max(0, Number(lifetime) || 0);
  return {
    palms: Math.floor(total / 12) + 3,
    flowers: Math.floor(total / 6) + 8,
    jewels: Math.floor(total / 9) + 4,
    palaces: Math.floor(total / 40) + 1,
    rivers: Math.floor(total / 25) + 1,
    services: Math.floor(total / 50) + 2,
    trees: Math.floor(total / 20) + 5,
  };
}

/**
 * مشهد الجنة التراكمي.
 * `lifetime` اختيارية: تُقرأ افتراضياً من `useDayLog().lifetimeTotal`.
 * اسحب بإصبعك لتتطلّع يميناً وشمالاً وفوق وتحت.
 */
export function ParadiseScene({ lifetime, className = "", tall = false }: ParadiseProps) {
  const { lifetimeTotal } = useDayLog();
  const total = Number.isFinite(Number(lifetime)) ? Number(lifetime) : lifetimeTotal;

  const stage = paradiseStage(total);
  const counts = paradiseCounts(total);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const origin = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    origin.current = { x: e.clientX, y: e.clientY, tx: tilt.x, ty: tilt.y };
    setDragging(true);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = (e.clientX - origin.current.x) / 140;
    const dy = (e.clientY - origin.current.y) / 140;
    setTilt({
      x: Math.max(-1, Math.min(1, origin.current.tx + dx)),
      y: Math.max(-1, Math.min(1, origin.current.ty + dy)),
    });
  };

  const onUp = () => setDragging(false);

  const pct = stage.next
    ? Math.max(0, Math.min(100, Math.round(((total - stage.at) / (stage.next - stage.at)) * 100)))
    : 100;

  return (
    <div
      dir="rtl"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={onUp}
      style={{ touchAction: "pan-y" }}
      className={`relative w-full cursor-grab overflow-hidden bg-neutral-950 select-none active:cursor-grabbing ${
        tall ? "h-full min-h-[70svh]" : "aspect-[4/5] min-h-[22rem] sm:aspect-[16/9] sm:min-h-0"
      } ${className}`}
    >
      {/* الطبقة البصرية: تتحرك مع السحب فتُعطي إحساساً بالعمق */}
      <div
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: `url(${stage.image})`,
          transform: `scale(1.16) translate3d(${tilt.x * -30}px, ${tilt.y * -22}px, 0)`,
          transition: dragging ? "none" : "transform 450ms ease-out",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40" />

      {/* شريط العدّادات */}
      <div className="absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-1 p-2 text-[10px] text-white/85 sm:text-[11px]">
        <span className="rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm">
          🌴 {counts.palms} · 🌸 {counts.flowers} · 💎 {counts.jewels} · 🏰 {counts.palaces} · 💧{" "}
          {counts.rivers}
        </span>
        <span className="rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm">اسحب لتتطلّع ↻</span>
      </div>

      {/* بطاقة المرحلة */}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <div className="rounded-2xl border border-amber-200/25 bg-black/55 p-3 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-amber-100">{stage.label}</p>
            <p className="text-[11px] text-amber-100/70 tabular-nums">{total} عملاً تراكمياً</p>
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-white/75">{stage.hint}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-amber-300 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-white/60">
            {stage.next
              ? `تتّسع الجنة أكثر عند ${stage.next} عملاً تراكمياً · لديك ${total}`
              : "بلغتَ أعلى مرحلة ظاهرة · والتراكمي لا يُمحى"}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-white/45">
            مشهدٌ تحفيزي رمزي لتقدّمك، لا صورةٌ للجنة الحقيقية ولا حسابٌ للأجر، و«فيها ما لا عينٌ
            رأت ولا أذنٌ سمعت».
          </p>
        </div>
      </div>
    </div>
  );
}

export const Paradise = ParadiseScene;
export default ParadiseScene;
