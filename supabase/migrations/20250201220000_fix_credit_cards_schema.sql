/*
  # Correção e Recriação do Sistema de Cartões de Crédito
  
  1. Limpeza
     - Remove a tabela 'credit_cards' se existir (CASCADE para remover políticas e chaves estrangeiras antigas).
  
  2. Nova Tabela
     - Cria 'credit_cards' com: id, name, limit_amount, closing_day, due_day, color, user_id.
  
  3. Atualização de Transações
     - Garante que a tabela 'transactions' tenha as colunas de suporte (card_id, installment_number, total_installments).
     - Recria a chave estrangeira para apontar para a nova tabela de cartões.
     
  4. Segurança
     - Habilita RLS.
     - Recria as políticas de acesso.
*/

-- 1. Limpeza Radical: Remove a tabela antiga para evitar conflitos de política
DROP TABLE IF EXISTS public.credit_cards CASCADE;

-- 2. Criação da Tabela
CREATE TABLE public.credit_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    limit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    closing_day INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
    due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    color TEXT DEFAULT '#6366f1',
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Atualização da Tabela de Transações (Safe Alter)
DO $$
BEGIN
    -- Adiciona card_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'card_id') THEN
        ALTER TABLE public.transactions ADD COLUMN card_id UUID;
    END IF;

    -- Adiciona installment_number se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'installment_number') THEN
        ALTER TABLE public.transactions ADD COLUMN installment_number INTEGER;
    END IF;

    -- Adiciona total_installments se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'total_installments') THEN
        ALTER TABLE public.transactions ADD COLUMN total_installments INTEGER;
    END IF;

    -- Recria a constraint de chave estrangeira para garantir que aponta para a nova tabela criada acima
    -- Primeiro remove se existir (pode estar apontando para a tabela deletada ou ser inválida)
    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_card_id_fkey;
    
    -- Adiciona a constraint novamente
    ALTER TABLE public.transactions 
    ADD CONSTRAINT transactions_card_id_fkey 
    FOREIGN KEY (card_id) 
    REFERENCES public.credit_cards(id) 
    ON DELETE SET NULL;
END $$;

-- 4. Segurança (RLS)
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards" ON public.credit_cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON public.credit_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON public.credit_cards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON public.credit_cards
    FOR DELETE USING (auth.uid() = user_id);
