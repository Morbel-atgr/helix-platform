import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorField, setErrorField] = useState<'email' | 'password' | 'both' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorField(null);

    if (mode === 'forgot') {
      const { error } = await resetPassword(email);
      if (error) { toast.error(error.message); setErrorField('email'); }
      else toast.success('Check your email for a password reset link.');
    } else if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) { toast.error(error.message); setErrorField('password'); }
    } else {
      const { error } = await signUp(email, password, name);
      if (error) { toast.error(error.message); setErrorField('both'); }
      else toast.success('Check your email to confirm your account.');
    }

    setLoading(false);
  };

  const title = mode === 'forgot' ? 'Reset password' : mode === 'login' ? 'Sign in to your account' : 'Create your account';

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'hsl(210, 10%, 97%)' }}>
        <div className="relative w-full max-w-sm rounded-xl p-[2px] iridescent-border">
          <div className="glass-card p-8 space-y-6 rounded-xl">
          <div className="text-center space-y-3">
            <h1 className="iridescent-text -mb-3" style={{ fontFamily: "'Bumbbled', cursive", fontSize: '3.5rem', fontWeight: 'bold' }}>Helix</h1>
            <p className="text-muted-foreground text-sm">{title}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
              </div>
            )}

            <div className="space-y-1.5">
              <Input id="email" type="email" value={email} onChange={e => { setEmail(e.target.value); setErrorField(null); }} placeholder="Email" required className={errorField === 'email' || errorField === 'both' ? 'border-2 border-destructive ring-0 focus-visible:ring-0' : ''} />
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <Input id="password" type="password" value={password} onChange={e => { setPassword(e.target.value); setErrorField(null); }} placeholder="Password" required minLength={6} className={errorField === 'password' || errorField === 'both' ? 'border-2 border-destructive ring-0 focus-visible:ring-0' : ''} />
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button type="button" onClick={() => setMode('forgot')} className="text-sm text-muted-foreground hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'forgot' ? 'Send Reset Link' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'forgot' ? (
              <button type="button" onClick={() => setMode('login')} className="text-muted-foreground hover:underline font-medium">
                Back to sign in
              </button>
            ) : mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-muted-foreground hover:underline font-medium">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="text-muted-foreground hover:underline font-medium">
                  Sign in
                </button>
              </>
            )}
          </p>
          </div>
        </div>
    </div>
  );
}
