-- ==========================================
-- Multi-Tenant Closed-Membership Reservation System
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- ENUM TYPES
-- =====================
CREATE TYPE user_role AS ENUM ('user', 'master', 'admin');
CREATE TYPE master_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'rejected');
CREATE TYPE reservation_source AS ENUM ('online', 'manual');
CREATE TYPE join_code_status AS ENUM ('active', 'expired', 'used_up');
CREATE TYPE notification_type AS ENUM (
  'reservation_requested',
  'reservation_confirmed',
  'reservation_rejected',
  'reservation_cancelled',
  'reservation_completed',
  'membership_approved'
);
CREATE TYPE message_type AS ENUM ('text', 'image', 'system');

-- =====================
-- USERS TABLE
-- =====================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================
-- MASTERS TABLE
-- =====================
CREATE TABLE masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  years_experience INTEGER NOT NULL DEFAULT 0,
  region TEXT NOT NULL DEFAULT '',
  district TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  base_price INTEGER NOT NULL DEFAULT 0,
  status master_status NOT NULL DEFAULT 'pending',
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_masters_user_id ON masters(user_id);
CREATE INDEX idx_masters_status ON masters(status);

-- =====================
-- JOIN_CODES TABLE
-- =====================
CREATE TABLE join_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  label TEXT,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  status join_code_status NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_join_codes_code ON join_codes(code);
CREATE INDEX idx_join_codes_master ON join_codes(master_id);

-- =====================
-- MASTER_MEMBERSHIPS TABLE
-- =====================
CREATE TABLE master_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_via TEXT NOT NULL DEFAULT 'invite_code',
  join_code_id UUID REFERENCES join_codes(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(master_id, user_id)
);

CREATE INDEX idx_memberships_master ON master_memberships(master_id);
CREATE INDEX idx_memberships_user ON master_memberships(user_id);
CREATE INDEX idx_memberships_active ON master_memberships(master_id, is_active);

-- =====================
-- RESERVATIONS TABLE
-- =====================
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 1,
  party_size INTEGER NOT NULL DEFAULT 1,
  consultation_type TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  total_price INTEGER NOT NULL DEFAULT 0,
  status reservation_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  source reservation_source NOT NULL DEFAULT 'online',
  manual_customer_name TEXT,
  manual_customer_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_reservation_source CHECK (
    (source = 'online' AND user_id IS NOT NULL) OR
    (source = 'manual' AND manual_customer_name IS NOT NULL)
  )
);

CREATE INDEX idx_reservations_master ON reservations(master_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_master_date ON reservations(master_id, date);
CREATE INDEX idx_reservations_master_status ON reservations(master_id, status);

-- =====================
-- MASTER_WEEKLY_HOURS TABLE
-- =====================
CREATE TABLE master_weekly_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_working BOOLEAN NOT NULL DEFAULT true,
  time_slots TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(master_id, day_of_week)
);

CREATE INDEX idx_weekly_hours_master ON master_weekly_hours(master_id);

-- =====================
-- MASTER_OFF_DAYS TABLE
-- =====================
CREATE TABLE master_off_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  off_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(master_id, off_date)
);

CREATE INDEX idx_off_days_master ON master_off_days(master_id);

-- =====================
-- CHAT_ROOMS TABLE
-- =====================
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  master_id UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  last_message TEXT NOT NULL DEFAULT '',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, master_id)
);

CREATE INDEX idx_chat_rooms_user ON chat_rooms(user_id);
CREATE INDEX idx_chat_rooms_master ON chat_rooms(master_id);

-- =====================
-- MESSAGES TABLE
-- =====================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type message_type NOT NULL DEFAULT 'text',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_room ON messages(room_id, created_at);
CREATE INDEX idx_messages_unread ON messages(room_id, sender_id, is_read);

-- =====================
-- NOTIFICATIONS TABLE
-- =====================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  master_id UUID REFERENCES masters(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_master ON notifications(master_id);

-- =====================
-- UPDATED_AT TRIGGER
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER masters_updated_at BEFORE UPDATE ON masters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER weekly_hours_updated_at BEFORE UPDATE ON master_weekly_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- RLS POLICIES
-- =====================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_weekly_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_off_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Permissive policies (auth handled at application layer via service_role)
CREATE POLICY "Allow all for service" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON masters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON master_memberships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON join_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON reservations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON master_weekly_hours FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON master_off_days FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON chat_rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- =====================
-- STORAGE BUCKET
-- =====================
INSERT INTO storage.buckets (id, name, public) VALUES ('master-images', 'master-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'master-images');

CREATE POLICY "Allow authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'master-images');

CREATE POLICY "Allow authenticated update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'master-images');

CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'master-images');
