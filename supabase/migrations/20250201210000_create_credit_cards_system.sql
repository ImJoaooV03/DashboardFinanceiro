/*
  # Create Credit Cards System
  
  1. New Tables
    - `credit_cards`
      - `id` (uuid, primary key)
      - `name` (text)
      - `limit_amount` (decimal)
      - `closing_day` (integer) - Dia que a fatura fecha
      - `due_day` (integer) - Dia que a fatura vence
      - `color` (text)
      - `user_id` (uuid)
      - `created_at` (timestamp)

  2. Alter Tables
    - Add columns to `transactions` if they don't exist (safe check)
*/

create table if not exists public.credit_cards (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  limit_amount decimal(12,2) not null default 0,
  closing_day integer not null check (closing_day between 1 and 31),
  due_day integer not null check (due_day between 1 and 31),
  color text,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS
alter table public.credit_cards enable row level security;

create policy "Users can view own cards"
  on public.credit_cards for select
  using (auth.uid() = user_id);

create policy "Users can insert own cards"
  on public.credit_cards for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cards"
  on public.credit_cards for update
  using (auth.uid() = user_id);

create policy "Users can delete own cards"
  on public.credit_cards for delete
  using (auth.uid() = user_id);

-- Ensure transactions table has necessary columns
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'card_id') then
    alter table public.transactions add column card_id uuid references public.credit_cards(id) on delete set null;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'installment_number') then
    alter table public.transactions add column installment_number integer;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'total_installments') then
    alter table public.transactions add column total_installments integer;
  end if;
end $$;
