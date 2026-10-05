const API_BASE = "/api/v1";

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Bir hata oluştu" }));
    throw new Error(err.error || "Bir hata oluştu");
  }
  return res.json();
}

export const adminApi = {
  getDashboard: () => adminFetch<Record<string, number>>("/admin/dashboard"),
  getAppointments: () => adminFetch<AdminAppointment[]>("/admin/appointments"),
  clearAppointments: () => adminFetch<{ success: boolean }>("/admin/appointments", { method: "DELETE" }),
  confirmAllAppointments: () =>
    adminFetch<{
      success: boolean;
      confirmed: number;
      emailsSent: number;
      emailsSkipped: number;
      emailsFailed: number;
    }>("/admin/appointments", {
      method: "PATCH",
      body: JSON.stringify({ action: "confirm_all" }),
    }),
  updateAppointment: (id: number, status: string) =>
    adminFetch<{
      success: boolean;
      deleted?: boolean;
      email?: { sent: boolean; skipped?: boolean; reason?: string; error?: string } | null;
    }>(`/admin/appointments/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteAppointment: (id: number) =>
    adminFetch(`/admin/appointments/${id}`, { method: "DELETE" }),
  getBarbers: () => adminFetch<AdminBarber[]>("/admin/barbers"),
  getServices: () => adminFetch<AdminService[]>("/admin/services"),
  getCustomers: () => adminFetch<AdminCustomer[]>("/admin/customers"),
  deleteCustomer: (id: number) =>
    adminFetch<{ success: boolean; deletedAppointments: number }>(`/admin/customers/${id}`, {
      method: "DELETE",
    }),
  getEmailStatus: () =>
    adminFetch<{
      status: { configured: boolean; enabled: boolean; host?: string; user?: string; from?: string };
    }>("/admin/email"),
  sendTestEmail: (to?: string) =>
    adminFetch<{ success: boolean; result?: { sent: boolean }; error?: string }>("/admin/email", {
      method: "POST",
      body: JSON.stringify({ to }),
    }),
  getReviews: () => adminFetch<AdminReview[]>("/admin/reviews"),
  getGallery: () => adminFetch<AdminGallery[]>("/admin/gallery"),
  createGallery: (data: {
    title: string;
    url: string;
    sortOrder?: number;
    mediaType?: "image" | "instagram" | "tiktok";
    instagramUrl?: string | null;
    coverUrl?: string | null;
    isVideo?: boolean;
  }) =>
    adminFetch<AdminGallery>("/admin/gallery", { method: "POST", body: JSON.stringify(data) }),
  updateGallery: (id: number, data: Partial<AdminGallery>) =>
    adminFetch("/admin/gallery", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
  deleteGallery: (id: number) => adminFetch(`/admin/gallery?id=${id}`, { method: "DELETE" }),
  getSettings: () => adminFetch<Record<string, string>>("/admin/settings"),
  saveSettings: (data: Record<string, string>) =>
    adminFetch("/admin/settings", { method: "PATCH", body: JSON.stringify(data) }),
  updateBarber: (id: number, data: Partial<AdminBarber>) =>
    adminFetch("/admin/barbers", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
  createBarber: (data: Partial<AdminBarber> & { name: string; slug: string }) =>
    adminFetch("/admin/barbers", { method: "POST", body: JSON.stringify(data) }),
  deleteBarber: (id: number) => adminFetch(`/admin/barbers?id=${id}`, { method: "DELETE" }),
  createService: (data: Partial<AdminService> & { name: string }) =>
    adminFetch<AdminService>("/admin/services", { method: "POST", body: JSON.stringify(data) }),
  deleteService: (id: number) => adminFetch(`/admin/services?id=${id}`, { method: "DELETE" }),
  updateService: (id: number, data: Partial<AdminService>) =>
    adminFetch("/admin/services", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
  updateReview: (id: number, data: Partial<AdminReview>) =>
    adminFetch("/admin/reviews", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
  deleteReview: (id: number) => adminFetch(`/admin/reviews?id=${id}`, { method: "DELETE" }),
  getNotifications: () => adminFetch<{ items: Notification[]; unread: number }>("/admin/notifications"),
  markNotificationRead: (id: number) =>
    adminFetch("/admin/notifications", { method: "PATCH", body: JSON.stringify({ action: "read", id }) }),
  markAllRead: () =>
    adminFetch("/admin/notifications", { method: "PATCH", body: JSON.stringify({ action: "read_all" }) }),
  getAvailability: (date?: string) =>
    adminFetch<AvailabilityBlock[]>(`/admin/availability${date ? `?date=${date}` : ""}`),
  createAvailability: (data: {
    date: string;
    startTime: string;
    endTime: string;
    reason?: string;
    barberId?: number | null;
    ruleType?: string;
    endDate?: string;
  }) =>
    adminFetch("/admin/availability", { method: "POST", body: JSON.stringify(data) }),
  deleteAvailability: (id: number) =>
    adminFetch(`/admin/availability/${id}`, { method: "DELETE" }),
  getReports: () => adminFetch<ReportsData>("/admin/reports"),
  getMessages: () => adminFetch<ContactMessage[]>("/admin/messages"),
  markMessageRead: (id: number) =>
    adminFetch("/admin/messages", { method: "PATCH", body: JSON.stringify({ id, read: true }) }),
  logout: () => adminFetch<{ success: boolean }>("/auth/session", { method: "POST" }),
};

export interface AdminAppointment {
  id: number;
  customerId: number;
  customerName: string;
  phone: string;
  email?: string;
  serviceId: number;
  serviceName: string;
  barberId: number | null;
  barberName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface AdminBarber {
  id: number;
  name: string;
  slug: string;
  position: string;
  avatar: string | null;
  specialty: string | null;
  workingDays: string;
  workingStart: string;
  workingEnd: string;
  onVacation: boolean;
  available: boolean;
  performance: number;
  appointmentsToday?: number;
}

export interface AdminService {
  id: number;
  name: string;
  slug: string;
  description: string;
  duration: number;
  price: number;
  image: string | null;
  popular: boolean;
  enabled: boolean;
  sortOrder: number;
}

export interface AdminCustomer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  visitCount: number;
  totalSpent: number;
  lastVisit: string | null;
  favoriteBarberId: number | null;
  notes: string | null;
  pendingAppointments?: number;
  confirmedAppointments?: number;
  activeAppointments?: number;
}

export interface AdminReview {
  id: number;
  customerName: string;
  customerEmail?: string | null;
  rating: number;
  review: string;
  source: string;
  featured: boolean;
  approved: boolean;
  replied: boolean;
  reply: string | null;
  createdAt: string;
}

export interface AdminGallery {
  id: number;
  url: string;
  title: string;
  mediaType: "image" | "instagram" | "tiktok";
  instagramUrl: string | null;
  coverUrl: string | null;
  isVideo: boolean;
  sortOrder: number;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AvailabilityBlock {
  id: number;
  date: string;
  endDate: string | null;
  startTime: string;
  endTime: string;
  ruleType: string;
  customOpen: string | null;
  customClose: string | null;
  scope: string | null;
  reason: string;
  barberId: number | null;
  active: boolean;
  createdBy: string | null;
  createdAt: string;
}

export interface ReportsData {
  revenueChart: { month: string; revenue: number; appointments: number }[];
  popularServices: { name: string; count: number }[];
  barberStats: { name: string; appointments: number; revenue: number }[];
  busyHours: { hour: string; count: number }[];
  totalCustomers: number;
  totalAppointments: number;
  totalRevenue: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}
