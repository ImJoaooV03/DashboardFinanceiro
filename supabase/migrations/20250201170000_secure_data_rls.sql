/*
  # Secure Data with Row Level Security (RLS)

  ## Query Description:
  This migration adds ownership to transactions and categories, ensuring users only see their own data.
  It also handles "System Categories" (shared defaults) vs "User Categories" (private).

  ## Metadata:
  - Schema-Category: "Security"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Add user_id column to transactions and categories
  - Enable RLS on both tables
  - Create policies for CRUD operations
*/

-- 1. Adicionar coluna user_id referenciando a tabela de auth.users
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para TRANSAÇÕES (Totalmente Privadas)
-- Usuários só podem ver suas próprias transações
CREATE POLICY "Users can view own transactions" ON transactions
FOR SELECT USING (auth.uid() = user_id);

-- Usuários só podem inserir transações para si mesmos
CREATE POLICY "Users can insert own transactions" ON transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários só podem atualizar suas próprias transações
CREATE POLICY "Users can update own transactions" ON transactions
FOR UPDATE USING (auth.uid() = user_id);

-- Usuários só podem deletar suas próprias transações
CREATE POLICY "Users can delete own transactions" ON transactions
FOR DELETE USING (auth.uid() = user_id);

-- 4. Políticas para CATEGORIAS (Híbridas: Sistema + Usuário)
-- Usuários podem ver categorias do sistema (user_id IS NULL) E suas próprias
CREATE POLICY "Users can view system and own categories" ON categories
FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

-- Usuários só podem criar categorias para si mesmos
CREATE POLICY "Users can insert own categories" ON categories
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários só podem deletar suas próprias categorias (NÃO as do sistema)
CREATE POLICY "Users can delete own categories" ON categories
FOR DELETE USING (auth.uid() = user_id);

-- Opcional: Limpar dados órfãos antigos para evitar confusão (já que não têm dono)
-- DELETE FROM transactions WHERE user_id IS NULL;
