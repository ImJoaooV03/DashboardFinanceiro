/*
  # Create Transactions Table

  ## Query Description:
  Cria a tabela de transações para armazenar dados financeiros.
  Nota: Para este protótipo, habilitamos acesso público para facilitar o teste sem autenticação.
  Em produção, você deve habilitar RLS e vincular a auth.users.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Table: transactions
  - Columns: id, description, amount, type, category, date, profile, created_at
*/

create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  description text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  date timestamp with time zone not null,
  profile text not null check (profile in ('personal', 'business'))
);

-- Habilitar RLS (Row Level Security)
alter table public.transactions enable row level security;

-- Criar política para permitir acesso total (leitura/escrita) publicamente para demonstração
-- AVISO: Em um app real, use "auth.uid() = user_id"
create policy "Enable access to all users"
on public.transactions
for all
using (true)
with check (true);
