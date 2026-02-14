import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createTicket, getTickets, getAnnouncements, getArticles } from '@/lib/store';
import { CATEGORIES, STATUS_CONFIG, PRIORITY_CONFIG, type TicketPriority } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { Plus, Search, Megaphone, BookOpen, Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState(getTickets());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: 'medium' as TicketPriority });

  const announcements = getAnnouncements();
  const articles = getArticles().filter(a => a.featured);

  const { isTechnician } = useAuth();

  const relevantTickets = isTechnician
    ? tickets
    : tickets.filter(t => t.requester_id === user?.id);

  const myTickets = relevantTickets
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = {
    open: relevantTickets.filter(t => t.status === 'OPEN').length,
    inProgress: relevantTickets.filter(t => t.status === 'IN_PROGRESS').length,
    waiting: relevantTickets.filter(t => t.status === 'WAITING_USER').length,
    closed: relevantTickets.filter(t => t.status === 'CLOSED' || t.status === 'RESOLVED').length,
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category || !user) return;
    createTicket({
      title: form.title,
      description: form.description,
      category: form.category,
      priority: form.priority,
      status: 'OPEN',
      requester_id: user.id,
      origin: 'WEB',
    });
    setTickets(getTickets());
    setForm({ title: '', description: '', category: '', priority: 'medium' });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Manage your support tickets and find answers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Open Ticket</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>Fill in the details below to submit a support request.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Brief description of the issue" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Provide details about your issue..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as TicketPriority }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Submit Ticket</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><AlertCircle className="h-5 w-5 text-primary" /></div>
          <div><p className="text-2xl font-bold">{stats.open}</p><p className="text-xs text-muted-foreground">Open</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10"><Loader2 className="h-5 w-5 text-warning" /></div>
          <div><p className="text-2xl font-bold">{stats.inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10"><Clock className="h-5 w-5 text-accent" /></div>
          <div><p className="text-2xl font-bold">{stats.waiting}</p><p className="text-xs text-muted-foreground">Waiting</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10"><CheckCircle className="h-5 w-5 text-success" /></div>
          <div><p className="text-2xl font-bold">{stats.closed}</p><p className="text-xs text-muted-foreground">Resolved</p></div>
        </CardContent></Card>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><Megaphone className="h-4 w-4" /> Latest Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {announcements.slice(0, 2).map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-warning flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{a.content}</p>
                </div>
              </div>
            ))}
            <Link to="/announcements" className="text-xs text-primary hover:underline">View all announcements →</Link>
          </CardContent>
        </Card>
      )}

      {/* My Tickets */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">{isTechnician ? 'All Tickets' : 'My Tickets'}</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 h-9 w-48" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="OPEN">Open</TabsTrigger>
              <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
              <TabsTrigger value="WAITING_USER">Waiting</TabsTrigger>
              <TabsTrigger value="RESOLVED">Resolved</TabsTrigger>
            </TabsList>
            <TabsContent value={statusFilter} className="mt-0">
              {myTickets.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-sm">No tickets found</p>
              ) : (
                <div className="space-y-2">
                  {myTickets.map(t => (
                    <Link key={t.id} to={`/tickets/${t.ticket_number}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{t.ticket_number}</span>
                        <span className="text-sm font-medium truncate">{t.title}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">{t.category}</Badge>
                        <span className={`inline-block h-2 w-2 rounded-full ${PRIORITY_CONFIG[t.priority].color}`} title={PRIORITY_CONFIG[t.priority].label} />
                        <Badge variant="secondary" className="text-xs">{STATUS_CONFIG[t.status].label}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Knowledge Base */}
      {articles.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg"><BookOpen className="h-5 w-5" /> Knowledge Base</CardTitle>
              <Link to="/knowledge-base"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {articles.map(a => (
                <Link key={a.id} to={`/knowledge-base/${a.id}`} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <h3 className="text-sm font-medium mb-1">{a.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{a.summary}</p>
                  <p className="text-xs text-muted-foreground mt-2">{a.views} views</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Home;
