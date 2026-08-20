import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      const msg = /pwned|weak|easy to guess/i.test(error.message)
        ? 'This password has appeared in a public data breach, so it is easy to guess. Try adding a couple of extra words or characters.'
        : error.message;
      toast.error(msg);
    } else {
      toast.success('Password updated successfully!');
      navigate('/');
    }

    setLoading(false);
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 auth-gradient-bg">
        <div className="w-full max-w-sm">
          <div className="glass-card p-8 space-y-6 text-center">
            <h1 className="iridescent-text -mb-3" style={{ fontFamily: "'Bumbbled', cursive", fontSize: '3.5rem', fontWeight: 'bold' }}>Helix</h1>
            <p className="text-muted-foreground text-sm">Loading recovery session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 auth-gradient-bg">
      <div className="w-full max-w-sm">
        <div className="glass-card p-8 space-y-6">
          <div className="text-center space-y-3">
            <h1 className="iridescent-text -mb-3" style={{ fontFamily: "'Bumbbled', cursive", fontSize: '3.5rem', fontWeight: 'bold' }}>Helix</h1>
            <p className="text-muted-foreground text-sm">Set your new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" required minLength={6} />
              <p className="text-xs text-muted-foreground">At least 6 characters. Avoid passwords you've used on other sites.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" required minLength={6} />
            </div>

            <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
