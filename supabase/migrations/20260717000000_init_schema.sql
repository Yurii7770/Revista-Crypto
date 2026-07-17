-- 1. Create futures_trades table
CREATE TABLE IF NOT EXISTS public.futures_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    token_name TEXT NOT NULL,
    position_size NUMERIC NOT NULL,
    exchange TEXT NOT NULL,
    rationale TEXT,
    direction TEXT NOT NULL CHECK (direction IN ('Long', 'Short')),
    outcome TEXT NOT NULL CHECK (outcome IN ('Take Profit', 'Stop Loss')),
    pnl NUMERIC NOT NULL,
    date_opened TIMESTAMP WITH TIME ZONE NOT NULL,
    date_closed TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_dates CHECK (date_closed >= date_opened)
);

-- 2. Create other_activities table
CREATE TABLE IF NOT EXISTS public.other_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    activity_name TEXT NOT NULL,
    exchange_platform TEXT NOT NULL,
    pnl NUMERIC NOT NULL,
    rationale TEXT,
    activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.futures_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.other_activities ENABLE ROW LEVEL SECURITY;

-- Create Policies for futures_trades
CREATE POLICY "Users can perform all operations on their own futures_trades"
    ON public.futures_trades
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create Policies for other_activities
CREATE POLICY "Users can perform all operations on their own other_activities"
    ON public.other_activities
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
