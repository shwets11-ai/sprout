-- Sprout Toddler Tracker — Supabase Migration
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/qkkqbtuenymkokidywrx/sql)

-- ─── Activities Tables ──────────────────────────────────────────
-- Each table has a user_id column referencing auth.users for RLS
-- Column names match the camelCase fields sent by the React forms

CREATE TABLE IF NOT EXISTS meals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME NOT NULL,
  "foodItems" TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME NOT NULL,
  "activityType" TEXT NOT NULL DEFAULT '',
  duration INTEGER NOT NULL DEFAULT 15,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sleep (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  "startTime" TIME NOT NULL,
  "endTime" TIME NOT NULL,
  type TEXT NOT NULL DEFAULT 'nap',
  quality INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS play (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME NOT NULL,
  "activityType" TEXT NOT NULL DEFAULT '',
  duration INTEGER NOT NULL DEFAULT 30,
  location TEXT NOT NULL DEFAULT 'indoor',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_learning_user_date ON learning(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_user_date ON sleep(user_id, date);
CREATE INDEX IF NOT EXISTS idx_play_user_date ON play(user_id, date);

-- ─── Row-Level Security ───────────────────────────────────────

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep ENABLE ROW LEVEL SECURITY;
ALTER TABLE play ENABLE ROW LEVEL SECURITY;

-- Policies: users can only CRUD their own rows

CREATE POLICY users_meals ON meals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY users_learning ON learning
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY users_sleep ON sleep
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY users_play ON play
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
