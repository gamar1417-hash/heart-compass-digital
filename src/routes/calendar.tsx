import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { useDayLog } from "@/lib/store";
import { groups } from "@/data/content";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "تقويم مسارات الحياة — الذنب والتوبة والسنن" },
      {
        name: "description",
        content:
          "تقويم يومي وأسبوعي يعرض تقدّم كل مسار: مجاهدة النفس، التوبة والحقوق، والسنن والعبادات.",
      },
      { property: "og:title", content: "تقويم مسارات الحياة" },
      { property: "og:description", content: "تابع مسارك يوماً بيوم وأسبوعاً بأسبوع بلا جلد للذات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CalendarPage,
});

/** مسارات الحياة: كل مسار يجمع مقامات من الفهرس. */
const tracks = [
  { id: "nafs", name: "مجاهدة النفس والذنب", emoji: "💧", groups: ["nafs", "khuluq"] },
  { id: "tawba", name: "التوبة وردّ الحقوق", emoji: "🔒", groups: ["tawba"] },
  { id: "sunan", name: "السنن والعبادات", emoji: "🌿", groups: ["salah", "dhikr", "quran", "tawhid"] },
] as const;

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const weekdays = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

function CalendarPage() {
  const { logs, today, add } = useDayLog();
  const [view, setView] = useState<"day" | "week">("day");

  const idsOf = (t: (typeof tracks)[number]) =>
    groups
      .filter((g) => (t.groups as readonly string[]).includes(g.id))
      .flatMap((g) => g.items.map((i) => i.id));

  const days: { key: string; name: string; date: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ key: dayKey(d), name: weekdays[d.getDay()] ?? "", date: d.getDate() });
  }

  const sumFor = (ids: string[], key: string) =>
    ids.reduce((a, id) => a + (logs[key]?.[id] ?? 0), 0);

  const weeks: { label: string; keys: string[] }[] = [];
  for (let w = 3; w >= 0; w--) {
    const keys: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (w * 7 + i));
      keys.push(dayKey(d));
    }
    weeks.push({ label: w === 0 ? "هذا الأسبوع" : `قبل ${w} أسبوع`, keys });
  }

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="🗓️"
        title="تقويم مساراتي"
        sub="تقدّمك في الذنب والتوبة والسنن، يوماً بيوم وأسبوعاً بأسبوع."
      />

      <div className="flex gap-2">
        <Btn variant={view === "day" ? "primary" : "ghost"} onClick={() => setView("day")}>
          عرض يومي
        </Btn>
        <Btn variant={view === "week" ? "primary" : "ghost"} onClick={() => setView("week")}>
          عرض أسبوعي
        </Btn>
      </div>

      {tracks.map((t) => {
        const ids = idsOf(t);
        const todaySum = ids.reduce((a, id) => a + (today[id] ?? 0), 0);
        const weekSum = days.reduce((a, d) => a + sumFor(ids, d.key), 0);
        const maxDay = Math.max(1, ...days.map((d) => sumFor(ids, d.key)));
        const maxWeek = Math.max(1, ...weeks.map((w) => w.keys.reduce((a, k) => a + sumFor(ids, k), 0)));

        return (
          <Card key={t.id} className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">
                  {t.emoji} {t.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  اليوم: {todaySum} · الأسبوع: {weekSum}
                </p>
              </div>
              <Link to="/maqamat" className="text-[11px] text-primary underline">
                سجّل من الفهرس
              </Link>
            </div>

            {view === "day" ? (
              <div className="grid grid-cols-7 gap-1 text-center">
                {days.map((d) => {
                  const v = sumFor(ids, d.key);
                  return (
                    <div key={d.key} className="space-y-1">
                      <div
                        className="mx-auto flex h-10 w-full items-center justify-center rounded-xl text-xs font-semibold"
                        style={{
                          background:
                            v > 0
                              ? `color-mix(in oklab, var(--color-primary) ${Math.round(
                                  20 + (v / maxDay) * 70,
                                )}%, transparent)`
                              : "color-mix(in oklab, var(--color-muted) 60%, transparent)",
                        }}
                      >
                        {v || "—"}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{d.name}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {weeks.map((w) => {
                  const v = w.keys.reduce((a, k) => a + sumFor(ids, k), 0);
                  return (
                    <div key={w.label} className="flex items-center gap-2 text-xs">
                      <span className="w-24 shrink-0 text-muted-foreground">{w.label}</span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted/60">
                        <div
                          className="h-full rounded-full bg-primary/80"
                          style={{ width: `${Math.max(2, (v / maxWeek) * 100)}%` }}
                        />
                      </div>
                      <span className="w-8 text-left tabular-nums text-primary">{v}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {groups
                .filter((g) => (t.groups as readonly string[]).includes(g.id))
                .flatMap((g) => g.items.slice(0, 2))
                .slice(0, 4)
                .map((i) => (
                  <Btn key={i.id} variant="ghost" onClick={() => add(i.id)}>
                    + {i.title} ({today[i.id] ?? 0})
                  </Btn>
                ))}
            </div>
          </Card>
        );
      })}

      <Note>
        التقويم مرآة للمداومة لا ميزان للأجر. الفراغ في يومٍ ليس حكماً عليك؛ ابدأ من اليوم بلا قنوط.
      </Note>
    </div>
  );
}
