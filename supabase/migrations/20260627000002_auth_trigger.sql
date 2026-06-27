-- ==============================================================================
-- 002_auth_trigger.sql
-- Automatically creates a profile when a new user signs up
-- ==============================================================================

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    -- Cast the text role to the user_role ENUM safely. Default to 'customer' if null or invalid.
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'customer'::public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function every time a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
