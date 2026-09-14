import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const sql = getSql()
    const rows = await sql`
      SELECT p.*, cat.slug as category_slug, cat.name as category_name
      FROM products p JOIN categories cat ON cat.id = p.category_id
      WHERE p.slug = ${slug} LIMIT 1
    `
    if (!rows.length) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    const p = rows[0] as any
    return NextResponse.json({
      success: true,
      data: {
        ...p,
        colors: p.colors ? JSON.parse(p.colors) : [],
        sizes: p.sizes ? JSON.parse(p.sizes) : []
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
