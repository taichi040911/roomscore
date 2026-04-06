-- RoomScore: 分析結果保存テーブル
create table if not exists public.room_scores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  total_score int not null check (total_score between 0 and 100),
  sleep_type text not null,
  one_line_advice text not null,
  categories jsonb not null,
  improvements jsonb not null,
  image_path text,
  user_agent text,
  referrer text
);

-- RLS
alter table public.room_scores enable row level security;
create policy "Anyone can insert" on public.room_scores for insert with check (true);
create policy "Anyone can read own" on public.room_scores for select using (true);

-- Index for analytics
create index idx_room_scores_created on public.room_scores (created_at desc);
create index idx_room_scores_total on public.room_scores (total_score);
