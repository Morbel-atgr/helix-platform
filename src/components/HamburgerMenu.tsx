import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Menu, Moon, Sun, User, LogOut, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function HamburgerMenu() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState('');

  const handleEditName = () => {
    setName(profile?.name || '');
    setEditingName(true);
  };

  const handleSaveName = async () => {
    if (!name.trim() || !user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim() })
      .eq('user_id', user.id);
    if (error) toast.error('Failed to update name');
    else {
      toast.success('Name updated');
      setEditingName(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-card border-border">
        <SheetHeader>
          <SheetTitle className="text-left text-foreground">Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Theme Toggle */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appearance</h3>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
                <span className="text-sm font-medium text-foreground">
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </span>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </div>

          <Separator />

          {/* User Settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3 py-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleSaveName} className="h-8 text-xs">Save</Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground truncate">{profile?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </>
                  )}
                </div>
              </div>

              {!editingName && (
                <Button variant="ghost" size="sm" onClick={handleEditName} className="w-full justify-start text-sm text-muted-foreground">
                  <Settings className="h-4 w-4 mr-2" /> Edit profile name
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Timezone */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preferences</h3>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Timezone</Label>
              <p className="text-sm text-foreground">{profile?.timezone || 'UTC'}</p>
            </div>
          </div>

          <Separator />

          {/* Sign Out */}
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => { signOut(); setOpen(false); }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
