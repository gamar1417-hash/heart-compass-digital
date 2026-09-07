import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/cloud";
import { paradiseStage } from "@/components/paradise";

const KEY = "hasibu:family-watch";

type Saved = { total: number; stage: number };

function read(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function write(v: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* تجاهل */
  }
}

function push(title: string, body: string) {
  toast(title, { description: body, duration: 8000 });
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch {
    /* تجاهل */
  }
}

/** يراقب تراكم جنة العائلة ويُنبّه عند ترقّيها أو بلوغ مرحلة جديدة. */
export function FamilyNotify() {
  const { user } = useSession();
  const started = useRef(false);

  const check = useCallback(async () => {
    if (!user) return;
    const { data: mem } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!mem) return;
    const { data: rows } = await supabase
      .from("family_progress")
      .select("lifetime_total")
      .eq("family_id", (mem as { family_id: string }).family_id);
    const total = ((rows as { lifetime_total: number }[]) ?? []).reduce(
      (a, r) => a + (r.lifetime_total ?? 0),
      0,
    );
    const stage = paradiseStage(total).index ?? 0;
    const prev = read();
    write({ total, stage });
    if (!prev) return;
    if (stage > prev.stage) {
      push(
        "🌴 جنة العائلة بلغت مرحلة جديدة",
        `${paradiseStage(total).label} — تراكم العائلة الآن ${total}. تعاونوا على البر.`,
      );
    } else if (total > prev.total) {
      push("🌱 ترقّت جنة العائلة", `أضاف أحد أفراد العائلة ${total - prev.total} عملاً جديداً.`);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!started.current) {
      started.current = true;
      void check();
    }
    const onSync = () => void check();
    window.addEventListener("hasibu:family-sync", onSync);
    const iv = setInterval(onSync, 45000);
    return () => {
      window.removeEventListener("hasibu:family-sync", onSync);
      clearInterval(iv);
    };
  }, [user, check]);

  return null;
}

/** طلب إذن إشعارات المتصفح (يُستدعى من زر داخل صفحة العائلة). */
export async function enableFamilyNotifications(): Promise<
  "granted" | "denied" | "unsupported" | "open-in-new-tab"
> {
  if (typeof Notification === "undefined") return "unsupported";
  if (window.top !== window.self) return "open-in-new-tab";
  if (Notification.permission === "granted") return "granted";
  const p = await Notification.requestPermission();
  return p === "granted" ? "granted" : "denied";
}
