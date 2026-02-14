import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck } from 'lucide-react';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(getNotifications(user?.id || ''));

  const refresh = () => setNotifications(getNotifications(user?.id || ''));

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    refresh();
  };

  const handleMarkAll = () => {
    markAllNotificationsRead(user?.id || '');
    refresh();
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6" /> Notifications</h1>
          <p className="text-muted-foreground">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark All Read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map(n => (
          <Card key={n.id} className={n.read ? 'opacity-60' : ''}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 min-w-0">
                {!n.read && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {n.ticket_id && (
                  <Link to={`/tickets/${n.ticket_id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                )}
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && <p className="text-center py-12 text-muted-foreground">No notifications yet</p>}
      </div>
    </div>
  );
};

export default NotificationCenter;
