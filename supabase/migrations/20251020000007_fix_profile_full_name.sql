-- Update the handle_new_user function to also copy full_name from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles with full_name from auth.users metadata
UPDATE public.profiles p
SET full_name = COALESCE(u.raw_user_meta_data->>'full_name', p.full_name)
FROM auth.users u
WHERE p.id = u.id
AND p.full_name IS NULL
AND u.raw_user_meta_data->>'full_name' IS NOT NULL;
