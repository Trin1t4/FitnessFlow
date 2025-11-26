-- ============================================
-- FITNESSFLOW TEAM EDITION - DATABASE SCHEMA
-- ============================================
-- Sistema multi-tenant per squadre sportive
-- Ogni squadra ha coach, staff e atleti
-- Solo goal "sport_performance" disponibile

-- ============================================
-- 1. TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Info base
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- per URL: /team/juventus-u19
  logo_url TEXT,

  -- Sport e categoria
  sport TEXT NOT NULL, -- 'football', 'basketball', 'volleyball', 'rugby', 'hockey'
  category TEXT, -- 'professional', 'semi_pro', 'amateur', 'youth'
  level TEXT, -- 'serie_a', 'serie_b', 'under_19', 'under_17'

  -- Stagione
  season_start DATE,
  season_end DATE,
  current_phase TEXT DEFAULT 'pre_season', -- 'pre_season', 'in_season', 'off_season', 'transition'

  -- Subscription
  subscription_tier TEXT DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
  subscription_status TEXT DEFAULT 'trial', -- 'trial', 'active', 'expired', 'cancelled'
  max_athletes INT DEFAULT 25,
  trial_ends_at TIMESTAMPTZ,

  -- Settings
  settings JSONB DEFAULT '{
    "require_daily_checkin": true,
    "checkin_reminder_time": "08:00",
    "share_analytics_with_athletes": false,
    "allow_athlete_program_view": true,
    "injury_alert_threshold": 3
  }'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index per ricerche
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_teams_sport ON teams(sport);
CREATE INDEX idx_teams_subscription ON teams(subscription_status);

-- ============================================
-- 2. TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Ruolo nel team
  role TEXT NOT NULL DEFAULT 'athlete', -- 'owner', 'coach', 'assistant_coach', 'physio', 'nutritionist', 'athlete'

  -- Info atleta (solo per role='athlete')
  jersey_number INT,
  position TEXT, -- sport-specific: 'goalkeeper', 'defender', 'point_guard', etc.
  dominant_foot TEXT, -- 'left', 'right', 'both' (per calcio)
  dominant_hand TEXT, -- 'left', 'right', 'both' (per basket)

  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'injured', 'recovering', 'resting', 'inactive'
  injury_notes TEXT,
  return_date DATE, -- data prevista rientro da infortunio

  -- Permessi custom
  permissions JSONB DEFAULT '{
    "can_view_team_analytics": false,
    "can_edit_own_program": false,
    "can_view_other_athletes": false
  }'::jsonb,

  -- Metadata
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  invited_by UUID REFERENCES auth.users(id),
  invite_accepted_at TIMESTAMPTZ,

  UNIQUE(team_id, user_id)
);

-- Index per query comuni
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_status ON team_members(status);

-- ============================================
-- 3. TEAM INVITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- Invite info
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'athlete',
  position TEXT,
  jersey_number INT,

  -- Token per accettazione
  invite_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'expired', 'revoked'
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_team_invites_token ON team_invites(invite_token);
CREATE INDEX idx_team_invites_email ON team_invites(email);

-- ============================================
-- 4. ATHLETE DAILY CHECKINS
-- ============================================
CREATE TABLE IF NOT EXISTS athlete_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Wellness metrics (1-10)
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_hours DECIMAL(3,1),
  energy_level INT CHECK (energy_level BETWEEN 1 AND 10),
  mood INT CHECK (mood BETWEEN 1 AND 10),
  stress_level INT CHECK (stress_level BETWEEN 1 AND 10),

  -- Physical status
  muscle_soreness INT CHECK (muscle_soreness BETWEEN 1 AND 10), -- DOMS
  soreness_areas TEXT[], -- ['quadriceps', 'hamstrings', 'lower_back']
  injury_pain INT CHECK (injury_pain BETWEEN 0 AND 10),
  injury_notes TEXT,

  -- Readiness
  readiness_score INT GENERATED ALWAYS AS (
    CASE
      WHEN sleep_quality IS NULL OR energy_level IS NULL OR muscle_soreness IS NULL THEN NULL
      ELSE GREATEST(1, LEAST(10,
        ROUND((sleep_quality + energy_level + (11 - muscle_soreness) + (11 - COALESCE(stress_level, 5))) / 4.0)
      ))
    END
  ) STORED,

  -- Training availability
  available_for_training BOOLEAN DEFAULT true,
  unavailable_reason TEXT, -- 'sick', 'personal', 'travel', 'school'

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, user_id, checkin_date)
);

CREATE INDEX idx_checkins_team_date ON athlete_checkins(team_id, checkin_date);
CREATE INDEX idx_checkins_user ON athlete_checkins(user_id);
CREATE INDEX idx_checkins_readiness ON athlete_checkins(readiness_score);

