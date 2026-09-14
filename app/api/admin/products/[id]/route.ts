import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth'
import { getSql } from '@/lib/db'

export const runtime = 'nodejs'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminFromRequest(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const sql = getSql()
    const body = await req.json()
    const {
      name, slug, category_id, description, price, sale_price, fabric,
      colors, sizes, image_primary, image_secondary, badge, is_featured, stock
    } = body

    const colorsStr = JSON.stringify(colors || [])
    const sizesStr = JSON.stringify(sizes || [])

    await sql`
      UPDATE products SET
        slug = ${slug},
        name = ${name},
        category_id = ${category_id},
        description = ${description || null},
        price = ${Number(price)},
        sale_price = ${sale_price != null ? Number(sale_price) : null},
        fabric = ${fabric || null},
        colors = ${colorsStr},
        sizes = ${sizesStr},
        image_primary = ${image_primary || null},
        image_secondary = ${image_secondary || null},
        badge = ${badge || null},
        is_featured = ${is_featured ? 1 : 0},
        stock = ${stock != null ? Number(stock) : 10}
      WHERE id = ${Number(id)}
    `
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminFromRequest(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const sql = getSql()
    await sql`DELETE FROM order_items WHERE product_id = ${Number(id)}`
    await sql`DELETE FROM products WHERE id = ${Number(id)}`
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
