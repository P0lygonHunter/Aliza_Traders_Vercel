import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

export const runtime = 'nodejs'

function parseJsonField(v: unknown) {
  if (!v) return []
  if (Array.isArray(v)) return v
  try {
    return JSON.parse(String(v))
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  try {
    const sql = getSql()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const featured = searchParams.get('featured')

    let rows: any[]

    if (category && search) {
      const like = `%${search}%`
      rows = await sql`
        SELECT p.*, cat.slug as category_slug, cat.name as category_name
        FROM products p JOIN categories cat ON cat.id = p.category_id
        WHERE cat.slug = ${category}
          AND (p.name ILIKE ${like} OR p.description ILIKE ${like} OR COALESCE(p.fabric,'') ILIKE ${like})
        ORDER BY p.created_at DESC, p.id DESC
      `
    } else if (category) {
      rows = await sql`
        SELECT p.*, cat.slug as category_slug, cat.name as category_name
        FROM products p JOIN categories cat ON cat.id = p.category_id
        WHERE cat.slug = ${category}
        ORDER BY p.created_at DESC, p.id DESC
      `
    } else if (search) {
      const like = `%${search}%`
      rows = await sql`
        SELECT p.*, cat.slug as category_slug, cat.name as category_name
        FROM products p JOIN categories cat ON cat.id = p.category_id
        WHERE p.name ILIKE ${like} OR p.description ILIKE ${like} OR COALESCE(p.fabric,'') ILIKE ${like}
        ORDER BY p.created_at DESC, p.id DESC
      `
    } else if (featured === '1') {
      rows = await sql`
        SELECT p.*, cat.slug as category_slug, cat.name as category_name
        FROM products p JOIN categories cat ON cat.id = p.category_id
        WHERE p.is_featured = 1
        ORDER BY p.created_at DESC, p.id DESC
      `
    } else {
      rows = await sql`
        SELECT p.*, cat.slug as category_slug, cat.name as category_name
        FROM products p JOIN categories cat ON cat.id = p.category_id
        ORDER BY p.created_at DESC, p.id DESC
      `
    }

    // client-side sort for price when needed
    if (sort === 'price_asc') {
      rows.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price))
    } else if (sort === 'price_desc') {
      rows.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price))
    } else if (sort === 'name_asc') {
      rows.sort((a, b) => String(a.name).localeCompare(String(b.name)))
    }

    const data = rows.map((p) => ({
      ...p,
      colors: parseJsonField(p.colors),
      sizes: parseJsonField(p.sizes)
    }))

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ success: false, error: e.message || 'DB error' }, { status: 500 })
  }
}
