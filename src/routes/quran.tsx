import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { ParadiseScene, paradiseStage } from "@/components/paradise";
import { ayat, groups } from "@/data/content";
import { useDayLog, useLocalState } from "@/lib/store";

export const Route = createFileRoute("/quran")({
  head: () => ({
    meta: [
      { title: "وردي القرآني — اختر آية وسجّل تلاوتك وتدبّرك" },
      {
        name: "description",
        content:
          "اختر آية من مصحفك اليومي، اقرأ معناها المبسّط، وسجّل التلاوة أو التدبّر أو الحفظ ليترقّى مسار السنن في جنتك وجنة عائلتك.",
      },
      { property: "og:title", content: "وردي القرآني" },
      {
        property: "og:description",
        content: "اختيار الآيات وتسجيلها، مربوطة بفهرس المقامات وبجنة العائلة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuranPage,
});

/** أعمال مقام القرآن التي يمكن تسجيلها مباشرة من الآية. */
const ACTIONS = [
  { id: "quran-1", label: "تلوتها", emoji: "📖" },
  { id: "quran-2", label: "تدبّرتها", emoji: "🫧" },
  { id: "quran-3", label: "حفظتها", emoji: "🧠" },
  { id: "quran-4", label: "راجعتها", emoji: "🔁" },
] as const;

const quranGroup = groups.find((g) => g.id === "quran");

function QuranPage() {
  const { today, add, lifetimeById } = useDayLog();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useLocalState<string[]>("quran-picked", []);
  const [manual, setManual] = useState({ verses: 1, pages: 1, words: 1 });

  const list = useMemo(() => {
    const term = q.trim();
    if (!term) return ayat;
    return ayat.filter((a) => (a.text + a.ref + a.tafsir).includes(term));
  }, [q]);

  const todayQuran = (quranGroup?.items ?? []).reduce((n, i) => n + (today[i.id] ?? 0), 0);
  const lifeQuran = (quranGroup?.items ?? []).reduce((n, i) => n + (lifetimeById[i.id] ?? 0), 0);
  const quranTotals = [
    { id: "quran-verses", label: "آية", value: manual.verses, key: "verses" as const },
    { id: "quran-pages", label: "صفحة", value: manual.pages, key: "pages" as const },
    { id: "quran-words", label: "كلمة", value: manual.words, key: "words" as const },
  ];
  const quranLifetime = lifeQuran + quranTotals.reduce((sum, item) => sum + (lifetimeById[item.id] ?? 0), 0);
  const stage = paradiseStage(quranLifetime);

  const toggle = (ref: string) =>
    setPicked((p) => (p.includes(ref) ? p.filter((x) => x !== ref) : [...p, ref]));

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="📖"
        title="وردي القرآني"
        sub="اختر آياتك، اقرأ معناها، وسجّل تلاوتك وتدبّرك — فيترقّى مسار السنن في جنتك وجنة عائلتك."
      />

      <Card className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">ورد القرآن اليوم</span>
          <span className="font-bold text-primary">{todayQuran}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">التراكمي في مقام القرآن</span>
          <span className="font-bold">{lifeQuran}</span>
        </div>
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-sm font-bold">مصحفك التراكمي</p>
          <p className="text-xs text-muted-foreground">سجّل ما قرأته هنا أو من أي مصحف آخر.</p>
          {quranTotals.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-2">
              <input type="number" min={1} value={item.value} aria-label={`عدد ${item.label}`}
                onChange={(e) => setManual((current) => ({ ...current, [item.key]: Math.max(1, Number(e.target.value) || 1) }))}
                className="h-10 w-20 rounded-2xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
              <Btn onClick={() => add(item.id, item.value)}>أضف {item.label}</Btn>
              <span className="text-xs text-muted-foreground">اليوم {today[item.id] ?? 0} · تراكمي {lifetimeById[item.id] ?? 0}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <ParadiseScene lifetime={quranLifetime} />
        <div className="p-4"><p className="font-bold">أثر وردك في الجنة الرمزية</p><p className="text-xs text-muted-foreground">{stage.label} · {quranLifetime} تسجيل تراكمي</p></div>
      </Card>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ابحث عن آية… مثل: الصبر، الرحمة، الذكر"
        className="min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
      />

      <div className="space-y-2">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا نتائج، جرّب كلمة أخرى.</p>
        ) : null}
        {list.map((a) => (
          <Card key={a.ref} className="space-y-2">
            <p className="font-display text-xl leading-loose">﴿{a.text}﴾</p>
            <p className="text-xs text-muted-foreground">{a.ref}</p>
            <p className="text-sm leading-relaxed">
              <b>معنى مبسّط: </b>
              {a.tafsir}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <b>مثال قريب: </b>
              {a.example}
            </p>

            <div className="flex flex-wrap gap-2 border-t border-border pt-2">
              {ACTIONS.map((act) => (
                <button
                  key={act.id}
                  onClick={() => add(act.id)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                    today[act.id]
                      ? "bg-accent text-accent-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {act.emoji} {act.label}
                  {today[act.id] ? ` ✓ ${today[act.id]}` : ""}
                </button>
              ))}
              <button
                onClick={() => toggle(a.ref)}
                className="rounded-xl border border-border px-3 py-2 text-xs font-semibold"
              >
                {picked.includes(a.ref) ? "💚 في وردي" : "🤍 أضف لوردي"}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {picked.length ? (
        <Card className="space-y-1">
          <h2 className="text-sm font-bold">وردي المختار</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {picked.join(" • ")}
          </p>
        </Card>
      ) : null}

      <Card className="space-y-2">
        <h2 className="text-sm font-bold">مرتبط بفهرس المقامات</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          كل تسجيل هنا يُضاف إلى بنود «{quranGroup?.name ?? "مقام القرآن"}» في الفهرس، ويدخل ضمن
          مسار «السنن والعبادات» فترتقي جنتك وجنة عائلتك تلقائياً.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/maqamat"
            className="rounded-2xl bg-secondary px-3 py-2 text-xs font-semibold"
          >
            🧭 افتح فهرس المقامات
          </Link>
          <Link
            to="/family"
            className="rounded-2xl bg-secondary px-3 py-2 text-xs font-semibold"
          >
            🏡 جنة العائلة
          </Link>
        </div>
      </Card>

      <Note>
        هذه مساحة تذكير شخصية؛ العدادات مؤشرات تحفيزية للمداومة وليست حساباً للأجر، وللتوسّع في
        التفسير ارجع لمصدر موثوق.
      </Note>
    </div>
  );
}
