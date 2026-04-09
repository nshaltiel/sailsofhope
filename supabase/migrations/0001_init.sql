-- Sails of Hope schema

create extension if not exists "pgcrypto";

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text,
  host_code text not null,
  created_at timestamptz not null default now()
);

create table if not exists actions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 200),
  created_at timestamptz not null default now()
);

create index if not exists actions_session_id_idx on actions(session_id, created_at);

-- Enable Realtime
alter publication supabase_realtime add table actions;

-- RLS
alter table sessions enable row level security;
alter table actions enable row level security;

-- sessions: anyone can create and read (host_code is the secret)
drop policy if exists sessions_insert on sessions;
create policy sessions_insert on sessions for insert to anon, authenticated with check (true);

drop policy if exists sessions_select on sessions;
create policy sessions_select on sessions for select to anon, authenticated using (true);

-- actions: anyone can insert/read for an existing session; deletes only via RPC
drop policy if exists actions_insert on actions;
create policy actions_insert on actions for insert to anon, authenticated
  with check (exists (select 1 from sessions s where s.id = session_id));

drop policy if exists actions_select on actions;
create policy actions_select on actions for select to anon, authenticated using (true);

-- No delete policy => deletes blocked from clients. Use SECURITY DEFINER RPC.

create or replace function delete_action(p_action_id uuid, p_host_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
  v_host_code text;
begin
  select a.session_id into v_session_id from actions a where a.id = p_action_id;
  if v_session_id is null then
    raise exception 'action not found';
  end if;
  select s.host_code into v_host_code from sessions s where s.id = v_session_id;
  if v_host_code is distinct from p_host_code then
    raise exception 'invalid host code';
  end if;
  delete from actions where id = p_action_id;
end;
$$;

grant execute on function delete_action(uuid, text) to anon, authenticated;
