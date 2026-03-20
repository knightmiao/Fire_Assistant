-- FIRE 助手：单用户整包备份（payload ≈ 前端 FireState）
-- 需已启用 Auth（建议 Email）。

create table if not exists public.fire_app_snapshot (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null,
  schema_version int not null default 1,
  updated_at timestamptz not null default now()
);

comment on table public.fire_app_snapshot is '每用户一行；payload 对应 src/types FireState';
comment on column public.fire_app_snapshot.payload is '与 useFireStore getStateForExport 数据结构一致';
comment on column public.fire_app_snapshot.schema_version is 'JSON 形状变更时递增，客户端可做迁移';

alter table public.fire_app_snapshot enable row level security;

grant select, insert, update, delete on table public.fire_app_snapshot to authenticated;

create policy "用户读写自己的 fire 快照"
  on public.fire_app_snapshot
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_fire_snapshot_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tr_fire_app_snapshot_updated on public.fire_app_snapshot;
create trigger tr_fire_app_snapshot_updated
  before insert or update on public.fire_app_snapshot
  for each row
  execute function public.set_fire_snapshot_updated_at();
