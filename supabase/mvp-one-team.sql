-- =========================
-- MVP: One Account = One Team Captain = One Team
-- Developer UUID:
-- fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f
-- =========================

-- =========================
-- A1) Enforce one team per user (unique created_by)
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class t ON t.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(i.indkey)
    WHERE n.nspname = 'public'
      AND t.relname = 'teams'
      AND i.indisunique
      AND array_length(i.indkey, 1) = 1
      AND a.attname = 'created_by'
  ) THEN
    ALTER TABLE public.teams
      ADD CONSTRAINT teams_created_by_unique UNIQUE (created_by);
  END IF;
END $$;

-- =========================
-- A2) Cascade delete team when auth user is deleted
-- =========================
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_created_by_fkey;

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT c.conname INTO constraint_name
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public'
    AND t.relname = 'teams'
    AND c.contype = 'f'
    AND c.conkey = ARRAY[
      (SELECT attnum FROM pg_attribute WHERE attrelid = t.oid AND attname = 'created_by')
    ];

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.teams DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE public.teams
  ADD CONSTRAINT teams_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- =========================
-- A3) Ensure team name is globally unique
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class t ON t.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(i.indkey)
    WHERE n.nspname = 'public'
      AND t.relname = 'teams'
      AND i.indisunique
      AND array_length(i.indkey, 1) = 1
      AND a.attname = 'name'
  ) THEN
    ALTER TABLE public.teams
      ADD CONSTRAINT teams_name_unique UNIQUE (name);
  END IF;
END $$;

-- =========================
-- Drop policies (safe rerun)
-- =========================
-- Teams
DROP POLICY IF EXISTS teams_insert_self ON public.teams;
DROP POLICY IF EXISTS teams_select_members ON public.teams;
DROP POLICY IF EXISTS teams_update_captain ON public.teams;
DROP POLICY IF EXISTS teams_delete_captain ON public.teams;
DROP POLICY IF EXISTS teams_select_owner_or_dev ON public.teams;
DROP POLICY IF EXISTS teams_update_owner_or_dev ON public.teams;
DROP POLICY IF EXISTS teams_delete_owner_or_dev ON public.teams;
DROP POLICY IF EXISTS teams_insert_owner_or_dev ON public.teams;

-- Team members (lock down)
DROP POLICY IF EXISTS team_members_select_members ON public.team_members;
DROP POLICY IF EXISTS team_members_insert_captain_or_bootstrap ON public.team_members;
DROP POLICY IF EXISTS team_members_update_captain ON public.team_members;
DROP POLICY IF EXISTS team_members_delete_captain ON public.team_members;
DROP POLICY IF EXISTS team_members_select_self_or_dev ON public.team_members;

-- Registrations
DROP POLICY IF EXISTS registrations_select_staff_or_team ON public.registrations;
DROP POLICY IF EXISTS registrations_insert_captain ON public.registrations;
DROP POLICY IF EXISTS registrations_update_staff ON public.registrations;
DROP POLICY IF EXISTS registrations_delete_staff_or_captain ON public.registrations;
DROP POLICY IF EXISTS registrations_select_staff_or_owner_or_dev ON public.registrations;
DROP POLICY IF EXISTS registrations_insert_owner_or_dev ON public.registrations;
DROP POLICY IF EXISTS registrations_update_staff_or_dev ON public.registrations;
DROP POLICY IF EXISTS registrations_delete_staff_or_owner_or_dev ON public.registrations;

-- Score submissions
DROP POLICY IF EXISTS score_submissions_select_staff_or_match_teams ON public.score_submissions;
DROP POLICY IF EXISTS score_submissions_insert_match_captains ON public.score_submissions;
DROP POLICY IF EXISTS score_submissions_select_staff_or_match_owners_or_dev ON public.score_submissions;
DROP POLICY IF EXISTS score_submissions_insert_match_owners_or_dev ON public.score_submissions;

-- Disputes
DROP POLICY IF EXISTS disputes_select_staff_or_match_captains ON public.disputes;
DROP POLICY IF EXISTS disputes_insert_match_captains ON public.disputes;
DROP POLICY IF EXISTS disputes_update_staff ON public.disputes;
DROP POLICY IF EXISTS disputes_delete_staff ON public.disputes;
DROP POLICY IF EXISTS disputes_select_staff_or_match_owners_or_dev ON public.disputes;
DROP POLICY IF EXISTS disputes_insert_match_owners_or_dev ON public.disputes;
DROP POLICY IF EXISTS disputes_update_staff_or_dev ON public.disputes;
DROP POLICY IF EXISTS disputes_delete_staff_or_dev ON public.disputes;