-- ============================================
-- 5. TEAM TRAINING SESSIONS (Allenamenti collettivi)
-- ============================================
CREATE TABLE IF NOT EXISTS team_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- Session info
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL, -- 'strength', 'conditioning', 'recovery', 'mixed', 'testing'

  -- Schedule
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  duration_minutes INT DEFAULT 60,
  location TEXT,

  -- Phase & periodization
  phase TEXT, -- 'pre_season', 'in_season', 'off_season'
  microcycle_week INT, -- settimana del microciclo
  mesocycle_week INT, -- settimana del mesociclo

  -- Assigned athletes (NULL = tutti)
  assigned_athlete_ids UUID[],
  excluded_athlete_ids UUID[], -- atleti esclusi (infortunati, ecc.)

  -- Status
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'

  -- Results (post-session)
  attendance_count INT,
  avg_rpe DECIMAL(3,1),
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_team_sessions_team_date ON team_sessions(team_id, scheduled_date);
CREATE INDEX idx_team_sessions_status ON team_sessions(status);

-- ============================================
-- 6. TEAM PROGRAM TEMPLATES
-- ============================================
-- Template di programmi per fase/posizione che vengono
-- personalizzati per ogni atleta
CREATE TABLE IF NOT EXISTS team_program_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- Template info
  name TEXT NOT NULL,
  description TEXT,

  -- Targeting
  phase TEXT NOT NULL, -- 'pre_season', 'in_season', 'off_season'
  target_positions TEXT[], -- ['goalkeeper', 'defender'] o NULL per tutti

  -- Program structure (from shared package)
  frequency INT NOT NULL DEFAULT 3, -- days per week
  split_type TEXT NOT NULL, -- 'full_body', 'upper_lower', 'push_pull_legs'
  focus TEXT[], -- ['strength', 'power', 'endurance', 'injury_prevention']

  -- Template data
  template_data JSONB NOT NULL, -- weekly_schedule structure

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_team_phase ON team_program_templates(team_id, phase);

-- ============================================
-- 7. ATHLETE PROGRAMS (Programmi individuali)
-- ============================================
-- Estende training_programs con info team-specific
CREATE TABLE IF NOT EXISTS athlete_team_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES team_program_templates(id),
  program_id UUID REFERENCES training_programs(id), -- link al programma effettivo

  -- Customizations from template
  customizations JSONB DEFAULT '{}', -- modifiche rispetto al template

  -- Progress tracking
  weeks_completed INT DEFAULT 0,
  compliance_rate DECIMAL(5,2), -- % sessioni completate

  -- Coach notes
  coach_notes TEXT,
  last_review_date DATE,
  reviewed_by UUID REFERENCES auth.users(id),

  -- Metadata
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_athlete_programs_team ON athlete_team_programs(team_id);
CREATE INDEX idx_athlete_programs_user ON athlete_team_programs(user_id);

-- ============================================
-- 8. TEAM ANALYTICS (Aggregated stats)
-- ============================================
CREATE TABLE IF NOT EXISTS team_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Checkin stats
  total_athletes INT,
  checkins_completed INT,
  checkin_rate DECIMAL(5,2),

  -- Wellness averages
  avg_sleep_quality DECIMAL(3,1),
  avg_energy_level DECIMAL(3,1),
  avg_muscle_soreness DECIMAL(3,1),
  avg_readiness_score DECIMAL(3,1),

  -- Training stats
  workouts_completed INT,
  avg_session_rpe DECIMAL(3,1),
  total_training_minutes INT,

  -- Alerts
  athletes_at_risk INT, -- readiness < 5 o soreness > 7
  athletes_injured INT,

  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, date)
);

CREATE INDEX idx_analytics_team_date ON team_analytics_daily(team_id, date);

-- ============================================
-- 9. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_program_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_team_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_analytics_daily ENABLE ROW LEVEL SECURITY;

-- Teams: visible to members
CREATE POLICY "Teams visible to members" ON teams
  FOR SELECT USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Teams: editable by owner/coach
CREATE POLICY "Teams editable by staff" ON teams
  FOR UPDATE USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );

-- Team members: visible to same team
CREATE POLICY "Members visible to team" ON team_members
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Checkins: athletes see own, staff sees all
CREATE POLICY "Checkins policy" ON athlete_checkins
  FOR ALL USING (
    user_id = auth.uid()
    OR team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'coach', 'assistant_coach', 'physio')
    )
  );

-- Analytics: visible to staff only
CREATE POLICY "Analytics visible to staff" ON team_analytics_daily
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'coach', 'assistant_coach', 'physio', 'nutritionist')
    )
  );

-- ============================================
-- 10. HELPER FUNCTIONS
-- ============================================

