-- Aliza Traders - Seed Data

INSERT OR IGNORE INTO categories (id, slug, name, description, sort_order) VALUES
  (1, 'party-wear', 'Party Wear', 'Statement lehengas for your next big night out', 1),
  (2, 'function-wear', 'Function Wear', 'Vibrant outfits for engagements, dholkis & functions', 2),
  (3, 'mehndi-wear', 'Mehndi Wear', 'Festive mehndi & henna ceremony lehengas', 3),
  (4, 'bridal-luxe', 'Bridal Luxe', 'Heavy hand-embellished bridal lehengas', 4);

-- Party Wear
INSERT OR IGNORE INTO products (slug, name, category_id, description, price, sale_price, fabric, colors, sizes, image_primary, badge, is_featured, stock) VALUES
('noor-sequin-lehenga', 'Noor Sequin Lehenga', 1, 'A shimmering sequin-embellished lehenga designed for your most glamorous nights. Fully lined with a comfortable stretch waist and matching dupatta.', 24500, NULL, 'Net with Sequin Embroidery', '["Emerald","Wine","Black"]', '["S","M","L","XL","Custom Stitched"]', 'grad-emerald', 'New', 1, 8),
('shabnam-tissue-lehenga', 'Shabnam Tissue Lehenga', 1, 'Lightweight tissue fabric with delicate crystal work, perfect for indoor parties and evening receptions.', 21000, 17800, 'Tissue with Crystal Work', '["Rani Pink","Royal Blue"]', '["S","M","L","XL"]', 'grad-royal', 'Sale', 1, 5),
('meherbaan-organza-lehenga', 'Meherbaan Organza Lehenga', 1, 'Flowy organza layers with hand-tacked pearls for that effortless twirl-worthy party look.', 26800, NULL, 'Organza with Pearl Detailing', '["Champagne","Peach"]', '["S","M","L","Custom Stitched"]', 'grad-champagne', 'Bestseller', 1, 6),
('zara-velvet-lehenga', 'Zara Velvet Lehenga', 1, 'Rich velvet choli paired with a flared net skirt — a modern take on classic party glamour.', 28900, NULL, 'Velvet & Net', '["Maroon","Bottle Green"]', '["S","M","L","XL"]', 'grad-maroon', 'New', 0, 4),
('sitara-embellished-lehenga', 'Sitara Embellished Lehenga', 1, 'Fully embellished with sitara and dabka work — designed to catch every light in the room.', 32500, 27900, 'Net with Sitara & Dabka', '["Black","Gold"]', '["S","M","L"]', 'grad-black-gold', 'Sale', 0, 3),
('afsha-chiffon-lehenga', 'Afsha Chiffon Lehenga', 1, 'Soft chiffon dupatta with a structured embroidered skirt for a graceful party silhouette.', 19800, NULL, 'Chiffon & Raw Silk', '["Teal","Mauve"]', '["S","M","L","XL"]', 'grad-teal', NULL, 0, 7);

-- Function Wear
INSERT OR IGNORE INTO products (slug, name, category_id, description, price, sale_price, fabric, colors, sizes, image_primary, badge, is_featured, stock) VALUES
('gulnaar-gharara-set', 'Gulnaar Gharara Set', 2, 'A vibrant gota-embellished gharara set ideal for dholki and engagement functions.', 18500, NULL, 'Silk with Gota Lace', '["Orange","Fuchsia"]', '["S","M","L","XL","Custom Stitched"]', 'grad-orange', 'New', 1, 10),
('rukhsar-angrakha-lehenga', 'Rukhsar Angrakha Lehenga', 2, 'An angrakha-style choli with a flared lehenga — festive, comfortable, and full of movement.', 20200, 16900, 'Jamawar with Thread Work', '["Turquoise","Coral"]', '["S","M","L"]', 'grad-turquoise', 'Sale', 1, 6),
('haya-anarkali-lehenga', 'Haya Anarkali Lehenga', 2, 'Floor-length anarkali paired with a flowing lehenga base — perfect for daytime functions.', 17200, NULL, 'Cotton Net with Embroidery', '["Lilac","Mint"]', '["S","M","L","XL"]', 'grad-lilac', NULL, 0, 9),
('dilkash-mirror-work-set', 'Dilkash Mirror Work Set', 2, 'Traditional mirror (shisha) work on a bright function-wear lehenga — a dholki favourite.', 19900, NULL, 'Cotton Silk with Mirror Work', '["Yellow","Hot Pink"]', '["S","M","L","Custom Stitched"]', 'grad-yellow-pink', 'Bestseller', 1, 8),
('anaya-gota-kurti-set', 'Anaya Gota Kurti Lehenga', 2, 'A short kurti styled with a gota-bordered lehenga for a fresh, festive function look.', 15800, NULL, 'Lawn Silk with Gota Border', '["Sky Blue","Peach"]', '["S","M","L","XL"]', 'grad-sky', 'New', 0, 5);

