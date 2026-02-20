import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
    } else {
      const { error } = await signUp(email, password, name);
      if (error) toast.error(error.message);
      else toast.success('Check your email to confirm your account.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'hsl(210, 10%, 97%)' }}>
      <div className="w-full max-w-sm">
        <div className="glass-card p-8 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-3">
            <h1 className="iridescent-text" style={{ fontFamily: "'Bumbbled', cursive", fontSize: '3.5rem' }}>Helix</h1>
            <p className="text-muted-foreground text-sm">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
              </div>
            )}

            <div className="space-y-1.5">
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
            </div>

            <div className="space-y-1.5">
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required minLength={6} />
            </div>

            <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
