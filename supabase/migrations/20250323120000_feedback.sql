-- 用户反馈：仅登录用户可写入；每人可读自己的记录（便于 insert().select() 校验）

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  feedback_type text not null check (feedback_type in ('issue', 'suggestion', 'other')),
  body text not null,
  contact text,
  page_path text
);

comment on table public.feedback is '应用内用户反馈';
comment on column public.feedback.feedback_type is 'issue | suggestion | other';
comment on column public.feedback.page_path is '提交时所在或来源页面路径';

create index if not exists feedback_user_id_created_at on public.feedback (user_id, created_at desc);

alter table public.feedback enable row level security;

grant select, insert on table public.feedback to authenticated;

create policy "feedback_insert_own"
  on public.feedback
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "feedback_select_own"
  on public.feedback
  for select
  to authenticated
  using (auth.uid() = user_id);
