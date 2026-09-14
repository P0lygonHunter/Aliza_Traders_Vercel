-- Aliza Traders — Postgres schema (Neon / Vercel)

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  description TEXT,
  price DOUBLE PRECISION NOT NULL,
  sale_price DOUBLE PRECISION,
  fabric TEXT,
  colors TEXT,
  sizes TEXT,
  image_primary TEXT,
  image_secondary TEXT,
  badge TEXT,
  is_featured INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  notes TEXT,
  payment_method TEXT DEFAULT 'COD',
  subtotal DOUBLE PRECISION NOT NULL,
  shipping_fee DOUBLE PRECISION DEFAULT 0,
  total DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  size TEXT,
  color TEXT,
  quantity INTEGER NOT NULL,
  unit_price DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

INSERT INTO site_settings (key, value) VALUES
  ('phone', '+92 300 1234567'),
  ('whatsapp', '+92 300 1234567'),
  ('email', 'hello@alizatraders.pk'),
  ('address', 'Karachi, Pakistan'),
  ('instagram_url', ''),
  ('facebook_url', ''),
  ('tiktok_url', ''),
  ('stats_mode', 'auto'),
  ('happy_customers_display', '500+'),
  ('unique_designs_display', '50+'),
  ('handcrafted_display', '100%'),
  ('free_delivery_text', 'Free Delivery on Orders Above Rs. 15,000'),
  ('announce_bar_text', 'Free Delivery on Orders Above Rs. 15,000 • Cash on Delivery Available Nationwide')
ON CONFLICT (key) DO NOTHING;

INSERT INTO categories (id, slug, name, description, sort_order) VALUES
  (1, 'party-wear', 'Party Wear', 'Statement lehengas for your next big night out', 1),
  (2, 'function-wear', 'Function Wear', 'Vibrant outfits for engagements, dholkis & functions', 2),
  (3, 'mehndi-wear', 'Mehndi Wear', 'Festive mehndi & henna ceremony lehengas', 3),
  (4, 'bridal-luxe', 'Bridal Luxe', 'Heavy hand-embellished bridal lehengas', 4)
ON CONFLICT (slug) DO NOTHING;

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
