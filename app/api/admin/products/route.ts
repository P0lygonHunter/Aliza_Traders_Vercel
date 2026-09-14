import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth'
import { getSql } from '@/lib/db'

export const runtime = 'nodejs'

function parseJson(v: unknown) {
  if (!v) return []
  if (Array.isArray(v)) return v
  try {
    return JSON.parse(String(v))
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  if (!(await requireAdminFromRequest(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const sql = getSql()
    const rows = await sql`
      SELECT p.*, cat.name as category_name
      FROM products p JOIN categories cat ON cat.id = p.category_id
      ORDER BY p.created_at DESC
    `
    const data = (rows as any[]).map((p) => ({
      ...p,
      colors: parseJson(p.colors),
      sizes: parseJson(p.sizes)
    }))
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdminFromRequest(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const sql = getSql()
    const body = await req.json()
    const {
      name, slug, category_id, description, price, sale_price, fabric,
      colors, sizes, image_primary, image_secondary, badge, is_featured, stock
    } = body

    if (!name || !slug || !category_id || price == null) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const colorsStr = JSON.stringify(colors || [])
    const sizesStr = JSON.stringify(sizes || [])

    const rows = await sql`
      INSERT INTO products (
        slug, name, category_id, description, price, sale_price, fabric,
        colors, sizes, image_primary, image_secondary, badge, is_featured, stock
      ) VALUES (
        ${slug}, ${name}, ${category_id}, ${description || null},
        ${Number(price)}, ${sale_price != null ? Number(sale_price) : null},
        ${fabric || null}, ${colorsStr}, ${sizesStr},
        ${image_primary || null}, ${image_secondary || null},
        ${badge || null}, ${is_featured ? 1 : 0}, ${stock != null ? Number(stock) : 10}
      )
      RETURNING id
    `
    return NextResponse.json({ success: true, data: { id: (rows[0] as any).id } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