-- Mehndi Wear
INSERT OR IGNORE INTO products (slug, name, category_id, description, price, sale_price, fabric, colors, sizes, image_primary, badge, is_featured, stock) VALUES
('haldi-blossom-lehenga', 'Haldi Blossom Lehenga', 3, 'Bright yellow and green tones with floral thread embroidery — a mehndi ceremony essential.', 16900, NULL, 'Cotton Silk with Floral Thread Work', '["Yellow","Parrot Green"]', '["S","M","L","XL","Custom Stitched"]', 'grad-mehndi-green', 'Bestseller', 1, 12),
('gulabo-mehndi-sharara', 'Gulabo Mehndi Sharara', 3, 'A playful sharara set with gota trims — designed for dancing the night away at mehndi.', 15400, 12900, 'Silk with Gota Trim', '["Hot Pink","Orange"]', '["S","M","L"]', 'grad-mehndi-pink', 'Sale', 1, 10),
('basant-phulkari-lehenga', 'Basant Phulkari Lehenga', 3, 'Colourful phulkari-inspired embroidery on a comfortable cotton silk base.', 17800, NULL, 'Cotton Silk with Phulkari Embroidery', '["Multicolor"]', '["S","M","L","XL"]', 'grad-mehndi-multi', 'New', 0, 8),
('raunaq-mirror-lehenga', 'Raunaq Mirror Lehenga', 3, 'Traditional shisha mirror work paired with tassel details for the ultimate mehndi glam.', 18900, NULL, 'Net with Mirror & Tassel Work', '["Mustard","Rani Pink"]', '["S","M","L","Custom Stitched"]', 'grad-mehndi-mustard', NULL, 0, 6),
('chameli-organza-sharara', 'Chameli Organza Sharara', 3, 'Light organza layers in fresh mint and yellow — breezy and comfortable for daytime mehndi.', 14900, NULL, 'Organza', '["Mint","Yellow"]', '["S","M","L","XL"]', 'grad-mehndi-mint', 'New', 1, 9);

-- Bridal Luxe
INSERT OR IGNORE INTO products (slug, name, category_id, description, price, sale_price, fabric, colors, sizes, image_primary, badge, is_featured, stock) VALUES
('mehr-zardozi-bridal-lehenga', 'Mehr Zardozi Bridal Lehenga', 4, 'Heavy hand-embellished zardozi work with dabka, nagh and kora — a true heirloom bridal piece.', 68500, NULL, 'Silk with Zardozi & Dabka Work', '["Maroon & Gold","Wine & Gold"]', '["Custom Stitched"]', 'grad-bridal-maroon', 'Bestseller', 1, 3),
('shehnaz-royal-bridal-set', 'Shehnaz Royal Bridal Set', 4, 'A regal fully-embellished bridal set with hand-tacked stones and pearl fringing.', 74900, 64900, 'Raw Silk with Stone & Pearl Work', '["Deep Red & Gold"]', '["Custom Stitched"]', 'grad-bridal-maroon', 'Sale', 1, 2);
