-- =========================
-- STEP 6 (CAPTAIN-ONLY MVP)
-- Developer UUID:
-- fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f
-- =========================

-- Drop policies (safe rerun)
-- Teams
DROP POLICY IF EXISTS teams_insert_self ON public.teams;
DROP POLICY IF EXISTS teams_select_members ON public.teams;
DROP POLICY IF EXISTS teams_update_captain ON public.teams;
DROP POLICY IF EXISTS teams_delete_captain ON public.teams;
DROP POLICY IF EXISTS teams_select_owner_or_dev ON public.teams;
DROP POLICY IF EXISTS teams_update_owner_or_dev ON public.teams;
DROP POLICY IF EXISTS teams_delete_owner_or_dev ON public.teams;

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

-- Final scores
DROP POLICY IF EXISTS final_scores_select_public_open ON public.final_scores;
DROP POLICY IF EXISTS final_scores_select_staff ON public.final_scores;
DROP POLICY IF EXISTS final_scores_insert_staff ON public.final_scores;
DROP POLICY IF EXISTS final_scores_update_staff ON public.final_scores;
DROP POLICY IF EXISTS final_scores_delete_staff ON public.final_scores;
DROP POLICY IF EXISTS final_scores_select_public_open_or_dev ON public.final_scores;
DROP POLICY IF EXISTS final_scores_select_staff_or_dev ON public.final_scores;
DROP POLICY IF EXISTS final_scores_insert_staff_or_dev ON public.final_scores;
DROP POLICY IF EXISTS final_scores_update_staff_or_dev ON public.final_scores;
DROP POLICY IF EXISTS final_scores_delete_staff_or_dev ON public.final_scores;

-- Audit logs
DROP POLICY IF EXISTS audit_logs_select_staff ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_insert_staff ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_select_staff_or_dev ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_insert_staff_or_dev ON public.audit_logs;

-- Tournament staff (avoid self-recursive policy)
DROP POLICY IF EXISTS tournament_staff_select_staff ON public.tournament_staff;
DROP POLICY IF EXISTS tournament_staff_select_self_or_dev ON public.tournament_staff;

-- =========================
-- TEAMS (captain-only model)
-- =========================
CREATE POLICY teams_insert_self
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

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
-- TEAM_MEMBERS (locked down)
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
-- REGISTRATIONS
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
-- SCORE SUBMISSIONS
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
-- DISPUTES
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

-- =========================
-- FINAL SCORES (staff writes, public read for open + dev override)
-- =========================
CREATE POLICY final_scores_select_public_open_or_dev
ON public.final_scores
FOR SELECT
TO public
USING (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1
    from public.matches m
    join public.tournaments t on t.id = m.tournament_id
    where m.id = final_scores.match_id
      and t.status = 'open'
  )
);

CREATE POLICY final_scores_select_staff_or_dev
ON public.final_scores
FOR SELECT
TO authenticated
USING (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1
    from public.matches m
    join public.tournament_staff ts on ts.tournament_id = m.tournament_id
    where m.id = final_scores.match_id
      and ts.user_id = auth.uid()
  )
);

CREATE POLICY final_scores_insert_staff_or_dev
ON public.final_scores
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1
    from public.matches m
    join public.tournament_staff ts on ts.tournament_id = m.tournament_id
    where m.id = final_scores.match_id
      and ts.user_id = auth.uid()
  )
);

CREATE POLICY final_scores_update_staff_or_dev
ON public.final_scores
FOR UPDATE
TO authenticated
USING (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1
    from public.matches m
    join public.tournament_staff ts on ts.tournament_id = m.tournament_id
    where m.id = final_scores.match_id
      and ts.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1
    from public.matches m
    join public.tournament_staff ts on ts.tournament_id = m.tournament_id
    where m.id = final_scores.match_id
      and ts.user_id = auth.uid()
  )
);

CREATE POLICY final_scores_delete_staff_or_dev
ON public.final_scores
FOR DELETE
TO authenticated
USING (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1
    from public.matches m
    join public.tournament_staff ts on ts.tournament_id = m.tournament_id
    where m.id = final_scores.match_id
      and ts.user_id = auth.uid()
  )
);

-- =========================
-- AUDIT LOGS (staff read/insert + dev override)
-- =========================
CREATE POLICY audit_logs_select_staff_or_dev
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1 from public.tournament_staff ts
    where ts.user_id = auth.uid()
  )
);

CREATE POLICY audit_logs_insert_staff_or_dev
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
  OR exists (
    select 1 from public.tournament_staff ts
    where ts.user_id = auth.uid()
  )
);

-- =========================
-- TOURNAMENT_STAFF (select only self + dev)
-- =========================
CREATE POLICY tournament_staff_select_self_or_dev
ON public.tournament_staff
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR auth.uid() = 'fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f'
);
