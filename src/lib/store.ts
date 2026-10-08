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
