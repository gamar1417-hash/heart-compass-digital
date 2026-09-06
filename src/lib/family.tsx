import { useEffect, useRef } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/cloud";
import { useDayLog } from "@/lib/store";
import { groups } from "@/data/content";
import { paradiseStage } from "@/components/paradise";

/** مسارات الحياة المشتركة بين التقويم والعائلة. */
export const TRACKS = [
  { id: "nafs", name: "مجاهدة النفس والذنب", emoji: "💧", groups: ["nafs", "khuluq"] },
  { id: "tawba", name: "التوبة وردّ الحقوق", emoji: "🔒", groups: ["tawba"] },
  {
    id: "sunan",
    name: "السنن والعبادات",
    emoji: "🌿",
    groups: ["salah", "dhikr", "quran", "tawhid"],
  },
] as const;

export type TrackId = (typeof TRACKS)[number]["id"];

function idsOfTrack(trackId: TrackId): string[] {
  const t = TRACKS.find((x) => x.id === trackId);
  if (!t) return [];
  return groups
    .filter((g) => (t.groups as readonly string[]).includes(g.id))
    .flatMap((g) => g.items.map((i) => i.id));
}

/** مجاميع كل مسار من الأعمال التراكمية. */
export function trackTotals(lifetimeById: Record<string, number>) {
  const out = {} as Record<TrackId, number>;
  for (const t of TRACKS) {
    out[t.id] = idsOfTrack(t.id).reduce((a, id) => a + (lifetimeById[id] ?? 0), 0);
  }
  return out;
}

/**
 * يرفع تقدّم المستخدم إلى عائلته من أي صفحة في التطبيق،
 * فترتقي جنة العائلة ومساراتها تلقائياً مع تسجيل كل فرد.
 */
export function FamilySync() {
  const { user } = useSession();
  const { today, lifetimeTotal, lifetimeById } = useDayLog();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const last = useRef<string>("");

  const todayTotal = Object.values(today).reduce((a, b) => a + b, 0);
  const tracks = trackTotals(lifetimeById);

  useEffect(() => {
    if (!user) return;
    const payloadKey = `${lifetimeTotal}|${todayTotal}|${tracks.nafs}|${tracks.tawba}|${tracks.sunan}`;
    if (last.current === payloadKey) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void (async () => {
        const { data: mem } = await supabase
          .from("family_members")
          .select("family_id, display_name")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!mem) return;
        last.current = payloadKey;
        await supabase.from("family_progress").upsert(
          {
            family_id: mem.family_id,
            user_id: user.id,
            display_name:
              mem.display_name || user.email?.split("@")[0] || "فرد من العائلة",
            lifetime_total: lifetimeTotal,
            today_total: todayTotal,
            stage: paradiseStage(lifetimeTotal).index ?? 0,
            track_nafs: tracks.nafs,
            track_tawba: tracks.tawba,
            track_sunan: tracks.sunan,
          },
          { onConflict: "family_id,user_id" },
        );
        window.dispatchEvent(new CustomEvent("hasibu:family-sync"));
      })();
    }, 1500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [user, lifetimeTotal, todayTotal, tracks.nafs, tracks.tawba, tracks.sunan]);

  return null;
}
