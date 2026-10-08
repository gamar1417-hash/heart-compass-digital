 import { useState, useEffect } from 'react';

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
    today: currentLog,
    log: currentLog,
    logs: logsState && typeof logsState === 'object' ? logsState : {},
    total: currentLog.points,
    lifetimeTotal,
    lifetimeById,
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