-- Get user's team role
CREATE OR REPLACE FUNCTION get_team_role(p_team_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM team_members
  WHERE team_id = p_team_id AND user_id = p_user_id
$$ LANGUAGE SQL STABLE;

-- Check if user is staff
CREATE OR REPLACE FUNCTION is_team_staff(p_team_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id
    AND user_id = p_user_id
    AND role IN ('owner', 'coach', 'assistant_coach', 'physio', 'nutritionist')
  )
$$ LANGUAGE SQL STABLE;

-- Calculate team readiness for a date
CREATE OR REPLACE FUNCTION get_team_readiness(p_team_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  avg_readiness DECIMAL,
  athletes_ready INT,
  athletes_at_risk INT,
  checkin_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(DISTINCT tm.user_id) as total_athletes,
      COUNT(ac.id) as checkins,
      AVG(ac.readiness_score) as avg_ready,
      COUNT(CASE WHEN ac.readiness_score >= 6 THEN 1 END) as ready,
      COUNT(CASE WHEN ac.readiness_score < 5 OR ac.muscle_soreness > 7 THEN 1 END) as at_risk
    FROM team_members tm
    LEFT JOIN athlete_checkins ac ON ac.user_id = tm.user_id
      AND ac.team_id = tm.team_id
      AND ac.checkin_date = p_date
    WHERE tm.team_id = p_team_id AND tm.role = 'athlete' AND tm.status = 'active'
  )
  SELECT
    COALESCE(avg_ready, 0)::DECIMAL,
    COALESCE(ready, 0)::INT,
    COALESCE(at_risk, 0)::INT,
    CASE WHEN total_athletes > 0 THEN (checkins::DECIMAL / total_athletes * 100) ELSE 0 END
  FROM stats;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 11. TRIGGERS
-- ============================================

-- Update team updated_at
CREATE OR REPLACE FUNCTION update_team_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_team_timestamp();

-- Update member last_active_at on checkin
CREATE OR REPLACE FUNCTION update_member_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE team_members
  SET last_active_at = NOW()
  WHERE team_id = NEW.team_id AND user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER checkin_updates_activity
  AFTER INSERT ON athlete_checkins
  FOR EACH ROW EXECUTE FUNCTION update_member_activity();

-- ============================================
-- 12. SPORT-SPECIFIC POSITIONS
-- ============================================
CREATE TABLE IF NOT EXISTS sport_positions (
  sport TEXT NOT NULL,
  position_key TEXT NOT NULL,
  position_name_it TEXT NOT NULL,
  position_name_en TEXT NOT NULL,
  category TEXT, -- 'defense', 'midfield', 'attack', etc.
  PRIMARY KEY (sport, position_key)
);

-- Football positions
INSERT INTO sport_positions (sport, position_key, position_name_it, position_name_en, category) VALUES
  ('football', 'goalkeeper', 'Portiere', 'Goalkeeper', 'goalkeeper'),
  ('football', 'center_back', 'Difensore Centrale', 'Center Back', 'defense'),
  ('football', 'full_back', 'Terzino', 'Full Back', 'defense'),
  ('football', 'wing_back', 'Esterno', 'Wing Back', 'defense'),
  ('football', 'defensive_mid', 'Mediano', 'Defensive Midfielder', 'midfield'),
  ('football', 'central_mid', 'Centrocampista', 'Central Midfielder', 'midfield'),
  ('football', 'attacking_mid', 'Trequartista', 'Attacking Midfielder', 'midfield'),
  ('football', 'winger', 'Ala', 'Winger', 'attack'),
  ('football', 'striker', 'Attaccante', 'Striker', 'attack')
ON CONFLICT DO NOTHING;

-- Basketball positions
INSERT INTO sport_positions (sport, position_key, position_name_it, position_name_en, category) VALUES
  ('basketball', 'point_guard', 'Playmaker', 'Point Guard', 'backcourt'),
  ('basketball', 'shooting_guard', 'Guardia', 'Shooting Guard', 'backcourt'),
  ('basketball', 'small_forward', 'Ala Piccola', 'Small Forward', 'frontcourt'),
  ('basketball', 'power_forward', 'Ala Grande', 'Power Forward', 'frontcourt'),
  ('basketball', 'center', 'Centro', 'Center', 'frontcourt')
ON CONFLICT DO NOTHING;

-- Volleyball positions
INSERT INTO sport_positions (sport, position_key, position_name_it, position_name_en, category) VALUES
  ('volleyball', 'setter', 'Palleggiatore', 'Setter', 'setter'),
  ('volleyball', 'outside_hitter', 'Schiacciatore', 'Outside Hitter', 'hitter'),
  ('volleyball', 'opposite', 'Opposto', 'Opposite', 'hitter'),
  ('volleyball', 'middle_blocker', 'Centrale', 'Middle Blocker', 'blocker'),
  ('volleyball', 'libero', 'Libero', 'Libero', 'libero')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE teams IS 'Squadre sportive - multi-tenant per Team Edition';
COMMENT ON TABLE team_members IS 'Membri delle squadre con ruoli e permessi';
COMMENT ON TABLE athlete_checkins IS 'Check-in giornaliero degli atleti per monitoraggio wellness';
COMMENT ON TABLE team_analytics_daily IS 'Analytics aggregati giornalieri per squadra';
