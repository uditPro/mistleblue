create table if not exists public.customer_cards (
  wordpress_post_id bigint primary key,
  owner_email text not null check (owner_email = lower(btrim(owner_email))),
  title text not null,
  slug text not null unique,
  content text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists customer_cards_owner_email_idx
  on public.customer_cards (owner_email);

alter table public.customer_cards enable row level security;
revoke all on public.customer_cards from anon, authenticated;
grant select on public.customer_cards to authenticated;

drop policy if exists "Users can read cards matching their verified email"
  on public.customer_cards;
create policy "Users can read cards matching their verified email"
  on public.customer_cards
  for select
  to authenticated
  using (
    auth.jwt() ->> 'email' is not null
    and lower(auth.jwt() ->> 'email') = owner_email
  );