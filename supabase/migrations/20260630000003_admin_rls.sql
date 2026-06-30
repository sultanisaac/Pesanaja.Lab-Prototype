-- 20260630000003_admin_rls.sql

-- Enable RLS on profiles and addresses if not already
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS Policies
-- Allow anyone to view profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
    END IF;
END
$$;

-- Allow users to insert their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END
$$;

-- Allow users to update their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END
$$;

-- Allow admins to update any profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can update any profile'
    ) THEN
        CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        );
    END IF;
END
$$;


-- 2. Addresses RLS Policies
-- Allow anyone to view addresses
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'addresses' AND policyname = 'Addresses are viewable by everyone'
    ) THEN
        CREATE POLICY "Addresses are viewable by everyone" ON public.addresses FOR SELECT USING (true);
    END IF;
END
$$;

-- Allow users to insert their own address
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'addresses' AND policyname = 'Users can insert their own address'
    ) THEN
        CREATE POLICY "Users can insert their own address" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Allow users to update their own address
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'addresses' AND policyname = 'Users can update their own address'
    ) THEN
        CREATE POLICY "Users can update their own address" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Allow users to delete their own address
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'addresses' AND policyname = 'Users can delete their own address'
    ) THEN
        CREATE POLICY "Users can delete their own address" ON public.addresses FOR DELETE USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Allow admins to manage any address
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'addresses' AND policyname = 'Admins can manage any address'
    ) THEN
        CREATE POLICY "Admins can manage any address" ON public.addresses FOR ALL USING (
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        );
    END IF;
END
$$;
