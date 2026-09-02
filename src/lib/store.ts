import { useCallback, useEffect, useState } from "react";

const PREFIX = "hasibu:";
export const REFRESH_EVENT = "hasibu:refresh";
export const LOCAL_WRITE_EVENT = "hasibu:localwrite";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** كل بيانات المستخدم المحفوظة محلياً (للمزامنة السحابية). */
export function snapshotAll(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (typeof window === "undefined") return out;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k || !k.startsWith(PREFIX)) continue;
      const raw = window.localStorage.getItem(k);
      if (raw == null) continue;
      try {
        out[k.slice(PREFIX.length)] = JSON.parse(raw);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
  return out;
}

/** كتابة البيانات القادمة من السحابة ثم تنبيه الواجهة لإعادة القراءة. */
export function restoreAll(data: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  for (const [k, v] of Object.entries(data)) {
    try {
      window.localStorage.setItem(PREFIX + k, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new Event(REFRESH_EVENT));
}

/** دمج سجلات الأيام: نأخذ الأكبر لكل عمل في كل يوم حتى لا يضيع شيء. */
export function mergeState(
  local: Record<string, unknown>,
  remote: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...remote, ...local };

  const lLogs = (local["daylogs"] ?? {}) as Record<string, Record<string, number>>;
  const rLogs = (remote["daylogs"] ?? {}) as Record<string, Record<string, number>>;
  const days = new Set([...Object.keys(lLogs), ...Object.keys(rLogs)]);
  const logs: Record<string, Record<string, number>> = {};
  for (const d of days) {
    const a = lLogs[d] ?? {};
    const b = rLogs[d] ?? {};
    const ids = new Set([...Object.keys(a), ...Object.keys(b)]);
    const day: Record<string, number> = {};
    for (const id of ids) day[id] = Math.max(a[id] ?? 0, b[id] ?? 0);
    logs[d] = day;
  }
  if (days.size) merged["daylogs"] = logs;

  for (const key of Object.keys(merged)) {
    const l = local[key];
    const r = remote[key];
    if (key === "daylogs") continue;
    if (Array.isArray(l) && Array.isArray(r)) {
      const seen = new Set<string>();
      const out: unknown[] = [];
      for (const item of [...r, ...l]) {
        const sig = JSON.stringify(item);
        if (seen.has(sig)) continue;
        seen.add(sig);
        out.push(item);
      }
      merged[key] = out;
    }
  }
  return merged;
}

/** Hydration-safe persisted state (localStorage + مزامنة سحابية عند تسجيل الدخول). */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, initial));
    setReady(true);
    const onRefresh = () => setValue(read<T>(key, initial));
    window.addEventListener(REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(REFRESH_EVENT, onRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
      window.dispatchEvent(new Event(LOCAL_WRITE_EVENT));
    } catch {
      /* storage may be unavailable */
    }
  }, [key, value, ready]);

  return [value, setValue, ready] as const;
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export type DayLog = Record<string, number>;

export function useDayLog() {
  const [logs, setLogs] = useLocalState<Record<string, DayLog>>("daylogs", {});
  const day = todayKey();
  const today = logs[day] ?? {};

  const add = useCallback(
    (id: string, delta = 1) => {
      setLogs((prev) => {
        const d = { ...(prev[day] ?? {}) };
        d[id] = Math.max(0, (d[id] ?? 0) + delta);
        return { ...prev, [day]: d };
      });
    },
    [day, setLogs],
  );

  const total = Object.values(today).reduce((a, b) => a + b, 0);
  const streak = (() => {
    let n = 0;
    for (let i = 0; i < 400; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      const sum = Object.values(logs[k] ?? {}).reduce((a, b) => a + b, 0);
      if (sum > 0) n++;
      else if (i > 0) break;
    }
    return n;
  })();

  // مجاميع تراكمية لا تنتهي بنهاية اليوم
  const lifetimeById: Record<string, number> = {};
  for (const d of Object.values(logs)) {
    for (const [k, v] of Object.entries(d)) lifetimeById[k] = (lifetimeById[k] ?? 0) + v;
  }
  const lifetimeTotal = Object.values(lifetimeById).reduce((a, b) => a + b, 0);

  return { today, add, total, streak, logs, lifetimeById, lifetimeTotal };
}
