import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database
  IMAGES: R2Bucket
  ADMIN_USERNAME: string
  ADMIN_PASSWORD: string
  JWT_SECRET: string
}

const admin = new Hono<{ Bindings: Bindings }>()

const COOKIE_NAME = 'aliza_admin_token'

// ---------- Auth Middleware ----------
async function requireAuth(c: any, next: any) {
  const token = getCookie(c, COOKIE_NAME)
  if (!token) return c.json({ success: false, error: 'Unauthorized' }, 401)
  try {
    await verify(token, c.env.JWT_SECRET, 'HS256')
    await next()
  } catch (e) {
    return c.json({ success: false, error: 'Session expired, please login again' }, 401)
  }
}

// ---------- Login ----------
admin.post('/login', async (c) => {
  const { env } = c
  const { username, password } = await c.req.json()

  const validUser = env.ADMIN_USERNAME || 'admin'
  const validPass = env.ADMIN_PASSWORD || 'admin123'

  if (username !== validUser || password !== validPass) {
    return c.json({ success: false, error: 'Invalid username or password' }, 401)
  }

  const payload = {
    sub: username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
  }
  const token = await sign(payload, env.JWT_SECRET)

  // Only require Secure cookies over HTTPS (production). Local http dev sandbox needs it off.
  const isHttps = new URL(c.req.url).protocol === 'https:'

  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })

  return c.json({ success: true })
})

admin.post('/logout', async (c) => {
  deleteCookie(c, COOKIE_NAME, { path: '/' })
  return c.json({ success: true })
})

admin.get('/session', async (c) => {
  const token = getCookie(c, COOKIE_NAME)
  if (!token) return c.json({ success: false, authenticated: false })
  try {
    await verify(token, c.env.JWT_SECRET, 'HS256')
    return c.json({ success: true, authenticated: true })
  } catch (e) {
    return c.json({ success: false, authenticated: false })
  }
})

// All routes below require auth
admin.use('/*', requireAuth)

// ---------- Dashboard Stats ----------
admin.get('/stats', async (c) => {
  const { env } = c
  const productCount = await env.DB.prepare('SELECT COUNT(*) as n FROM products').first()
  const orderCount = await env.DB.prepare('SELECT COUNT(*) as n FROM orders').first()
  const pendingCount = await env.DB.prepare("SELECT COUNT(*) as n FROM orders WHERE status = 'pending'").first()
  const revenue = await env.DB.prepare("SELECT COALESCE(SUM(total),0) as t FROM orders WHERE status != 'cancelled'").first()

  return c.json({
    success: true,
    data: {
      products: (productCount as any)?.n || 0,
      orders: (orderCount as any)?.n || 0,
      pending_orders: (pendingCount as any)?.n || 0,
      revenue: (revenue as any)?.t || 0
    }
  })
})

// ---------- Categories ----------
admin.get('/categories', async (c) => {
  const { env } = c
  const { results } = await env.DB.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all()
  return c.json({ success: true, data: results })
})

// ---------- Products CRUD ----------
admin.get('/products', async (c) => {
  const { env } = c
  const { results } = await env.DB.prepare(
    `SELECT p.*, cat.name as category_name FROM products p
     JOIN categories cat ON cat.id = p.category_id
     ORDER BY p.created_at DESC`
  ).all()
  const data = (results as any[]).map((p) => ({
    ...p,
    colors: p.colors ? JSON.parse(p.colors) : [],
    sizes: p.sizes ? JSON.parse(p.sizes) : []
  }))
  return c.json({ success: true, data })
})

admin.get('/products/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first()
  if (!product) return c.json({ success: false, error: 'Not found' }, 404)
  const data = {
    ...product,
    colors: (product as any).colors ? JSON.parse((product as any).colors) : [],
    sizes: (product as any).sizes ? JSON.parse((product as any).sizes) : []
  }
  return c.json({ success: true, data })
})

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

