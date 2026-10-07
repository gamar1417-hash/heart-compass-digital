 
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

function write<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(val));
    window.dispatchEvent(new Event(LOCAL_WRITE_EVENT));
  } catch {}
}

export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type DayLog = Record<string, number>;

export function useDayLog(dateKey?: string) {
  const key = dateKey ?? todayKey();
  const [log, setLog] = useState<DayLog>(() => read<DayLog>(key, {}));
  const [lifetimeTotal, setLifetimeTotal] = useState<number>(() => read<number>("lifetime_total", 0));

  const refresh = useCallback(() => {
    setLog(read<DayLog>(key, {}));
    setLifetimeTotal(read<number>("lifetime_total", 0));
  }, [key]);

  useEffect(() => {
    refresh();
    const handleLocal = () => refresh();
    window.addEventListener(LOCAL_WRITE_EVENT, handleLocal);
    window.addEventListener(REFRESH_EVENT, handleLocal);
    return () => {
      window.removeEventListener(LOCAL_WRITE_EVENT, handleLocal);
      window.removeEventListener(REFRESH_EVENT, handleLocal);
    };
  }, [refresh]);

  const add = (itemId: string, delta = 1) => {
    const currentLog = read<DayLog>(key, {});
    const currentCount = currentLog[itemId] ?? 0;
    const nextCount = Math.max(0, currentCount + delta);
    const updatedLog = { ...currentLog, [itemId]: nextCount };
    
    write(key, updatedLog);

    if (delta > 0) {
      const currentLifetime = read<number>("lifetime_total", 0);
      write("lifetime_total", currentLifetime + delta);
    }
    
    refresh();
  };

  const remove = (itemId: string, delta = 1) => {
    const currentLog = read<DayLog>(key, {});
    const currentCount = currentLog[itemId] ?? 0;
    if (currentCount <= 0) return;

    const actualDelta = Math.min(currentCount, delta);
    const updatedLog = { ...currentLog, [itemId]: currentCount - actualDelta };
    
    write(key, updatedLog);
    
    const currentLifetime = read<number>("lifetime_total", 0);
    write("lifetime_total", Math.max(0, currentLifetime - actualDelta));
    
    refresh();
  };

  return { log, lifetimeTotal, add, remove, refresh };
}
