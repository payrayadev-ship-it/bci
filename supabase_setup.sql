-- =========================================================
-- BCI (Business Connect Indonesia) - Supabase SQL Schema & Auth
-- Jalankan skrip ini di SQL Editor di Dashboard Supabase Anda
-- =========================================================

-- 1. Buat Tabel Profiles (Tabel Pengguna Ekosistem BCI)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Member', -- 'Super Admin', 'Admin', 'Moderator', 'Perusahaan', 'Investor', 'Supplier', 'Vendor', 'Member'
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
  company_id TEXT,
  membership TEXT DEFAULT 'Gratis', -- 'Gratis', 'Premium', 'Enterprise'
  phone TEXT,
  position TEXT,
  language TEXT DEFAULT 'id',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Kebijakan Keamanan (RLS Policies)
-- Izinkan semua orang membaca profil pengguna
CREATE POLICY "Profil dapat dibaca oleh publik" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Izinkan pengguna memperbarui profilnya sendiri
CREATE POLICY "Pengguna dapat memperbarui profil sendiri" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Izinkan pengguna menyisipkan profil sendiri
CREATE POLICY "Pengguna dapat membuat profil sendiri" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 3. Trigger Otomatis Pembuatan Profil saat Register via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, avatar, membership)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Member'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120'),
    'Gratis'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger pada tabel auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Tabel Log Sesi Login Pengguna (Opsional)
CREATE TABLE IF NOT EXISTS public.login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User dapat membaca log login sendiri" 
  ON public.login_logs FOR SELECT 
  USING (auth.uid() = user_id);

-- Hak Akses Publik
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
