export interface Skill { name: string; verified?: boolean; proof_url?: string | null; }
export interface LangItem { lang: string; level: string; }

export interface User {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  age: number;
  gender?: string;
  city?: string | null;
  status?: string | null;
  is_migrant_child?: boolean;
  needs: string[];
  interests: string[];
  domains?: string[];
  education?: string | null;
  bio?: string | null;
  languages: LangItem[];
  skills: Skill[];
  trust_score: number;
  language_pref: string;
  profile_public?: boolean;
  is_adult: boolean;
  achievements?: Achievement[];
}

export interface Achievement {
  id: string; type: string; title: string; detail: Record<string, unknown>;
  verified: boolean; verified_by?: string | null; verified_at?: string | null; proof_url?: string | null;
}

export interface Opportunity {
  id: string; title: string; organization?: string | null; category: string;
  description?: string | null; location: string[]; is_free: boolean;
  deadline?: string | null; contact_info?: string | null; source_url?: string | null;
  skills_tags?: string[]; min_legal_age?: number; for_migrant_child?: boolean;
  salary_min?: number | null; salary_max?: number | null; experience?: string | null;
  employment_format?: string | null; sphere?: string | null; responsibilities?: string | null;
  _score?: number;
}

export interface Step {
  id: string; order: number; label: string; description?: string | null;
  status: "locked" | "current" | "done"; suggested_resource?: string | null;
  resource?: { id: string } | null; is_final_job: boolean; vacancy_id?: string | null;
}
export interface RoadmapSteps {
  id: string; goal: string; goal_text: string;
  progress: { done: number; total: number; label: string };
  steps: Step[];
}

export interface Gig { id: string; title: string; category?: string; price?: number | null;
  delivery_days?: number | null; description?: string | null; seller_id: string; }
export interface Task { id: string; title: string; location?: string; pay?: number | null;
  duration_hours?: number | null; category?: string; status: string; }
export interface Vacancy {
  id: string; title: string; organization?: string; category: string;
  location: string[]; skills_tags?: string[]; description?: string | null;
  responsibilities?: string | null; sphere?: string | null;
  salary_min?: number | null; salary_max?: number | null;
  experience?: string | null; employment_format?: string | null;
}
export interface VacancyFilters {
  city?: string; sphere?: string; employment_format?: string; experience?: string;
  salary_min?: number; org_id?: string; q?: string; category?: string;
}
export interface Application { id: string; title?: string | null; status: string; created_at?: string; }

export interface UniProgram { name: string; min_score?: number; cost?: number; deadline?: string; scholarship?: boolean; }
export interface University { id: string; name: string; city?: string; programs: UniProgram[]; requirements?: string; }

export interface Notif { text: string; meta: Record<string, unknown>; read: boolean; }
export interface Org { id: string; name: string; type?: string; verified?: boolean;
  brand_color?: string | null; logo_text?: string | null; sphere?: string | null; }
export interface Company {
  id: string; name: string; sphere?: string | null; brand_color?: string | null;
  logo_text?: string | null; verified?: boolean; vacancies: Vacancy[];
}
export interface VerificationItem {
  id: string; user_id: string; user_display: string; claim_type: string;
  claim_detail: Record<string, unknown>; status: string; requested_at?: string;
}
export interface PublicProfile {
  id: string; display_name: string; city?: string | null; age_bucket: string;
  trust_score: number; bio?: string | null; education?: string | null; domains?: string[];
  skills: Skill[]; languages: LangItem[]; verified_achievements: Achievement[];
  is_adult: boolean; roadmaps: RoadmapSteps[];
}
export interface L3 { tj: string; ru: string; en: string; }
export interface NeedOption { id: string; icon: string; icon_id?: string; min_age: number; label: { tj: string; ru: string }; categories: string[]; }
export interface StatusOption { id: string; icon: string; label: L3; sub: L3; }
export interface DomainOption { id: string; icon: string; label: L3; tech: string[]; }
export interface IdLabel { id: string; label: L3; }
export interface Meta {
  cities: string[]; categories: string[]; age_buckets: string[];
  interests: { id: string; icon: string; label: { tj: string; ru: string } }[];
  needs: NeedOption[];
  statuses: StatusOption[];
  education_levels: IdLabel[];
  skill_domains: DomainOption[];
  spoken_languages: IdLabel[];
  lang_levels: IdLabel[];
}
