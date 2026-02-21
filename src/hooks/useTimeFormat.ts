import { useProfile } from './useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export type TimeFormat = '24h' | '12h';

export function useTimeFormat() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  const settings = (profile?.settings as Record<string, unknown>) || {};
  const timeFormat: TimeFormat = (settings.time_format as TimeFormat) || '24h';

  const setTimeFormat = useCallback(async (format: TimeFormat) => {
    if (!user) return;
    const newSettings = { ...settings, time_format: format };
    await supabase
      .from('profiles')
      .update({ settings: newSettings })
      .eq('user_id', user.id);
    queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
  }, [user, settings, queryClient]);

  const formatTime = useCallback((date: Date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    if (timeFormat === '12h') {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${display}:${String(m).padStart(2, '0')} ${ampm}`;
    }
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }, [timeFormat]);

  const formatHour = useCallback((h: number) => {
    if (timeFormat === '12h') {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${display}:00 ${ampm}`;
    }
    return `${String(h).padStart(2, '0')}:00`;
  }, [timeFormat]);

  return { timeFormat, setTimeFormat, formatTime, formatHour };
}
