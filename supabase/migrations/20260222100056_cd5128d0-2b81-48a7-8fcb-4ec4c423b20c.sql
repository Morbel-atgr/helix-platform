
-- Create task_notes table
CREATE TABLE public.task_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies: access via task -> block -> vertical -> user
CREATE POLICY "Users can view own task notes"
ON public.task_notes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM tasks t
  JOIN blocks b ON b.id = t.block_id
  JOIN verticals v ON v.id = b.vertical_id
  WHERE t.id = task_notes.task_id AND v.user_id = auth.uid()
));

CREATE POLICY "Users can insert own task notes"
ON public.task_notes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM tasks t
  JOIN blocks b ON b.id = t.block_id
  JOIN verticals v ON v.id = b.vertical_id
  WHERE t.id = task_notes.task_id AND v.user_id = auth.uid()
));

CREATE POLICY "Users can update own task notes"
ON public.task_notes FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM tasks t
  JOIN blocks b ON b.id = t.block_id
  JOIN verticals v ON v.id = b.vertical_id
  WHERE t.id = task_notes.task_id AND v.user_id = auth.uid()
));

CREATE POLICY "Users can delete own task notes"
ON public.task_notes FOR DELETE
USING (EXISTS (
  SELECT 1 FROM tasks t
  JOIN blocks b ON b.id = t.block_id
  JOIN verticals v ON v.id = b.vertical_id
  WHERE t.id = task_notes.task_id AND v.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_task_notes_updated_at
BEFORE UPDATE ON public.task_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
