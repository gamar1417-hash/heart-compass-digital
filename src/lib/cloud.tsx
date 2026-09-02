import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { LOCAL_WRITE_EVENT, mergeState, restoreAll, snapshotAll } from "@/lib/store";

/** الجلسة الحالية للمستخدم (متاحة في المتصفح فقط). */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (alive) setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setReady(true);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, ready, user: session?.user ?? null };
}

/** يزامن كل إنجازات المستخدم (الجنة، الأعمال، المقامات، المفضلة) مع حسابه. */
export function CloudSync() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const pulled = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // سحب البيانات من الحساب ودمجها مع الجهاز
  useEffect(() => {
    if (!userId || pulled.current === userId) return;
    pulled.current = userId;
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("user_state")
        .select("data")
        .eq("user_id", userId)
        .maybeSingle();
      if (!alive) return;
      const remote = (data?.data ?? {}) as Record<string, unknown>;
      const merged = mergeState(snapshotAll(), remote);
      restoreAll(merged);
      await supabase
        .from("user_state")
        .upsert({ user_id: userId, data: merged as never }, { onConflict: "user_id" });
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  // رفع أي تغيير محلي بعد لحظات من التوقف عن الاستخدام
  useEffect(() => {
    if (!userId) return;
    const onWrite = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void supabase
          .from("user_state")
          .upsert({ user_id: userId, data: snapshotAll() as never }, { onConflict: "user_id" });
      }, 1200);
    };
    window.addEventListener(LOCAL_WRITE_EVENT, onWrite);
    return () => {
      window.removeEventListener(LOCAL_WRITE_EVENT, onWrite);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [userId]);

  return null;
}
