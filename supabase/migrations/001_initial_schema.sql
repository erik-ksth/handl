-- =============================================
-- Handl Database Schema Migration
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE task_status AS ENUM ('draft', 'in_progress', 'completed', 'cancelled');
CREATE TYPE call_type AS ENUM ('call_businesses', 'call_specific_number');
CREATE TYPE preferred_criteria AS ENUM ('cheapest', 'fastest', 'nearest', 'best_rated');
CREATE TYPE message_role AS ENUM ('user', 'assistant');
CREATE TYPE call_status AS ENUM ('queued', 'calling', 'in_progress', 'completed', 'failed');

-- =============================================
-- TABLES
-- =============================================

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT,
    status task_status DEFAULT 'draft',
    call_type call_type,
    service TEXT,
    service_details TEXT,
    location TEXT,
    budget TEXT,
    time_constraints TEXT,
    preferred_criteria preferred_criteria,
    call_objective TEXT,
    questions_to_ask TEXT[],
    additional_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calls table
CREATE TABLE public.calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    vapi_call_id TEXT UNIQUE,
    phone_number TEXT NOT NULL,
    business_name TEXT,
    status call_status DEFAULT 'queued',
    transcript TEXT,
    recording_url TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    ended_reason TEXT,
    cost DECIMAL(10, 4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call Analyses table
CREATE TABLE public.call_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
    summary TEXT,
    price TEXT,
    has_new_questions BOOLEAN DEFAULT FALSE,
    new_questions JSONB,
    insights TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX idx_messages_task_id ON public.messages(task_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_calls_task_id ON public.calls(task_id);
CREATE INDEX idx_calls_vapi_call_id ON public.calls(vapi_call_id);
CREATE INDEX idx_call_analyses_call_id ON public.call_analyses(call_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_analyses ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their tasks"
    ON public.messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = messages.task_id
        AND tasks.user_id = auth.uid()
    ));

CREATE POLICY "Users can create messages in their tasks"
    ON public.messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = messages.task_id
        AND tasks.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete messages in their tasks"
    ON public.messages FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = messages.task_id
        AND tasks.user_id = auth.uid()
    ));

-- Calls policies
CREATE POLICY "Users can view calls in their tasks"
    ON public.calls FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = calls.task_id
        AND tasks.user_id = auth.uid()
    ));

CREATE POLICY "Users can create calls in their tasks"
    ON public.calls FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = calls.task_id
        AND tasks.user_id = auth.uid()
    ));

CREATE POLICY "Users can update calls in their tasks"
    ON public.calls FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = calls.task_id
        AND tasks.user_id = auth.uid()
    ));

-- Call Analyses policies
CREATE POLICY "Users can view analyses for their calls"
    ON public.call_analyses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.calls
        JOIN public.tasks ON tasks.id = calls.task_id
        WHERE calls.id = call_analyses.call_id
        AND tasks.user_id = auth.uid()
    ));

CREATE POLICY "Users can create analyses for their calls"
    ON public.call_analyses FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.calls
        JOIN public.tasks ON tasks.id = calls.task_id
        WHERE calls.id = call_analyses.call_id
        AND tasks.user_id = auth.uid()
    ));

-- =============================================
-- TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for tasks table
CREATE TRIGGER tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- =============================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- DONE!
-- =============================================
-- Run this script in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor
