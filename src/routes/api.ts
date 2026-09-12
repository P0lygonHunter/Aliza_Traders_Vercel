import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  IMAGES: R2Bucket
}

const api = new Hono<{ Bindings: Bindings }>()

function genOrderNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000)
  const ts = Date.now().toString().slice(-6)
  return `AT-${ts}${rand}`
}

// ---------- Serve uploaded product images from R2 (public, cached) ----------
api.get('/images/*', async (c) => {
  const { env } = c
  const key = c.req.path.replace('/api/images/', '')
  const object = await env.IMAGES.get(key)

  if (!object) return c.notFound()

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
})

// ---------- Categories ----------
api.get('/categories', async (c) => {
  const { env } = c
  const { results } = await env.DB.prepare(
    'SELECT * FROM categories ORDER BY sort_order ASC'
  ).all()
  return c.json({ success: true, data: results })
})

// ---------- Products ----------
// GET /api/products?category=party-wear&search=lehenga&sort=price_asc
api.get('/products', async (c) => {
  const { env } = c
  const category = c.req.query('category')
  const search = c.req.query('search')
  const sort = c.req.query('sort') || 'newest'
  const featured = c.req.query('featured')

  let sql = `
    SELECT p.*, cat.slug as category_slug, cat.name as category_name
    FROM products p
    JOIN categories cat ON cat.id = p.category_id
    WHERE 1=1
  `
  const params: any[] = []

  if (category) {
    sql += ' AND cat.slug = ?'
    params.push(category)
  }
  if (search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.fabric LIKE ?)'
    const like = `%${search}%`
    params.push(like, like, like)
  }
  if (featured === '1') {
    sql += ' AND p.is_featured = 1'
  }

  switch (sort) {
    case 'price_asc':
      sql += ' ORDER BY COALESCE(p.sale_price, p.price) ASC'
      break
    case 'price_desc':
      sql += ' ORDER BY COALESCE(p.sale_price, p.price) DESC'
      break
    case 'name_asc':
      sql += ' ORDER BY p.name ASC'
      break
    default:
      sql += ' ORDER BY p.created_at DESC, p.id DESC'
  }

  const stmt = env.DB.prepare(sql).bind(...params)
  const { results } = await stmt.all()

  const data = (results as any[]).map((p) => ({
    ...p,
    colors: p.colors ? JSON.parse(p.colors) : [],
    sizes: p.sizes ? JSON.parse(p.sizes) : []
  }))

  return c.json({ success: true, data })
})

api.get('/products/:slug', async (c) => {
  const { env } = c
  const slug = c.req.param('slug')
  const product = await env.DB.prepare(
    `SELECT p.*, cat.slug as category_slug, cat.name as category_name
     FROM products p JOIN categories cat ON cat.id = p.category_id
     WHERE p.slug = ?`
  ).bind(slug).first()

  if (!product) return c.json({ success: false, error: 'Product not found' }, 404)

  const data = {
    ...product,
    colors: (product as any).colors ? JSON.parse((product as any).colors as string) : [],
    sizes: (product as any).sizes ? JSON.parse((product as any).sizes as string) : []
  }

  return c.json({ success: true, data })
})

