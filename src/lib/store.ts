import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const LOCAL_WRITE_EVENT = "heart_compass_local_write";

const PREFIX = "heart_compass";
const LOGS_KEY = "heart_compass_logs";

/** خريطة «عمل → عدد» ليومٍ واحد. */
export type DayCounts = Record<string, number>;
/** سجل الأيام: مفتاح التاريخ ← خريطته. */
export type DayLogs = Record<string, DayCounts>;

function safeParse(raw: string | null): unknown {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * يحوّل سجل يومٍ إلى خريطة «عمل → عدد».
 * يقبل الشكل القديم (قائمة `items`) ويحوّله إلى عدّادات، ويتجاهل مفاتيح
 * `points`/`items` حتى لا تُحسب كمجموعات وهمية.
 */
export function normalizeDay(raw: unknown): DayCounts {
  const out: DayCounts = {};
  if (!raw || typeof raw !== "object") return out;
  const day = raw as Record<string, unknown>;

  const items = day["items"];
  if (Array.isArray(items)) {
    for (const entry of items as unknown[]) {
      if (!entry || typeof entry !== "object") continue;
      const item = entry as Record<string, unknown>;
      const id = item["id"] ?? item["name"];
      if (id === undefined || id === null) continue;
      const n = Number(item["count"] ?? item["points"] ?? 1);
      if (!Number.isFinite(n)) continue;
      const key = String(id);
      out[key] = (out[key] ?? 0) + n;
    }
  }

  for (const [key, value] of Object.entries(day)) {
    if (key === "items" || key === "points") continue;
    const n = Number(value);
    if (!Number.isFinite(n) || n === 0) continue;
    out[key] = Math.max(out[key] ?? 0, n);
  }

  return out;
}

/** يطبّع كل الأيام إلى شكلٍ واحد موحّد. */
export function normalizeLogs(raw: unknown): DayLogs {
  const out: DayLogs = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [day, value] of Object.entries(raw as Record<string, unknown>)) {
    const counts = normalizeDay(value);
    if (Object.keys(counts).length > 0) out[day] = counts;
  }
  return out;
}

function dayKeyOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function todayKey() {
  return dayKeyOf(new Date());
}

function readLogs(): DayLogs {
  try {
    return normalizeLogs(safeParse(localStorage.getItem(LOGS_KEY)));
  } catch {
    return {};
  }
}

function mergeDayCounts(a: DayCounts, b: DayCounts): DayCounts {
  const out: DayCounts = { ...a };
  for (const [id, n] of Object.entries(b)) {
    const v = Number(n);
    if (!Number.isFinite(v)) continue;
    out[id] = Math.max(out[id] ?? 0, v);
  }
  return out;
}

function mergeDayMaps(a: DayLogs, b: DayLogs): DayLogs {
  const out: DayLogs = { ...a };
  for (const [day, counts] of Object.entries(b)) {
    out[day] = mergeDayCounts(out[day] ?? {}, counts);
  }
  return out;
}

/** لقطة من كل بيانات التطبيق على هذا الجهاز. */
export function snapshotAll(): Record<string, unknown> {
  try {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) data[key] = safeParse(localStorage.getItem(key));
    }
    return data;
  } catch {
    return {};
  }
}

/** يستعيد لقطة كاملة ويُنذر بقية الصفحات. */
export function restoreAll(snapshot: Record<string, unknown>) {
  try {
    if (!snapshot || typeof snapshot !== "object") return;
    for (const [key, value] of Object.entries(snapshot)) {
      if (!key.startsWith(PREFIX)) continue;
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    }
    window.dispatchEvent(new Event(LOCAL_WRITE_EVENT));
  } catch (e) {
    console.error(e);
  }
}

/**
 * يدمج بيانات الجهاز مع بيانات الحساب: يأخذ الأكبر لكل عمل في كل يوم،
 * ولا يحذف شيئاً ممّا هو محفوظ محلياً. يُرجع اللقطة المدموجة.
 */
export function mergeState(
  local: Record<string, unknown>,
  remote: Record<string, unknown>,
): Record<string, unknown> {
  const localObj = local && typeof local === "object" ? local : {};
  const remoteObj = remote && typeof remote === "object" ? remote : {};
  const merged: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(localObj)) {
    if (key.startsWith(PREFIX)) merged[key] = value;
  }

  for (const [key, value] of Object.entries(remoteObj)) {
    if (!key.startsWith(PREFIX)) continue;
    if (key === LOGS_KEY) {
      merged[key] = mergeDayMaps(normalizeLogs(merged[key]), normalizeLogs(value));
    } else if (merged[key] === undefined) {
      merged[key] = value;
    }
  }

  return merged;
}

/**
 * سجل اليوم وسجل الأيام والمجاميع التراكمية.
 * `add(id, n)` يضيف، و`remove(id, n)` ينقص سجل اليوم فقط بأمان (لا يقل عن صفر)
 * دون المساس ببقية الأيام.
 */
