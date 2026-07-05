-- 002_rls_policies.sql
-- Disable RLS or create open policies for prototype testing

-- Grant usage and all privileges to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Enable RLS and create open access policies for all main tables
DO $$ 
DECLARE 
    t_name text;
BEGIN
    FOR t_name IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t_name);
        
        -- Drop policy if exists to avoid errors
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS "Allow all access" ON public.%I;', t_name);
        EXCEPTION WHEN undefined_object THEN
            -- do nothing
        END;

        -- Create open policy
        EXECUTE format('CREATE POLICY "Allow all access" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t_name);
    END LOOP;
END $$;