// ---------- Orders / Checkout ----------
api.post('/orders', async (c) => {
  const { env } = c
  const body = await c.req.json()

  const {
    customer_name, phone, email, address, city, notes,
    payment_method, items
  } = body

  if (!customer_name || !phone || !address || !city || !Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, error: 'Missing required fields' }, 400)
  }

  // Validate items & compute subtotal server-side (never trust client price)
  let subtotal = 0
  const validatedItems: any[] = []

  for (const item of items) {
    const product = await env.DB.prepare(
      'SELECT * FROM products WHERE id = ?'
    ).bind(item.product_id).first()

    if (!product) continue

    const unitPrice = (product as any).sale_price || (product as any).price
    const qty = Math.max(1, parseInt(item.quantity) || 1)
    subtotal += unitPrice * qty

    validatedItems.push({
      product_id: (product as any).id,
      product_name: (product as any).name,
      size: item.size || null,
      color: item.color || null,
      quantity: qty,
      unit_price: unitPrice
    })
  }

  if (validatedItems.length === 0) {
    return c.json({ success: false, error: 'No valid items in cart' }, 400)
  }

  const shippingFee = subtotal >= 15000 ? 0 : 250
  const total = subtotal + shippingFee
  const orderNumber = genOrderNumber()

  const orderResult = await env.DB.prepare(
    `INSERT INTO orders (order_number, customer_name, phone, email, address, city, notes, payment_method, subtotal, shipping_fee, total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    orderNumber, customer_name, phone, email || null, address, city, notes || null,
    payment_method || 'COD', subtotal, shippingFee, total
  ).run()

  const orderId = orderResult.meta.last_row_id

  for (const item of validatedItems) {
    await env.DB.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, size, color, quantity, unit_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(orderId, item.product_id, item.product_name, item.size, item.color, item.quantity, item.unit_price).run()
  }

  return c.json({
    success: true,
    data: { order_number: orderNumber, subtotal, shipping_fee: shippingFee, total }
  })
})

api.get('/orders/:orderNumber', async (c) => {
  const { env } = c
  const orderNumber = c.req.param('orderNumber')

  const order = await env.DB.prepare(
    'SELECT * FROM orders WHERE order_number = ?'
  ).bind(orderNumber).first()

  if (!order) return c.json({ success: false, error: 'Order not found' }, 404)

  const { results: items } = await env.DB.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  ).bind((order as any).id).all()

  return c.json({ success: true, data: { ...order, items } })
})

// ---------- Newsletter ----------
api.post('/newsletter', async (c) => {
  const { env } = c
  const { email } = await c.req.json()

  if (!email || !email.includes('@')) {
    return c.json({ success: false, error: 'Valid email required' }, 400)
  }

  try {
    await env.DB.prepare(
      'INSERT INTO newsletter_subscribers (email) VALUES (?)'
    ).bind(email).run()
    return c.json({ success: true, message: 'Subscribed successfully!' })
  } catch (e) {
    return c.json({ success: true, message: 'You are already subscribed!' })
  }
})

// ---------- Contact ----------
api.post('/contact', async (c) => {
  const { env } = c
  const { name, email, phone, message } = await c.req.json()

  if (!name || !email || !message) {
    return c.json({ success: false, error: 'Missing required fields' }, 400)
  }

  await env.DB.prepare(
    'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)'
  ).bind(name, email, phone || null, message).run()

  return c.json({ success: true, message: 'Message sent successfully!' })
})

// ---------- Public Site Settings (contact + stats for storefront) ----------
api.get('/settings', async (c) => {
  const { env } = c

  // Load all settings into a map
  const { results } = await env.DB.prepare('SELECT key, value FROM site_settings').all()
  const map: Record<string, string> = {}
  for (const row of (results as any[]) || []) {
    map[row.key] = row.value
  }

  const mode = map.stats_mode || 'auto'

  // Real counts from database
  const productCount = await env.DB.prepare('SELECT COUNT(*) as n FROM products').first()
  const customerCount = await env.DB.prepare(
    'SELECT COUNT(DISTINCT phone) as n FROM orders WHERE phone IS NOT NULL AND phone != ""'
  ).first()
  const orderCount = await env.DB.prepare('SELECT COUNT(*) as n FROM orders').first()

  const realProducts = Number((productCount as any)?.n || 0)
  const realCustomers = Number((customerCount as any)?.n || 0)
  const realOrders = Number((orderCount as any)?.n || 0)

  // Decide what to show on storefront
  let happyCustomers: string
  let uniqueDesigns: string
  let handcrafted: string

  if (mode === 'manual') {
    happyCustomers = map.happy_customers_display || '0'
    uniqueDesigns = map.unique_designs_display || '0'
    handcrafted = map.handcrafted_display || '100%'
  } else {
    // AUTO mode: use real numbers, but fall back to manual display if real is still low
    // so the store doesn't look empty at launch
    const autoHappy = realCustomers > 0 ? String(realCustomers) + '+' : (map.happy_customers_display || '0')
    const autoDesigns = realProducts > 0 ? String(realProducts) + '+' : (map.unique_designs_display || '0')
    happyCustomers = autoHappy
    uniqueDesigns = autoDesigns
    handcrafted = map.handcrafted_display || '100%'
  }

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
      stats_mode: mode,
      happy_customers: happyCustomers,
      unique_designs: uniqueDesigns,
      handcrafted: handcrafted,
      // raw numbers (useful for admin / debugging)
      _real: {
        products: realProducts,
        customers: realCustomers,
        orders: realOrders
      }
    }
  })
})

export default api
