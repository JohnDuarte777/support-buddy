import { User, Ticket, TicketMessage, KBArticle, Announcement, Notification, AuditLog } from './types';

const STORAGE_PREFIX = 'helpdesk_';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

// Current user
export function getCurrentUser(): User | null {
  return load<User | null>('current_user', null);
}
export function setCurrentUser(user: User | null) {
  save('current_user', user);
}

// Users
export function getUsers(): User[] { return load('users', SEED_USERS); }
export function saveUsers(u: User[]) { save('users', u); }

// Tickets
export function getTickets(): Ticket[] { return load('tickets', SEED_TICKETS); }
export function saveTickets(t: Ticket[]) { save('tickets', t); }
export function getTicketByNumber(num: string): Ticket | undefined {
  return getTickets().find(t => t.ticket_number === num);
}

let ticketCounter = 0;
export function nextTicketNumber(): string {
  const tickets = getTickets();
  const nums = tickets.map(t => parseInt(t.ticket_number.replace('TICKET-', '')));
  ticketCounter = Math.max(...nums, 1000) + 1;
  return `TICKET-${ticketCounter}`;
}

export function createTicket(data: Omit<Ticket, 'id' | 'ticket_number' | 'created_at' | 'updated_at'>): Ticket {
  const tickets = getTickets();
  const ticket: Ticket = {
    ...data,
    id: crypto.randomUUID(),
    ticket_number: nextTicketNumber(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  tickets.unshift(ticket);
  saveTickets(tickets);
  addNotification({
    user_id: data.requester_id,
    title: 'Ticket Created',
    message: `Your ticket ${ticket.ticket_number} has been created.`,
    type: 'ticket_opened',
    ticket_id: ticket.id,
  });
  return ticket;
}

export function updateTicket(id: string, updates: Partial<Ticket>, userId: string): Ticket | null {
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.id === id);
  if (idx === -1) return null;
  const old = tickets[idx];
  tickets[idx] = { ...old, ...updates, updated_at: new Date().toISOString() };
  if (updates.status === 'RESOLVED' || updates.status === 'CLOSED') {
    tickets[idx].resolved_at = tickets[idx].resolved_at || new Date().toISOString();
    if (updates.status === 'CLOSED') tickets[idx].closed_at = new Date().toISOString();
  }
  saveTickets(tickets);

  // audit
  const changes: Record<string, { old: string; new: string }> = {};
  for (const key of Object.keys(updates) as (keyof Ticket)[]) {
    if (old[key] !== updates[key]) {
      changes[key] = { old: String(old[key] ?? ''), new: String(updates[key] ?? '') };
    }
  }
  addAuditLog({ entity_type: 'ticket', entity_id: id, action: 'update', user_id: userId, changes });

  // notification
  addNotification({
    user_id: old.requester_id,
    title: updates.status === 'CLOSED' || updates.status === 'RESOLVED' ? 'Ticket Resolved' : 'Ticket Updated',
    message: `Ticket ${old.ticket_number} has been updated.`,
    type: updates.status === 'CLOSED' || updates.status === 'RESOLVED' ? 'ticket_closed' : 'ticket_updated',
    ticket_id: id,
  });
  return tickets[idx];
}

// Messages
export function getMessages(ticketId: string): TicketMessage[] {
  return load<TicketMessage[]>('messages', SEED_MESSAGES).filter(m => m.ticket_id === ticketId);
}
export function addMessage(msg: Omit<TicketMessage, 'id' | 'created_at'>): TicketMessage {
  const all = load<TicketMessage[]>('messages', SEED_MESSAGES);
  const m: TicketMessage = { ...msg, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  all.push(m);
  save('messages', all);
  return m;
}

// KB
export function getArticles(): KBArticle[] { return load('articles', SEED_ARTICLES); }
export function saveArticles(a: KBArticle[]) { save('articles', a); }

// Announcements
export function getAnnouncements(): Announcement[] { return load('announcements', SEED_ANNOUNCEMENTS); }
export function saveAnnouncements(a: Announcement[]) { save('announcements', a); }

// Notifications
export function getNotifications(userId: string): Notification[] {
  return load<Notification[]>('notifications', []).filter(n => n.user_id === userId);
}
export function addNotification(data: Omit<Notification, 'id' | 'read' | 'created_at'>) {
  const all = load<Notification[]>('notifications', []);
  all.unshift({ ...data, id: crypto.randomUUID(), read: false, created_at: new Date().toISOString() });
  save('notifications', all);
}
export function markNotificationRead(id: string) {
  const all = load<Notification[]>('notifications', []);
  const n = all.find(x => x.id === id);
  if (n) n.read = true;
  save('notifications', all);
}
export function markAllNotificationsRead(userId: string) {
  const all = load<Notification[]>('notifications', []);
  all.filter(n => n.user_id === userId).forEach(n => { n.read = true; });
  save('notifications', all);
}

// Audit
export function addAuditLog(data: Omit<AuditLog, 'id' | 'created_at'>) {
  const all = load<AuditLog[]>('audit', []);
  all.unshift({ ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() });
  save('audit', all);
}
export function getAuditLogs(): AuditLog[] { return load('audit', []); }

// ---- SEED DATA ----
const SEED_USERS: User[] = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice@company.com', role: 'admin', avatar: '' },
  { id: 'u2', name: 'Bob Smith', email: 'bob@company.com', role: 'technician', avatar: '' },
  { id: 'u3', name: 'Carol Davis', email: 'carol@company.com', role: 'end_user', avatar: '' },
  { id: 'u4', name: 'Dave Wilson', email: 'dave@company.com', role: 'end_user', avatar: '' },
];

const SEED_TICKETS: Ticket[] = [
  { id: 't1', ticket_number: 'TICKET-1001', title: 'Cannot access VPN', description: 'Getting connection timeout when trying to connect to corporate VPN from home.', status: 'OPEN', priority: 'high', category: 'Network', requester_id: 'u3', assignee_id: 'u2', origin: 'WEB', created_at: '2026-02-10T09:00:00Z', updated_at: '2026-02-10T09:00:00Z' },
  { id: 't2', ticket_number: 'TICKET-1002', title: 'Need new monitor setup', description: 'Requesting dual monitor setup for desk 4B.', status: 'IN_PROGRESS', priority: 'medium', category: 'Hardware', requester_id: 'u4', assignee_id: 'u2', origin: 'WEB', created_at: '2026-02-09T14:30:00Z', updated_at: '2026-02-11T10:00:00Z' },
  { id: 't3', ticket_number: 'TICKET-1003', title: 'Email not syncing on mobile', description: 'Outlook app on iPhone not receiving new emails since yesterday.', status: 'WAITING_USER', priority: 'medium', category: 'Email', requester_id: 'u3', origin: 'EMAIL', created_at: '2026-02-08T11:00:00Z', updated_at: '2026-02-12T08:00:00Z' },
  { id: 't4', ticket_number: 'TICKET-1004', title: 'Software license for Adobe CC', description: 'Need Adobe Creative Cloud license for marketing team projects.', status: 'RESOLVED', priority: 'low', category: 'Software', requester_id: 'u4', assignee_id: 'u1', origin: 'WEB', created_at: '2026-02-05T10:00:00Z', updated_at: '2026-02-07T16:00:00Z', resolved_at: '2026-02-07T16:00:00Z' },
  { id: 't5', ticket_number: 'TICKET-1005', title: 'Printer jam on 3rd floor', description: 'The HP LaserJet on 3rd floor keeps jamming. Paper tray seems fine.', status: 'CLOSED', priority: 'low', category: 'Hardware', requester_id: 'u3', assignee_id: 'u2', origin: 'WEB', created_at: '2026-02-01T08:00:00Z', updated_at: '2026-02-03T12:00:00Z', resolved_at: '2026-02-02T14:00:00Z', closed_at: '2026-02-03T12:00:00Z' },
  { id: 't6', ticket_number: 'TICKET-1006', title: 'Request access to Jira project', description: 'I need access to the PLATFORM project in Jira for sprint planning.', status: 'OPEN', priority: 'medium', category: 'Access & Permissions', requester_id: 'u4', origin: 'EMAIL', created_at: '2026-02-13T07:00:00Z', updated_at: '2026-02-13T07:00:00Z' },
];

const SEED_MESSAGES: TicketMessage[] = [
  { id: 'm1', ticket_id: 't1', author_id: 'u3', content: 'I\'ve been trying to connect since this morning. The VPN client shows "Connection timed out" every time.', is_internal: false, created_at: '2026-02-10T09:05:00Z' },
  { id: 'm2', ticket_id: 't1', author_id: 'u2', content: 'Could you try restarting the VPN client and share your client version? Also, are you on the latest OS update?', is_internal: false, created_at: '2026-02-10T10:30:00Z' },
  { id: 'm3', ticket_id: 't2', author_id: 'u2', content: 'Ordered 2x Dell U2722D monitors. Expected delivery by Feb 14.', is_internal: true, created_at: '2026-02-11T10:00:00Z' },
];

const SEED_ARTICLES: KBArticle[] = [
  { id: 'a1', title: 'How to Connect to VPN', summary: 'Step-by-step guide for connecting to the corporate VPN from any device.', body: '## Prerequisites\n- Download the VPN client from the IT portal\n- Have your credentials ready\n\n## Steps\n1. Open the VPN client\n2. Enter the server address: vpn.company.com\n3. Enter your username and password\n4. Click Connect\n\n## Troubleshooting\n- If connection times out, try switching to TCP mode\n- Ensure your firewall allows the VPN client', category: 'Network', tags: ['vpn', 'remote', 'network'], featured: true, views: 342, helpful_yes: 89, helpful_no: 5, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
  { id: 'a2', title: 'Setting Up Email on Mobile', summary: 'Configure Outlook on iOS and Android devices.', body: '## iOS\n1. Open Settings > Mail > Accounts\n2. Add Account > Microsoft Exchange\n3. Enter your work email\n4. Follow the prompts\n\n## Android\n1. Download Outlook from Play Store\n2. Sign in with your work email\n3. Allow permissions', category: 'Email', tags: ['email', 'mobile', 'outlook'], featured: true, views: 256, helpful_yes: 67, helpful_no: 3, created_at: '2026-01-20T10:00:00Z', updated_at: '2026-01-20T10:00:00Z' },
  { id: 'a3', title: 'Requesting Software Licenses', summary: 'How to request new software licenses through the help desk.', body: '## Process\n1. Submit a ticket with category "Software"\n2. Include the software name and version\n3. Provide business justification\n4. Your manager will receive an approval request\n5. Once approved, IT will provision the license within 2 business days', category: 'Software', tags: ['license', 'software', 'request'], featured: false, views: 128, helpful_yes: 34, helpful_no: 2, created_at: '2026-01-25T10:00:00Z', updated_at: '2026-01-25T10:00:00Z' },
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann1', title: 'Scheduled Maintenance: Feb 15', content: 'All systems will undergo maintenance on February 15, 2026 from 10 PM to 2 AM EST. Expect brief interruptions to email and VPN services.', author_id: 'u1', target: 'all', start_date: '2026-02-12T00:00:00Z', end_date: '2026-02-16T00:00:00Z', created_at: '2026-02-10T14:00:00Z' },
  { id: 'ann2', title: 'New Password Policy', content: 'Starting March 1, all passwords must be at least 14 characters with uppercase, lowercase, numbers, and symbols. MFA will be mandatory.', author_id: 'u1', target: 'all', start_date: '2026-02-08T00:00:00Z', created_at: '2026-02-08T09:00:00Z' },
];
