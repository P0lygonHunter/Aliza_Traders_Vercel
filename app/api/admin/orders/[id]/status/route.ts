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
    const { status } = await req.json()
    const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!valid.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }
    const sql = getSql()
    await sql`UPDATE orders SET status = ${status} WHERE id = ${Number(id)}`
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
