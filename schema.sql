-- ============================================================
--  Rose Property Solutions — Expense Tracker  |  Database schema
--  HOW TO USE:
--    1. Open your project at https://supabase.com/dashboard
--    2. Left sidebar → SQL Editor → "New query"
--    3. Paste this ENTIRE file in and click "Run"
--  Safe to run once on a fresh project.
-- ============================================================

-- 1. CATEGORIES --------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  icon        text not null default 'tag',
  position    integer not null default 0,          -- drives the cohesive auto-color
  created_at  timestamptz not null default now()
);
create index categories_user_idx on public.categories(user_id);

-- 2. EXPENSES ----------------------------------------------------
create table public.expenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  category_id  uuid references public.categories(id) on delete set null,  -- null = "Uncategorized"
  amount       numeric(12,2) not null check (amount >= 0),
  description  text not null,
  expense_date date not null,
  is_recurring boolean not null default false,
  receipt_path text,                                -- path of the file in Storage
  created_at   timestamptz not null default now()
);
create index expenses_user_date_idx on public.expenses(user_id, expense_date);

-- 3. ROW LEVEL SECURITY  (each account only ever sees its own data)
alter table public.categories enable row level security;
alter table public.expenses  enable row level security;

create policy "own categories" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own expenses" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. SEED THE 20 DEFAULT CATEGORIES FOR EVERY NEW ACCOUNT --------
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, icon, position) values
    (new.id, 'Cleaning & Turnover',      'sparkles',  0),
    (new.id, 'Repairs & Maintenance',    'wrench',    1),
    (new.id, 'Supplies & Consumables',   'package',   2),
    (new.id, 'Furnishings & Décor',      'sofa',      3),
    (new.id, 'Utilities',                'zap',       4),
    (new.id, 'Internet & Streaming',     'wifi',      5),
    (new.id, 'Grounds & Pest',           'sprout',    6),
    (new.id, 'Mortgage & Interest',      'landmark',  7),
    (new.id, 'Insurance',                'shield',    8),
    (new.id, 'Property Taxes',           'file',      9),
    (new.id, 'HOA Fees',                 'building', 10),
    (new.id, 'Platform & Booking Fees',  'percent',  11),
    (new.id, 'Software & Subscriptions', 'app',      12),
    (new.id, 'Marketing',                'megaphone',13),
    (new.id, 'Professional Services',    'briefcase',14),
    (new.id, 'Licenses & Permits',       'stamp',    15),
    (new.id, 'Bank & Merchant Fees',     'card',     16),
    (new.id, 'Travel & Mileage',         'car',      17),
    (new.id, 'Meals',                    'meals',    18),
    (new.id, 'Office & Admin',           'printer',  19);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.seed_default_categories();

-- 5. PRIVATE STORAGE BUCKET FOR RECEIPTS -------------------------
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Files live under a folder named after each user's id, e.g. "<user_id>/<file>".
-- These policies make sure a user can only touch files in their own folder.
create policy "own receipts read" on storage.objects
  for select using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "own receipts insert" on storage.objects
  for insert with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "own receipts delete" on storage.objects
  for delete using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

-- 6. PAYMENT METHODS (added later) — managed list, mirrors categories -----
--    Safe to run on an existing project; it only adds new objects.
create table public.payment_methods (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  position    integer not null default 0,          -- drives the cohesive auto-color
  created_at  timestamptz not null default now()
);
create index payment_methods_user_idx on public.payment_methods(user_id);

alter table public.payment_methods enable row level security;
create policy "own payment_methods" on public.payment_methods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Link expenses to a payment method (nullable; null = "Unspecified").
alter table public.expenses
  add column payment_method_id uuid references public.payment_methods(id) on delete set null;

-- Done. You should see "Success. No rows returned."
