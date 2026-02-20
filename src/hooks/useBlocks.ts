import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBlocks(verticalId: string | undefined) {
  return useQuery({
    queryKey: ['blocks', verticalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocks')
        .select('*')
        .eq('vertical_id', verticalId!)
        .eq('archived', false)
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!verticalId,
  });
}

export function useCreateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ vertical_id, name }: { vertical_id: string; name: string }) => {
      const { data: existing } = await supabase
        .from('blocks')
        .select('order_index')
        .eq('vertical_id', vertical_id)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrder = (existing?.[0]?.order_index ?? -1) + 1;

      const { data, error } = await supabase
        .from('blocks')
        .insert({ vertical_id, name, order_index: nextOrder })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks'] }),
  });
}

export function useUpdateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; archived?: boolean; order_index?: number }) => {
      const { data, error } = await supabase
        .from('blocks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks'] }),
  });
}
