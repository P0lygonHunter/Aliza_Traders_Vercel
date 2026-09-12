-- Site-wide settings (contact info, social links, storefront stats)
-- Editable from Admin Panel. Storefront reads these dynamically.

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Default values (can be changed anytime from Admin → Settings)
INSERT OR IGNORE INTO site_settings (key, value) VALUES
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
  ('announce_bar_text', 'Free Delivery on Orders Above Rs. 15,000 • Cash on Delivery Available Nationwide');
