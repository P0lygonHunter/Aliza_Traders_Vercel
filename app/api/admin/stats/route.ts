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
    const products = await sql`SELECT COUNT(*)::int as n FROM products`
    const orders = await sql`SELECT COUNT(*)::int as n FROM orders`
    const pending = await sql`SELECT COUNT(*)::int as n FROM orders WHERE status = 'pending'`
    const revenue = await sql`SELECT COALESCE(SUM(total),0)::float as t FROM orders WHERE status != 'cancelled'`

    return NextResponse.json({
      success: true,
      data: {
        products: (products[0] as any)?.n || 0,
        orders: (orders[0] as any)?.n || 0,
        pending_orders: (pending[0] as any)?.n || 0,
        revenue: (revenue[0] as any)?.t || 0
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
