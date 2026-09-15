import { NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
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
    const orderCount = await sql`SELECT COUNT(*)::int as n FROM orders`

    const realProducts = Number((productCount[0] as any)?.n || 0)
    const realCustomers = Number((customerCount[0] as any)?.n || 0)
    const realOrders = Number((orderCount[0] as any)?.n || 0)
    const mode = map.stats_mode || 'auto'

    let heroImages: string[] = []
    try {
      heroImages = map.hero_images ? JSON.parse(map.hero_images) : []
      if (!Array.isArray(heroImages)) heroImages = []
    } catch {
      heroImages = []
    }

    let happyCustomers: string
    let uniqueDesigns: string
    let handcrafted: string

    if (mode === 'manual') {
      happyCustomers = map.happy_customers_display || '0'
      uniqueDesigns = map.unique_designs_display || '0'
      handcrafted = map.handcrafted_display || '100%'
    } else {
      happyCustomers =
        realCustomers > 0
          ? String(realCustomers) + '+'
          : map.happy_customers_display || '0'
      uniqueDesigns =
        realProducts > 0
          ? String(realProducts) + '+'
          : map.unique_designs_display || '0'
      handcrafted = map.handcrafted_display || '100%'
    }

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
        stats_mode: mode,
        happy_customers: happyCustomers,
        unique_designs: uniqueDesigns,
        handcrafted,
        hero_images: heroImages,
        _real: { products: realProducts, customers: realCustomers, orders: realOrders }
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
