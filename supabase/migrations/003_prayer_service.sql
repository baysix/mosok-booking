-- 기원 서비스: 무속인이 자유 등록하는 기원 상품 + 기간별 가격 옵션

-- prayer_products: 기원 상품 (무속인이 이름/설명 자유 등록)
CREATE TABLE prayer_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,              -- 무속인이 자유 입력 (예: '소원등', '건강초', '재물등')
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- prayer_product_options: 기간별 가격 옵션
CREATE TABLE prayer_product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES prayer_products(id) ON DELETE CASCADE,
  duration_days INTEGER NOT NULL,  -- 49, 100, 365
  price INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, duration_days)
);

-- prayer_orders: 기원 주문/등록
CREATE TABLE prayer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES prayer_products(id) ON DELETE RESTRICT,
  option_id UUID REFERENCES prayer_product_options(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,      -- 주문 시점 상품명 보존
  duration_days INTEGER NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  beneficiary_name TEXT NOT NULL DEFAULT '',
  wish_text TEXT NOT NULL DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT NOT NULL DEFAULT 'online',
  manual_customer_name TEXT,
  manual_customer_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_prayer_products_master ON prayer_products(master_id);
CREATE INDEX idx_prayer_product_options_product ON prayer_product_options(product_id);
CREATE INDEX idx_prayer_orders_master ON prayer_orders(master_id);
CREATE INDEX idx_prayer_orders_user ON prayer_orders(user_id);
CREATE INDEX idx_prayer_orders_status ON prayer_orders(master_id, status);

-- Triggers
CREATE TRIGGER prayer_products_updated_at BEFORE UPDATE ON prayer_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER prayer_orders_updated_at BEFORE UPDATE ON prayer_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE prayer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON prayer_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON prayer_product_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON prayer_orders FOR ALL USING (true) WITH CHECK (true);
