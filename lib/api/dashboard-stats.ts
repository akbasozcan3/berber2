export const EMPTY_DASHBOARD = {
  todayAppointments: 0,
  waitingCustomers: 0,
  completedToday: 0,
  revenueToday: 0,
  revenueMonth: 0,
} as const;

export function normalizeDashboardStats(data: unknown) {
  const row = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  return {
    todayAppointments: Number(row.todayAppointments) || 0,
    waitingCustomers: Number(row.waitingCustomers) || 0,
    completedToday: Number(row.completedToday) || 0,
    revenueToday: Number(row.revenueToday) || 0,
    revenueMonth: Number(row.revenueMonth) || 0,
  };
}
