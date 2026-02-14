import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Ticket, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email is required'); return; }
    const ok = login(email, '');
    if (ok) navigate('/');
    else setError('User not found. Try: alice@company.com, bob@company.com, carol@company.com, dave@company.com');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Ticket className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">HelpDesk Pro</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your support tickets</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Enter your company email to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" defaultValue="demo" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Sign In</Button>
            </form>
          </CardContent>
        </Card>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <Shield className="h-4 w-4 text-primary" /> Demo Accounts
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p><strong>Admin:</strong> alice@company.com</p>
            <p><strong>Technician:</strong> bob@company.com</p>
            <p><strong>End User:</strong> carol@company.com / dave@company.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
