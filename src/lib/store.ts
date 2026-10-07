 import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  useDayLog: () => {
    log: DayLog[];
    today: DayLog[];
    lifetimeTotal: number;
    lifetimeById: Record<string, number>;
    add: (deedId: string, points: number) => void;
    remove: (deedId: string, points: number) => void;
    refresh: () => void;
  };
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
          add: (deedId, points) => get().addPoint(points, deedId),
          remove: (deedId, points) => get().removePoint(points, deedId),
          refresh: () => {},
        };
      }
    }),
    { name: 'meezan-storage' }
  )
);
