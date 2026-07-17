-- Create exchange_balances table
CREATE TABLE IF NOT EXISTS public.exchange_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    exchange_name TEXT NOT NULL,
    balance NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_exchange UNIQUE (user_id, exchange_name)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.exchange_balances ENABLE ROW LEVEL SECURITY;

-- Create Policies for exchange_balances
CREATE POLICY "Users can manage their own exchange balances"
    ON public.exchange_balances
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
