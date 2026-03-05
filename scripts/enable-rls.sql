-- ============================================================
-- SciFit — Enable Row Level Security on all tables
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Enable RLS on every table
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans              ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_days          ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage           ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- profiles  (primary key `id` = auth.uid())
-- ============================================================
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- plans  (has user_id column)
-- ============================================================
CREATE POLICY "Users can read own plans"
  ON plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON plans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- plan_days  (belongs to a plan via plan_id)
-- ============================================================
CREATE POLICY "Users can read own plan_days"
  ON plan_days FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM plans WHERE plans.id = plan_days.plan_id AND plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own plan_days"
  ON plan_days FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM plans WHERE plans.id = plan_days.plan_id AND plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own plan_days"
  ON plan_days FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM plans WHERE plans.id = plan_days.plan_id AND plans.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM plans WHERE plans.id = plan_days.plan_id AND plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own plan_days"
  ON plan_days FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM plans WHERE plans.id = plan_days.plan_id AND plans.user_id = auth.uid()
  ));

-- ============================================================
-- plan_items  (belongs to a plan_day via plan_day_id)
-- ============================================================
CREATE POLICY "Users can read own plan_items"
  ON plan_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM plan_days
      JOIN plans ON plans.id = plan_days.plan_id
    WHERE plan_days.id = plan_items.plan_day_id
      AND plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own plan_items"
  ON plan_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM plan_days
      JOIN plans ON plans.id = plan_days.plan_id
    WHERE plan_days.id = plan_items.plan_day_id
      AND plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own plan_items"
  ON plan_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM plan_days
      JOIN plans ON plans.id = plan_days.plan_id
    WHERE plan_days.id = plan_items.plan_day_id
      AND plans.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM plan_days
      JOIN plans ON plans.id = plan_days.plan_id
    WHERE plan_days.id = plan_items.plan_day_id
      AND plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own plan_items"
  ON plan_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM plan_days
      JOIN plans ON plans.id = plan_days.plan_id
    WHERE plan_days.id = plan_items.plan_day_id
      AND plans.user_id = auth.uid()
  ));

-- ============================================================
-- workout_sessions  (has user_id column)
-- ============================================================
CREATE POLICY "Users can read own sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- workout_sets  (belongs to a session via session_id)
-- ============================================================
CREATE POLICY "Users can read own sets"
  ON workout_sets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workout_sessions
    WHERE workout_sessions.id = workout_sets.session_id
      AND workout_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own sets"
  ON workout_sets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workout_sessions
    WHERE workout_sessions.id = workout_sets.session_id
      AND workout_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own sets"
  ON workout_sets FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workout_sessions
    WHERE workout_sessions.id = workout_sets.session_id
      AND workout_sessions.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM workout_sessions
    WHERE workout_sessions.id = workout_sets.session_id
      AND workout_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own sets"
  ON workout_sets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM workout_sessions
    WHERE workout_sessions.id = workout_sets.session_id
      AND workout_sessions.user_id = auth.uid()
  ));

-- ============================================================
-- exercises  (public read-only catalog)
-- ============================================================
CREATE POLICY "Anyone can read exercises"
  ON exercises FOR SELECT
  USING (true);

-- ============================================================
-- recovery_logs  (has user_id column)
-- ============================================================
CREATE POLICY "Users can read own recovery logs"
  ON recovery_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recovery logs"
  ON recovery_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recovery logs"
  ON recovery_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- subscriptions  (has user_id column)
-- ============================================================
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- ai_usage  (has user_id column)
-- ============================================================
CREATE POLICY "Users can read own ai usage"
  ON ai_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai usage"
  ON ai_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai usage"
  ON ai_usage FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