export function useDayLog(dateKey?: string) {
  const activeKey = dateKey || todayKey();
  const lastJson = useRef<string | null>(null);
  const [logsState, setLogsState] = useState<DayLogs>({});
  const [loaded, setLoaded] = useState(false);

  // القراءة بعد التصور الأول حتى لا يختلف ما يرسله الخادم عن ما يراه الجهاز
  useEffect(() => {
    const next = readLogs();
    lastJson.current = JSON.stringify(next);
    setLogsState(next);
    setLoaded(true);
  }, []);

  // حفظ أي تغيير على الجهاز والإنذار ببقية الصفحات
  useEffect(() => {
    if (!loaded) return;
    const canon = JSON.stringify(normalizeLogs(logsState));
    if (canon === lastJson.current) return;
    lastJson.current = canon;
    try {
      localStorage.setItem(LOGS_KEY, canon);
      window.dispatchEvent(new Event(LOCAL_WRITE_EVENT));
    } catch (e) {
      console.error(e);
    }
  }, [logsState, loaded]);

  // التجاوب مع ما تكتبه صفحاتٌ أخرى أو المزامنة السحابية
  useEffect(() => {
    const onWrite = () => {
      let raw: string | null = null;
      try {
        raw = localStorage.getItem(LOGS_KEY);
      } catch {
        return;
      }
      if (raw === null) return;
      const next = normalizeLogs(safeParse(raw));
      const canon = JSON.stringify(next);
      if (canon === lastJson.current) return;
      lastJson.current = canon;
      setLogsState(next);
    };
    window.addEventListener(LOCAL_WRITE_EVENT, onWrite);
    return () => window.removeEventListener(LOCAL_WRITE_EVENT, onWrite);
  }, []);

  const add = useCallback(
    (id: string, n: number = 1) => {
      const key = String(id ?? "").trim();
      const amount = Math.round(Number(n));
      if (!key || !Number.isFinite(amount) || amount === 0) return;
      setLogsState((prev) => {
        const day = { ...(prev[activeKey] ?? {}) };
        const next = Math.max(0, (day[key] ?? 0) + amount);
        if (next === 0) delete day[key];
        else day[key] = next;
        return { ...prev, [activeKey]: day };
      });
    },
    [activeKey],
  );

  /**
   * إنقاص سجل اليوم فقط: يوقف النقصان عند الصفر، ولا يلمس بقية الأيام،
   * فلا يُمحى منها تسجيلاً واحداً.
   */
  const remove = useCallback(
    (id: string, n: number = 1) => {
      const amount = Math.abs(Math.round(Number(n)));
      if (!Number.isFinite(amount) || amount === 0) return;
      add(id, -amount);
    },
    [add],
  );

  const today = useMemo(() => logsState[activeKey] ?? {}, [logsState, activeKey]);

  const total = useMemo(
    () => Object.values(today).reduce((a, b) => a + b, 0),
    [today],
  );

  const { lifetimeById, lifetimeTotal } = useMemo(() => {
    const byId: DayCounts = {};
    let sum = 0;
    for (const day of Object.values(logsState)) {
      for (const [id, n] of Object.entries(day)) {
        const v = Number(n);
        if (!Number.isFinite(v) || v <= 0) continue;
        byId[id] = (byId[id] ?? 0) + v;
        sum += v;
      }
    }
    return { lifetimeById: byId, lifetimeTotal: sum };
  }, [logsState]);

  const streak = useMemo(() => {
    const d = new Date();
    if (total === 0) d.setDate(d.getDate() - 1);
    let count = 0;
    while (count < 3650) {
      const key = dayKeyOf(d);
      const dayTotal = Object.values(logsState[key] ?? {}).reduce((a, b) => a + b, 0);
      if (dayTotal <= 0) break;
      count += 1;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [logsState, total]);

  /** إعادة القراءة من الجهاز (تُستدعى بعد مزامنة أو تغيير خارجي). */
  const refresh = useCallback(() => {
    const next = readLogs();
    const canon = JSON.stringify(next);
    lastJson.current = canon;
    setLogsState(next);
  }, []);

  return {
    today,
    log: today,
    logs: logsState,
    total,
    streak,
    lifetimeById,
    lifetimeTotal,
    dayKey: activeKey,
    add,
    remove,
    refresh,
  };
}

/** حالةٌ بسيطة محفوظة على الجهاز تحت مفتاح `heart_compass_<key>`. */
export function useLocalState<T>(
  key: string,
  fallback: T,
): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = localStorage.getItem(`${PREFIX}_${key}`);
      if (item !== null) setValue(JSON.parse(item) as T);
    } catch {
      /* تجاهل */
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(`${PREFIX}_${key}`, JSON.stringify(value));
      window.dispatchEvent(new Event(LOCAL_WRITE_EVENT));
    } catch (e) {
      console.error(e);
    }
  }, [key, value, loaded]);

  return [value, setValue];
}
