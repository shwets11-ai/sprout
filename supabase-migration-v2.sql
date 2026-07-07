-- Sprout Toddler Tracker — Supabase Migration v2: Family Sharing
-- Run this AFTER supabase-migration.sql in the Supabase SQL Editor
-- (https://supabase.com/dashboard/project/qkkqbtuenymkokidywrx/sql)

-- ─── Families ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS families (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'My Family',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Family Members (join table) ──────────────────────────────
CREATE TABLE IF NOT EXISTS family_members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  family_id BIGINT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- ─── Toddlers ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS toddlers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  family_id BIGINT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  avatar TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Invitations ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invitations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  family_id BIGINT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Add toddler_id to existing activity tables ───────────────
ALTER TABLE meals   ADD COLUMN IF NOT EXISTS toddler_id BIGINT REFERENCES toddlers(id) ON DELETE CASCADE;
ALTER TABLE learning ADD COLUMN IF NOT EXISTS toddler_id BIGINT REFERENCES toddlers(id) ON DELETE CASCADE;
ALTER TABLE sleep   ADD COLUMN IF NOT EXISTS toddler_id BIGINT REFERENCES toddlers(id) ON DELETE CASCADE;
ALTER TABLE play    ADD COLUMN IF NOT EXISTS toddler_id BIGINT REFERENCES toddlers(id) ON DELETE CASCADE;

-- ─── Indexes ──────────────────────────────────────────────────
-- Drop old user_id + date indexes
DROP INDEX IF EXISTS idx_meals_user_date;
DROP INDEX IF EXISTS idx_learning_user_date;
DROP INDEX IF EXISTS idx_sleep_user_date;
DROP INDEX IF EXISTS idx_play_user_date;

-- Create new composite indexes
CREATE INDEX IF NOT EXISTS idx_meals_toddler_date   ON meals(toddler_id, date);
CREATE INDEX IF NOT EXISTS idx_meals_user_toddler   ON meals(user_id, toddler_id);
CREATE INDEX IF NOT EXISTS idx_learning_toddler_date ON learning(toddler_id, date);
CREATE INDEX IF NOT EXISTS idx_learning_user_toddler ON learning(user_id, toddler_id);
CREATE INDEX IF NOT EXISTS idx_sleep_toddler_date   ON sleep(toddler_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_user_toddler   ON sleep(user_id, toddler_id);
CREATE INDEX IF NOT EXISTS idx_play_toddler_date    ON play(toddler_id, date);
CREATE INDEX IF NOT EXISTS idx_play_user_toddler    ON play(user_id, toddler_id);

-- ─── Row-Level Security for new tables ────────────────────────
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE toddlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- ─── Policies for families ────────────────────────────────────
-- User can SELECT families they belong to
CREATE POLICY select_families ON families
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
    )
  );

-- User can INSERT families (creating a new family)
CREATE POLICY insert_families ON families
  FOR INSERT
  WITH CHECK (true);

-- ─── Policies for family_members ──────────────────────────────
-- User can SELECT members of families they belong to
CREATE POLICY select_family_members ON family_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members AS fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
    )
  );

-- User can INSERT into their own family
CREATE POLICY insert_family_members ON family_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members AS fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
    )
  );

-- ─── Policies for toddlers ────────────────────────────────────
-- User can CRUD toddlers in their families
CREATE POLICY select_toddlers ON toddlers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = toddlers.family_id
        AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY insert_toddlers ON toddlers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = toddlers.family_id
        AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY update_toddlers ON toddlers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = toddlers.family_id
        AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY delete_toddlers ON toddlers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = toddlers.family_id
        AND family_members.user_id = auth.uid()
    )
  );

-- ─── Policies for invitations ─────────────────────────────────
-- User can SELECT invitations for their family
CREATE POLICY select_invitations ON invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = invitations.family_id
        AND family_members.user_id = auth.uid()
    )
  );

-- User can INSERT invitations for their family
CREATE POLICY insert_invitations ON invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = invitations.family_id
        AND family_members.user_id = auth.uid()
    )
  );

-- ─── Updated RLS policies for activity tables (v2) ────────────
-- Drop old policies
DROP POLICY IF EXISTS users_meals ON meals;
DROP POLICY IF EXISTS users_learning ON learning;
DROP POLICY IF EXISTS users_sleep ON sleep;
DROP POLICY IF EXISTS users_play ON play;

-- Recreate with family-based access
-- User can read/write if they are a member of the toddler's family
CREATE POLICY access_meals ON meals
  FOR ALL
  USING (
    toddler_id IS NULL
    OR
    EXISTS (
      SELECT 1 FROM toddlers
      JOIN family_members ON family_members.family_id = toddlers.family_id
      WHERE toddlers.id = meals.toddler_id
        AND family_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    toddler_id IS NULL
    OR
    EXISTS (
      SELECT 1 FROM toddlers
      JOIN family_members ON family_members.family_id = toddlers.family_id
      WHERE toddlers.id = meals.toddler_id
        AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY access_learning ON learning
  FOR ALL
  USING (
    toddler_id IS NULL
    OR
    EXISTS (
      SELECT 1 FROM toddlers
      JOIN family_members ON family_members.family_id = toddlers.family_id
      WHERE toddlers.id = learning.toddler_id
        AND family_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    toddler_id IS NULL
    OR
    EXISTS (
      SELECT 1 FROM toddlers
      JOIN family_members ON family_members.family_id = toddlers.family_id
      WHERE toddlers.id = learning.toddler_id
        AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY access_sleep ON sleep
  FOR ALL
  USING (
    toddler_id IS NULL
    OR
    EXISTS (
      SELECT 1 FROM toddlers
      JOIN family_members ON family_members.family_id = toddlers.family_id
      WHERE toddlers.id = sleep.toddler_id
        AND family_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    toddler_id IS NULL
    OR
    EXISTS (
      SELECT 1 FROM toddlers
      JOIN family_members ON family_members.family_id = toddlers.family_id
      WHERE toddlers.id = sleep.toddler_id
        AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY access_play ON play
  FOR ALL
  USING (
    toddler_id IS NULL
    OR
    EXISTS (
      SELECT 1 FROM toddlers
      JOIN family_members ON family_members.family_id = toddlers.family_id
      WHERE toddlers.id = play.toddler_id
        AND family_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    toddler_id IS NULL
    OR
    EXISTS (
      SELECT 1 FROM toddlers
      JOIN family_members ON family_members.family_id = toddlers.family_id
      WHERE toddlers.id = play.toddler_id
        AND family_members.user_id = auth.uid()
    )
  );
