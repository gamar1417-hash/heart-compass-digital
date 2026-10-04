import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Card, Counter, Note, PageTitle, PrivateNote, ShareReminder } from "@/components/bits";
import { counterVirtue } from "@/data/content";
import { useDayLog, useLocalState } from "@/lib/store";
import { ParadiseScene, paradiseStage } from "@/components/paradise";

export const Route = createFileRoute("/deeds")({
  head: () => ({
    meta: [
      { title: "أعمالي وأذكاري — سجل يومي وتراكمي" },
      {
        name: "description",
        content:
          "عدادات هادئة للذكر والأعمال مع إدخال يدوي، وسجل بالأيام ومجاميع تراكمية تُظهر أكثر عملٍ داومت عليه.",
      },
      { property: "og:title", content: "أعمالي وأذكاري" },
      { property: "og:description", content: "سجّل ذكرك وأعمالك يومياً وتراكمياً بخصوصية كاملة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Deeds,
});

const counters = [
  { id: "subhan", label: "سبحان الله وبحمده", hint: "١٠٠ مرة" },
  { id: "istighfar", label: "أستغفر الله", hint: "متفرقة خلال اليوم" },
  { id: "salat-nabi", label: "الصلاة على النبي ﷺ", hint: "أكثِر يوم الجمعة" },
  { id: "hawqala", label: "لا حول ولا قوة إلا بالله", hint: "عند الهمّ والتعب" },
  { id: "tahlil", label: "لا إله إلا الله وحده لا شريك له", hint: "١٠ مرات صباحاً" },
  { id: "sadaqa", label: "معروف اليوم", hint: "لا تحقرنّ من المعروف شيئاً" },
];

const EXTRA_LABELS: Record<string, string> = {
  rawatib: "سنن رواتب",
  ikhlas: "الإخلاص",
  baqiyat: "الباقيات الصالحات",
  "hamm-istighfar": "استغفار عند الهمّ",
  "rizq-dua": "دعاء الرزق",
};

export function labelOf(id: string) {
  return counters.find((c) => c.id === id)?.label ?? EXTRA_LABELS[id] ?? id;
}

function fmtDay(key: string) {
  try {
    return new Intl.DateTimeFormat("ar", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date(key + "T00:00:00"));
  } catch {
    return key;
  }
}

type Challenge = { id: string; name: string; circle: string; target: number; done: number };

function Deeds() {
  const { today, add, total, logs, lifetimeById, lifetimeTotal } = useDayLog();
  const [note, setNote] = useLocalState("deeds-note", "");
  const [challenges, setChallenges] = useLocalState<Challenge[]>("challenges", [
    { id: "c1", name: "١٠٠ استغفار", circle: "الأسرة", target: 100, done: 0 },
  ]);
  const [name, setName] = useState("");
  const [circle, setCircle] = useState("الأسرة");
  const [showAllDays, setShowAllDays] = useState(false);

  const ranked = Object.entries(lifetimeById)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  const topDeed = ranked[0];
  const topToday = Object.entries(today)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])[0];

  const days = Object.entries(logs)
    .map(([d, v]) => ({ day: d, entries: Object.entries(v).filter(([, n]) => n > 0) }))
    .filter((d) => d.entries.length > 0)
    .sort((a, b) => (a.day < b.day ? 1 : -1));
  const shownDays = showAllDays ? days : days.slice(0, 7);
  const stage = paradiseStage(lifetimeTotal);
  const tasbih = counters.filter((counter) => ["hawqala", "istighfar", "salat-nabi"].includes(counter.id));
  const otherCounters = counters.filter((counter) => !tasbih.some((item) => item.id === counter.id));

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="📿"
        title="أعمالي وأذكاري"
        sub={`اليوم: ${total} · التراكمي: ${lifetimeTotal} — الأرقام للتحفيز والمداومة فقط.`}
      />

      <Note>جودة النيّة لا يعرفها إلا الله؛ العدّاد يقيس المداومة لا القبول ولا الأجر.</Note>

      <section className="space-y-2">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-primary">السبحة</p>
            <h2 className="text-xl font-bold">ذكرٌ يبني المشهد أولاً بأول</h2>
          </div>
          <span aria-hidden="true" className="text-3xl">↙</span>
        </div>
        <div className="grid gap-2">
          {tasbih.map((c) => (
            <Counter key={c.id} label={c.label} hint={c.hint} value={today[c.id] ?? 0}
              lifetime={lifetimeById[c.id] ?? 0} virtue={counterVirtue[c.id]} onAdd={(n) => add(c.id, n)} />
          ))}
        </div>
      </section>

      <Card className="overflow-hidden p-0">
        <ParadiseScene lifetime={lifetimeTotal} />
        <div className="flex items-center justify-between gap-3 p-4">
          <div><p className="font-bold">{stage.label}</p><p className="text-xs text-muted-foreground">تتجدّد فوراً · {lifetimeTotal} تسجيل تراكمي</p></div>
          <span className="text-2xl">🌴</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Card className="space-y-1 text-center">
          <p className="text-xs text-muted-foreground">أكثر ما داومت عليه (تراكمي)</p>
          <p className="font-bold text-primary">{topDeed ? labelOf(topDeed[0]) : "—"}</p>
          <p className="text-2xl font-bold tabular-nums">{topDeed ? topDeed[1] : 0}</p>
        </Card>
        <Card className="space-y-1 text-center">
          <p className="text-xs text-muted-foreground">أكثر عمل اليوم</p>
          <p className="font-bold text-primary">{topToday ? labelOf(topToday[0]) : "—"}</p>
          <p className="text-2xl font-bold tabular-nums">{topToday ? topToday[1] : 0}</p>
        </Card>
      </div>

      <div className="grid gap-2">
        {otherCounters.map((c) => (
          <Counter
            key={c.id}
            label={c.label}
            hint={c.hint}
            value={today[c.id] ?? 0}
            lifetime={lifetimeById[c.id] ?? 0}
            virtue={counterVirtue[c.id]}
            onAdd={(n) => add(c.id, n)}
          />
        ))}
      </div>

      <Note>
        لو سبّحت أو استغفرت خارج التطبيق فاكتب العدد في خانة «إدخال يدوي» واضغط «أضِف» — بأمانة وصدق
        بينك وبين الله 🤍
      </Note>

      <Card className="space-y-3">
        <h2 className="font-bold">🏆 أكثر الأعمال تراكماً</h2>
        {ranked.length === 0 ? (
          <p className="text-sm text-muted-foreground">لم تسجّل شيئاً بعد — ابدأ بذكرٍ واحد.</p>
        ) : (
          <div className="space-y-2">
            {ranked.slice(0, 8).map(([id, v]) => (
              <div key={id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{labelOf(id)}</span>
                  <span className="tabular-nums font-semibold">{v}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.round((v / (ranked[0]?.[1] || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-bold">🗓️ سجلّ الأيام</h2>
        <p className="text-xs text-muted-foreground">
          محفوظ يوماً بيوم على جهازك (ويُزامَن مع حسابك عند الدخول)، والتراكمي لا يُصفَّر.
        </p>
        {shownDays.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا يوجد سجل بعد.</p>
        ) : (
          shownDays.map((d) => {
            const sum = d.entries.reduce((n, [, v]) => n + v, 0);
            const best = [...d.entries].sort((a, b) => b[1] - a[1])[0]!;
            return (
              <div key={d.day} className="rounded-2xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{fmtDay(d.day)}</p>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    المجموع {sum}
                  </span>
                </div>
                <p className="mt-1 text-xs text-primary">
                  الأكثر: {labelOf(best[0])} ({best[1]})
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {d.entries
                    .sort((a, b) => b[1] - a[1])
                    .map(([id, v]) => (
                      <span
                        key={id}
                        className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground"
                      >
                        {labelOf(id)} · {v}
                      </span>
                    ))}
                </div>
              </div>
            );
          })
        )}
        {days.length > 7 ? (
          <button
            onClick={() => setShowAllDays((v) => !v)}
            className="text-sm font-semibold text-primary"
          >
            {showAllDays ? "عرض آخر ٧ أيام" : `عرض كل الأيام (${days.length})`}
          </button>
        ) : null}
      </Card>


      <div className="flex flex-wrap items-center gap-3">
        <ShareReminder title="أذكار اليوم" />
        <span className="text-xs text-muted-foreground">لا شيء يُشارك تلقائياً 🔒</span>
      </div>

      <Card className="space-y-3">
        <h2 className="font-bold">🤍 تحديات ذكر اختيارية</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          خاصة مع الأسرة أو الأصدقاء، بنيّة التعاون على الخير لا المنافسة ولا المفاخرة. لا يُعرض هنا
          ترتيب ولا مقارنات.
        </p>
        {challenges.map((ch) => (
          <div key={ch.id} className="rounded-2xl border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{ch.name}</p>
              <span className="text-xs text-muted-foreground">{ch.circle}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(100, (ch.done / ch.target) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {ch.done} / {ch.target}
              </span>
              <div className="flex gap-2">
                <Btn
                  variant="ghost"
                  onClick={() =>
                    setChallenges((p) =>
                      p.map((x) => (x.id === ch.id ? { ...x, done: x.done + 10 } : x)),
                    )
                  }
                >
                  +١٠
                </Btn>
                <Btn
                  variant="ghost"
                  onClick={() => setChallenges((p) => p.filter((x) => x.id !== ch.id))}
                >
                  حذف
                </Btn>
              </div>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم التحدي"
            className="min-h-11 flex-1 rounded-2xl border border-border bg-card px-3 text-sm"
          />
          <select
            value={circle}
            onChange={(e) => setCircle(e.target.value)}
            className="min-h-11 rounded-2xl border border-border bg-card px-3 text-sm"
          >
            <option>الأسرة</option>
            <option>الأصدقاء</option>
            <option>بيني وبين نفسي</option>
          </select>
          <Btn
            onClick={() => {
              if (!name.trim()) return;
              setChallenges((p) => [
                ...p,
                { id: String(Date.now()), name: name.trim(), circle, target: 100, done: 0 },
              ]);
              setName("");
            }}
          >
            إضافة
          </Btn>
        </div>
      </Card>

      <Card>
        <PrivateNote storageValue={note} onChange={setNote} />
      </Card>
    </div>
  );
}