admin.post('/products', async (c) => {
  const { env } = c
  const body = await c.req.json()

  const {
    name, category_id, description, price, sale_price, fabric,
    colors, sizes, image_primary, image_secondary, badge, is_featured, stock
  } = body

  if (!name || !category_id || !price) {
    return c.json({ success: false, error: 'Name, category and price are required' }, 400)
  }

  let slug = slugify(name)
  const existing = await env.DB.prepare('SELECT id FROM products WHERE slug = ?').bind(slug).first()
  if (existing) slug = slug + '-' + Date.now().toString().slice(-5)

  const result = await env.DB.prepare(
    `INSERT INTO products
      (slug, name, category_id, description, price, sale_price, fabric, colors, sizes, image_primary, image_secondary, badge, is_featured, stock)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    slug, name, category_id, description || null, price, sale_price || null, fabric || null,
    JSON.stringify(colors || []), JSON.stringify(sizes || []),
    image_primary || 'grad-maroon', image_secondary || null, badge || null,
    is_featured ? 1 : 0, stock ?? 10
  ).run()

  return c.json({ success: true, data: { id: result.meta.last_row_id, slug } })
})

admin.put('/products/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  const body = await c.req.json()

  const {
    name, category_id, description, price, sale_price, fabric,
    colors, sizes, image_primary, image_secondary, badge, is_featured, stock
  } = body

  const existing = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ success: false, error: 'Product not found' }, 404)

  await env.DB.prepare(
    `UPDATE products SET
      name = ?, category_id = ?, description = ?, price = ?, sale_price = ?, fabric = ?,
      colors = ?, sizes = ?, image_primary = ?, image_secondary = ?, badge = ?, is_featured = ?, stock = ?
     WHERE id = ?`
  ).bind(
    name, category_id, description || null, price, sale_price || null, fabric || null,
    JSON.stringify(colors || []), JSON.stringify(sizes || []),
    image_primary, image_secondary || null, badge || null,
    is_featured ? 1 : 0, stock ?? 10, id
  ).run()

  return c.json({ success: true })
})

admin.delete('/products/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// ---------- Image Upload (to R2) ----------
admin.post('/upload-image', async (c) => {
  const { env } = c
  const body = await c.req.parseBody()
  const file = body['file'] as File

  if (!file || typeof file === 'string') {
    return c.json({ success: false, error: 'No file uploaded' }, 400)
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return c.json({ success: false, error: 'Only JPG, PNG, WEBP or GIF images allowed' }, 400)
  }

  if (file.size > 5 * 1024 * 1024) {
    return c.json({ success: false, error: 'Image must be under 5MB' }, 400)
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const key = `products/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`

  const buffer = await file.arrayBuffer()
  await env.IMAGES.put(key, buffer, {
    httpMetadata: { contentType: file.type }
  })

  return c.json({ success: true, data: { key, url: `/api/images/${key}` } })
})

// ---------- Orders Management ----------
admin.get('/orders', async (c) => {
  const { env } = c
  const status = c.req.query('status')

  let sql = 'SELECT * FROM orders'
  const params: any[] = []
  if (status) {
    sql += ' WHERE status = ?'
    params.push(status)
  }
  sql += ' ORDER BY created_at DESC'

  const { results } = await env.DB.prepare(sql).bind(...params).all()
  return c.json({ success: true, data: results })
})

admin.get('/orders/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')

  const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first()
  if (!order) return c.json({ success: false, error: 'Order not found' }, 404)

  const { results: items } = await env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(id).all()
  return c.json({ success: true, data: { ...order, items } })
})

admin.put('/orders/:id/status', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  const { status } = await c.req.json()

  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
  if (!validStatuses.includes(status)) {
    return c.json({ success: false, error: 'Invalid status' }, 400)
  }

  await env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(status, id).run()
  return c.json({ success: true })
})

// ---------- Newsletter & Contact (view only) ----------
admin.get('/newsletter', async (c) => {
  const { env } = c
  const { results } = await env.DB.prepare('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC').all()
  return c.json({ success: true, data: results })
})

admin.get('/contact-messages', async (c) => {
  const { env } = c
  const { results } = await env.DB.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all()
  return c.json({ success: true, data: results })
})

// ---------- Site Settings (contact + stats) ----------
admin.get('/settings', async (c) => {
  const { env } = c
  const { results } = await env.DB.prepare('SELECT key, value FROM site_settings').all()
  const map: Record<string, string> = {}
  for (const row of (results as any[]) || []) {
    map[row.key] = row.value
  }

  // Also return live counts so admin can see what "auto" will show
  const productCount = await env.DB.prepare('SELECT COUNT(*) as n FROM products').first()
  const customerCount = await env.DB.prepare(
    'SELECT COUNT(DISTINCT phone) as n FROM orders WHERE phone IS NOT NULL AND phone != ""'
  ).first()

  return c.json({
    success: true,
    data: {
      phone: map.phone || '',
      whatsapp: map.whatsapp || '',
      email: map.email || '',
      address: map.address || '',
      instagram_url: map.instagram_url || '',
      facebook_url: map.facebook_url || '',
      tiktok_url: map.tiktok_url || '',
      announce_bar_text: map.announce_bar_text || '',
      free_delivery_text: map.free_delivery_text || '',
      stats_mode: map.stats_mode || 'auto',
      happy_customers_display: map.happy_customers_display || '500+',
      unique_designs_display: map.unique_designs_display || '50+',
      handcrafted_display: map.handcrafted_display || '100%',
      _live: {
        products: Number((productCount as any)?.n || 0),
        customers: Number((customerCount as any)?.n || 0)
      }
    }
  })
})

admin.put('/settings', async (c) => {
  const { env } = c
  const body = await c.req.json()

  const allowed = [
    'phone', 'whatsapp', 'email', 'address',
    'instagram_url', 'facebook_url', 'tiktok_url',
    'announce_bar_text', 'free_delivery_text',
    'stats_mode', 'happy_customers_display',
    'unique_designs_display', 'handcrafted_display'
  ]

  for (const key of allowed) {
    if (body[key] !== undefined) {
      await env.DB.prepare(
        'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
      ).bind(key, String(body[key])).run()
    }
  }

  return c.json({ success: true, message: 'Settings saved' })
})

export default admin
