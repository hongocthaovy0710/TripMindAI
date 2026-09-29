/**
 * API client — gọi backend TripMind AI (theo API design 5.5).
 * Tự đính kèm JWT vào header Authorization nếu đã đăng nhập.
 */
const BASE = "http://127.0.0.1:8000/api/v1";

function getToken(): string | null {
  try {
    return localStorage.getItem("tripmind_token");
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem("tripmind_token", token);
  } catch {
    /* bỏ qua nếu storage bị chặn */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem("tripmind_token");
  } catch {
    /* ignore */
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...options, headers });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const msg = json?.error?.message || json?.detail || "Có lỗi xảy ra";
    throw new Error(msg);
  }
  return json.data as T;
}

export interface Activity {
  id?: string;
  name: string;
  time?: string;
  location?: string;
  cost: number;
  priority: "high" | "medium" | "low";
}
export interface Day {
  day: number;
  activities: Activity[];
}
export interface Itinerary {
  destination: string;
  days: number;
  budget: number;
  estimated_cost: number;
  within_budget: boolean;
  itinerary: Day[];
}
export interface Trip {
  id: string;
  destination: string;
  days: number;
  budget: number;
  estimated_cost: number;
}

export const api = {
  register: (email: string, password: string, name: string) =>
    request<{ token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  generate: (destination: string, days: number, budget: number, preferences: string[]) =>
    request<Itinerary>("/trips/generate", {
      method: "POST",
      body: JSON.stringify({ destination, days, budget, preferences }),
    }),
  saveTrip: (t: Itinerary) =>
    request<{ id: string }>("/trips", { method: "POST", body: JSON.stringify(t) }),
  listTrips: () => request<Trip[]>("/trips"),
  updatePriority: (activityId: string, priority: string) =>
    request<Activity>(`/activities/${activityId}`, {
      method: "PATCH",
      body: JSON.stringify({ priority }),
    }),
};
