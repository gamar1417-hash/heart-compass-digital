import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/cloud";
import { useDayLog } from "@/lib/store";
import { TRACKS, trackTotals } from "@/lib/family";
import { enableFamilyNotifications } from "@/lib/family-notify";
import { paradiseCounts, paradiseStage, ParadiseScene } from "@/components/paradise";

export const Route = createFileRoute("/family")({
  head: () => ({
    meta: [
      { title: "العائلة — جنة العائلة ومساراتها" },
      {
        name: "description",
        content:
          "اربط حسابات أسرتك في مساحة واحدة: جنة العائلة تنمو بتراكم أعمال كل فرد، بلطف وبلا منافسة مؤذية.",
      },
      { property: "og:title", content: "قسم العائلة" },
      { property: "og:description", content: "جنة واحدة للعائلة تنمو بأعمال كل فرد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FamilyPage,
});

type Family = { id: string; name: string; join_code: string; owner_id: string };
type Progress = {
  user_id: string;
  display_name: string;
  lifetime_total: number;
  today_total: number;
  stage: number;
  track_nafs: number;
  track_tawba: number;
  track_sunan: number;
};

const db = supabase as unknown as {
  from: (t: string) => any;
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
};

function FamilyPage() {
  const { user, ready } = useSession();
  const { today, lifetimeTotal, lifetimeById } = useDayLog();
  const [family, setFamily] = useState<Family | null>(null);
  const [rows, setRows] = useState<Progress[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [myName, setMyName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const todayTotal = Object.values(today).reduce((a, b) => a + b, 0);
  const myTracks = useMemo(() => trackTotals(lifetimeById), [lifetimeById]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: mem } = await db
      .from("family_members")
      .select("family_id, display_name")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!mem) {
      setFamily(null);
      setRows([]);
      return;
    }
    setMyName((mem as { display_name: string }).display_name ?? "");
    const { data: fam } = await db
      .from("families")
      .select("id, name, join_code, owner_id")
      .eq("id", (mem as { family_id: string }).family_id)
      .maybeSingle();
    setFamily((fam as Family) ?? null);
    const { data: prog } = await db
      .from("family_progress")
      .select(
        "user_id, display_name, lifetime_total, today_total, stage, track_nafs, track_tawba, track_sunan",
      )
      .eq("family_id", (mem as { family_id: string }).family_id);
    setRows(((prog as Progress[]) ?? []).sort((a, b) => b.lifetime_total - a.lifetime_total));
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  // رفع تقدّمي إلى العائلة كلما تغيّر (يعمل من أي صفحة عبر FamilySync)
  useEffect(() => {
    if (!user || !family) return;
    const t = setTimeout(() => {
      void db
        .from("family_progress")
        .upsert(
          {
            family_id: family.id,
            user_id: user.id,
            display_name: myName || user.email?.split("@")[0] || "فرد من العائلة",
            lifetime_total: lifetimeTotal,
            today_total: todayTotal,
            stage: paradiseStage(lifetimeTotal).index ?? 0,
            track_nafs: myTracks.nafs,
            track_tawba: myTracks.tawba,
            track_sunan: myTracks.sunan,
          },
          { onConflict: "family_id,user_id" },
        )
        .then(() => load());
    }, 1200);
    return () => clearTimeout(t);
  }, [user, family, lifetimeTotal, todayTotal, myName, myTracks, load]);

  // تحديث لوحة العائلة عند رفع تقدّم أي فرد أو كل نصف دقيقة
  useEffect(() => {
    if (!user) return;
    const onSync = () => void load();
    window.addEventListener("hasibu:family-sync", onSync);
    const iv = setInterval(onSync, 30000);
    return () => {
      window.removeEventListener("hasibu:family-sync", onSync);
      clearInterval(iv);
    };
  }, [user, load]);

  async function createFamily() {
    if (!user || !name.trim()) return;
    setBusy(true);
    setMsg("");
    const { data, error } = await db
      .from("families")
      .insert({ name: name.trim(), owner_id: user.id })
      .select("id, name, join_code, owner_id")
      .maybeSingle();
    if (error || !data) {
      setMsg("تعذّر إنشاء العائلة، حاول مرة أخرى.");
    } else {
      await db.from("family_members").insert({
        family_id: (data as Family).id,
        user_id: user.id,
        display_name: myName || user.email?.split("@")[0] || "فرد من العائلة",
        role: "owner",
      });
      await load();
    }
    setBusy(false);
  }

  async function joinFamily() {
    if (!code.trim()) return;
    setBusy(true);
    setMsg("");
    const { error } = await db.rpc("join_family_by_code", {
      _code: code.trim(),
      _display_name: myName || user?.email?.split("@")[0] || "فرد من العائلة",
    });
    if (error) setMsg("الكود غير صحيح أو انتهت صلاحيته.");
    else await load();
    setBusy(false);
  }

  async function leave() {
    if (!user) return;
    setBusy(true);
    await db.from("family_progress").delete().eq("user_id", user.id);
    await db.from("family_members").delete().eq("user_id", user.id);
    setFamily(null);
    setRows([]);
    setBusy(false);
  }

  if (!ready) return <p className="p-6 text-center text-sm text-muted-foreground">لحظة…</p>;

  if (!user) {
    return (
      <div className="space-y-4">
        <PageTitle emoji="🏡" title="العائلة" sub="جنة واحدة تنمو بأعمال كل فرد." />
        <Card className="space-y-2 text-center">
          <p className="text-sm">لربط حسابات أسرتك، سجّل الدخول أولاً.</p>
          <Link to="/auth" className="inline-block text-sm text-primary underline">
            الذهاب إلى حسابي
          </Link>
        </Card>
      </div>
    );
  }

  const familyLifetime = rows.reduce((a, r) => a + r.lifetime_total, 0);
  const familyToday = rows.reduce((a, r) => a + r.today_total, 0);
  const counts = paradiseCounts(familyLifetime);
  const stage = paradiseStage(familyLifetime);

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="🏡"
        title="العائلة"
        sub="تعاون على البر، لا مسابقة ولا مقارنة مؤذية."
      />

      {!family ? (
        <>
          <Card className="space-y-2">
            <h2 className="font-bold">أنشئ عائلة جديدة</h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم العائلة (مثال: بيت الرحمة)"
              className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
            />
            <Btn onClick={createFamily} disabled={busy || !name.trim()}>
              إنشاء
            </Btn>
          </Card>

          <Card className="space-y-2">
            <h2 className="font-bold">أو انضم بكود العائلة</h2>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثال: A1B2C3"
              className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm tracking-widest"
            />
            <Btn onClick={joinFamily} disabled={busy || !code.trim()}>
              انضمام
            </Btn>
          </Card>
          {msg ? <Note>{msg}</Note> : null}
        </>
      ) : (
        <>
          <Card className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">{family.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  كود الدعوة:{" "}
                  <span className="font-display tracking-widest text-primary">
                    {family.join_code}
                  </span>
                </p>
              </div>
              <Btn variant="ghost" onClick={leave} disabled={busy}>
                مغادرة
              </Btn>
            </div>
            <div className="flex gap-2">
              <input
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                placeholder="اسمي في العائلة"
                className="flex-1 rounded-2xl border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </Card>

          <Card className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">جنة العائلة</h2>
              <span className="text-[11px] text-muted-foreground">{stage.label}</span>
            </div>
            <ParadiseScene lifetime={familyLifetime} />
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-2xl bg-muted/50 p-2">
                🌴 {counts.palms}
              </div>
              <div className="rounded-2xl bg-muted/50 p-2">🏰 {counts.palaces}</div>
              <div className="rounded-2xl bg-muted/50 p-2">💎 {counts.jewels}</div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              تراكم العائلة: {familyLifetime} · اليوم: {familyToday}
            </p>
            <Btn
              variant="ghost"
              onClick={async () => {
                const r = await enableFamilyNotifications();
                setMsg(
                  r === "granted"
                    ? "تم تفعيل الإشعارات، سنخبرك عند ترقّي جنة العائلة."
                    : r === "open-in-new-tab"
                      ? "افتح التطبيق في نافذة مستقلة لتفعيل إشعارات المتصفح."
                      : r === "unsupported"
                        ? "متصفحك لا يدعم الإشعارات، لكن ستظهر التنبيهات داخل التطبيق."
                        : "الإشعارات مرفوضة من إعدادات المتصفح.",
                );
              }}
            >
              🔔 تفعيل إشعارات ترقّي الجنة
            </Btn>
            {msg ? <Note>{msg}</Note> : null}
          </Card>

          <Card className="space-y-2">
            <h2 className="font-bold">مسارات العائلة</h2>
            {TRACKS.map((t) => {
              const total = rows.reduce(
                (a, r) =>
                  a +
                  (t.id === "nafs"
                    ? r.track_nafs
                    : t.id === "tawba"
                      ? r.track_tawba
                      : r.track_sunan),
                0,
              );
              const pct = Math.min(100, Math.round((total / Math.max(1, familyLifetime)) * 100));
              return (
                <div key={t.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {t.emoji} {t.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{total}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <Link to="/calendar" className="text-xs text-primary underline">
              تفاصيل مساراتي في التقويم
            </Link>
          </Card>

          <Card className="space-y-2">
            <h2 className="font-bold">أفراد العائلة</h2>
            {rows.length ? (
              rows.map((r) => (
                <div
                  key={r.user_id}
                  className="flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-2 text-sm"
                >
                  <span>
                    {r.user_id === user.id ? "🫱 " : "🤍 "}
                    {r.display_name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    اليوم {r.today_total} · تراكمي{" "}
                    <span className="text-primary">{r.lifetime_total}</span>
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">لم يسجّل أحد بعد.</p>
            )}
            <Link to="/calendar" className="text-xs text-primary underline">
              تابع مسارات كل فرد في تقويم المسارات
            </Link>
          </Card>
        </>
      )}

      <Note>
        لا تظهر لأفراد العائلة تفاصيل أعمالك أو خواطرك الخاصة، بل مجاميع تحفيزية فقط. والأجر عند الله
        وحده، والمقصود التعاون على البر لا المفاخرة.
      </Note>
    </div>
  );
}
