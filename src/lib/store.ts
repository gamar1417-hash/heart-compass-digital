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
  useDayLog: () => any;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      totalPoints: 0,
      logs: [],
      addPoint: (points: number, deedId = 'default') => {
        const newLog = { 
          id: Date.now().toString(), 
          date: new Date().toISOString().split('T')[0], 
          deedId, 
          points: Number(points) || 1 
        };
        set((state) => ({ 
          totalPoints: (state.totalPoints || 0) + (Number(points) || 1), 
          logs: [...state.logs, newLog] 
        }));
      },
      removePoint: (points: number, deedId = 'default') => {
        set((state) => ({ 
          totalPoints: Math.max(0, (state.totalPoints || 0) - (Number(points) || 1)), 
          logs: state.logs.filter(l => l.deedId !== deedId) 
        }));
      },
      useDayLog: () => {
        const state = get();
        const todayStr = new Date().toISOString().split('T')[0];
        const today = state.logs.filter(l => l.date === todayStr);
        const lifetimeById: Record<string, number> = {};
        state.logs.forEach(l => { 
          lifetimeById[l.deedId] = (lifetimeById[l.deedId] || 0) + (Number(l.points) || 0); 
        });
        return {
          log: state.logs,
          today,
          lifetimeTotal: Number(state.totalPoints) || 0,
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

export function useDayLog() {
  return useStore((state) => state.useDayLog());
}

export function useLocalState<T>(key: string, fallback: T) {
  const store = useStore();
  return [store.totalPoints, store.addPoint] as const;
}

export const LOCAL_WRITE_EVENT = "meezan:refresh";
export const mergeState = (_state: any) => {};
export const restoreAll = (_data: any) => {};
export const snapshotAll = () => ({});
