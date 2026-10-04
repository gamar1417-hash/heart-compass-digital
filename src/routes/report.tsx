import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Note, PageTitle } from "@/components/bits";
import { useDayLog } from "@/lib/store";
import { paradiseCounts, paradiseStage } from "@/components/paradise";
import { labelOf } from "@/routes/deeds";
import { useSession } from "@/lib/cloud";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "تقريري الأسبوعي — تقدّم جنتي وأعمالي" },
      {
        name: "description",
        content:
          "تقرير أسبوعي خاص يوضّح تقدّم جنتك، تراكم أعمالك، والمراحل التي بلغتها، مع تذكير قرآني محفّز.",
      },
      { property: "og:title", content: "التقرير الأسبوعي" },
      { property: "og:description", content: "أعمال أسبوعك ومراحل جنتك في صفحة واحدة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportPage,
});

const ayat = [
  { text: "﴿وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ﴾", ref: "النجم: ٣٩" },
  { text: "﴿إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ﴾", ref: "هود: ١١٤" },
  { text: "﴿وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ﴾", ref: "آل عمران: ١٣٣" },
  { text: "﴿وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ﴾", ref: "الزلزلة: ٧" },
  { text: "﴿فَاسْتَبِقُوا الْخَيْرَاتِ﴾", ref: "البقرة: ١٤٨" },
];

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const weekdays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function ReportPage() {
  const { logs, lifetimeById, lifetimeTotal } = useDayLog();
  const { user } = useSession();

  const days: { key: string; name: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const total = Object.values(logs[key] ?? {}).reduce((a, b) => a + b, 0);
    days.push({ key, name: weekdays[d.getDay()] ?? "", total });
  }

  const weekTotal = days.reduce((a, d) => a + d.total, 0);
  const prevWeekTotal = (() => {
    let sum = 0;
    for (let i = 13; i >= 7; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      sum += Object.values(logs[dayKey(d)] ?? {}).reduce((a, b) => a + b, 0);
    }
    return sum;
  })();
  const diff = weekTotal - prevWeekTotal;
  const activeDays = days.filter((d) => d.total > 0).length;
  const max = Math.max(1, ...days.map((d) => d.total));

  // أكثر الأعمال في الأسبوع
  const weekById: Record<string, number> = {};
  for (const d of days) {
    for (const [id, n] of Object.entries(logs[d.key] ?? {})) {
      weekById[id] = (weekById[id] ?? 0) + n;
    }
  }
  const topWeek = Object.entries(weekById)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topLife = Object.entries(lifetimeById)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const stage = paradiseStage(lifetimeTotal);
  const counts = paradiseCounts(lifetimeTotal);
  const ayah = ayat[new Date().getDay() % ayat.length]!;

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="📊"
        title="تقريري الأسبوعي"
        sub="نظرة رحيمة على أسبوعك: مداومة لا محاسبة قاسية."
      />

      <Card className="space-y-1 text-center">
        <p className="font-display text-lg leading-loose text-primary">{ayah.text}</p>
        <p className="text-[11px] text-muted-foreground">{ayah.ref}</p>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Card className="text-center">
          <p className="text-xs text-muted-foreground">أعمال هذا الأسبوع</p>
          <p className="font-display text-3xl text-primary">{weekTotal}</p>
          <p className="text-[11px] text-muted-foreground">
            {diff >= 0 ? `+${diff} عن الأسبوع الماضي` : `${diff} عن الأسبوع الماضي`}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-muted-foreground">أيام مداومة</p>
          <p className="font-display text-3xl text-primary">{activeDays} / 7</p>
          <p className="text-[11px] text-muted-foreground">الإجمالي التراكمي: {lifetimeTotal}</p>
        </Card>
      </div>

      <Card className="space-y-2">
        <h2 className="font-bold">أيام أسبوعك</h2>
        <div className="flex items-end justify-between gap-1 pt-2">
          {days.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{d.total}</span>
              <div
                className="w-full rounded-t-lg bg-primary/70"
                style={{ height: `${Math.max(4, (d.total / max) * 90)}px` }}
              />
              <span className="text-[10px] text-muted-foreground">{d.name}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-2">
        <h2 className="font-bold">تقدّم جنتك</h2>
        <p className="text-sm">
          المرحلة الحالية: <span className="font-semibold text-primary">{stage.label}</span>
        </p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-2xl bg-muted/50 p-2">
            🌴 نخيل
            <p className="font-display text-lg text-primary">{counts.palms}</p>
          </div>
          <div className="rounded-2xl bg-muted/50 p-2">
            🏰 قصور
            <p className="font-display text-lg text-primary">{counts.palaces}</p>
          </div>
          <div className="rounded-2xl bg-muted/50 p-2">
            💎 جواهر
            <p className="font-display text-lg text-primary">{counts.jewels}</p>
          </div>
          <div className="rounded-2xl bg-muted/50 p-2">
            🌸 زهور
            <p className="font-display text-lg text-primary">{counts.flowers}</p>
          </div>
          <div className="rounded-2xl bg-muted/50 p-2">
            🏞️ أنهار
            <p className="font-display text-lg text-primary">{counts.rivers}</p>
          </div>
          <div className="rounded-2xl bg-muted/50 p-2">
            ✨ التراكم
            <p className="font-display text-lg text-primary">{lifetimeTotal}</p>
          </div>
        </div>
        <Link to="/farm" className="text-xs text-primary underline">
          افتح مشهد جنتك
        </Link>
      </Card>

      <div className="grid gap-2 md:grid-cols-2">
        <Card className="space-y-2">
          <h2 className="font-bold">أكثر أعمالك هذا الأسبوع</h2>
          {topWeek.length ? (
            topWeek.map(([id, n]) => (
              <div key={id} className="flex justify-between text-sm">
                <span>{labelOf(id)}</span>
                <span className="tabular-nums text-primary">{n}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">لم تسجّل شيئاً بعد هذا الأسبوع.</p>
          )}
        </Card>
        <Card className="space-y-2">
          <h2 className="font-bold">الأكثر تراكماً منذ البداية</h2>
          {topLife.length ? (
            topLife.map(([id, n]) => (
              <div key={id} className="flex justify-between text-sm">
                <span>{labelOf(id)}</span>
                <span className="tabular-nums text-primary">{n}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">ابدأ بأول تسبيحة اليوم.</p>
          )}
        </Card>
      </div>

      {!user ? (
        <Note>
          سجّل الدخول من صفحة <Link to="/auth" search={{ redirect: "/report" }} className="text-primary underline">حسابي</Link> ليُحفظ
          تقريرك وتقدّمك على حسابك الخاص.
        </Note>
      ) : null}

      <Note>
        هذه الأرقام مؤشرات مداومة وتحفيز فقط، لا حكم فيها على القبول ولا تقدير للأجر — والأجر عند
        الله وحده.
      </Note>
    </div>
  );
}
