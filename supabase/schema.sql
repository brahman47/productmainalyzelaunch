-- Create users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create mains evaluations table
CREATE TABLE IF NOT EXISTS public.mains_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    answer_files TEXT[] NOT NULL,
    evaluation_result JSONB,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.mains_evaluations ENABLE ROW LEVEL SECURITY;

-- Create policies for mains evaluations
CREATE POLICY "Users can view own evaluations" ON public.mains_evaluations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evaluations" ON public.mains_evaluations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create prelims sessions table
CREATE TABLE IF NOT EXISTS public.prelims_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('conceptual', 'application', 'upsc_level')) NOT NULL,
    questions JSONB NOT NULL,
    user_answers JSONB DEFAULT '{}',
    score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.prelims_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for prelims sessions
CREATE POLICY "Users can view own sessions" ON public.prelims_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.prelims_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.prelims_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create storage bucket for answer uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('answer-uploads', 'answer-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload own files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'answer-uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'answer-uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mains_evaluations_user_id ON public.mains_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_mains_evaluations_status ON public.mains_evaluations(status);
CREATE INDEX IF NOT EXISTS idx_prelims_sessions_user_id ON public.prelims_sessions(user_id);
