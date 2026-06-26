// Single API client. Reads base from VITE_API_BASE (default localhost:8000).
import type {
  Application, Company, Gig, Meta, Notif, Org, Opportunity, PublicProfile, RoadmapSteps,
  Task, University, User, Vacancy, VerificationItem,
} from "./types";

const BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:8000";

let _token: string | null = localStorage.getItem("imkon_token");

export function setToken(t: string | null) {
  _token = t;
  if (t) localStorage.setItem("imkon_token", t);
  else localStorage.removeItem("imkon_token");
}
export function getToken() { return _token; }

async function req<T>(path: string, opts: { method?: string; body?: unknown; token?: string | null } = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const tok = opts.token !== undefined ? opts.token : _token;
  if (tok) headers["Authorization"] = `Bearer ${tok}`;
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { detail = (await res.json()).detail || detail; } catch { /* noop */ }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  base: BASE,
  health: () => req<{ status: string; ai: Record<string, unknown> }>("/health"),
  meta: (age?: number) => req<Meta>(`/meta${age != null ? `?age=${age}` : ""}`),

  // auth / users
  register: (body: Record<string, unknown>) => req<{ token: string; user: User }>("/users", { method: "POST", body }),
  login: (body: Record<string, unknown>) => req<{ token: string; user: User }>("/auth/login", { method: "POST", body }),
  me: () => req<User>("/auth/me"),
  getUser: (id: string) => req<User>(`/users/${id}`),
  updateUser: (id: string, body: Record<string, unknown>) => req<User>(`/users/${id}`, { method: "PATCH", body }),
  matches: (id: string, limit = 8) =>
    req<{ count: number; matches: Opportunity[]; is_adult: boolean }>(`/users/${id}/matches?limit=${limit}`),

  // ai
  aiDialog: (body: { user_id?: string; history: { role: string; content: string }[] }) =>
    req<{ done: boolean; question?: string; needs?: string[]; interests?: string[]; goal?: string; positions?: string[]; notes?: string }>("/ai/dialog", { method: "POST", body }),
  aiResume: (body: { user_id: string; lang?: string; linkedin?: string; phone?: string; experience?: string; target?: string }) =>
    req<{ resume: string }>("/ai/resume", { method: "POST", body }),
  aiText: (prompt: string, lang?: string) => req<{ text: string }>("/ai/text", { method: "POST", body: { prompt, lang } }),
  aiImprove: (text: string, kind: string, lang?: string) =>
    req<{ text: string }>("/ai/improve", { method: "POST", body: { text, kind, lang } }),
  companies: () => req<{ companies: Company[] }>("/companies", { token: null }),
  aiRoadmap: (user_id: string, goal_text: string) => req<RoadmapSteps>("/ai/roadmap", { method: "POST", body: { user_id, goal_text } }),

  // roadmaps
  roadmapSteps: (id: string) => req<RoadmapSteps>(`/roadmaps/${id}/steps`),
  userRoadmaps: (id: string) => req<{ roadmaps: RoadmapSteps[] }>(`/users/${id}/roadmaps`),

  // verifications / org
  createVerification: (body: Record<string, unknown>) => req<{ id: string; status: string }>("/verifications", { method: "POST", body }),
  orgLogin: (login_email: string, password: string) => req<{ token: string; org: Org }>("/auth/org-login", { method: "POST", body: { login_email, password } }),
  orgVerifications: (orgId: string, token: string, status = "pending") =>
    req<{ org: Org; count: number; items: VerificationItem[] }>(`/org/${orgId}/verifications?status=${status}`, { token }),
  resolveVerification: (id: string, decision: string, token: string) =>
    req<Record<string, unknown>>(`/verifications/${id}/resolve`, { method: "POST", body: { decision }, token }),

  // share / public
  createShare: (uid: string, body: Record<string, unknown> = {}) =>
    req<{ token: string; url: string; one_time: boolean; expires_at: string | null }>(`/profiles/${uid}/share`, { method: "POST", body }),
  revokeShare: (uid: string, token: string) => req<{ revoked: boolean }>(`/profiles/${uid}/share/${token}`, { method: "DELETE" }),
  publicProfile: (token: string) => req<PublicProfile>(`/p/${token}`, { token: null }),
  pdfUrl: (token: string) => `${BASE}/p/${token}/resume.pdf`,

  // earning
  gigs: () => req<{ gigs: Gig[] }>("/gigs", { token: null }),
  createGig: (body: Record<string, unknown>) => req<{ id: string }>("/gigs", { method: "POST", body }),
  tasks: () => req<{ tasks: Task[] }>("/tasks", { token: null }),
  createTask: (body: Record<string, unknown>) => req<{ id: string }>("/tasks", { method: "POST", body }),
  vacancies: (filters: Record<string, string | number | undefined> = {}) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v !== undefined && v !== "" && v !== null) p.set(k, String(v));
    const qs = p.toString();
    return req<{ vacancies: Vacancy[]; count: number; spheres: string[] }>(`/vacancies${qs ? `?${qs}` : ""}`);
  },
  apply: (body: Record<string, unknown>) => req<{ id: string; status: string }>("/applications", { method: "POST", body }),
  myApplications: (uid: string) => req<{ applications: Application[] }>(`/users/${uid}/applications`),
  updateApplication: (id: string, status: string) => req<{ id: string; status: string }>(`/applications/${id}`, { method: "PATCH", body: { status } }),
  createJobAlert: (criteria: Record<string, unknown>) => req<{ id: string }>("/job-alerts", { method: "POST", body: { criteria } }),

  // catalog
  opportunities: (params: { category?: string; city?: string } = {}) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return req<{ count: number; opportunities: Opportunity[] }>(`/opportunities${q ? `?${q}` : ""}`, { token: null });
  },
  opportunity: (id: string) => req<Opportunity>(`/opportunities/${id}`, { token: null }),
  organizations: () => req<{ organizations: Org[] }>("/organizations", { token: null }),
  universities: (city?: string) => req<{ universities: University[] }>(`/universities${city ? `?city=${city}` : ""}`, { token: null }),
  notifications: () => req<{ items: Notif[] }>("/notifications"),
  markRead: () => req<{ ok: boolean }>("/notifications/read", { method: "POST" }),
};
