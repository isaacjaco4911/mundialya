// Tipos centrales de MundialYa — espejo del esquema de Supabase.

export type Stage = "group" | "r32" | "r16" | "qf" | "sf" | "final";
export type MatchStatus = "scheduled" | "live" | "finished";

export interface Team {
  id: string;
  name: string;
  code: string; // código FIFA de 3 letras
  flag_url: string | null;
  group_label: string | null; // A–L
  fifa_rank: number | null;
  created_at?: string;
}

export interface Match {
  id: string;
  stage: Stage;
  group_label: string | null;
  home_team_id: string;
  away_team_id: string;
  kickoff: string; // timestamptz ISO
  stadium: string;
  host_city: string;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  views: number;
  created_at?: string;
  // joins opcionales
  home_team?: Team;
  away_team?: Team;
}

export interface League {
  id: string;
  name: string;
  code: string;
  owner_id: string;
  is_public: boolean;
  created_at?: string;
}

export interface LeagueMember {
  id: string;
  league_id: string;
  user_id: string;
  display_name: string;
  total_points: number;
  created_at?: string;
}

export interface Prediction {
  id: string;
  league_id: string;
  user_id: string;
  match_id: string;
  pred_home: number;
  pred_away: number;
  points: number | null;
  created_at?: string;
}

export interface Poll {
  id: string;
  match_id: string | null; // null = encuesta global
  question: string;
  options: string[];
  created_at?: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_index: number;
  ip_hash: string;
  created_at?: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  phone: string;
  photo_url: string | null;
  description: string;
  screens: number;
  promos: string;
  showing_match_id: string | null;
  is_verified: boolean;
  is_featured: boolean;
  featured_until: string | null;
  avg_rating: number;
  review_count: number;
  views: number;
  created_at?: string;
}

export interface VenueReview {
  id: string;
  venue_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  ip_hash: string;
  created_at?: string;
}

export interface Banner {
  id: string;
  title: string;
  image_url: string | null;
  link: string | null;
  placement: "home_top" | "sidebar" | "match";
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  priority: number;
}

export interface Popup {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  link: string | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  frequency_hours: number;
}

export interface GroupRow {
  team: Team;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dif: number;
  pts: number;
}

export const STAGE_LABELS: Record<Stage, string> = {
  group: "Fase de grupos",
  r32: "32avos de final",
  r16: "16avos de final",
  qf: "Cuartos de final",
  sf: "Semifinales",
  final: "Final",
};
