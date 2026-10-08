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

  const currentLog = logsState[activeKey] || { points: 0, items: [] };

  let lifetimeTotal = 0;
  const lifetimeById: Record<string, number> = {};
  Object.values(logsState).forEach((day: any) => {
    if (day && typeof day.points === 'number') {
      lifetimeTotal += day.points;
    }
    if (day && day.items && Array.isArray(day.items)) {
      day.items.forEach((item: any) => {
        const id = item.id || item.name;
        if (id) {
          lifetimeById[id] = (lifetimeById[id] || 0) + (item.count || item.points || 1);
        }
      });
    }
  });

  const add = (itemOrPoints: any) => {
    setLogsState((prev) => {
      const dayData = prev[activeKey] || { points: 0, items: [] };
      const newPoints = (dayData.points || 0) + (typeof itemOrPoints === 'number' ? itemOrPoints : (itemOrPoints?.points || 1));
      const newItems = [...(dayData.items || []), itemOrPoints];
      return {
        ...prev,
        [activeKey]: { ...dayData, points: newPoints, items: newItems }
      };
    });
  };

  const remove = (itemId: string) => {
    setLogsState((prev) => {
      const dayData = prev[activeKey];
      if (!dayData || !dayData.items) return prev;
      const newItems = dayData.items.filter((i: any) => i.id !== itemId && i.name !== itemId);
      return {
        ...prev,
        [activeKey]: { ...dayData, items: newItems }
      };
    });
  };

  const refresh = () => {
    setLogsState({ ...logsState });
  };

  return {
    today: currentLog,
    log: currentLog,
    logs: logsState,
    total: currentLog.points || 0,
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
