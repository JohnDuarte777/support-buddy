import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { getTicketByNumber, getMessages, addMessage, updateTicket, getUsers } from '@/lib/store';
import { STATUS_CONFIG, PRIORITY_CONFIG, type TicketStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Send, Clock, User as UserIcon, Tag } from 'lucide-react';

const TicketDetail = () => {
  const { ticketNumber } = useParams<{ ticketNumber: string }>();
  const navigate = useNavigate();
  const { user, isTechnician } = useAuth();
  const users = getUsers();

  const [ticket, setTicket] = useState(getTicketByNumber(ticketNumber || ''));
  const [messages, setMessages] = useState(getMessages(ticket?.id || ''));
  const [reply, setReply] = useState('');

  if (!ticket) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-muted-foreground">Ticket not found</p>
    </div>
  );

  const requester = users.find(u => u.id === ticket.requester_id);
  const assignee = users.find(u => u.id === ticket.assignee_id);

  const handleReply = () => {
    if (!reply.trim() || !user) return;
    addMessage({ ticket_id: ticket.id, author_id: user.id, content: reply, is_internal: false });
    setMessages(getMessages(ticket.id));
    setReply('');
  };

  const handleStatusChange = (status: TicketStatus) => {
    if (!user) return;
    const updated = updateTicket(ticket.id, { status }, user.id);
    if (updated) setTicket(updated);
  };

  const handleAssign = (assigneeId: string) => {
    if (!user) return;
    const updated = updateTicket(ticket.id, { assignee_id: assigneeId }, user.id);
    if (updated) setTicket(updated);
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-muted-foreground mb-1">{ticket.ticket_number}</p>
                  <CardTitle className="text-xl">{ticket.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${PRIORITY_CONFIG[ticket.priority].color}`} />
                  <Badge variant="secondary">{STATUS_CONFIG[ticket.status].label}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader><CardTitle className="text-base">Conversation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex gap-3 ${m.is_internal ? 'opacity-60' : ''}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                    {getUserName(m.author_id).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{getUserName(m.author_id)}</span>
                      {m.is_internal && <Badge variant="outline" className="text-xs">Internal</Badge>}
                      <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>}
              <Separator />
              <div className="flex gap-2">
                <Textarea placeholder="Type your reply..." value={reply} onChange={e => setReply(e.target.value)} rows={3} className="flex-1" />
                <Button onClick={handleReply} disabled={!reply.trim()} className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Category:</span>
                <span>{ticket.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Requester:</span>
                <span>{requester?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Assignee:</span>
                <span>{assignee?.name || 'Unassigned'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Origin:</span>
                <Badge variant="outline">{ticket.origin}</Badge>
              </div>
            </CardContent>
          </Card>

          {isTechnician && (
            <Card>
              <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={ticket.status} onValueChange={(v) => handleStatusChange(v as TicketStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign To</label>
                  <Select value={ticket.assignee_id || ''} onValueChange={handleAssign}>
                    <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.role !== 'end_user').map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
