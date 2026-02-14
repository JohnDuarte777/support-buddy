import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { getNotifications } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home, LayoutDashboard, BookOpen, Megaphone, Bell,
  Ticket, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Home', icon: Home, roles: ['end_user', 'technician', 'admin'] },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['technician', 'admin'] },
  { path: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen, roles: ['end_user', 'technician', 'admin'] },
  { path: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['end_user', 'technician', 'admin'] },
  { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['end_user', 'technician', 'admin'] },
];

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const notifications = getNotifications(user?.id || '');
  const unread = notifications.filter(n => !n.read).length;

  const filtered = navItems.filter(n => n.roles.includes(user?.role || ''));

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-60 flex-col border-r bg-card">
        <div className="flex items-center gap-2 p-4 border-b">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Ticket className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">HelpDesk Pro</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {filtered.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.path === '/notifications' && unread > 0 && (
                  <Badge className="ml-auto text-xs h-5 w-5 flex items-center justify-center p-0">{unread}</Badge>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between p-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <span className="font-bold">HelpDesk Pro</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unread > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">{unread}</span>}
              </Button>
            </Link>
          </div>
        </header>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden border-b bg-card p-3 space-y-1">
            {filtered.map(item => (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  location.pathname === item.path ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                }`}>
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ))}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-muted-foreground">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
