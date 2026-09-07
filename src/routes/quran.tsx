import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Btn, Card, Note, PageTitle } from "@/components/bits";
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
  const [pages, setPages] = useState(1);

  const list = useMemo(() => {
    const term = q.trim();
    if (!term) return ayat;
    return ayat.filter((a) => (a.text + a.ref + a.tafsir).includes(term));
  }, [q]);

  const todayQuran = (quranGroup?.items ?? []).reduce((n, i) => n + (today[i.id] ?? 0), 0);
  const lifeQuran = (quranGroup?.items ?? []).reduce((n, i) => n + (lifetimeById[i.id] ?? 0), 0);

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
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
          <span className="text-xs text-muted-foreground">قرأت خارج التطبيق؟</span>
          <input
            type="number"
            min={1}
            value={pages}
            onChange={(e) => setPages(Math.max(1, Number(e.target.value) || 1))}
            className="h-10 w-20 rounded-2xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
          <Btn onClick={() => add("quran-1", pages)}>أضف {pages} صفحة/ورد</Btn>
        </div>
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
