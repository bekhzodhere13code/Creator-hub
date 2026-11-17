-- Ichki balans (100 000), "bosh sahifaga chiqarish" va avans + yakuniy to'lov.
-- Supabase'ga qo'llangan migration nomi: wallet_featured_deposit.
-- Ilova bazaga anon kalit + x-app-secret bilan kiradi, shuning uchun hamma narsa app_secret_ok() bilan himoyalangan.

-- 1) Ichki balans (haqiqiy pul emas: yechib olinmaydi, o'tkazilmaydi, faqat sayt ichidagi xizmatlar uchun)
create table if not exists public.wallets (
  user_id    text primary key references public.profiles(id) on delete cascade,
  balance    integer not null default 100000 check (balance >= 0),
  created_at timestamptz not null default now()
);
create table if not exists public.wallet_transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null references public.profiles(id) on delete cascade,
  amount     integer not null,            -- manfiy = sarf
  type       text not null,               -- signup_bonus | feature_service
  service_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists wallet_tx_user_idx on public.wallet_transactions (user_id, created_at desc);

alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
drop policy if exists app_server_access on public.wallets;
create policy app_server_access on public.wallets for all to anon using (app_secret_ok()) with check (app_secret_ok());
drop policy if exists app_server_access on public.wallet_transactions;
create policy app_server_access on public.wallet_transactions for all to anon using (app_secret_ok()) with check (app_secret_ok());

-- 2) Xizmat: bosh sahifada ko'rsatilish muddati va avans foizi
alter table public.services add column if not exists featured_until timestamptz;
alter table public.services add column if not exists deposit_percent integer not null default 30;
alter table public.services drop constraint if exists services_deposit_percent_check;
alter table public.services add constraint services_deposit_percent_check check (deposit_percent between 10 and 100);
create index if not exists services_featured_idx on public.services (featured_until) where featured_until is not null;

-- 3) Buyurtma: avans + yakuniy to'lov bosqichlari
alter table public.orders add column if not exists deposit_percent integer not null default 100;
alter table public.orders add column if not exists deposit_amount numeric;
alter table public.orders add column if not exists final_amount numeric;
alter table public.orders add column if not exists delivered_at timestamptz;
alter table public.orders add column if not exists final_paid_at timestamptz;
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status = any (array['new','pending','confirmed','rejected','cancelled','delivered','final_pending','completed']));

-- Eski (to'liq to'langan) buyurtmalar: yakunlangan deb belgilanadi
update public.orders set deposit_amount = price, final_amount = 0, status = 'completed', final_paid_at = coalesce(decided_at, now())
  where status = 'confirmed' and deposit_amount is null;
update public.orders set deposit_amount = price, final_amount = 0 where deposit_amount is null;

-- 4) Funksiyalar (atomik). Faqat ilova (app_secret_ok) yoki service_role chaqira oladi.
create or replace function public.ensure_wallet(p_user text) returns integer
language plpgsql security definer set search_path = public as $$
declare b integer;
begin
  if not (public.app_secret_ok() or auth.role() = 'service_role') then raise exception 'forbidden'; end if;
  insert into public.wallets (user_id) values (p_user) on conflict (user_id) do nothing;
  if found then
    insert into public.wallet_transactions (user_id, amount, type) values (p_user, 100000, 'signup_bonus');
  end if;
  select balance into b from public.wallets where user_id = p_user;
  return b;
end $$;

create or replace function public.feature_service(p_user text, p_service uuid, p_days integer, p_price integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s record; nb integer; untl timestamptz;
begin
  if not (public.app_secret_ok() or auth.role() = 'service_role') then raise exception 'forbidden'; end if;
  if p_days < 1 or p_days > 90 or p_price < 0 then return jsonb_build_object('ok', false, 'error', 'failed'); end if;
  select owner_id, status into s from public.services where id = p_service for update;
  if not found or s.owner_id is distinct from p_user then return jsonb_build_object('ok', false, 'error', 'notFound'); end if;
  if s.status is distinct from 'active' then return jsonb_build_object('ok', false, 'error', 'inactive'); end if;
  perform public.ensure_wallet(p_user);
  update public.wallets set balance = balance - p_price where user_id = p_user and balance >= p_price returning balance into nb;
  if not found then return jsonb_build_object('ok', false, 'error', 'balance'); end if;
  update public.services set featured_until = greatest(coalesce(featured_until, now()), now()) + make_interval(days => p_days)
    where id = p_service returning featured_until into untl;
  insert into public.wallet_transactions (user_id, amount, type, service_id) values (p_user, -p_price, 'feature_service', p_service);
  return jsonb_build_object('ok', true, 'balance', nb, 'featured_until', untl);
end $$;

revoke all on function public.ensure_wallet(text) from public;
revoke all on function public.feature_service(text, uuid, integer, integer) from public;
grant execute on function public.ensure_wallet(text) to anon, service_role;
grant execute on function public.feature_service(text, uuid, integer, integer) to anon, service_role;
