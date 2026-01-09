/*
  # Sistema de Cartão de Crédito
  
  1. Nova Tabela: credit_cards
     - Armazena configurações do cartão (dia fechamento, vencimento, limite)
  
  2. Alterações em Transactions
     - Adiciona colunas para vincular ao cartão e controlar parcelas
*/

-- Create Credit Cards table
CREATE TABLE IF NOT EXISTS public.credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  closing_day INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  limit_amount DECIMAL(12,2),
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own cards" ON public.credit_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON public.credit_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON public.credit_cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON public.credit_cards
  FOR DELETE USING (auth.uid() = user_id);

-- Update Transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS installment_number INTEGER, -- Qual parcela é essa (ex: 1)
ADD COLUMN IF NOT EXISTS total_installments INTEGER; -- Total de parcelas (ex: 10)

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_card ON public.transactions(credit_card_id);
