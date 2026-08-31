import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Card, Note, PageTitle, ShareReminder } from "@/components/bits";
import { ParadiseScene, paradiseCounts, paradiseStage } from "@/components/paradise";
import { useDayLog } from "@/lib/store";

export const Route = createFileRoute("/farm")({
  head: () => ({
    meta: [
      { title: "جنة الغراس — مشهد تراكمي رمزي" },
      {
        name: "description",
        content:
          "جنة واحدة واسعة تكبر تراكمياً مع مداومتك: نخيل وزهور وثمار كالجواهر وأنهار وقصور — تمثيل تحفيزي رمزي.",
      },
      { property: "og:title", content: "جنة الغراس" },
      { property: "og:description", content: "مشهد أخضر واسع يكبر مع مداومتك على الذكر والسنن." },
    ],
  }),
  component: Farm,
});

const seeds = [
  { id: "rawatib", name: "سنن رواتب", icon: "🕌", grow: "قصر" },
  { id: "ikhlas", name: "الإخلاص", icon: "🤍", grow: "نور وزهور" },
  { id: "baqiyat", name: "الباقيات الصالحات", icon: "🌾", grow: "نخيل" },
  { id: "hawqala", name: "لا حول ولا قوة إلا بالله", icon: "💎", grow: "كنز من الجواهر" },
];

function Farm() {
  const { today, add, lifetimeById, lifetimeTotal } = useDayLog();
  const [wide, setWide] = useState(false);
  const c = paradiseCounts(lifetimeTotal);
  const stage = paradiseStage(lifetimeTotal);

  const todayScore = seeds.reduce((n, s) => n + (today[s.id] ?? 0), 0);

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="🌴"
        title="جنة الغراس"
        sub="جنّة واحدة واسعة تكبر معك ولا تُمحى بنهاية اليوم — تمثيل تحفيزي رمزي، لا نتيجة دينية مؤكدة."
      />

      <div className="overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-soft)]">
        <ParadiseScene lifetime={lifetimeTotal} />
        <div className="flex flex-wrap items-center justify-between gap-2 bg-card px-4 py-3 text-xs text-muted-foreground">
          <span>
            🌴 {c.palms} نخلة · 🌸 {c.flowers} زهرة · 💎 {c.jewels} ثمرة · 🏰 {c.palaces} قصر · 💧{" "}
            {c.rivers} نهر
          </span>
          <span className="font-semibold text-primary">{stage.label}</span>
          <button onClick={() => setWide(true)} className="font-semibold text-primary">
            عرض واسع ⤢
          </button>
        </div>
        {stage.next ? (
          <div className="bg-card px-4 pb-3 text-xs text-muted-foreground">
            تتّسع الجنة أكثر عند بلوغ {stage.next} عملاً تراكمياً (لديكِ {lifetimeTotal}).
          </div>
        ) : null}
      </div>


      <div className="grid grid-cols-2 gap-2">
        <Card className="text-center">
          <p className="text-2xl font-bold tabular-nums">{lifetimeTotal}</p>
          <p className="text-xs text-muted-foreground">مجموع تراكمي (لا يُصفَّر)</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold tabular-nums">{todayScore}</p>
          <p className="text-xs text-muted-foreground">غِراس اليوم</p>
        </Card>
      </div>

      <div className="grid gap-2">
        {seeds.map((s) => (
          <Card key={s.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold">
                <span className="ml-2">{s.icon}</span>
                {s.name}
              </p>
              <p className="text-xs text-muted-foreground">
                ينمو منه: {s.grow} · اليوم: {today[s.id] ?? 0} · تراكمي: {lifetimeById[s.id] ?? 0}
              </p>
            </div>
            <Btn onClick={() => add(s.id)}>أغرس</Btn>
          </Card>
        ))}
      </div>

      <Card className="space-y-2">
        <h2 className="font-bold">🍇 بوابة ثمار الدنيا</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          للهموم والرزق: أكثِر من الاستغفار والدعاء، وخذ بالأسباب، وارجُ من الله الفرج
          <b> رجاءً لا ضماناً</b>؛ فالعطاء والمنع بحكمته سبحانه.
        </p>
        <div className="flex flex-wrap gap-2">
          <Btn variant="accent" onClick={() => add("hamm-istighfar")}>
            استغفرت للهمّ
          </Btn>
          <Btn variant="ghost" onClick={() => add("rizq-dua")}>
            دعوت بالرزق الحلال
          </Btn>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <ShareReminder title="نماء الجنة" />
        <span className="text-xs text-muted-foreground">الافتراضي: خاص 🔒</span>
      </div>

      <Note>الرموز هنا وسيلة تحفيز بصري فقط، ولا تعني قبولاً ولا أجراً محدداً.</Note>

      {wide ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-foreground/70 p-2">
          <button
            onClick={() => setWide(false)}
            className="mb-2 self-start rounded-2xl bg-card px-4 py-2 text-sm font-semibold"
          >
            إغلاق ✕
          </button>
          <div className="flex flex-1 items-center overflow-auto rounded-3xl bg-card">
            <ParadiseScene lifetime={lifetimeTotal} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
