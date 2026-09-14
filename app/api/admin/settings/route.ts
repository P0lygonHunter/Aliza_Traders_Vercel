import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth'
import { getSql } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  if (!(await requireAdminFromRequest(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const sql = getSql()
    const rows = await sql`SELECT key, value FROM site_settings`
    const map: Record<string, string> = {}
    for (const row of rows as any[]) map[row.key] = row.value

    const productCount = await sql`SELECT COUNT(*)::int as n FROM products`
    const customerCount = await sql`
      SELECT COUNT(DISTINCT phone)::int as n FROM orders
      WHERE phone IS NOT NULL AND phone != ''
    `

    return NextResponse.json({
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
          products: Number((productCount[0] as any)?.n || 0),
          customers: Number((customerCount[0] as any)?.n || 0)
        }
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdminFromRequest(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const sql = getSql()
    const body = await req.json()
    const allowed = [
      'phone', 'whatsapp', 'email', 'address',
      'instagram_url', 'facebook_url', 'tiktok_url',
      'announce_bar_text', 'free_delivery_text',
      'stats_mode', 'happy_customers_display',
      'unique_designs_display', 'handcrafted_display'
    ]
    for (const key of allowed) {
      if (body[key] !== undefined) {
        await sql`
          INSERT INTO site_settings (key, value) VALUES (${key}, ${String(body[key])})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `
      }
    }
    return NextResponse.json({ success: true, message: 'Settings saved' })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
