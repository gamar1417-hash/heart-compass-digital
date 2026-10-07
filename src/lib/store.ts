 import { useState, useEffect } from 'react';

export interface DayLog {
  id: string;
  date: string;
  deedId: string;
  points: number;
}

export function useStore() {
  const [totalPoints, setTotalPoints] = useState<number>(() => {
    if (typeof window === 'undefined') return 150;
    const saved = localStorage.getItem('meezan_total_points');
    return saved ? Number(saved) : 150;
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

  const addPoint = (points: number = 1, deedId = 'default') => {
    const pts = Number(points) || 1;
    const newTotal = totalPoints + pts;
    setTotalPoints(newTotal);
    const newLog: DayLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      deedId,
      points: pts
    };
    setLogs(prev => [...prev, newLog]);
  };

  const removePoint = (points: number = 1, deedId = 'default') => {
    const pts = Number(points) || 1;
    setTotalPoints(prev => Math.max(0, prev - pts));
    setLogs(prev => prev.filter(l => l.deedId !== deedId));
  };

  return {
    totalPoints,
    logs,
    addPoint,
    removePoint
  };
}

export function useDayLog() {
  const store = useStore();
  const todayStr = new Date().toISOString().split('T')[0];
  const today = store.logs.filter(l => l.date === todayStr);
  
  const lifetimeById: Record<string, number> = {};
  store.logs.forEach(l => {
    lifetimeById[l.deedId] = (lifetimeById[l.deedId] || 0) + (Number(l.points) || 0);
  });

  return {
    log: store.logs,
    today,
    lifetimeTotal: store.totalPoints,
    lifetimeById,
    add: (deedId: string, points: number) => store.addPoint(points, deedId),
    remove: (deedId: string, points: number) => store.removePoint(points, deedId),
    refresh: () => {},
  };
}

export function useLocalState<T>(_key: string, _fallback: T) {
  const store = useStore();
  return [store.totalPoints, store.addPoint] as const;
}

export const LOCAL_WRITE_EVENT = "meezan:refresh";
export const mergeState = (_state: any) => {};
export const restoreAll = (_data: any) => {};
export const snapshotAll = () => ({});
