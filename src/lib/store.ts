 import { useState, useEffect } from 'react';

export interface DayLog {
  id: string;
  date: string;
  deedId: string;
  points: number;
}

// تخزين محلي بسيط وبدون أخطاء خارجية
export function useStore() {
  const [totalPoints, setTotalPoints] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('meezan_total_points');
    return saved ? Number(saved) : 0;
  });

  const [logs, setLogs] = useState<DayLog[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('meezan_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('meezan_total_points', totalPoints.toString());
    localStorage.setItem('meezan_logs', JSON.stringify(logs));
  }, [totalPoints, logs]);

  const addPoint = (points: number, deedId = 'default') => {
    const newLog: DayLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      deedId,
      points,
    };
    setTotalPoints((prev) => prev + points);
    setLogs((prev) => [...prev, newLog]);
  };

  const removePoint = (points: number, deedId = 'default') => {
    setTotalPoints((prev) => Math.max(0, prev - points));
    setLogs((prev) => prev.filter((l) => l.deedId !== deedId));
  };

  const useDayLog = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = logs.filter((l) => l.date === todayStr);
    const lifetimeById: Record<string, number> = {};
    logs.forEach((l) => {
      lifetimeById[l.deedId] = (lifetimeById[l.deedId] || 0) + l.points;
    });

    return {
      log: logs,
      today,
      lifetimeTotal: totalPoints,
      lifetimeById,
      add: (deedId: string, points: number) => addPoint(points, deedId),
      remove: (deedId: string, points: number) => removePoint(points, deedId),
      refresh: () => {},
    };
  };

  return { totalPoints, logs, addPoint, removePoint, useDayLog };
}

export function useDayLog() {
  const store = useStore();
  return store.useDayLog();
}

export function useLocalState<T>(key: string, fallback: T) {
  const [val, setVal] = useState<T>(() => {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(val));
    }
  }, [key, val]);

  return [val, setVal] as const;
}

export const LOCAL_WRITE_EVENT = "meezan:refresh";
export const mergeState = (_state: any) => {};
export const restoreAll = (_data: any) => {};
export const snapshotAll = () => ({});
