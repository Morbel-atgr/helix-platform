import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useVerticals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['verticals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verticals')
        .select('*')
        .eq('user_id', user!.id)
        .eq('archived', false)
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateVertical() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color?: string }) => {
      // Get max order
      const { data: existing } = await supabase
        .from('verticals')
        .select('order_index')
        .eq('user_id', user!.id)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrder = (existing?.[0]?.order_index ?? -1) + 1;

      const { data, error } = await supabase
        .from('verticals')
        .insert({ user_id: user!.id, name, color, order_index: nextOrder })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['verticals'] }),
  });
}

export function useUpdateVertical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; color?: string; archived?: boolean; order_index?: number }) => {
      const { data, error } = await supabase
        .from('verticals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['verticals'] }),
  });
}
