-- Allaqachon Supabase'ga qo'llangan (migration: profiles_claimed_banned).
-- claimed: foydalanuvchi yangi tizimga kamida bir marta kirgan. Kirmagan (eski/demo) profillar ro'yxatlarda ko'rinmaydi.
-- banned: admin ban qilgan foydalanuvchi ro'yxatlardan yashiriladi va kira olmaydi.
alter table public.profiles add column if not exists claimed boolean not null default false;
alter table public.profiles add column if not exists banned boolean not null default false;
create index if not exists profiles_claimed_idx on public.profiles (claimed) where claimed;
