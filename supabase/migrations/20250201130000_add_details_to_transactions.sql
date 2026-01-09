/*
  # Add Status and Payment Method to Transactions
  Adds columns to track transaction status (pending/completed) and payment method.

  ## Query Description:
  This migration adds 'status' and 'payment_method' columns to the existing 'transactions' table.
  It sets default values to ensure existing data remains valid.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Table: public.transactions
  - New Column: status (text) - check constraint for 'pending' or 'completed'
  - New Column: payment_method (text)
*/

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed')),
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'pix';

-- Update existing rows to have consistent data if needed (defaults handle this, but being explicit)
UPDATE public.transactions SET status = 'completed' WHERE status IS NULL;
UPDATE public.transactions SET payment_method = 'pix' WHERE payment_method IS NULL;
