import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

export default function Auth() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin
    });
    if (error) toast.error(error.message || 'Google sign-in failed');
    setGoogleLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'forgot') {
      const { error } = await resetPassword(email);
      if (error) toast.error(error.message);else
      toast.success('Check your email for a password reset link.');
    } else if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
    } else {
      // Check if email already exists before attempting signup
      try {
        const { data } = await supabase.functions.invoke('check-email-exists', {
          body: { email }
        });
        if (data?.exists) {
          toast.error('An account with this email already exists.');
          setLoading(false);
          return;
        }
      } catch {















        // If check fails, proceed with signup anyway
      }const { error } = await signUp(email, password, name);if (error) toast.error(error.message);else toast.success('Check your email to confirm your account.');}setLoading(false);};const title = mode === 'forgot' ? 'Reset password' : mode === 'login' ? 'Sign in to your account' : 'Create your account';return <div className="min-h-screen flex items-center justify-center px-4 auth-gradient-bg">
        <div className="w-full max-w-sm flex flex-col items-center text-4xl">
          <h1 className="iridescent-text mb-4 text-5xl pr-[6px] pt-0" style={{ fontFamily: "'Bumbbled', cursive", fontSize: '3.5rem', fontWeight: 100 }}>Helix</h1>
          <div className="w-full glass-card p-8 space-y-6 rounded-xl">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">{title}</p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
              </div>}

            <div className="space-y-1.5">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            </div>

            {mode !== 'forgot' && <div className="space-y-1.5">
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} />
              </div>
          }

            {mode === 'login' &&
          <div className="text-right">
                <button type="button" onClick={() => setMode('forgot')} className="text-sm text-muted-foreground hover:underline">
                  Forgot password?
                </button>
              </div>
          }

            <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'forgot' ? 'Send Reset Link' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          {mode !== 'forgot' &&
        <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}>

                {googleLoading ?
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :

            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
            }
                Log in with Google
              </Button>
            </>
        }

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'forgot' ?
          <button type="button" onClick={() => setMode('login')} className="text-muted-foreground hover:underline font-medium">
                Back to sign in
              </button> :
          mode === 'login' ?
          <>
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-muted-foreground hover:underline font-medium">
                  Sign up
                </button>
              </> :

          <>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="text-muted-foreground hover:underline font-medium">
                  Sign in
                </button>
              </>
          }
          </p>
          </div>
      </div>
    </div>;

}