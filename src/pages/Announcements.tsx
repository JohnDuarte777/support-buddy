import { getAnnouncements } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone } from 'lucide-react';

const Announcements = () => {
  const announcements = getAnnouncements();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="h-6 w-6" /> Announcements</h1>
        <p className="text-muted-foreground">Stay informed about important updates</p>
      </div>

      <div className="space-y-4">
        {announcements.map(a => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{a.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{a.target === 'all' ? 'Everyone' : a.target}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{a.content}</p>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && <p className="text-center py-12 text-muted-foreground">No announcements</p>}
      </div>
    </div>
  );
};

export default Announcements;
