-- מיזם "השגות רמ"י" — סכמת Supabase
-- אותו פרויקט Supabase הקיים (giygjmacxquucwexmfdd, אותו כמו מכריע ו-insure-vda)
-- כל הטבלאות בקידומת rami_ כדי לא להתנגש בטבלאות הקיימות

create extension if not exists "pgcrypto";

-- יישובים: מטא-דאטה + סטטוס סיווג (מקביל ל-machria_committees, אבל לפי ישוב במקום ועדה)
create table if not exists rami_yishuvim (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  decisions_count int not null default 0,
  classified boolean not null default false,
  classified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- החלטות. instance מבחין בין שתי ערכאות שונות מהותית: 'committee' = ועדת השגות
-- (3 חברים, השגה שנייה, decisions_appeals_board) ו-'first' = הכרעה בהשגה ראשונה
-- (שמאי בודד, committee endpoint) — שני מבני מסמך שונים, סכמות סיווג נפרדות
create table if not exists rami_decisions (
  id uuid primary key default gen_random_uuid(),
  yishuv_id uuid references rami_yishuvim(id) on delete cascade,
  yishuv_name text not null,
  instance text not null default 'committee' check (instance in ('committee', 'first')),
  title text not null,
  case_number text,
  block text,
  plot text,
  property_primary_class text,
  property_secondary_class text,
  objector_name text,
  decision_date date,
  pdf_url text not null,
  status text not null default 'pending' check (status in ('pending', 'classified', 'failed')),
  classification jsonb,
  lint_flags jsonb not null default '[]'::jsonb,
  classified_at timestamptz,
  geo_x double precision,
  geo_y double precision,
  created_at timestamptz not null default now(),
  unique (title, decision_date, instance)
);

create index if not exists idx_rami_decisions_yishuv on rami_decisions(yishuv_id);
create index if not exists idx_rami_decisions_status on rami_decisions(status);

-- אצוות סיווג. instance כאן כדי שהבליעה (poll-batches) תדע איזו סכמת נורמליזציה/linter
-- להפעיל על התוצאות, בלי לשלוף כל החלטה בנפרד כדי לבדוק
create table if not exists rami_classification_batches (
  id uuid primary key default gen_random_uuid(),
  yishuv_id uuid references rami_yishuvim(id) on delete cascade,
  instance text not null default 'committee' check (instance in ('committee', 'first')),
  anthropic_batch_id text not null,
  status text not null default 'submitted' check (status in ('submitted', 'processing', 'ended', 'ingested', 'error')),
  decision_ids uuid[] not null,
  submitted_at timestamptz not null default now(),
  ended_at timestamptz,
  error text
);

-- תיקי לקוחות (מוצר 1: בדיקה מקדימה, 480 ₪ שטוח)
create table if not exists rami_cases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  yishuv_name text not null,
  block text,
  plot text,
  contact_name text,
  contact_phone text,
  contact_email text,
  price_nis numeric not null default 480,
  paid boolean not null default false,
  paid_at timestamptz,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'queued_for_classification', 'ready', 'sent')),
  report_html text,
  geo_x double precision,
  geo_y double precision,
  notes text
);

-- תיקי שלב 2 (עיקרי דברים, 1,400 ₪ שטוח)
create table if not exists rami_stage2_cases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  stage1_case_id uuid references rami_cases(id),
  yishuv_name text not null,
  contact_name text,
  contact_phone text,
  contact_email text,
  price_nis numeric not null default 1400,
  paid boolean not null default false,
  paid_at timestamptz,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'pending_upload', 'uploaded', 'analyzing', 'pending_admin_review', 'ready', 'sent')),
  letter_file_path text,
  assessment_file_path text,
  claim_data jsonb,
  argument_document text,
  admin_notes text
);

-- RLS
alter table rami_yishuvim enable row level security;
alter table rami_decisions enable row level security;
alter table rami_cases enable row level security;
alter table rami_classification_batches enable row level security;
alter table rami_stage2_cases enable row level security;

create policy "rami yishuvim are publicly readable" on rami_yishuvim
  for select using (true);

create policy "anyone can create a rami case" on rami_cases
  for insert with check (true);
create policy "anyone can read a rami case by id" on rami_cases
  for select using (true);
create policy "anyone can update their own rami case" on rami_cases
  for update using (true);

create policy "anyone can create a rami stage2 case" on rami_stage2_cases
  for insert with check (true);
create policy "anyone can read a rami stage2 case by id" on rami_stage2_cases
  for select using (true);
create policy "anyone can update their own rami stage2 case" on rami_stage2_cases
  for update using (true);

-- אחסון קבצים לשלב 2 — bucket נפרד "rami-files" (ליצור דרך ה-API, לא כאן)
create policy "anyone can upload rami stage2 files" on storage.objects
  for insert with check (bucket_id = 'rami-files');
