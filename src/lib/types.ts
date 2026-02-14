export type UserRole = 'end_user' | 'technician' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED' | 'CANCELED';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketOrigin = 'WEB' | 'EMAIL';

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  requester_id: string;
  assignee_id?: string;
  origin: TicketOrigin;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  attachments?: string[];
}

export interface KBArticle {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  tags: string[];
  featured: boolean;
  views: number;
  helpful_yes: number;
  helpful_no: number;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  target: 'all' | UserRole;
  start_date: string;
  end_date?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'ticket_opened' | 'ticket_updated' | 'ticket_closed';
  ticket_id?: string;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  user_id: string;
  changes: Record<string, { old: string; new: string }>;
  created_at: string;
}

export const CATEGORIES = [
  'Hardware', 'Software', 'Network', 'Access & Permissions',
  'Email', 'General Inquiry', 'Bug Report', 'Feature Request'
];

export const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'bg-blue-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-500' },
  WAITING_USER: { label: 'Waiting on User', color: 'bg-purple-500' },
  RESOLVED: { label: 'Resolved', color: 'bg-emerald-500' },
  CLOSED: { label: 'Closed', color: 'bg-slate-500' },
  CANCELED: { label: 'Canceled', color: 'bg-red-400' },
};

export const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-slate-400' },
  medium: { label: 'Medium', color: 'bg-blue-400' },
  high: { label: 'High', color: 'bg-orange-500' },
  urgent: { label: 'Urgent', color: 'bg-red-600' },
};
