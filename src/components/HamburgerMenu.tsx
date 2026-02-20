import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { useVerticals, useUpdateVertical } from '@/hooks/useVerticals';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Menu, Moon, Sun, User, LogOut, Settings, ChevronDown, Trash2, HelpCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useQueryClient } from '@tanstack/react-query';

const COLORS = ['#2dd4bf', '#f472b6', '#fb923c', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];

interface HamburgerMenuProps {
  onSelectVertical?: (id: string) => void;
  onNavigate?: (page: string) => void;
}

export function HamburgerMenu({ onSelectVertical, onNavigate }: HamburgerMenuProps) {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const { data: verticals = [] } = useVerticals();
  const updateVertical = useUpdateVertical();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState('');
  const [verticalsOpen, setVerticalsOpen] = useState(true);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);

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

  const handleDeleteVertical = async (id: string) => {
    const { error } = await supabase.from('verticals').delete().eq('id', id);
    if (error) toast.error('Failed to delete vertical');
    else {
      toast.success('Vertical deleted');
      queryClient.invalidateQueries({ queryKey: ['verticals'] });
    }
  };

  const handleColorChange = (verticalId: string, color: string) => {
    updateVertical.mutate({ id: verticalId, color });
    setEditingColorId(null);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-card border-border">
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
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </div>

          <Separator />

          {/* Verticals */}
          <Collapsible open={verticalsOpen} onOpenChange={setVerticalsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verticals</h3>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${verticalsOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1">
              {verticals.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No verticals yet.</p>
              ) : (
                verticals.map(v => (
                  <div key={v.id} className="space-y-1">
                    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 group">
                      <button
                        className="w-3 h-3 rounded-full flex-shrink-0 border border-border hover:scale-125 transition-transform"
                        style={{ backgroundColor: v.color || 'hsl(var(--primary))' }}
                        onClick={() => setEditingColorId(editingColorId === v.id ? null : v.id)}
                        title="Change color"
                      />
                      <button
                        className="flex-1 text-left text-sm text-foreground truncate"
                        onClick={() => { onSelectVertical?.(v.id); setOpen(false); }}
                      >
                        {v.name}
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{v.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this vertical and all its blocks and tasks. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteVertical(v.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    {editingColorId === v.id && (
                      <div className="flex gap-1.5 px-2 pb-1">
                        {COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => handleColorChange(v.id, c)}
                            className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                            style={{ backgroundColor: c, borderColor: v.color === c ? 'hsl(var(--foreground))' : 'transparent' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Account */}
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

          {/* Preferences */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preferences</h3>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Timezone</Label>
              <p className="text-sm text-foreground">{profile?.timezone || 'UTC'}</p>
            </div>
          </div>

          <Separator />

          {/* Links */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-muted-foreground"
              onClick={() => { onNavigate?.('how-it-works'); setOpen(false); }}
            >
              <HelpCircle className="h-4 w-4 mr-2" /> How Health Scoring Works
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-muted-foreground"
              onClick={() => { onNavigate?.('about'); setOpen(false); }}
            >
              <Info className="h-4 w-4 mr-2" /> About
            </Button>
          </div>

          <Separator />

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
