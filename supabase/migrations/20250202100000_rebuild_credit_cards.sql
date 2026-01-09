/*
  # Rebuild Credit Card System
  
  1. New Tables
    - `credit_cards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `limit_amount` (numeric)
      - `closing_day` (integer)
      - `due_day` (integer)
      - `color` (text)
      - `created_at` (timestamp)

  2. Changes to Transactions
    - Add `card_id` (uuid, foreign key)
    - Add `installment_number` (integer)
    - Add `total_installments` (integer)
    - Add `invoice_date` (date) - Critical for filtering invoices
*/

-- Create Credit Cards table
CREATE TABLE IF NOT EXISTS public.credit_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  limit_amount numeric DEFAULT 0,
  closing_day integer NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
  due_day integer NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  color text DEFAULT '#6366f1',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own cards"
ON public.credit_cards FOR ALL
USING (auth.uid() = user_id);

-- Update Transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS card_id uuid REFERENCES public.credit_cards(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS installment_number integer,
ADD COLUMN IF NOT EXISTS total_installments integer,
ADD COLUMN IF NOT EXISTS invoice_date date;

-- Index for faster queries on invoices
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_date ON public.transactions(invoice_date);
CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON public.transactions(card_id);
