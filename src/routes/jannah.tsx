import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";

const Paradise360 = lazy(() => import("@/components/paradise-360"));
import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { ParadiseScene, paradiseCounts, paradiseStage } from "@/components/paradise";
import { groups } from "@/data/content";
import { useDayLog } from "@/lib/store";
import { useSession } from "@/lib/cloud";
import { TRACKS, trackTotals, type TrackId } from "@/lib/family";

export const Route = createFileRoute("/jannah")({
  head: () => ({
    meta: [
      { title: "جنتي — مشهد تراكمي مرتبط بحسابك" },
      {
        name: "description",
        content: "تطبيق الجنة وحده: مشهد واقعي يتّسع تراكمياً مع مساراتك وفهرس المقامات، محفوظ في حسابك.",
      },
      { property: "og:title", content: "جنتي — مشهد تراكمي" },
      { property: "og:description", content: "جنة رمزية تكبر مع مساراتك ومقاماتك، محفوظة في حسابك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Jannah,
});

function Jannah() {
  const { user } = useSession();
  const { today, add, lifetimeById, lifetimeTotal } = useDayLog();
  const [track, setTrack] = useState<TrackId>("sunan");
  const [wide, setWide] = useState(false);
  const stage = paradiseStage(lifetimeTotal);
  const c = paradiseCounts(lifetimeTotal);
  const totals = trackTotals(lifetimeById);
  const active = TRACKS.find((t) => t.id === track)!;
  const trackGroups = groups.filter((g) => (active.groups as readonly string[]).includes(g.id));

  return (
    <div className="space-y-4">
      <PageTitle emoji="🌿" title="جنتي" sub="مشهد واحد بسيط يتّسع مع كل عمل تسجّله — تمثيل تحفيزي رمزي لا حساب للأجر." />

      <ClientOnly fallback={<div className="h-[75svh] min-h-[26rem] rounded-3xl bg-muted" />}>
        <Suspense fallback={<div className="h-[75svh] min-h-[26rem] rounded-3xl bg-muted" />}>
          <Paradise360 lifetime={lifetimeTotal} />
        </Suspense>
      </ClientOnly>

      <div className="overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-soft)]">
        <ParadiseScene lifetime={lifetimeTotal} />
        <div className="flex flex-wrap items-center justify-between gap-2 bg-card px-4 py-3 text-xs text-muted-foreground">
          <span>🌴 {c.palms} · 🌸 {c.flowers} · 💎 {c.jewels} · 🏰 {c.palaces} · 💧 {c.rivers}</span>
          <span className="font-semibold text-primary">{stage.label}</span>
          <button onClick={() => setWide(true)} className="font-semibold text-primary">عرض واسع ⤢</button>
        </div>
        <div className="bg-card px-4 pb-3 text-xs text-muted-foreground">
          المجموع التراكمي: <b className="tabular-nums">{lifetimeTotal}</b>
          {stage.next ? ` · المرحلة التالية عند ${stage.next}` : " · بلغتِ أوسع مرحلة، وتستمر في الاتساع"}
        </div>
      </div>

      <Card className="text-sm">
        {user ? (
          <span>☁️ جنتك ومساراتك ومقاماتك محفوظة في حسابك وتُزامَن تلقائياً.</span>
        ) : (
          <span>
            🔒 محفوظة على هذا الجهاز فقط.{" "}
            <Link to="/auth" search={{ redirect: "/jannah" }} className="font-semibold text-primary">سجّل الدخول</Link>{" "}
            لحفظها في حسابك.
          </span>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTrack(t.id)}
            className={`rounded-2xl border p-3 text-center ${track === t.id ? "border-primary bg-primary/10" : "border-border bg-card"}`}
          >
            <p className="text-xl">{t.emoji}</p>
            <p className="text-xs font-semibold">{t.name}</p>
            <p className="text-lg font-bold tabular-nums">{totals[t.id]}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {trackGroups.map((g) => (
          <Card key={g.id} className="space-y-2">
            <p className="font-bold">{g.emoji} {g.name}</p>
            <div className="grid gap-2">
              {g.items.slice(0, 8).map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-2 border-t border-border pt-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{i.title}</p>
                    <p className="text-xs text-muted-foreground">اليوم {today[i.id] ?? 0} · تراكمي {lifetimeById[i.id] ?? 0}</p>
                  </div>
                  <Btn onClick={() => add(i.id)}>سجّل</Btn>
                </div>
              ))}
            </div>
          </Card>
        ))}
        <Link to="/maqamat" className="block text-center text-sm font-semibold text-primary">فهرس المقامات كاملاً ←</Link>
      </div>

      <Note>المشهد والأرقام وسيلة تذكير وتحفيز فقط، ولا تعني قبولاً ولا أجراً محدداً.</Note>

      {wide ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-foreground/70 p-2">
          <button onClick={() => setWide(false)} className="mb-2 self-start rounded-2xl bg-card px-4 py-2 text-sm font-semibold">إغلاق ✕</button>
          <div className="flex-1 overflow-hidden rounded-3xl bg-card">
            <ParadiseScene lifetime={lifetimeTotal} tall />
          </div>
        </div>
      ) : null}
    </div>
  );
}
