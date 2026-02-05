-- =========================
-- UNIQUE TEAM NAME FIX (normalized)
-- =========================

-- 1) Inspect existing constraints
SELECT conname, contype, pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
  AND t.relname = 'teams'
ORDER BY conname;

-- 2) Inspect existing indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'teams'
ORDER BY indexname;

-- 3) Check for duplicates by normalized name
SELECT lower(regexp_replace(btrim(name), E'\\s+', ' ', 'g')) AS normalized,
       count(*) AS count,
       array_agg(id ORDER BY created_at) AS ids
FROM public.teams
GROUP BY 1
HAVING count(*) > 1
ORDER BY count DESC;

-- =========================
-- Optional remediation (run only if duplicates exist)
-- This appends " (dup-N)" to duplicates beyond the first, ordered by created_at.
-- =========================
-- WITH ranked AS (
--   SELECT id,
--          lower(regexp_replace(btrim(name), E'\\s+', ' ', 'g')) AS normalized,
--          row_number() OVER (
--            PARTITION BY lower(regexp_replace(btrim(name), E'\\s+', ' ', 'g'))
--            ORDER BY created_at
--          ) AS rn
--   FROM public.teams
-- )
-- UPDATE public.teams t
-- SET name = t.name || ' (dup-' || (ranked.rn - 1) || ')'
-- FROM ranked
-- WHERE t.id = ranked.id
--   AND ranked.rn > 1;

-- =========================
-- Enforce normalized uniqueness (case + whitespace)
-- =========================
CREATE UNIQUE INDEX IF NOT EXISTS teams_name_unique_norm
ON public.teams (lower(regexp_replace(btrim(name), E'\\s+', ' ', 'g')));

-- Prevent blank/whitespace-only names
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'teams'
      AND c.conname = 'teams_name_not_blank'
  ) THEN
    ALTER TABLE public.teams
      ADD CONSTRAINT teams_name_not_blank CHECK (btrim(name) <> '');
  END IF;
END $$;
