import { createFileRoute } from "@tanstack/react-router";
import { Btn, Card, Note, PageTitle, ShareReminder } from "@/components/bits";
import { useDayLog } from "@/lib/store";

export const Route = createFileRoute("/farm")({
  head: () => ({
    meta: [
      { title: "مزرعة وغراس الجنة — تمثيل تحفيزي رمزي" },
      {
        name: "description",
        content: "مشهد أخضر رمزي ينمو مع مداومتك على السنن والذكر، تحفيزاً لا حكماً.",
      },
      { property: "og:title", content: "مزرعة وغراس الجنة" },
      { property: "og:description", content: "غراس رمزية تنمو مع مداومتك على الذكر والسنن." },
    ],
  }),
  component: Farm,
});

const seeds = [
  { id: "rawatib", name: "سنن رواتب", icon: "🕌", grow: "قصر" },
  { id: "ikhlas", name: "الإخلاص", icon: "🤍", grow: "نور" },
  { id: "baqiyat", name: "الباقيات الصالحات", icon: "🌾", grow: "غرس" },
  { id: "hawqala", name: "لا حول ولا قوة إلا بالله", icon: "💎", grow: "كنز" },
];

function Farm() {
  const { today, add } = useDayLog();
  const score = seeds.reduce((n, s) => n + (today[s.id] ?? 0), 0);
  const level = Math.min(5, Math.floor(score / 3));

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="🌴"
        title="مزرعة وغراس الجنة"
        sub="تمثيل تحفيزي رمزي يعينك على المداومة — وليس نتيجة دينية مؤكدة."
      />

      <div className="garden-sky relative overflow-hidden rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-soft)]">
        <div className="flex h-44 items-end justify-around">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`animate-sway transition-all duration-500 ${i < level ? "opacity-100" : "opacity-25"}`}
              style={{ fontSize: `${28 + (i < level ? level * 6 : 0)}px`, animationDelay: `${i * 0.4}s` }}
            >
              {["🌱", "🌴", "🏰", "🌳", "💎"][i]}
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span>مستوى النماء الرمزي: {level} / 5</span>
          <span>{score} تسجيل اليوم</span>
        </div>
      </div>

      <div className="grid gap-2">
        {seeds.map((s) => (
          <Card key={s.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">
                <span className="ml-2">{s.icon}</span>
                {s.name}
              </p>
              <p className="text-xs text-muted-foreground">
                ينمو منه: {s.grow} · اليوم: {today[s.id] ?? 0}
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
        <ShareReminder title="نماء المزرعة" />
        <span className="text-xs text-muted-foreground">الافتراضي: خاص 🔒</span>
      </div>

      <Note>الرموز هنا وسيلة تحفيز بصري فقط، ولا تعني قبولاً ولا أجراً محدداً.</Note>
    </div>
  );
}
