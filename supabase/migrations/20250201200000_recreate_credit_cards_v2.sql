/*
  # Recriação do Sistema de Cartões de Crédito (V2)
  
  1. Nova Tabela: credit_cards
  2. Alteração em transactions para suportar vínculo com cartão e parcelas
*/

-- Criar tabela de cartões
CREATE TABLE IF NOT EXISTS public.credit_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    limit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    closing_day INTEGER NOT NULL, -- Dia que fecha a fatura
    due_day INTEGER NOT NULL,     -- Dia que vence a fatura
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar colunas na tabela de transações existente
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS installment_number INTEGER, -- Qual é esta parcela (ex: 1)
ADD COLUMN IF NOT EXISTS total_installments INTEGER; -- Total de parcelas (ex: 10)

-- Políticas de Segurança (RLS) para Cartões
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards" ON public.credit_cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON public.credit_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON public.credit_cards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON public.credit_cards
    FOR DELETE USING (auth.uid() = user_id);
