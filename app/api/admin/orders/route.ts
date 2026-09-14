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
    const status = req.nextUrl.searchParams.get('status')
    let rows: any[]
    if (status) {
      rows = await sql`SELECT * FROM orders WHERE status = ${status} ORDER BY created_at DESC`
    } else {
      rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`
    }
    return NextResponse.json({ success: true, data: rows })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
