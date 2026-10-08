 import { useState, useEffect } from 'react';

export const LOCAL_WRITE_EVENT = 'heart_compass_local_write';

export function snapshotAll() {
  try {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('heart_compass')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return data;
  } catch {
    return {};
  }
}

export function restoreAll(snapshot: Record<string, any>) {
  try {
    if (!snapshot || typeof snapshot !== 'object') return;
    Object.entries(snapshot).forEach(([key, value]) => {
      if (key.startsWith('heart_compass')) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    });
    window.dispatchEvent(new Event(LOCAL_WRITE_EVENT));
  } catch (e) {
    console.error(e);
  }
}

export function mergeState(remoteData: Record<string, any>) {
  try {
    if (!remoteData || typeof remoteData !== 'object') return;
    Object.entries(remoteData).forEach(([key, value]) => {
      if (key.startsWith('heart_compass')) {
        const localVal = localStorage.getItem(key);
        if (!localVal) {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      }
    });
    window.dispatchEvent(new Event(LOCAL_WRITE_EVENT));
  } catch (e) {
    console.error(e);
  }
}

export function useDayLog(dateKey?: string) {
  const todayKey = new Date().toISOString().split('T')[0];
  const activeKey = dateKey || todayKey;

  const [logsState, setLogsState] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('heart_compass_logs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('heart_compass_logs', JSON.stringify(logsState));
    } catch (e) {
      console.error(e);
    }
  }, [logsState]);

  const rawCurrentLog = logsState?.[activeKey];
  const currentLog = {
    points: rawCurrentLog?.points || 0,
    items: Array.isArray(rawCurrentLog?.items) ? rawCurrentLog.items : []
  };

  let lifetimeTotal = 0;
  const lifetimeById: Record<string, number> = {};
  
  if (logsState && typeof logsState === 'object') {
    Object.values(logsState).forEach((day: any) => {
      if (day && typeof day.points === 'number') {
        lifetimeTotal += day.points;
      }
      if (day && day.items && Array.isArray(day.items)) {
        day.items.forEach((item: any) => {
          const id = item?.id || item?.name;
          if (id) {
            lifetimeById[id] = (lifetimeById[id] || 0) + (item.count || item.points || 1);
          }
        });
      }
    });
  }

  const add = (itemOrPoints: any) => {
    setLogsState((prev) => {
      const safePrev = prev && typeof prev === 'object' ? prev : {};
      const dayData = safePrev[activeKey] || { points: 0, items: [] };
      const safeItems = Array.isArray(dayData.items) ? dayData.items : [];
      const addVal = typeof itemOrPoints === 'number' ? itemOrPoints : (itemOrPoints?.points || 1);
      
      return {
        ...safePrev,
        [activeKey]: {
          ...dayData,
          points: (dayData.points || 0) + addVal,
          items: [...safeItems, itemOrPoints]
        }
      };
    });
  };

  const remove = (itemId: string) => {
    setLogsState((prev) => {
      const safePrev = prev && typeof prev === 'object' ? prev : {};
      const dayData = safePrev[activeKey];
      if (!dayData || !Array.isArray(dayData.items)) return safePrev;
      const newItems = dayData.items.filter((i: any) => i?.id !== itemId && i?.name !== itemId);
      return {
        ...safePrev,
        [activeKey]: { ...dayData, items: newItems }
      };
    });
  };

  const refresh = () => {
    setLogsState({ ...(logsState || {}) });
  };

  return {
    today: currentLog || { points: 0, items: [] },
    log: currentLog || { points: 0, items: [] },
    logs: (logsState && typeof logsState === 'object') ? logsState : {},
    total: currentLog?.points || 0,
    lifetimeTotal: lifetimeTotal || 0,
    lifetimeById: (lifetimeById && typeof lifetimeById === 'object') ? lifetimeById : {},
    add,
    remove,
    refresh
  };
}

export function useLocalState<T>(key: string, fallback: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(`heart_compass_${key}`);
      return item !== null ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`heart_compass_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  }, [key, value]);

  return [value, setValue];
}
