export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  points: number;
  badge_level: string;
  reports_count: number;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  email?: string;
  description?: string;
}

export interface Report {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  ai_summary?: string;
  category: string;
  severity: Severity;
  status: ReportStatus;
  department_id?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  upvotes_count: number;
  comments_count: number;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  users?: User;
  departments?: Department;
}

export interface Comment {
  id: string;
  report_id: string;
  user_id: string;
  content: string;
  created_at: string;
  users?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  report_id?: string;
  created_at: string;
}

export interface AIAnalysis {
  title: string;
  category: string;
  severity: Severity;
  summary: string;
  department: string;
  confidence: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  points: number;
  badge_level: string;
  reports_count: number;
  is_admin: boolean;  // ← add this
  created_at: string;
}