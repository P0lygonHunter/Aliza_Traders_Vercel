import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth'
import { getSql } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminFromRequest(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const sql = getSql()
    const orders = await sql`SELECT * FROM orders WHERE id = ${Number(id)} LIMIT 1`
    if (!orders.length) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    const items = await sql`SELECT * FROM order_items WHERE order_id = ${Number(id)}`
    return NextResponse.json({ success: true, data: { ...orders[0], items } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
