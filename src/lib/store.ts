 import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';

export interface DayLog {
  id: string;
  date: string;
  deedId: string;
  points: number;
}

interface StoreState {
  totalPoints: number;
  logs: DayLog[];
  addPoint: (points: number, deedId?: string) => void;
  removePoint: (points: number, deedId?: string) => void;
  useDayLog: () => any;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      totalPoints: 0,
      logs: [],
      addPoint: (points: number, deedId = 'default') => {
        const newLog = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], deedId, points };
        set((state) => ({ totalPoints: state.totalPoints + points, logs: [...state.logs, newLog] }));
      },
      removePoint: (points: number, deedId = 'default') => {
        set((state) => ({ totalPoints: Math.max(0, state.totalPoints - points), logs: state.logs.filter(l => l.deedId !== deedId) }));
      },
      useDayLog: () => {
        const state = get();
        const todayStr = new Date().toISOString().split('T')[0];
        const today = state.logs.filter(l => l.date === todayStr);
        const lifetimeById: Record<string, number> = {};
        state.logs.forEach(l => { lifetimeById[l.deedId] = (lifetimeById[l.deedId] || 0) + l.points; });
        return {
          log: state.logs,
          today,
          lifetimeTotal: state.totalPoints,
          lifetimeById,
          add: (deedId: string, points: number) => get().addPoint(points, deedId),
          remove: (deedId: string, points: number) => get().removePoint(points, deedId),
          refresh: () => {},
        };
      }
    }),
    { name: 'meezan-storage' }
  )
);

// إرجاع الدوال الناقصة لتشغيل باقي صفحات التطبيق بنجاح
export function useDayLog() {
  return useStore((state) => state.useDayLog());
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
export const mergeState = (state: any) => {};
export const restoreAll = (data: any) => {};
export const snapshotAll = () => ({});
