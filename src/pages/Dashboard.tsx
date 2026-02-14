import { useState, useMemo } from 'react';
import { getTickets, getUsers } from '@/lib/store';
import { CATEGORIES, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';

const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#6b7280', '#ef4444'];

const Dashboard = () => {
  const tickets = getTickets();
  const users = getUsers();
  const [period, setPeriod] = useState('30');

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(period));
  const filtered = tickets.filter(t => new Date(t.created_at) >= cutoff);

  const statusData = useMemo(() =>
    Object.entries(STATUS_CONFIG).map(([key, val]) => ({
      name: val.label,
      value: filtered.filter(t => t.status === key).length,
    })).filter(d => d.value > 0),
  [filtered]);

  const categoryData = useMemo(() =>
    CATEGORIES.map(c => ({
      name: c,
      count: filtered.filter(t => t.category === c).length,
    })).filter(d => d.count > 0),
  [filtered]);

  const priorityData = useMemo(() =>
    Object.entries(PRIORITY_CONFIG).map(([key, val]) => ({
      name: val.label,
      value: filtered.filter(t => t.priority === key).length,
    })).filter(d => d.value > 0),
  [filtered]);

  const totalOpen = filtered.filter(t => !['CLOSED', 'RESOLVED', 'CANCELED'].includes(t.status)).length;
  const totalClosed = filtered.filter(t => ['CLOSED', 'RESOLVED'].includes(t.status)).length;

  const avgResolution = useMemo(() => {
    const resolved = filtered.filter(t => t.resolved_at);
    if (resolved.length === 0) return 0;
    const total = resolved.reduce((sum, t) => {
      return sum + (new Date(t.resolved_at!).getTime() - new Date(t.created_at).getTime());
    }, 0);
    return Math.round(total / resolved.length / (1000 * 60 * 60));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Ticket metrics and analytics</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center">
          <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{filtered.length}</p>
          <p className="text-xs text-muted-foreground">Total Tickets</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-1" />
          <p className="text-2xl font-bold">{totalOpen}</p>
          <p className="text-xs text-muted-foreground">Open Backlog</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
          <p className="text-2xl font-bold">{totalClosed}</p>
          <p className="text-xs text-muted-foreground">Resolved</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Clock className="h-5 w-5 text-accent mx-auto mb-1" />
          <p className="text-2xl font-bold">{avgResolution}h</p>
          <p className="text-xs text-muted-foreground">Avg Resolution</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Users className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{users.filter(u => u.role !== 'end_user').length}</p>
          <p className="text-xs text-muted-foreground">Agents</p>
        </CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Tickets by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(220, 72%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Status Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Tickets by Priority</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Assignee Workload</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={users.filter(u => u.role !== 'end_user').map(u => ({
                name: u.name.split(' ')[0],
                open: filtered.filter(t => t.assignee_id === u.id && !['CLOSED', 'RESOLVED'].includes(t.status)).length,
                closed: filtered.filter(t => t.assignee_id === u.id && ['CLOSED', 'RESOLVED'].includes(t.status)).length,
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="open" fill="#f59e0b" name="Open" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closed" fill="#10b981" name="Closed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
