import { NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const sql = getSql()
    const data = await sql`SELECT * FROM categories ORDER BY sort_order ASC`
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
