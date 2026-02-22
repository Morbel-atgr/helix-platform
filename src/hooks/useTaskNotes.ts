import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTaskNotes(taskId: string | undefined) {
  return useQuery({
    queryKey: ['task-notes', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_notes')
        .select('*')
        .eq('task_id', taskId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!taskId,
  });
}

export function useCreateTaskNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ task_id, content }: { task_id: string; content: string }) => {
      const { data, error } = await supabase
        .from('task_notes')
        .insert({ task_id, content })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ['task-notes', data.task_id] }),
  });
}

export function useUpdateTaskNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content, task_id }: { id: string; content: string; task_id: string }) => {
      const { data, error } = await supabase
        .from('task_notes')
        .update({ content })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { ...data, task_id };
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ['task-notes', data.task_id] }),
  });
}

export function useDeleteTaskNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, task_id }: { id: string; task_id: string }) => {
      const { error } = await supabase.from('task_notes').delete().eq('id', id);
      if (error) throw error;
      return { task_id };
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ['task-notes', data.task_id] }),
  });
}
