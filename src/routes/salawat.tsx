import { createFileRoute, Link } from "@tanstack/react-router";
import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { useDayLog } from "@/lib/store";
import { paradiseStage } from "@/components/paradise";

export const Route = createFileRoute("/salawat")({
  head: () => ({
    meta: [
      { title: "جدول الصلاة اليومي — مبادرة وتوقيت رمزي" },
      {
        name: "description",
        content:
          "جدول يومي للصلوات الخمس مع توقيت رمزي يوضّح فضل المبادرة، محفوظ في حسابك ويرقّى جنتك مع صلاة اليوم.",
      },
      { property: "og:title", content: "جدول الصلاة اليومي" },
      { property: "og:description", content: "بادر إلى الوقت، وسجّل صلاتك وراتبتك في جدول واضح." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SalawatPage,
});

type Row = { id: string; name: string; window: string; sunnah: number; virtue: string };

const rows: Row[] = [
  {
    id: "fajr",
    name: "الفجر",
    window: "من الأذان إلى شروق الشمس",
    sunnah: 2,
    virtue: "«ركعتا الفجر خير من الدنيا وما فيها» — رجاءً لا حساباً للأجر.",
  },
  {
    id: "dhuhr",
    name: "الظهر",
    window: "من الزوال إلى مصير ظل الشيء مثله",
    sunnah: 4,
    virtue: "أربع قبلها وركعتان بعدها من الرواتب المؤكدة.",
  },
  {
    id: "asr",
    name: "العصر",
    window: "إلى اصفرار الشمس",
    sunnah: 0,
    virtue: "المحافظة على العصر باب سكينة في آخر النهار.",
  },
  {
    id: "maghrib",
    name: "المغرب",
    window: "من الغروب إلى مغيب الشفق",
    sunnah: 2,
    virtue: "بادر بها فور الأذان ما تيسّر.",
  },
  {
    id: "isha",
    name: "العشاء",
    window: "إلى منتصف الليل",
    sunnah: 2,
    virtue: "واختم ليلك بوتر ولو ركعة.",
  },
];

/** حالات التوقيت الرمزي — تشجيع على المبادرة، وليست حكماً على الصلاة. */
const marks = [
  { key: "sabiq", label: "بادرتُ مع الأذان", emoji: "🌟", tone: "text-primary" },
  { key: "waqt", label: "في وقتها", emoji: "✅", tone: "text-foreground" },
  { key: "akhir", label: "في آخر وقتها", emoji: "🕰️", tone: "text-muted-foreground" },
];

function SalawatPage() {
  const { today, add, lifetimeTotal } = useDayLog();
  const stage = paradiseStage(lifetimeTotal);

  const doneToday = rows.filter((r) => (today[`prayer-${r.id}`] ?? 0) > 0).length;
  const earlyToday = rows.filter((r) => (today[`sabiq-${r.id}`] ?? 0) > 0).length;

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="🗓️"
        title="جدول الصلاة اليومي"
        sub="بادر إلى الوقت، والقبول عند الله وحده."
      />

      <Card className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">صلوات اليوم</p>
          <p className="font-display text-3xl text-primary">{doneToday} / 5</p>
          <p className="text-[11px] text-muted-foreground">منها {earlyToday} بمبادرة مع الأذان</p>
        </div>
        <div className="text-left">
          <p className="text-xs text-muted-foreground">مرحلة جنتك الآن</p>
          <p className="text-sm font-semibold">{stage.label}</p>
          <Link to="/farm" className="text-[11px] text-primary underline">
            شاهد جنتك
          </Link>
        </div>
      </Card>

      <div className="grid gap-2">
        {rows.map((r) => {
          const done = today[`prayer-${r.id}`] ?? 0;
          return (
            <Card key={r.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">
                    {r.name} {done > 0 ? "✅" : ""}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{r.window}</p>
                </div>
                <Btn onClick={() => add(`prayer-${r.id}`)}>صلّيت</Btn>
              </div>

              <div className="flex flex-wrap gap-2">
                {marks.map((m) => (
                  <Btn
                    key={m.key}
                    variant="ghost"
                    onClick={() => {
                      add(`${m.key}-${r.id}`);
                      if ((today[`prayer-${r.id}`] ?? 0) === 0) add(`prayer-${r.id}`);
                    }}
                  >
                    <span className={m.tone}>
                      {m.emoji} {m.label}
                      {(today[`${m.key}-${r.id}`] ?? 0) > 0 ? ` (${today[`${m.key}-${r.id}`]})` : ""}
                    </span>
                  </Btn>
                ))}
                {r.sunnah ? (
                  <Btn variant="ghost" onClick={() => add("rawatib")}>
                    🌿 الراتبة ({r.sunnah} ركعات)
                  </Btn>
                ) : null}
              </div>

              <p className="text-[11px] text-muted-foreground">{r.virtue}</p>
            </Card>
          );
        })}
      </div>

      <Card className="space-y-2">
        <h2 className="font-bold">توابع اليوم</h2>
        <div className="flex flex-wrap gap-2">
          <Btn variant="ghost" onClick={() => add("witr")}>
            الوتر ({today["witr"] ?? 0})
          </Btn>
          <Btn variant="ghost" onClick={() => add("duha")}>
            الضحى ({today["duha"] ?? 0})
          </Btn>
          <Btn variant="ghost" onClick={() => add("adhkar-salah")}>
            أذكار بعد الصلاة ({today["adhkar-salah"] ?? 0})
          </Btn>
        </div>
      </Card>

      <Note>
        التوقيت هنا رمزي للتذكير بفضل المبادرة، ولا يحسب أجراً ولا يقيس خشوعاً. وما تسجّله محفوظ لك
        وحدك في حسابك، ويظهر أثره في نمو مشهد جنتك التحفيزي.
      </Note>
    </div>
  );
}
