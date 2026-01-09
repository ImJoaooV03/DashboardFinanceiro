/*
  # Fix Categories Table
  
  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - 'income' or 'expense'
      - `color` (text)
      - `icon` (text)
      - `profile` (text) - 'personal' or 'business'
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `categories` table
    - Add policy for public access (since no auth is currently active in the context provided)
    
  3. Initial Data
    - Seed default categories for Personal and Business profiles
*/

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT NOT NULL,
  icon TEXT,
  profile TEXT NOT NULL CHECK (profile IN ('personal', 'business')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create Policy (Permissive for development as per previous context)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.categories;
CREATE POLICY "Enable insert access for all users" ON public.categories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON public.categories;
CREATE POLICY "Enable update access for all users" ON public.categories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON public.categories;
CREATE POLICY "Enable delete access for all users" ON public.categories FOR DELETE USING (true);

-- Seed Data (Only if table is empty to avoid duplicates)
-- Personal Categories
INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Salário', 'income', '#10b981', 'wallet', 'personal'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Salário' AND profile = 'personal');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Freelance', 'income', '#3b82f6', 'laptop', 'personal'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Freelance' AND profile = 'personal');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Investimentos', 'income', '#8b5cf6', 'trending-up', 'personal'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Investimentos' AND profile = 'personal');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Alimentação', 'expense', '#f59e0b', 'utensils', 'personal'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Alimentação' AND profile = 'personal');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Transporte', 'expense', '#ef4444', 'car', 'personal'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Transporte' AND profile = 'personal');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Moradia', 'expense', '#6366f1', 'home', 'personal'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Moradia' AND profile = 'personal');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Lazer', 'expense', '#ec4899', 'gamepad-2', 'personal'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Lazer' AND profile = 'personal');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Saúde', 'expense', '#14b8a6', 'heart-pulse', 'personal'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Saúde' AND profile = 'personal');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Educação', 'expense', '#f97316', 'graduation-cap', 'personal'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Educação' AND profile = 'personal');

-- Business Categories
INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Vendas', 'income', '#10b981', 'shopping-cart', 'business'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Vendas' AND profile = 'business');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Serviços', 'income', '#3b82f6', 'briefcase', 'business'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Serviços' AND profile = 'business');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Fornecedores', 'expense', '#ef4444', 'truck', 'business'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Fornecedores' AND profile = 'business');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Marketing', 'expense', '#8b5cf6', 'megaphone', 'business'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Marketing' AND profile = 'business');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Impostos', 'expense', '#f59e0b', 'file-text', 'business'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Impostos' AND profile = 'business');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Operacional', 'expense', '#64748b', 'settings', 'business'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Operacional' AND profile = 'business');

INSERT INTO public.categories (name, type, color, icon, profile)
SELECT 'Folha de Pagamento', 'expense', '#f43f5e', 'users', 'business'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Folha de Pagamento' AND profile = 'business');
