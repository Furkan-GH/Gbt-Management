-- GbtManagement uygulamasının ihtiyaç duyduğu alanlar ve tablolar.
-- Supabase Dashboard > SQL Editor'a yapıştırıp çalıştırın. Tekrar çalıştırmak güvenlidir.

-- Sınıflar
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  branch text not null default '',
  teacher_id uuid references staff(id) on delete set null,
  capacity integer not null default 10 check (capacity > 0),
  created_at timestamptz not null default now()
);

-- Ders saatleri
create table if not exists class_schedules (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  day text not null check (day in ('Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar')),
  start_time time not null,
  end_time time not null check (end_time > start_time)
);
create index if not exists class_schedules_class_id_idx on class_schedules(class_id);

-- Öğrencilere eklenen alanlar
alter table students add column if not exists parent_phone text not null default '';
alter table students add column if not exists birth_date date;
alter table students add column if not exists class_id uuid references classes(id) on delete set null;
create index if not exists students_class_id_idx on students(class_id);

-- Hocalara eklenen alan
alter table staff add column if not exists branch text not null default '';

-- Erişim kuralları (RLS)
-- DİKKAT: Uygulamada henüz giriş (login) yok, bu yüzden publishable key ile
-- herkes tüm tablolarda okuma/yazma yapabiliyor. Giriş eklendiğinde
-- "to anon" kısmı kaldırılıp sadece "to authenticated" bırakılmalı.
do $$
declare
  t text;
begin
  foreach t in array array['students','staff','fee_payments','staff_payments','classes','class_schedules'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists gbt_uygulama_erisimi on %I', t);
    execute format(
      'create policy gbt_uygulama_erisimi on %I for all to anon, authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;
