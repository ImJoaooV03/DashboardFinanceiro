/*
  # Remove Credit Card System
  
  1. Drop Table
     - Drop `credit_cards` table
  
  2. Alter Table `transactions`
     - Remove columns: `credit_card_id`, `installment_number`, `total_installments`
*/

-- Remove columns from transactions first to avoid dependency issues
ALTER TABLE transactions 
DROP COLUMN IF EXISTS credit_card_id,
DROP COLUMN IF EXISTS installment_number,
DROP COLUMN IF EXISTS total_installments;

-- Drop the credit cards table
DROP TABLE IF EXISTS credit_cards;
