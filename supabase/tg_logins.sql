-- Telegram orqali kirish uchun vaqtinchalik kodlar (Supabase -> SQL Editor da bir marta ishga tushiring)
create table if not exists public.tg_logins (
  code        text primary key,
  tg_id       bigint,
  first_name  text,
  last_name   text,
  used        boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.tg_logins enable row level security;
-- Ilova bazaga boshqa jadvallar kabi app_secret_ok() orqali kiradi
drop policy if exists app_server_access on public.tg_logins;
create policy app_server_access on public.tg_logins for all to anon using (app_secret_ok()) with check (app_secret_ok());
