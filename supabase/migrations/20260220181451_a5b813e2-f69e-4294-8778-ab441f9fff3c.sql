
-- Create task status enum
CREATE TYPE public.task_status AS ENUM ('active', 'done');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  timezone TEXT DEFAULT 'UTC',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verticals table
CREATE TABLE public.verticals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verticals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verticals" ON public.verticals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own verticals" ON public.verticals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own verticals" ON public.verticals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own verticals" ON public.verticals FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_verticals_user ON public.verticals(user_id);

-- Blocks table
CREATE TABLE public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id UUID REFERENCES public.verticals(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks" ON public.blocks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.verticals WHERE id = blocks.vertical_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own blocks" ON public.blocks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.verticals WHERE id = blocks.vertical_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own blocks" ON public.blocks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.verticals WHERE id = blocks.vertical_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own blocks" ON public.blocks FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.verticals WHERE id = blocks.vertical_id AND user_id = auth.uid()));

CREATE INDEX idx_blocks_vertical ON public.blocks(vertical_id);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES public.blocks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  importance_weight INTEGER NOT NULL DEFAULT 5,
  status public.task_status NOT NULL DEFAULT 'active',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.blocks b
    JOIN public.verticals v ON v.id = b.vertical_id
    WHERE b.id = tasks.block_id AND v.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.blocks b
    JOIN public.verticals v ON v.id = b.vertical_id
    WHERE b.id = tasks.block_id AND v.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.blocks b
    JOIN public.verticals v ON v.id = b.vertical_id
    WHERE b.id = tasks.block_id AND v.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.blocks b
    JOIN public.verticals v ON v.id = b.vertical_id
    WHERE b.id = tasks.block_id AND v.user_id = auth.uid()
  ));

CREATE INDEX idx_tasks_block ON public.tasks(block_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_status ON public.tasks(status);

-- Updated_at trigger for tasks
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