-- =========================
-- A4) Captain-only RLS for teams
-- =========================
CREATE POLICY teams_insert_owner_or_dev
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  OR auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
);

CREATE POLICY teams_select_owner_or_dev
ON public.teams
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
);

CREATE POLICY teams_update_owner_or_dev
ON public.teams
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
)
WITH CHECK (
  created_by = auth.uid()
  OR auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
);

CREATE POLICY teams_delete_owner_or_dev
ON public.teams
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
);

-- =========================
-- A5) Team members locked down
-- =========================
CREATE POLICY team_members_select_self_or_dev
ON public.team_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
);

-- =========================
-- A6) Registrations use teams.created_by
-- =========================
CREATE POLICY registrations_select_staff_or_owner_or_dev
ON public.registrations
FOR SELECT
TO authenticated
USING (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1 from public.tournament_staff ts
    where ts.tournament_id = registrations.tournament_id
      and ts.user_id = auth.uid()
  )
  OR exists (
    select 1 from public.teams t
    where t.id = registrations.team_id
      and t.created_by = auth.uid()
  )
);

CREATE POLICY registrations_insert_owner_or_dev
ON public.registrations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1 from public.teams t
    where t.id = registrations.team_id
      and t.created_by = auth.uid()
  )
);

CREATE POLICY registrations_update_staff_or_dev
ON public.registrations
FOR UPDATE
TO authenticated
USING (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1 from public.tournament_staff ts
    where ts.tournament_id = registrations.tournament_id
      and ts.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1 from public.tournament_staff ts
    where ts.tournament_id = registrations.tournament_id
      and ts.user_id = auth.uid()
  )
);

CREATE POLICY registrations_delete_staff_or_owner_or_dev
ON public.registrations
FOR DELETE
TO authenticated
USING (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1 from public.tournament_staff ts
    where ts.tournament_id = registrations.tournament_id
      and ts.user_id = auth.uid()
  )
  OR exists (
    select 1 from public.teams t
    where t.id = registrations.team_id
      and t.created_by = auth.uid()
  )
);

-- =========================
-- Score submissions use teams.created_by
-- =========================
CREATE POLICY score_submissions_select_staff_or_match_owners_or_dev
ON public.score_submissions
FOR SELECT
TO authenticated
USING (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1
    from public.matches m
    join public.tournament_staff ts on ts.tournament_id = m.tournament_id
    where m.id = score_submissions.match_id
      and ts.user_id = auth.uid()
  )
  OR exists (
    select 1
    from public.matches m
    join public.teams t on t.id in (m.home_team_id, m.away_team_id)
    where m.id = score_submissions.match_id
      and t.created_by = auth.uid()
  )
);

CREATE POLICY score_submissions_insert_match_owners_or_dev
ON public.score_submissions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1
    from public.matches m
    join public.teams t on t.id in (m.home_team_id, m.away_team_id)
    where m.id = score_submissions.match_id
      and t.created_by = auth.uid()
  )
);

-- No UPDATE/DELETE policies for score_submissions (denied by default)

-- =========================
-- Disputes use teams.created_by
-- =========================
CREATE POLICY disputes_select_staff_or_match_owners_or_dev
ON public.disputes
FOR SELECT
TO authenticated
USING (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1
    from public.matches m
    join public.tournament_staff ts on ts.tournament_id = m.tournament_id
    where m.id = disputes.match_id
      and ts.user_id = auth.uid()
  )
  OR exists (
    select 1
    from public.matches m
    join public.teams t on t.id in (m.home_team_id, m.away_team_id)
    where m.id = disputes.match_id
      and t.created_by = auth.uid()
  )
);

CREATE POLICY disputes_insert_match_owners_or_dev
ON public.disputes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1
    from public.matches m
    join public.teams t on t.id in (m.home_team_id, m.away_team_id)
    where m.id = disputes.match_id
      and t.created_by = auth.uid()
  )
);

CREATE POLICY disputes_update_staff_or_dev
ON public.disputes
FOR UPDATE
TO authenticated
USING (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1
    from public.matches m
    join public.tournament_staff ts on ts.tournament_id = m.tournament_id
    where m.id = disputes.match_id
      and ts.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1
    from public.matches m
    join public.tournament_staff ts on ts.tournament_id = m.tournament_id
    where m.id = disputes.match_id
      and ts.user_id = auth.uid()
  )
);

CREATE POLICY disputes_delete_staff_or_dev
ON public.disputes
FOR DELETE
TO authenticated
USING (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1
    from public.matches m
    join public.tournament_staff ts on ts.tournament_id = m.tournament_id
    where m.id = disputes.match_id
      and ts.user_id = auth.uid()
  )
);
