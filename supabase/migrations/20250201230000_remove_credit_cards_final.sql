-- Remover tabela de cartões e limpar colunas de transações
DROP TABLE IF EXISTS credit_cards CASCADE;

-- Remover colunas específicas de cartão da tabela de transações
ALTER TABLE transactions DROP COLUMN IF EXISTS card_id;
ALTER TABLE transactions DROP COLUMN IF EXISTS installment_number;
ALTER TABLE transactions DROP COLUMN IF EXISTS total_installments;
