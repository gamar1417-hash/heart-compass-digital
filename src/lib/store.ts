import { useCallback, useEffect, useState } from "react";

const PREFIX = "hasibu:";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Hydration-safe persisted state (localStorage). */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, initial));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
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
